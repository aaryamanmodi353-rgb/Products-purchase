package com.example.ecommerce.controller;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CatalogProductRequest(
        @NotBlank(message = "Product name is required")
        @Size(max = 120, message = "Product name must be at most 120 characters")
        String name,

        @NotBlank(message = "Product description is required")
        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than zero")
        @Digits(integer = 8, fraction = 2, message = "Price can have at most two decimal places")
        BigDecimal price,

        @NotBlank(message = "Image URL is required")
        @Size(max = 2000, message = "Image URL must be at most 2000 characters")
        String imageUrl,

        @NotNull(message = "Image width is required")
        @Min(value = 1, message = "Image width must be positive")
        @Max(value = 100000, message = "Image width is too large")
        Integer imageWidth,

        @NotNull(message = "Image height is required")
        @Min(value = 1, message = "Image height must be positive")
        @Max(value = 100000, message = "Image height is too large")
        Integer imageHeight,

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity cannot be negative")
        Integer stockQuantity
) { }
