package com.ecommerce.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Fallback endpoints invoked when downstream microservices trip the circuit breaker.
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> productFallback() {
        return buildFallbackResponse("Product Service is temporarily unavailable. Please retry shortly.");
    }

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> orderFallback() {
        return buildFallbackResponse("Order Service is temporarily unavailable. Please retry shortly.");
    }

    @GetMapping("/payments")
    public ResponseEntity<Map<String, Object>> paymentFallback() {
        return buildFallbackResponse("Payment Service is temporarily unavailable. Please retry shortly.");
    }

    private ResponseEntity<Map<String, Object>> buildFallbackResponse(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        body.put("error", "Service Unavailable");
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }
}
