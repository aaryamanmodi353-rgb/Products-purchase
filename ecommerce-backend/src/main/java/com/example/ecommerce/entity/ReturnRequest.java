package com.example.ecommerce.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "return_requests")
@CompoundIndex(
        name = "return_user_idempotency_unique",
        def = "{'userId': 1, 'idempotencyKey': 1}",
        unique = true
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequest {

    @Id
    private String id;

    @Indexed(name = "return_order_unique", unique = true)
    private String orderId;

    private String userId;

    private String idempotencyKey;

    private String reason;

    private ReturnRequestStatus status;

    private Instant createdAt;
}
