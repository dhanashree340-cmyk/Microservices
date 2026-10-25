package com.ecommerce.paymentservice;

import com.ecommerce.paymentservice.client.OrderServiceClient;
import com.ecommerce.paymentservice.dto.PaymentRequest;
import com.ecommerce.paymentservice.dto.PaymentResponse;
import com.ecommerce.paymentservice.model.Payment;
import com.ecommerce.paymentservice.model.PaymentMethod;
import com.ecommerce.paymentservice.model.PaymentStatus;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.ecommerce.paymentservice.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderServiceClient orderServiceClient;

    @InjectMocks
    private PaymentService paymentService;

    private PaymentRequest paymentRequest;

    @BeforeEach
    void setUp() {
        paymentRequest = PaymentRequest.builder()
                .orderId(10L)
                .customerId(101L)
                .amount(new BigDecimal("99.98"))
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .cardNumber("4111111111111234")
                .build();
    }

    @Test
    @DisplayName("Should successfully process valid payment and update order status to PAID")
    void testProcessPaymentSuccess() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        PaymentResponse response = paymentService.processPayment(paymentRequest);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(response.getTransactionId()).startsWith("TXN-");
        assertThat(response.getAmount()).isEqualByComparingTo("99.98");

        verify(paymentRepository, times(1)).save(any(Payment.class));
        verify(orderServiceClient, times(1)).updateOrderStatus(10L, "PAID");
    }

    @Test
    @DisplayName("Should mark payment FAILED when test card ends in 0000")
    void testProcessPaymentFailed() {
        paymentRequest.setCardNumber("4111111111110000");

        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(2L);
            return p;
        });

        PaymentResponse response = paymentService.processPayment(paymentRequest);

        assertThat(response.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(response.getFailureReason()).contains("Card declined");
        verify(orderServiceClient, never()).updateOrderStatus(anyLong(), anyString());
    }
}
