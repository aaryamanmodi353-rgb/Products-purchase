package com.example.ecommerce.repository;

import com.example.ecommerce.entity.ReturnRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends MongoRepository<ReturnRequest, String> {

    Optional<ReturnRequest> findByUserIdAndIdempotencyKey(String userId, String idempotencyKey);

    Optional<ReturnRequest> findByIdAndUserId(String id, String userId);
}
