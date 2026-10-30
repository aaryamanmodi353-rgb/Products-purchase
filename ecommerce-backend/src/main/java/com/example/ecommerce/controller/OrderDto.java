package com.example.ecommerce.controller;

import com.example.ecommerce.entity.PaymentMethod;
import com.example.ecommerce.entity.ReturnRequestStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    public record OrderItemRequest(
            @NotBlank(message = "Product ID is required") String productId,
            @NotNull(message = "Quantity is required")
            @Min(value = 1, message = "Quantity must be at least 1") Integer quantity
    ) {
    }

    public record CreateOrderRequest(
            @NotEmpty(message = "Order must contain at least one item")
            @Valid List<OrderItemRequest> items,
            @NotNull(message = "Payment method is required") PaymentMethod paymentMethod
    ) {
    }

    public record CancelOrderRequest(
            @NotBlank(message = "A cancellation reason is required")
            @Size(max = 1000, message = "Cancellation reason must be at most 1000 characters")
            String reason
    ) {
    }

    public record OrderItemResponse(
            String id,
            String productId,
            String productName,
            String productImageUrl,
            Integer quantity,
            BigDecimal priceAtPurchase
    ) {
    }

    public record OrderResponse(
            String id,
            List<OrderItemResponse> items,
            BigDecimal totalAmount,
            String status,
            String paymentMethod,
            LocalDateTime createdAt,
            Instant deliveredAt,
            String carrier,
            String trackingNumber,
            String cancelReason
    ) {
    }

    public record CreateReturnRequest(
            @NotBlank(message = "Idempotency key is required")
            @Size(max = 128, message = "Idempotency key must be at most 128 characters")
            String idempotencyKey,
            @NotBlank(message = "A return reason is required")
            @Size(max = 2000, message = "Return reason must be at most 2000 characters")
            String reason
    ) {
    }

    public record ReturnRequestResponse(
            String id,
            String orderId,
            ReturnRequestStatus status,
            String reason,
            Instant createdAt
    ) {
    }
}
