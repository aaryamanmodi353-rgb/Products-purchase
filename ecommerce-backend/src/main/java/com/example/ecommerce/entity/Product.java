package com.example.ecommerce.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    private String id;

    private String name;

    private String description;

    private BigDecimal price;

    private String imageUrl;

    private Integer stockQuantity;

    private String sku;

    private String catalogSource;

    private Long catalogVersion;

    @JsonIgnore
    private String commercetoolsId;

    @JsonIgnore
    private String commercetoolsKey;
}
