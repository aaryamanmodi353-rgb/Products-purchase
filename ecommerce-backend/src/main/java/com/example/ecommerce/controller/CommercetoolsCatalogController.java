package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Product;
import com.example.ecommerce.service.CommercetoolsCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/catalog/commercetools")
@RequiredArgsConstructor
public class CommercetoolsCatalogController {

    private final CommercetoolsCatalogService catalogService;

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody CatalogProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.createProduct(request));
    }

    @PostMapping("/sync")
    public ResponseEntity<CommercetoolsCatalogService.SyncSummary> syncPublishedProducts() {
        return ResponseEntity.ok(catalogService.syncPublishedProducts());
    }

    @PostMapping("/seed-existing")
    public ResponseEntity<CommercetoolsCatalogService.SeedSummary> seedExistingCatalog() {
        return ResponseEntity.ok(catalogService.seedExistingCatalog());
    }

    @PostMapping("/import-dummyjson")
    public ResponseEntity<CommercetoolsCatalogService.ImportSummary> importDummyJsonProducts(
            @RequestParam(required = false) List<String> categories) {
        return ResponseEntity.ok(catalogService.importDummyJsonProducts(categories));
    }
}
