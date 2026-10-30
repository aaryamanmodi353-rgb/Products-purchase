package com.example.ecommerce.service;

import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    private final CommercetoolsCatalogService commercetoolsCatalogService;

    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        boolean commercetoolsCatalogHasItems = products.stream()
                .anyMatch(product -> "COMMERCETOOLS".equals(product.getCatalogSource()));
        if (!commercetoolsCatalogHasItems) {
            return products;
        }
        return products.stream()
                .filter(product -> !"LOCAL_SEED".equals(product.getCatalogSource()))
                .toList();
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(String id) {
        productRepository.findById(id).ifPresent(product -> {
            commercetoolsCatalogService.deleteRemoteProduct(product);
            productRepository.delete(product);
        });
    }
}
