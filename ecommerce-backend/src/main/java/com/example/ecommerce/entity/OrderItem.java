package com.example.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @JsonIgnore
    private CustomerOrder order;

    @DBRef
    private Product product;

    private Integer quantity;

    private BigDecimal priceAtPurchase;
}
