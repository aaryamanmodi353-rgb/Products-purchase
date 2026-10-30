package com.example.ecommerce.config;

import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.Role;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String LOCAL_SEED = "LOCAL_SEED";
    private static final Map<String, String> LEGACY_SEED_IMAGES = Map.of(
            "Premium Wireless Headphones", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            "Mechanical Gaming Keyboard", "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
            "4K Ultra HD Monitor", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
            "Smartwatch Pro", "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"
    );

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String seedAdminEmail;
    private final String seedAdminPassword;

    public DataSeeder(
            ProductRepository productRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${SEED_ADMIN_EMAIL:}") String seedAdminEmail,
            @Value("${SEED_ADMIN_PASSWORD:}") String seedAdminPassword
    ) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedAdminEmail = seedAdminEmail;
        this.seedAdminPassword = seedAdminPassword;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            Product p1 = Product.builder()
                    .name("Premium Wireless Headphones")
                    .description("High-quality wireless headphones with noise cancellation.")
                    .price(new BigDecimal("299.99"))
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80")
                    .stockQuantity(50)
                    .catalogSource(LOCAL_SEED)
                    .build();

            Product p2 = Product.builder()
                    .name("Mechanical Gaming Keyboard")
                    .description("RGB mechanical keyboard with tactile switches.")
                    .price(new BigDecimal("129.50"))
                    .imageUrl("https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80")
                    .stockQuantity(30)
                    .catalogSource(LOCAL_SEED)
                    .build();

            Product p3 = Product.builder()
                    .name("4K Ultra HD Monitor")
                    .description("27-inch 4K monitor for designers and gamers.")
                    .price(new BigDecimal("399.00"))
                    .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80")
                    .stockQuantity(20)
                    .catalogSource(LOCAL_SEED)
                    .build();

            Product p4 = Product.builder()
                    .name("Smartwatch Pro")
                    .description("Advanced fitness tracking and health monitoring.")
                    .price(new BigDecimal("199.99"))
                    .imageUrl("https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80")
                    .stockQuantity(100)
                    .catalogSource(LOCAL_SEED)
                    .build();

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4));
            System.out.println("Seeded database with initial products!");
        }

        tagExistingSeedProducts();

        if (seedAdminEmail.isBlank() != seedAdminPassword.isBlank()) {
            throw new IllegalStateException(
                    "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be configured together");
        }

        if (userRepository.count() == 0 && !seedAdminEmail.isBlank()) {
            User admin = User.builder()
                    .name("Admin User")
                    .email(seedAdminEmail.trim())
                    .password(passwordEncoder.encode(seedAdminPassword))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded database with the configured initial Admin user.");
        }
    }

    private void tagExistingSeedProducts() {
        List<Product> legacySeeds = productRepository.findAll().stream()
                .filter(product -> product.getCatalogSource() == null)
                .filter(product -> LEGACY_SEED_IMAGES.containsKey(product.getName()))
                .filter(product -> LEGACY_SEED_IMAGES.get(product.getName()).equals(product.getImageUrl()))
                .toList();
        if (!legacySeeds.isEmpty()) {
            legacySeeds.forEach(product -> product.setCatalogSource(LOCAL_SEED));
            productRepository.saveAll(legacySeeds);
        }
    }
}
