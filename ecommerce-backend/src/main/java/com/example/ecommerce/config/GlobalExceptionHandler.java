package com.example.ecommerce.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle @Valid validation failures → 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        Map<String, String> body = new LinkedHashMap<>();
        body.put("error", "Validation failed");
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // Handle invalid enum values (e.g., bad paymentMethod string) → 400
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            org.springframework.http.converter.HttpMessageNotReadableException ex) {
        String message = "Invalid request body";
        if (ex.getMessage() != null && ex.getMessage().contains("PaymentMethod")) {
            message = "Invalid payment method. Accepted values: CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, CASH_ON_DELIVERY";
        }
        Map<String, String> body = new LinkedHashMap<>();
        body.put("error", "Bad request");
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // Handle all RuntimeExceptions from service layer → 400
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("error", "Request failed");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
