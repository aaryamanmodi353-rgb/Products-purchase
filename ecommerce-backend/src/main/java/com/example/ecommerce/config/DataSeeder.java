package com.example.ecommerce.config;

import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.Role;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            Product p1 = Product.builder()
                    .name("Premium Wireless Headphones")
                    .description("High-quality wireless headphones with noise cancellation.")
                    .price(new BigDecimal("299.99"))
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80")
                    .stockQuantity(50)
                    .build();

            Product p2 = Product.builder()
                    .name("Mechanical Gaming Keyboard")
                    .description("RGB mechanical keyboard with tactile switches.")
                    .price(new BigDecimal("129.50"))
                    .imageUrl("https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80")
                    .stockQuantity(30)
                    .build();

            Product p3 = Product.builder()
                    .name("4K Ultra HD Monitor")
                    .description("27-inch 4K monitor for designers and gamers.")
                    .price(new BigDecimal("399.00"))
                    .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80")
                    .stockQuantity(20)
                    .build();

            Product p4 = Product.builder()
                    .name("Smartwatch Pro")
                    .description("Advanced fitness tracking and health monitoring.")
                    .price(new BigDecimal("199.99"))
                    .imageUrl("https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80")
                    .stockQuantity(100)
                    .build();

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4));
            System.out.println("Seeded database with initial products!");
        }

        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@technova.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded database with default Admin user (admin@technova.com / admin123)");
        }
    }
}
