package com.example.ecommerce.repository;

import com.example.ecommerce.entity.CustomerOrder;
import com.example.ecommerce.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<CustomerOrder, String> {
    List<CustomerOrder> findByUserOrderByCreatedAtDesc(User user);
}
