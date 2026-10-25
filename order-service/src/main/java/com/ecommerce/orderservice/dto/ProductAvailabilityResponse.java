package com.ecommerce.orderservice.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Mirrors the ProductAvailabilityResponse from product-service.
 * Kept local to avoid tight coupling to product-service's model jar.
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
