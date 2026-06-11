package com.example.ecommerce.controller;

import com.example.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto.OrderResponse> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderDto.CreateOrderRequest request
    ) {
        return ResponseEntity.ok(orderService.createOrder(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<OrderDto.OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(orderService.getUserOrders(userDetails.getUsername()));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDto.OrderResponse> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderId,
            @RequestBody OrderDto.CancelOrderRequest request
    ) {
        return ResponseEntity.ok(orderService.cancelOrder(userDetails.getUsername(), orderId, request.getReason()));
    }
}
