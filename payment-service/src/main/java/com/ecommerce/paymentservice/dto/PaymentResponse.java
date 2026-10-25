package com.ecommerce.paymentservice.dto;

import com.ecommerce.paymentservice.model.PaymentMethod;
import com.ecommerce.paymentservice.model.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO representing payment result.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private String transactionId;
    private Long orderId;
    private Long customerId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String paymentGatewayRef;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
