package com.example.ecommerce.config;

import com.example.ecommerce.service.CommercetoolsCatalogService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommercetoolsCatalogSyncRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(CommercetoolsCatalogSyncRunner.class);

    private final CommercetoolsProperties properties;
    private final CommercetoolsCatalogService catalogService;

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.isApiConfigured()) {
            logger.info("Skipping commercetools catalog sync because backend API credentials are not configured.");
            return;
        }

        try {
            if (args.containsOption("seed-demo-catalog")) {
                CommercetoolsCatalogService.SeedSummary result = catalogService.seedDemoCatalog();
                logger.info("commercetools demo catalog seed completed: {} candidates, {} created, "
                                + "{} already present, {} failed; storefront sync created {} and updated {}.",
                        result.totalCandidates(), result.created(), result.alreadyPresent(), result.failed(),
                        result.syncedCreated(), result.syncedUpdated());
                if (!result.errors().isEmpty()) {
                    logger.warn("commercetools demo catalog seed reported {} product error(s).", result.errors().size());
                }
                return;
            }

            if (args.containsOption("import-dummyjson")) {
                CommercetoolsCatalogService.ImportSummary result = catalogService.importDummyJsonProducts(null);
                logger.info("DummyJSON catalog import completed: {} candidates, {} created, {} already present, "
                                + "{} skipped, {} failed; storefront sync created {} and updated {}.",
                        result.totalCandidates(), result.created(), result.alreadyPresent(), result.skipped(),
                        result.failed(), result.syncedCreated(), result.syncedUpdated());
                if (!result.errors().isEmpty()) {
                    logger.warn("DummyJSON catalog import reported {} issue(s).", result.errors().size());
                }
                return;
            }

            if (args.containsOption("seed-existing-catalog")) {
                CommercetoolsCatalogService.SeedSummary result = catalogService.seedExistingCatalog();
                logger.info("commercetools catalog seed completed: {} candidates, {} created, {} already present, "
                                + "{} skipped, {} failed; storefront sync created {} and updated {}.",
                        result.totalCandidates(), result.created(), result.alreadyPresent(), result.skippedIncomplete(),
                        result.failed(), result.syncedCreated(), result.syncedUpdated());
                if (!result.errors().isEmpty()) {
                    logger.warn("commercetools catalog seed reported {} product error(s).", result.errors().size());
                }
                return;
            }

            CommercetoolsCatalogService.SyncSummary result = catalogService.syncPublishedProducts();
            logger.info("commercetools catalog sync completed: {} created, {} updated, {} skipped, {} seen.",
                    result.created(), result.updated(), result.skippedIncomplete(), result.totalSeen());
        } catch (RuntimeException exception) {
            logger.error("commercetools catalog sync failed at startup; the existing storefront catalog remains available.",
                    exception);
        }
    }
}
