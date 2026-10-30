package com.example.ecommerce.controller;

import com.example.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnRequestController {

    private final OrderService orderService;

    @GetMapping("/{returnRequestId}")
    public ResponseEntity<OrderDto.ReturnRequestResponse> getReturnRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String returnRequestId
    ) {
        return ResponseEntity.ok(orderService.getReturnRequest(userDetails.getUsername(), returnRequestId));
    }
}
