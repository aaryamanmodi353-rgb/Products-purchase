package com.example.ecommerce.service;

import com.example.ecommerce.controller.OrderDto;
import com.example.ecommerce.entity.CustomerOrder;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.OrderStatus;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.ReturnRequest;
import com.example.ecommerce.entity.ReturnRequestStatus;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.ReturnRequestRepository;
import com.example.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReturnRequestRepository returnRequestRepository;

    public OrderDto.OrderResponse createOrder(String userEmail, OrderDto.CreateOrderRequest request) {
        // Defensive validation
        if (request.paymentMethod() == null) {
            throw new RuntimeException("Payment method is required");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new RuntimeException("Order must contain at least one item");
        }

        User user = userRepository.findFirstByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            throw new RuntimeException("You must add a shipping address in your Profile Settings before checking out.");
        }

        CustomerOrder order = CustomerOrder.builder()
                .user(user)
                .status(OrderStatus.CONFIRMED)
                .paymentMethod(request.paymentMethod())
                .createdAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderDto.OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.productId()));

            if (product.getStockQuantity() < itemReq.quantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }

            // Decrease stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.quantity());
            productRepository.save(product);

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.quantity())
                    .priceAtPurchase(product.getPrice())
                    .build();

            order.getItems().add(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity())));
        }

        order.setTotalAmount(total);
        CustomerOrder saved = orderRepository.save(order);

        return mapToResponse(saved);
    }

    public List<OrderDto.OrderResponse> getUserOrders(String userEmail) {
        User user = userRepository.findFirstByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderDto.OrderResponse getOrder(String userEmail, String orderId) {
        User user = findUser(userEmail);
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        requireOwner(order, user);
        return mapToResponse(order);
    }

    public CreateReturnResult createReturnRequest(
            String userEmail,
            String orderId,
            OrderDto.CreateReturnRequest request
    ) {
        User user = findUser(userEmail);
        String reason = request.reason().trim();

        var existing = returnRequestRepository.findByUserIdAndIdempotencyKey(user.getId(), request.idempotencyKey());
        if (existing.isPresent()) {
            ReturnRequest returnRequest = existing.get();
            if (!returnRequest.getOrderId().equals(orderId) || !returnRequest.getReason().equals(reason)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Idempotency key was already used for a different return request");
            }
            CustomerOrder order = findOwnedOrder(orderId, user);
            if (order.getStatus() == OrderStatus.DELIVERED) {
                order.setStatus(OrderStatus.RETURN_REQUESTED);
                orderRepository.save(order);
            }
            return new CreateReturnResult(toReturnResponse(returnRequest), false);
        }

        CustomerOrder order = findOwnedOrder(orderId, user);
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A return can only be requested for a delivered order");
        }

        ReturnRequest returnRequest = ReturnRequest.builder()
                .orderId(orderId)
                .userId(user.getId())
                .idempotencyKey(request.idempotencyKey())
                .reason(reason)
                .status(ReturnRequestStatus.PENDING_REVIEW)
                .createdAt(Instant.now())
                .build();

        try {
            returnRequest = returnRequestRepository.save(returnRequest);
        } catch (DuplicateKeyException ex) {
            var duplicate = returnRequestRepository.findByUserIdAndIdempotencyKey(user.getId(), request.idempotencyKey());
            if (duplicate.isPresent()
                    && duplicate.get().getOrderId().equals(orderId)
                    && duplicate.get().getReason().equals(reason)) {
                return new CreateReturnResult(toReturnResponse(duplicate.get()), false);
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A return request already exists for this order", ex);
        }

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        orderRepository.save(order);
        return new CreateReturnResult(toReturnResponse(returnRequest), true);
    }

    public OrderDto.ReturnRequestResponse getReturnRequest(String userEmail, String returnRequestId) {
        User user = findUser(userEmail);
        ReturnRequest returnRequest = returnRequestRepository.findByIdAndUserId(returnRequestId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Return request not found"));
        return toReturnResponse(returnRequest);
    }

    public OrderDto.OrderResponse cancelOrder(String userEmail, String orderId, String reason) {
        User user = findUser(userEmail);
        CustomerOrder order = findOwnedOrder(orderId, user);

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only pending or confirmed orders can be cancelled");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("A cancellation reason is required");
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason.trim());
        CustomerOrder saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    private OrderDto.OrderResponse mapToResponse(CustomerOrder order) {
        List<OrderDto.OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderDto.OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getImageUrl(),
                        item.getQuantity(),
                        item.getPriceAtPurchase()))
                .collect(Collectors.toList());

        return new OrderDto.OrderResponse(
                order.getId(),
                items,
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getPaymentMethod().name(),
                order.getCreatedAt(),
                order.getDeliveredAt(),
                order.getCarrier(),
                order.getTrackingNumber(),
                order.getCancelReason());
    }

    private User findUser(String userEmail) {
        return userRepository.findFirstByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private CustomerOrder findOwnedOrder(String orderId, User user) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        requireOwner(order, user);
        return order;
    }

    private void requireOwner(CustomerOrder order, User user) {
        if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
    }

    private OrderDto.ReturnRequestResponse toReturnResponse(ReturnRequest returnRequest) {
        return new OrderDto.ReturnRequestResponse(
                returnRequest.getId(),
                returnRequest.getOrderId(),
                returnRequest.getStatus(),
                returnRequest.getReason(),
                returnRequest.getCreatedAt());
    }

    public record CreateReturnResult(OrderDto.ReturnRequestResponse response, boolean created) {
    }
}
