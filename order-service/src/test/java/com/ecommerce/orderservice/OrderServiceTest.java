package com.ecommerce.orderservice;

import com.ecommerce.orderservice.client.ProductServiceClient;
import com.ecommerce.orderservice.dto.CreateOrderRequest;
import com.ecommerce.orderservice.dto.OrderItemRequest;
import com.ecommerce.orderservice.dto.OrderResponse;
import com.ecommerce.orderservice.dto.ProductAvailabilityResponse;
import com.ecommerce.orderservice.model.Order;
import com.ecommerce.orderservice.model.OrderStatus;
import com.ecommerce.orderservice.repository.OrderRepository;
import com.ecommerce.orderservice.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductServiceClient productServiceClient;

    @InjectMocks
    private OrderService orderService;

    private CreateOrderRequest createRequest;

    @BeforeEach
    void setUp() {
        createRequest = CreateOrderRequest.builder()
                .customerId(101L)
                .shippingAddress("123 Microservices Way, Cloud City")
                .items(Collections.singletonList(
                        OrderItemRequest.builder()
                                .productId(1L)
                                .quantity(2)
                                .build()
                ))
                .build();
    }

    @Test
    @DisplayName("Should create order successfully when product is in stock")
    void testCreateOrderSuccess() {
        ProductAvailabilityResponse availability = ProductAvailabilityResponse.builder()
                .productId(1L)
                .name("Laptop Stand")
                .price(new BigDecimal("49.99"))
                .availableQuantity(20)
                .inStock(true)
                .build();

        when(productServiceClient.checkAvailability(1L, 2)).thenReturn(availability);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(10L);
            return o;
        });

        OrderResponse response = orderService.createOrder(createRequest);

        assertThat(response).isNotNull();
        assertThat(response.getCustomerId()).isEqualTo(101L);
        assertThat(response.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(response.getTotalAmount()).isEqualByComparingTo("99.98");

        verify(productServiceClient, times(1)).reserveStock(1L, 2);
        verify(orderRepository, atLeastOnce()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should fail order creation when product is out of stock")
    void testCreateOrderOutOfStock() {
        ProductAvailabilityResponse availability = ProductAvailabilityResponse.builder()
                .productId(1L)
                .name("Laptop Stand")
                .price(new BigDecimal("49.99"))
                .availableQuantity(0)
                .inStock(false)
                .build();

        when(productServiceClient.checkAvailability(1L, 2)).thenReturn(availability);

        assertThatThrownBy(() -> orderService.createOrder(createRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("out of stock");

        verify(productServiceClient, never()).reserveStock(anyLong(), anyInt());
    }

    @Test
    @DisplayName("Should cancel order and release reserved stock")
    void testCancelOrder() {
        Order existingOrder = Order.builder()
                .id(5L)
                .orderNumber("ORD-12345")
                .customerId(101L)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("99.98"))
                .items(Collections.emptyList())
                .build();

        when(orderRepository.findById(5L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(existingOrder);

        OrderResponse cancelled = orderService.cancelOrder(5L);

        assertThat(cancelled.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(orderRepository, times(1)).save(existingOrder);
    }
}
