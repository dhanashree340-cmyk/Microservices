package com.ecommerce.productservice.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Lightweight DTO used by other microservices (e.g., Order Service)
 * when they query product availability and pricing.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAvailabilityResponse {

    private Long productId;
    private String name;
    private BigDecimal price;
    private Integer availableQuantity;
    private Boolean inStock;
}
