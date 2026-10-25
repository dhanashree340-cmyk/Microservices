package com.ecommerce.orderservice.model;

/**
 * Order lifecycle states.
 *
 * PENDING    → CONFIRMED → PAID → SHIPPED → DELIVERED
 *     ↓           ↓
 * CANCELLED  CANCELLED
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PAID,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED
}
