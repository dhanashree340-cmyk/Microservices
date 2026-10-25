package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.OrderServiceClient;
import com.ecommerce.paymentservice.dto.PaymentRequest;
import com.ecommerce.paymentservice.dto.PaymentResponse;
import com.ecommerce.paymentservice.dto.RefundRequest;
import com.ecommerce.paymentservice.exception.PaymentNotFoundException;
import com.ecommerce.paymentservice.model.Payment;
import com.ecommerce.paymentservice.model.PaymentStatus;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing payment processing, status callbacks, and refunds.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderServiceClient orderServiceClient;

    /**
     * Process an incoming payment request.
     * Simulates payment gateway approval and notifies Order Service.
     */
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing payment for order {} amount {}", request.getOrderId(), request.getAmount());

        String transactionId = generateTransactionId();
        String gatewayRef = "PG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Simulate payment processing logic (e.g. valid card check or dummy gateway)
        boolean isSuccess = true;
        if (request.getCardNumber() != null && request.getCardNumber().endsWith("0000")) {
            isSuccess = false; // Simulate rejected payment card
        }

        Payment payment = Payment.builder()
                .transactionId(transactionId)
                .orderId(request.getOrderId())
                .customerId(request.getCustomerId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED)
                .paymentGatewayRef(gatewayRef)
                .failureReason(isSuccess ? null : "Card declined by issuing bank")
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Notify Order Service asynchronously or via Feign client
        if (isSuccess) {
            try {
                orderServiceClient.updateOrderStatus(request.getOrderId(), "PAID");
                log.info("Notified Order Service for order {} status PAID", request.getOrderId());
            } catch (Exception e) {
                log.warn("Failed to notify Order Service: {}", e.getMessage());
            }
        }

        return mapToResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException(id));
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new PaymentNotFoundException(transactionId));
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Process refund for a previously successful transaction.
     */
    public PaymentResponse refundPayment(Long paymentId, RefundRequest request) {
        log.info("Processing refund for payment id {}", paymentId);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Only successful payments can be refunded");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setFailureReason("Refunded: " + request.getReason());
        Payment updated = paymentRepository.save(payment);

        try {
            orderServiceClient.updateOrderStatus(payment.getOrderId(), "REFUNDED");
        } catch (Exception e) {
            log.warn("Could not notify Order Service of refund: {}", e.getMessage());
        }

        return mapToResponse(updated);
    }

    private String generateTransactionId() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "TXN-" + timestamp + "-" + random;
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .transactionId(payment.getTransactionId())
                .orderId(payment.getOrderId())
                .customerId(payment.getCustomerId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .paymentGatewayRef(payment.getPaymentGatewayRef())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
