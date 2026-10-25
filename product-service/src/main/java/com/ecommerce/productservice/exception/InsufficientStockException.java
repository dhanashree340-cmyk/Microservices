package com.ecommerce.productservice.exception;

/**
 * Thrown when a stock reservation request exceeds available inventory.
 */
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(Long productId, int requested, int available) {
        super(String.format(
            "Insufficient stock for product %d. Requested: %d, Available: %d",
            productId, requested, available
        ));
    }
}
