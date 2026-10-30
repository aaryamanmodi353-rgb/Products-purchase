package com.example.ecommerce.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;

/** Reads sample products from DummyJSON. DummyJSON remains a read-only source for this importer. */
@Component
public class DummyJsonProductClient {

    private final RestClient client = RestClient.builder()
            .baseUrl("https://dummyjson.com")
            .build();

    public JsonNode getProductsByCategory(String category) {
        try {
            JsonNode response = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/products/category/{category}")
                            .queryParam("limit", 0)
                            .build(category))
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null || !response.path("products").isArray()) {
                throw new ResponseStatusException(BAD_GATEWAY,
                        "DummyJSON returned an invalid product list for category " + category + ".");
            }
            return response;
        } catch (RestClientResponseException exception) {
            throw new ResponseStatusException(BAD_GATEWAY,
                    "DummyJSON returned HTTP " + exception.getStatusCode().value()
                            + " while loading category " + category + ".");
        } catch (ResourceAccessException exception) {
            throw new ResponseStatusException(BAD_GATEWAY,
                    "Could not reach DummyJSON while loading category " + category + ".");
        }
    }
}
