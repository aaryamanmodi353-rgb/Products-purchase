package com.example.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "customer_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrder {

    @Id
    private String id;

    @DBRef
    @JsonIgnore
    private User user;

    private List<OrderItem> items;

    private BigDecimal totalAmount;

    private OrderStatus status;

    private PaymentMethod paymentMethod;

    private LocalDateTime createdAt;

    private String cancelReason;
}
