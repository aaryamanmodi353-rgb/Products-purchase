package com.example.ecommerce.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "commercetools")
public class CommercetoolsProperties {

    private String projectKey = "";
    private String clientId = "";
    private String clientSecret = "";
    private String apiUrl = "";
    private String authUrl = "";
    private String scope = "";
    private String productTypeId = "";
    private String locale = "en-US";
    private String currency = "USD";

    public boolean isApiConfigured() {
        return hasText(projectKey)
                && hasText(clientId)
                && hasText(clientSecret)
                && hasText(apiUrl)
                && hasText(authUrl);
    }

    public boolean isConfigured() {
        return isApiConfigured()
                && hasText(productTypeId);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    public String getProjectKey() { return projectKey; }
    public void setProjectKey(String projectKey) { this.projectKey = projectKey; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }
    public String getAuthUrl() { return authUrl; }
    public void setAuthUrl(String authUrl) { this.authUrl = authUrl; }
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public String getProductTypeId() { return productTypeId; }
    public void setProductTypeId(String productTypeId) { this.productTypeId = productTypeId; }
    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
