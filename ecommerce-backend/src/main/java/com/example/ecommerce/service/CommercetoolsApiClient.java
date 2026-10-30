package com.example.ecommerce.service;

import com.example.ecommerce.config.CommercetoolsProperties;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

@Component
public class CommercetoolsApiClient {

    private static final long TOKEN_EXPIRY_SAFETY_SECONDS = 30;

    private final CommercetoolsProperties properties;
    private final RestClient apiClient;
    private final RestClient authClient;
    private volatile CachedAccessToken cachedAccessToken;

    public CommercetoolsApiClient(CommercetoolsProperties properties) {
        this.properties = properties;
        this.apiClient = RestClient.builder().baseUrl(trimTrailingSlash(properties.getApiUrl())).build();
        this.authClient = RestClient.builder().baseUrl(trimTrailingSlash(properties.getAuthUrl())).build();
    }

    public JsonNode createProduct(Map<String, Object> productDraft) {
        return apiRequest(HttpMethod.POST, projectPath("/products"), productDraft);
    }

    public JsonNode publishProduct(String productId, long version) {
        Map<String, Object> action = Map.of("action", "publish");
        return apiRequest(
                HttpMethod.POST,
                projectPath("/products/" + encodePathSegment(productId)),
                Map.of("version", version, "actions", new Object[]{action})
        );
    }

    public JsonNode getProduct(String productId) {
        return apiRequest(HttpMethod.GET, projectPath("/products/" + encodePathSegment(productId)), null);
    }

    public JsonNode getProductByKey(String key) {
        try {
            return apiRequest(HttpMethod.GET, projectPath("/products/key=" + encodePathSegment(key)), null);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().equals(NOT_FOUND)) {
                return null;
            }
            throw exception;
        }
    }

    public JsonNode getProductProjections(int limit, int offset, String currency) {
        String path = projectPath("/product-projections")
                + "?limit=" + limit
                + "&offset=" + offset
                + "&withTotal=false"
                + "&priceCurrency=" + encodePathSegment(currency);
        return apiRequest(HttpMethod.GET, path, null);
    }

    public void deleteProduct(String productId, long version) {
        String path = projectPath("/products/" + encodePathSegment(productId)) + "?version=" + version;
        apiRequest(HttpMethod.DELETE, path, null);
    }

    private JsonNode apiRequest(HttpMethod method, String path, Object body) {
        ensureConfigured();
        try {
            RestClient.RequestBodySpec request = apiClient.method(method)
                    .uri(path)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken());

            if (body != null) {
                request.contentType(MediaType.APPLICATION_JSON).body(body);
            }

            return request.retrieve().body(JsonNode.class);
        } catch (RestClientResponseException exception) {
            throw translateUpstreamError(exception);
        } catch (ResourceAccessException exception) {
            throw new ResponseStatusException(BAD_GATEWAY, "Could not reach the commercetools API.");
        }
    }

    private String accessToken() {
        Instant now = Instant.now();
        CachedAccessToken current = cachedAccessToken;
        if (current != null && current.expiresAt().isAfter(now.plusSeconds(TOKEN_EXPIRY_SAFETY_SECONDS))) {
            return current.value();
        }

        synchronized (this) {
            current = cachedAccessToken;
            now = Instant.now();
            if (current != null && current.expiresAt().isAfter(now.plusSeconds(TOKEN_EXPIRY_SAFETY_SECONDS))) {
                return current.value();
            }

            try {
                MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
                form.add("grant_type", "client_credentials");
                String scope = configuredScope();
                if (!scope.isBlank()) {
                    form.add("scope", scope);
                }

                JsonNode response = authClient.post()
                        .uri("/oauth/token")
                        .headers(headers -> headers.setBasicAuth(properties.getClientId(), properties.getClientSecret()))
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .body(form)
                        .retrieve()
                        .body(JsonNode.class);

                if (response == null || !response.hasNonNull("access_token")) {
                    throw new ResponseStatusException(BAD_GATEWAY, "commercetools did not return an access token.");
                }

                long expiresIn = response.path("expires_in").asLong(300);
                cachedAccessToken = new CachedAccessToken(
                        response.path("access_token").asText(),
                        Instant.now().plusSeconds(Math.max(expiresIn, 1))
                );
                return cachedAccessToken.value();
            } catch (RestClientResponseException exception) {
                throw translateAuthenticationError(exception);
            } catch (ResourceAccessException exception) {
                throw new ResponseStatusException(BAD_GATEWAY, "Could not reach commercetools authentication.");
            }
        }
    }

    private ResponseStatusException translateUpstreamError(RestClientResponseException exception) {
        int upstreamStatus = exception.getStatusCode().value();
        if (upstreamStatus == 400) {
            return new ResponseStatusException(UNPROCESSABLE_ENTITY,
                    "commercetools rejected the product data. Check the configured Product Type, locale, and currency.");
        }
        if (upstreamStatus == 409) {
            return new ResponseStatusException(CONFLICT,
                    "commercetools reports a product or SKU conflict. Check whether this item already exists.");
        }
        if (upstreamStatus == 404) {
            return new ResponseStatusException(NOT_FOUND, "The commercetools product no longer exists.");
        }
        if (upstreamStatus == 401 || upstreamStatus == 403) {
            return new ResponseStatusException(BAD_GATEWAY,
                    "commercetools rejected the API credentials or scopes. Check the server-side integration settings.");
        }
        return new ResponseStatusException(BAD_GATEWAY,
                "commercetools returned HTTP " + upstreamStatus + ". Check the server logs and project settings.");
    }

    private ResponseStatusException translateAuthenticationError(RestClientResponseException exception) {
        int upstreamStatus = exception.getStatusCode().value();
        if (upstreamStatus == 400 || upstreamStatus == 401 || upstreamStatus == 403) {
            return new ResponseStatusException(BAD_GATEWAY,
                    "commercetools authentication failed. Check the API client ID, secret, project scope, and region.");
        }
        return new ResponseStatusException(BAD_GATEWAY,
                "commercetools authentication returned HTTP " + upstreamStatus + ". Check the backend settings.");
    }

    private void ensureConfigured() {
        if (!properties.isApiConfigured()) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "The commercetools connection is not configured on the backend yet.");
        }
    }

    private String configuredScope() {
        if (properties.getScope() != null && !properties.getScope().isBlank()) {
            return properties.getScope().trim();
        }
        String projectKey = properties.getProjectKey().trim();
        return "manage_products:" + projectKey
                + " view_products:" + projectKey
                + " view_published_products:" + projectKey;
    }

    private String projectPath(String resourcePath) {
        return "/" + encodePathSegment(properties.getProjectKey().trim()) + resourcePath;
    }

    private String encodePathSegment(String value) {
        return UriUtils.encodePathSegment(value, StandardCharsets.UTF_8);
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "https://api.commercetools.com";
        }
        return value.replaceAll("/+$", "");
    }

    private record CachedAccessToken(String value, Instant expiresAt) { }
}
