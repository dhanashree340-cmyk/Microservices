package com.ecommerce.paymentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign client for notifying Order Service about payment outcomes.
 */
@FeignClient(name = "order-service", fallback = OrderClientFallback.class)
public interface OrderServiceClient {

    @PatchMapping("/api/orders/{id}/status")
    void updateOrderStatus(@PathVariable("id") Long orderId, @RequestParam("status") String status);
}
