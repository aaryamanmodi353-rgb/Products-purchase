package com.example.ecommerce.controller;

import com.example.ecommerce.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        private String productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateOrderRequest {
        @NotEmpty(message = "Order must contain at least one item")
        @Valid
        private List<OrderItemRequest> items;

        @NotNull(message = "Payment method is required")
        private PaymentMethod paymentMethod;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CancelOrderRequest {
        private String reason;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderItemResponse {
        private String id;
        private String productId;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private BigDecimal priceAtPurchase;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderResponse {
        private String id;
        private List<OrderItemResponse> items;
        private BigDecimal totalAmount;
        private String status;
        private String paymentMethod;
        private LocalDateTime createdAt;
        private String cancelReason;
    }
}
