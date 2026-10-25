package com.ecommerce.paymentservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Circuit breaker fallback for OrderServiceClient.
 */
@Component
@Slf4j
public class OrderClientFallback implements OrderServiceClient {

    @Override
    public void updateOrderStatus(Long orderId, String status) {
        log.warn("FALLBACK: Order Service is currently unavailable. Failed to update order {} to status {}", orderId, status);
    }
}
