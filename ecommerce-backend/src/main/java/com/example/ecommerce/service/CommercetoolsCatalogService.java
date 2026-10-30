package com.example.ecommerce.service;

import com.example.ecommerce.config.CommercetoolsProperties;
import com.example.ecommerce.controller.CatalogProductRequest;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.RoundingMode;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class CommercetoolsCatalogService {

    private static final Logger logger = LoggerFactory.getLogger(CommercetoolsCatalogService.class);
    private static final String SOURCE = "COMMERCETOOLS";
    private static final int PROJECTION_PAGE_SIZE = 100;
    private static final int MAX_PROJECTION_OFFSET = 10_000;
    private static final List<String> DEFAULT_DUMMYJSON_CATEGORIES = List.of(
            "smartphones", "laptops", "tablets", "mobile-accessories");
    private static final List<DemoProduct> DEMO_PRODUCTS = List.of(
            new DemoProduct("novapods-pro-wireless-earbuds", "TN-DM-NOVAPODS-PRO",
                    "NovaPods Pro Wireless Earbuds",
                    "Compact wireless earbuds with adaptive noise cancellation, clear calls, and a pocket-sized charging case.",
                    new BigDecimal("149.99"),
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&q=85&fit=crop&auto=format", 72),
            new DemoProduct("aura-studio-bluetooth-speaker", "TN-DM-AURA-STUDIO",
                    "Aura Studio Bluetooth Speaker",
                    "A room-filling wireless speaker with balanced sound, a refined fabric finish, and all-day battery life.",
                    new BigDecimal("179.99"),
                    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=85&fit=crop&auto=format", 38),
            new DemoProduct("pulse-75-mechanical-keyboard", "TN-DM-PULSE-75",
                    "Pulse 75 Mechanical Gaming Keyboard",
                    "A compact mechanical keyboard with tactile switches, customizable lighting, and a durable aluminum frame.",
                    new BigDecimal("159.99"),
                    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&q=85&fit=crop&auto=format", 46),
            new DemoProduct("vortex-wireless-gaming-mouse", "TN-DM-VORTEX-MOUSE",
                    "Vortex Wireless Gaming Mouse",
                    "A lightweight wireless gaming mouse with responsive tracking, programmable controls, and a contoured grip.",
                    new BigDecimal("89.99"),
                    "https://images.unsplash.com/photo-1527814050087-3793815479db?w=900&q=85&fit=crop&auto=format", 54),
            new DemoProduct("horizon-4k-creator-monitor", "TN-DM-HORIZON-4K",
                    "Horizon 4K Creator Monitor",
                    "A color-rich 4K display for creative work, featuring crisp detail, a slim bezel, and an adjustable stand.",
                    new BigDecimal("649.99"),
                    "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=900&q=85&fit=crop&auto=format", 18),
            new DemoProduct("edge-27-inch-gaming-monitor", "TN-DM-EDGE-27",
                    "Edge 27-Inch Gaming Monitor",
                    "A smooth 27-inch gaming display with vivid color, sharp motion, and a clean low-profile design.",
                    new BigDecimal("479.99"),
                    "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=900&q=85&fit=crop&auto=format", 21),
            new DemoProduct("activefit-pro-smartwatch", "TN-DM-ACTIVEFIT-PRO",
                    "ActiveFit Pro Smartwatch",
                    "A versatile smartwatch with activity tracking, health insights, and a bright display for everyday use.",
                    new BigDecimal("249.99"),
                    "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=900&q=85&fit=crop&auto=format", 35),
            new DemoProduct("pulseband-fitness-wearable", "TN-DM-PULSEBAND",
                    "PulseBand Fitness Wearable",
                    "A comfortable fitness band that tracks movement, sleep, and heart rate with a week-long battery.",
                    new BigDecimal("89.99"),
                    "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=900&q=85&fit=crop&auto=format", 61)
    );

    private final CommercetoolsProperties properties;
    private final CommercetoolsApiClient apiClient;
    private final DummyJsonProductClient dummyJsonProductClient;
    private final ProductRepository productRepository;

    public Product createProduct(CatalogProductRequest request) {
        ensureCatalogConfigured();
        validateImageUrl(request.imageUrl());

        String locale = normalizeLocale(properties.getLocale());
        String currency = normalizeCurrency(properties.getCurrency());
        String sku = "TN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
        String unique = UUID.randomUUID().toString().replace("-", "");
        String slug = slugify(request.name()) + "-" + unique.substring(0, 10);
        long centAmount = request.price().setScale(2, RoundingMode.UNNECESSARY)
                .movePointRight(2)
                .longValueExact();

        Map<String, Object> image = new LinkedHashMap<>();
        image.put("url", request.imageUrl().trim());
        image.put("label", request.name().trim());
        image.put("dimensions", Map.of("w", request.imageWidth(), "h", request.imageHeight()));

        Map<String, Object> masterVariant = Map.of(
                "sku", sku,
                "prices", List.of(Map.of("value", Map.of("currencyCode", currency, "centAmount", centAmount))),
                "images", List.of(image)
        );
        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("key", "technova-" + unique);
        draft.put("productType", Map.of("typeId", "product-type", "id", properties.getProductTypeId().trim()));
        draft.put("name", Map.of(locale, request.name().trim()));
        draft.put("slug", Map.of(locale, slug));
        draft.put("description", Map.of(locale, request.description().trim()));
        draft.put("masterVariant", masterVariant);

        JsonNode created = apiClient.createProduct(draft);
        String productId = created == null ? null : created.path("id").asText(null);
        long version = created == null ? 0 : created.path("version").asLong(0);
        if (productId == null || version < 1) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "commercetools created no usable product response. Check the backend logs before retrying.");
        }

        try {
            JsonNode published = apiClient.publishProduct(productId, version);
            long publishedVersion = published == null ? version + 1 : published.path("version").asLong(version + 1);

            Product product = Product.builder()
                    .id(productId)
                    .name(request.name().trim())
                    .description(request.description().trim())
                    .price(request.price().setScale(2, RoundingMode.UNNECESSARY))
                    .imageUrl(request.imageUrl().trim())
                    .stockQuantity(request.stockQuantity())
                    .sku(sku)
                    .catalogSource(SOURCE)
                    .catalogVersion(publishedVersion)
                    .commercetoolsId(productId)
                    .commercetoolsKey("technova-" + unique)
                    .build();
            return productRepository.save(product);
        } catch (RuntimeException exception) {
            try {
                JsonNode latest = apiClient.getProduct(productId);
                apiClient.deleteProduct(productId, latest.path("version").asLong(version));
            } catch (RuntimeException cleanupException) {
                logger.warn("Could not remove commercetools product {} after a failed publish/cache step.", productId);
            }
            throw exception;
        }
    }

    /**
     * Copies the current MongoDB catalog into commercetools. Stable product keys make this
     * safe to run again after a partial failure without creating duplicate products.
     */
    public SeedSummary seedExistingCatalog() {
        ensureCatalogConfigured();
        String locale = normalizeLocale(properties.getLocale());
        String currency = normalizeCurrency(properties.getCurrency());

        List<Product> candidates = productRepository.findAll().stream()
                .filter(product -> !SOURCE.equals(product.getCatalogSource()))
                .toList();
        List<String> failures = new ArrayList<>();
        int created = 0;
        int alreadyPresent = 0;
        int skippedIncomplete = 0;
        int failedProducts = 0;

        for (Product product : candidates) {
            if (product.getId() == null || product.getName() == null || product.getName().isBlank()
                    || product.getPrice() == null || product.getPrice().signum() < 0
                    || product.getImageUrl() == null || product.getImageUrl().isBlank()) {
                skippedIncomplete++;
                continue;
            }

            String suffix = stableSuffix(product.getId());
            String key = "technova-seed-" + suffix;
            try {
                validateImageUrl(product.getImageUrl());
                JsonNode remote = apiClient.getProductByKey(key);
                boolean existed = remote != null;
                if (remote == null) {
                    remote = apiClient.createProduct(buildSeedDraft(product, key, suffix, locale, currency));
                }

                long version = remote == null ? 0 : remote.path("version").asLong(0);
                if (version < 1 || !remote.hasNonNull("id")) {
                    throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                            "commercetools returned an incomplete product response.");
                }
                JsonNode published = remote;
                if (!remote.path("published").asBoolean(false)) {
                    published = apiClient.publishProduct(remote.path("id").asText(), version);
                }
                long publishedVersion = published == null
                        ? version + 1
                        : published.path("version").asLong(version + 1);

                product.setCatalogSource(SOURCE);
                product.setCatalogVersion(publishedVersion);
                product.setCommercetoolsId(remote.path("id").asText());
                product.setCommercetoolsKey(key);
                productRepository.save(product);

                if (existed) {
                    alreadyPresent++;
                } else {
                    created++;
                }
            } catch (RuntimeException exception) {
                failedProducts++;
                String detail = exception instanceof ResponseStatusException statusException
                        ? statusException.getReason()
                        : exception.getMessage();
                failures.add(product.getName() + (detail == null || detail.isBlank() ? "" : ": " + detail));
            }
        }

        SyncSummary sync = null;
        if (created > 0 || alreadyPresent > 0) {
            try {
                sync = syncPublishedProducts();
            } catch (RuntimeException exception) {
                failures.add("Products were sent to commercetools, but the storefront catalog sync did not finish. "
                        + "Use Sync commercetools after resolving the backend connection.");
            }
        }

        int syncedCreated = sync == null ? 0 : sync.created();
        int syncedUpdated = sync == null ? 0 : sync.updated();
        return new SeedSummary(candidates.size(), created, alreadyPresent, skippedIncomplete,
                failedProducts, syncedCreated, syncedUpdated, failures);
    }

    /** Creates a fresh, repeatable sample electronics catalog directly in commercetools. */
    public SeedSummary seedDemoCatalog() {
        ensureCatalogConfigured();
        String locale = normalizeLocale(properties.getLocale());
        String currency = normalizeCurrency(properties.getCurrency());
        List<String> failures = new ArrayList<>();
        int created = 0;
        int alreadyPresent = 0;
        int failedProducts = 0;

        for (DemoProduct demo : DEMO_PRODUCTS) {
            String key = "technova-demo-" + demo.key();
            try {
                validateImageUrl(demo.imageUrl());
                JsonNode remote = apiClient.getProductByKey(key);
                boolean existed = remote != null;
                if (remote == null) {
                    Product draftProduct = Product.builder()
                            .id(key)
                            .name(demo.name())
                            .description(demo.description())
                            .price(demo.price())
                            .imageUrl(demo.imageUrl())
                            .stockQuantity(demo.stockQuantity())
                            .sku(demo.sku())
                            .build();
                    remote = apiClient.createProduct(buildSeedDraft(
                            draftProduct, key, stableSuffix(key), locale, currency));
                }

                String productId = remote == null ? null : remote.path("id").asText(null);
                long version = remote == null ? 0 : remote.path("version").asLong(0);
                if (productId == null || version < 1) {
                    throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                            "commercetools returned an incomplete product response.");
                }
                JsonNode published = remote.path("published").asBoolean(false)
                        ? remote
                        : apiClient.publishProduct(productId, version);
                long publishedVersion = published == null
                        ? version + 1
                        : published.path("version").asLong(version + 1);

                productRepository.save(Product.builder()
                        .id(productId)
                        .name(demo.name())
                        .description(demo.description())
                        .price(demo.price())
                        .imageUrl(demo.imageUrl())
                        .stockQuantity(demo.stockQuantity())
                        .sku(demo.sku())
                        .catalogSource(SOURCE)
                        .catalogVersion(publishedVersion)
                        .commercetoolsId(productId)
                        .commercetoolsKey(key)
                        .build());

                if (existed) {
                    alreadyPresent++;
                } else {
                    created++;
                }
            } catch (RuntimeException exception) {
                failedProducts++;
                String detail = exception instanceof ResponseStatusException statusException
                        ? statusException.getReason()
                        : exception.getMessage();
                failures.add(demo.name() + (detail == null || detail.isBlank() ? "" : ": " + detail));
            }
        }

        SyncSummary sync = null;
        if (created > 0 || alreadyPresent > 0) {
            try {
                sync = syncPublishedProducts();
            } catch (RuntimeException exception) {
                failures.add("Demo products were created, but the storefront sync did not finish. "
                        + "Restart the backend after resolving the catalog connection.");
            }
        }

        return new SeedSummary(DEMO_PRODUCTS.size(), created, alreadyPresent, 0, failedProducts,
                sync == null ? 0 : sync.created(), sync == null ? 0 : sync.updated(), failures);
    }

    /** Imports real sample products from DummyJSON, persists them in commercetools, then refreshes the storefront cache. */
    public ImportSummary importDummyJsonProducts(List<String> requestedCategories) {
        ensureCatalogConfigured();
        String locale = normalizeLocale(properties.getLocale());
        String currency = normalizeCurrency(properties.getCurrency());
        List<String> categories = normalizeDummyJsonCategories(requestedCategories);
        Map<String, JsonNode> candidates = new LinkedHashMap<>();
        List<String> errors = new ArrayList<>();

        for (String category : categories) {
            try {
                JsonNode response = dummyJsonProductClient.getProductsByCategory(category);
                for (JsonNode item : response.path("products")) {
                    String sourceId = item.path("id").asText("").trim();
                    if (!sourceId.isBlank()) {
                        candidates.putIfAbsent(sourceId, item);
                    }
                }
            } catch (RuntimeException exception) {
                errors.add(category + ": " + safeErrorMessage(exception));
            }
        }

        int created = 0;
        int alreadyPresent = 0;
        int skipped = 0;
        int failed = 0;

        for (Map.Entry<String, JsonNode> entry : candidates.entrySet()) {
            String sourceId = entry.getKey();
            JsonNode item = entry.getValue();
            String name = item.path("title").asText("").trim();
            String description = item.path("description").asText("").trim();
            String imageUrl = dummyJsonImageUrl(item);
            BigDecimal price = item.path("price").isNumber()
                    ? item.path("price").decimalValue().setScale(2, RoundingMode.HALF_UP)
                    : null;
            int stockQuantity = Math.max(0, item.path("stock").asInt(0));

            if (name.isBlank() || price == null || price.signum() <= 0 || imageUrl == null) {
                skipped++;
                errors.add("DummyJSON product " + sourceId
                        + " was skipped because its name, positive price, or image URL is missing.");
                continue;
            }
            if (description.isBlank()) {
                description = name;
            }
            if (description.length() > 2000) {
                description = description.substring(0, 2000);
            }

            String key = "technova-dummyjson-" + sourceId;
            String sku = "TN-DJ-" + sourceId;
            Product sourceProduct = Product.builder()
                    .id(key)
                    .name(name)
                    .description(description)
                    .price(price)
                    .imageUrl(imageUrl)
                    .stockQuantity(stockQuantity)
                    .sku(sku)
                    .build();

            try {
                validateImageUrl(imageUrl);
                JsonNode remote = apiClient.getProductByKey(key);
                boolean existed = remote != null;
                if (remote == null) {
                    remote = apiClient.createProduct(buildSeedDraft(
                            sourceProduct, key, stableSuffix(key), locale, currency));
                }

                String productId = remote == null ? null : remote.path("id").asText(null);
                long version = remote == null ? 0 : remote.path("version").asLong(0);
                if (productId == null || version < 1) {
                    throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                            "commercetools returned an incomplete product response.");
                }

                JsonNode published = isPublished(remote)
                        ? remote
                        : apiClient.publishProduct(productId, version);
                long publishedVersion = published == null
                        ? version + 1
                        : published.path("version").asLong(version + 1);

                productRepository.save(Product.builder()
                        .id(productId)
                        .name(name)
                        .description(description)
                        .price(price)
                        .imageUrl(imageUrl)
                        .stockQuantity(stockQuantity)
                        .sku(sku)
                        .catalogSource(SOURCE)
                        .catalogVersion(publishedVersion)
                        .commercetoolsId(productId)
                        .commercetoolsKey(key)
                        .build());

                if (existed) {
                    alreadyPresent++;
                } else {
                    created++;
                }
            } catch (RuntimeException exception) {
                failed++;
                errors.add(name + " (DummyJSON ID " + sourceId + "): " + safeErrorMessage(exception));
            }
        }

        SyncSummary sync = null;
        if (created > 0 || alreadyPresent > 0) {
            try {
                sync = syncPublishedProducts();
            } catch (RuntimeException exception) {
                errors.add("Products were imported, but the storefront sync failed: " + safeErrorMessage(exception));
            }
        }

        return new ImportSummary(categories, candidates.size(), created, alreadyPresent, skipped, failed,
                sync == null ? 0 : sync.created(), sync == null ? 0 : sync.updated(), errors);
    }

    private List<String> normalizeDummyJsonCategories(List<String> requestedCategories) {
        List<String> categories = requestedCategories == null || requestedCategories.isEmpty()
                ? DEFAULT_DUMMYJSON_CATEGORIES
                : requestedCategories.stream()
                        .filter(category -> category != null && !category.isBlank())
                        .map(category -> category.trim().toLowerCase(Locale.ROOT))
                        .distinct()
                        .toList();
        if (categories.isEmpty() || categories.size() > 12
                || categories.stream().anyMatch(category -> !category.matches("[a-z0-9-]{2,80}"))) {
            throw new ResponseStatusException(UNPROCESSABLE_ENTITY,
                    "Provide between 1 and 12 valid DummyJSON category slugs.");
        }
        return categories;
    }

    private String dummyJsonImageUrl(JsonNode item) {
        JsonNode images = item.path("images");
        if (images.isArray()) {
            for (JsonNode image : images) {
                if (image.isTextual() && isHttpUrl(image.asText())) {
                    return image.asText().trim();
                }
            }
        }
        String thumbnail = item.path("thumbnail").asText("").trim();
        return isHttpUrl(thumbnail) ? thumbnail : null;
    }

    private boolean isHttpUrl(String rawUrl) {
        try {
            URI uri = URI.create(rawUrl.trim());
            String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
            return List.of("https", "http").contains(scheme) && uri.getHost() != null;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private boolean isPublished(JsonNode product) {
        JsonNode masterData = product.path("masterData");
        if (masterData.has("published")) {
            return masterData.path("published").asBoolean(false);
        }
        return product.path("published").asBoolean(false);
    }

    private String safeErrorMessage(RuntimeException exception) {
        if (exception instanceof ResponseStatusException statusException
                && statusException.getReason() != null && !statusException.getReason().isBlank()) {
            return statusException.getReason();
        }
        return exception.getMessage() == null || exception.getMessage().isBlank()
                ? "Unexpected error. Check the backend logs."
                : exception.getMessage();
    }

    private Map<String, Object> buildSeedDraft(
            Product product, String key, String suffix, String locale, String currency) {
        long centAmount = product.getPrice().setScale(2, RoundingMode.UNNECESSARY)
                .movePointRight(2)
                .longValueExact();
        String sku = product.getSku() == null || product.getSku().isBlank()
                ? "TN-" + suffix.substring(0, 12).toUpperCase(Locale.ROOT)
                : product.getSku().trim();
        String slug = slugify(product.getName()) + "-" + suffix.substring(0, 12);
        String description = product.getDescription() == null || product.getDescription().isBlank()
                ? product.getName().trim()
                : product.getDescription().trim();

        Map<String, Object> image = new LinkedHashMap<>();
        image.put("url", product.getImageUrl().trim());
        image.put("label", product.getName().trim());
        image.put("dimensions", Map.of("w", 800, "h", 800));

        Map<String, Object> masterVariant = new LinkedHashMap<>();
        masterVariant.put("sku", sku);
        masterVariant.put("prices", List.of(Map.of(
                "value", Map.of("currencyCode", currency, "centAmount", centAmount))));
        masterVariant.put("images", List.of(image));

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("key", key);
        draft.put("productType", Map.of("typeId", "product-type", "id", properties.getProductTypeId().trim()));
        draft.put("name", Map.of(locale, product.getName().trim()));
        draft.put("slug", Map.of(locale, slug));
        draft.put("description", Map.of(locale, description));
        draft.put("masterVariant", masterVariant);
        return draft;
    }

    private String stableSuffix(String sourceId) {
        return UUID.nameUUIDFromBytes(("technova:" + sourceId).getBytes(StandardCharsets.UTF_8))
                .toString()
                .replace("-", "")
                .substring(0, 16);
    }

    public SyncSummary syncPublishedProducts() {
        ensureApiConfigured();
        String locale = normalizeLocale(properties.getLocale());
        String currency = normalizeCurrency(properties.getCurrency());
        Map<String, Product> existingById = new HashMap<>();
        Map<String, Product> existingByKey = new HashMap<>();
        for (Product product : productRepository.findAll()) {
            if (product.getId() != null) {
                existingById.put(product.getId(), product);
            }
            if (product.getCommercetoolsId() != null && !product.getCommercetoolsId().isBlank()) {
                existingById.put(product.getCommercetoolsId(), product);
            }
            if (product.getCommercetoolsKey() != null && !product.getCommercetoolsKey().isBlank()) {
                existingByKey.put(product.getCommercetoolsKey(), product);
            }
        }

        List<Product> toSave = new ArrayList<>();
        int seen = 0;
        int skippedIncomplete = 0;
        int offset = 0;

        while (offset <= MAX_PROJECTION_OFFSET) {
            JsonNode response = apiClient.getProductProjections(PROJECTION_PAGE_SIZE, offset, currency);
            JsonNode results = response == null ? null : response.path("results");
            if (results == null || !results.isArray()) {
                throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                        "commercetools returned an invalid product projection page.");
            }

            int pageSize = results.size();
            if (pageSize == 0) {
                break;
            }
            seen += pageSize;

            for (JsonNode projection : results) {
                String id = projection.path("id").asText("");
                String key = projection.path("key").asText("");
                JsonNode masterVariant = projection.path("masterVariant");
                String name = localizedValue(projection.path("name"), locale);
                String description = localizedValue(projection.path("description"), locale);
                String imageUrl = masterVariant.path("images").isArray() && !masterVariant.path("images").isEmpty()
                        ? masterVariant.path("images").get(0).path("url").asText("")
                        : "";
                BigDecimal price = readPrice(masterVariant, currency);

                if (id.isBlank() || name.isBlank() || imageUrl.isBlank() || price == null) {
                    skippedIncomplete++;
                    continue;
                }

                Product previous = existingById.get(id);
                if (previous == null && !key.isBlank()) {
                    previous = existingByKey.get(key);
                }
                int stockQuantity = readStockQuantity(masterVariant, previous);
                Product product = Product.builder()
                        .id(previous == null ? id : previous.getId())
                        .name(name)
                        .description(description)
                        .price(price)
                        .imageUrl(imageUrl)
                        .stockQuantity(stockQuantity)
                        .sku(masterVariant.path("sku").asText(previous == null ? null : previous.getSku()))
                        .catalogSource(SOURCE)
                        .catalogVersion(projection.path("version").isNumber()
                                ? projection.path("version").asLong()
                                : previous == null ? null : previous.getCatalogVersion())
                        .commercetoolsId(id)
                        .commercetoolsKey(key.isBlank()
                                ? previous == null ? null : previous.getCommercetoolsKey()
                                : key)
                        .build();
                toSave.add(product);
            }

            offset += pageSize;
            if (pageSize < PROJECTION_PAGE_SIZE || offset > MAX_PROJECTION_OFFSET) {
                break;
            }
        }

        int updated = (int) toSave.stream()
                .filter(product -> existingById.containsKey(product.getCommercetoolsId()))
                .count();
        int created = toSave.size() - updated;
        if (!toSave.isEmpty()) {
            productRepository.saveAll(toSave);
        }

        return new SyncSummary(created, updated, skippedIncomplete, seen);
    }

    public void deleteRemoteProduct(Product product) {
        if (!SOURCE.equals(product.getCatalogSource())) {
            return;
        }
        ensureCatalogConfigured();
        String remoteId = product.getCommercetoolsId() == null || product.getCommercetoolsId().isBlank()
                ? product.getId()
                : product.getCommercetoolsId();
        JsonNode remote;
        try {
            remote = apiClient.getProduct(remoteId);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().equals(NOT_FOUND)) {
                return;
            }
            throw exception;
        }
        if (remote == null || !remote.hasNonNull("version")) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "Could not read the current commercetools product version before deleting it.");
        }
        apiClient.deleteProduct(remoteId, remote.path("version").asLong());
    }

    private void ensureCatalogConfigured() {
        if (!properties.isConfigured()) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "Configure commercetools credentials, project URLs, and Product Type ID on the backend first.");
        }
    }

    private void ensureApiConfigured() {
        if (!properties.isApiConfigured()) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "Configure commercetools project credentials and regional API URLs on the backend first.");
        }
    }

    private String localizedValue(JsonNode localized, String locale) {
        if (localized == null || !localized.isObject()) {
            return "";
        }
        if (localized.hasNonNull(locale)) {
            return localized.path(locale).asText("").trim();
        }
        if (localized.hasNonNull("en")) {
            return localized.path("en").asText("").trim();
        }
        var fields = localized.fields();
        return fields.hasNext() ? fields.next().getValue().asText("").trim() : "";
    }

    private BigDecimal readPrice(JsonNode variant, String currency) {
        JsonNode selected = variant.path("price");
        if (selected.isObject()) {
            JsonNode value = selected.path("value");
            if (value.path("centAmount").isNumber()) {
                return BigDecimal.valueOf(value.path("centAmount").asLong(), 2);
            }
        }
        JsonNode prices = variant.path("prices");
        if (prices.isArray()) {
            for (JsonNode price : prices) {
                JsonNode value = price.path("value");
                if (currency.equals(value.path("currencyCode").asText()) && value.path("centAmount").isNumber()) {
                    return BigDecimal.valueOf(value.path("centAmount").asLong(), 2);
                }
            }
        }
        return null;
    }

    private int readStockQuantity(JsonNode variant, Product previous) {
        JsonNode quantity = variant.path("availability").path("availableQuantity");
        if (quantity.isNumber()) {
            return (int) Math.min(Integer.MAX_VALUE, Math.max(0, quantity.asLong()));
        }
        return previous != null && previous.getStockQuantity() != null
                ? previous.getStockQuantity()
                : 0;
    }

    private void validateImageUrl(String rawUrl) {
        try {
            URI uri = URI.create(rawUrl.trim());
            if (!List.of("https", "http").contains(uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT))
                    || uri.getHost() == null) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(UNPROCESSABLE_ENTITY,
                    "Image URL must be an absolute HTTP or HTTPS URL.");
        }
    }

    private String normalizeLocale(String locale) {
        return locale == null || locale.isBlank() ? "en" : locale.trim();
    }

    private String normalizeCurrency(String currency) {
        String normalized = currency == null || currency.isBlank() ? "USD" : currency.trim().toUpperCase(Locale.ROOT);
        if (!normalized.matches("[A-Z]{3}")) {
            throw new ResponseStatusException(UNPROCESSABLE_ENTITY,
                    "COMMERCETOOLS_CURRENCY must be a three-letter ISO currency code.");
        }
        if (!"USD".equals(normalized)) {
            throw new ResponseStatusException(UNPROCESSABLE_ENTITY,
                    "The current TechNova storefront displays USD. Configure commercetools with USD for this catalog.");
        }
        return normalized;
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        return normalized.isBlank() ? "technova-product" : normalized.substring(0, Math.min(normalized.length(), 180));
    }

    public record SyncSummary(int created, int updated, int skippedIncomplete, int totalSeen) { }

    public record ImportSummary(
            List<String> categories,
            int totalCandidates,
            int created,
            int alreadyPresent,
            int skipped,
            int failed,
            int syncedCreated,
            int syncedUpdated,
            List<String> errors) { }

    private record DemoProduct(
            String key,
            String sku,
            String name,
            String description,
            BigDecimal price,
            String imageUrl,
            int stockQuantity) { }

    public record SeedSummary(
            int totalCandidates,
            int created,
            int alreadyPresent,
            int skippedIncomplete,
            int failed,
            int syncedCreated,
            int syncedUpdated,
            List<String> errors) { }
}
