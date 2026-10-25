package com.ecommerce.orderservice.client;

import com.ecommerce.orderservice.dto.ProductAvailabilityResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

/**
 * Feign client for communicating with the Product Service.
 * Service name "product-service" is resolved via Eureka Service Discovery.
 * Falls back to ProductClientFallback on circuit breaker open.
 */
@FeignClient(
    name = "product-service",
    fallback = ProductClientFallback.class
)
public interface ProductServiceClient {

    @GetMapping("/api/products/{id}/availability")
    ProductAvailabilityResponse checkAvailability(
        @PathVariable("id") Long productId,
        @RequestParam("qty") int quantity
    );

    @PostMapping("/api/products/{id}/reserve")
    void reserveStock(
        @PathVariable("id") Long productId,
        @RequestParam("qty") int quantity
    );

    @PostMapping("/api/products/{id}/release")
    void releaseStock(
        @PathVariable("id") Long productId,
        @RequestParam("qty") int quantity
    );
}
