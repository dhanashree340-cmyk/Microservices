package com.ecommerce.paymentservice.exception;

public class PaymentNotFoundException extends RuntimeException {
    public PaymentNotFoundException(Long id) {
        super("Payment not found with id: " + id);
    }

    public PaymentNotFoundException(String transactionId) {
        super("Payment not found with transaction ID: " + transactionId);
    }
}
