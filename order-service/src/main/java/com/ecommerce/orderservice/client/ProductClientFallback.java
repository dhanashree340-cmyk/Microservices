package com.ecommerce.orderservice.client;

import com.ecommerce.orderservice.dto.ProductAvailabilityResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Fallback implementation for ProductServiceClient.
 * Activated when Product Service is unavailable or circuit breaker is open.
 * Returns sensible defaults to prevent cascading failures.
 */
@Component
@Slf4j
public class ProductClientFallback implements ProductServiceClient {

    @Override
    public ProductAvailabilityResponse checkAvailability(Long productId, int quantity) {
        log.warn("FALLBACK: Product Service unavailable. Cannot check availability for product {}", productId);
        return ProductAvailabilityResponse.builder()
                .productId(productId)
                .name("Unknown Product")
                .price(BigDecimal.ZERO)
                .availableQuantity(0)
                .inStock(false)
                .build();
    }

    @Override
    public void reserveStock(Long productId, int quantity) {
        log.warn("FALLBACK: Product Service unavailable. Cannot reserve stock for product {}", productId);
        throw new RuntimeException("Product Service is currently unavailable. Please try again later.");
    }

    @Override
    public void releaseStock(Long productId, int quantity) {
        log.warn("FALLBACK: Product Service unavailable. Cannot release stock for product {}", productId);
    }
}
