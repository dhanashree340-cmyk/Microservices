package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.client.ProductServiceClient;
import com.ecommerce.orderservice.dto.*;
import com.ecommerce.orderservice.exception.OrderNotFoundException;
import com.ecommerce.orderservice.model.*;
import com.ecommerce.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Order Service - orchestrates order creation, status updates, and cancellations.
 *
 * Key interactions:
 *  - Calls Product Service (via Feign) to validate stock before confirming.
 *  - Reserves stock when order is confirmed.
 *  - Releases stock on cancellation (compensating transaction).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;

    /**
     * Creates and confirms a new order.
     * Validates product availability and reserves stock atomically.
     */
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creating order for customer: {}", request.getCustomerId());

        // Validate all items and calculate total
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            // Check product availability via Feign → Product Service
            ProductAvailabilityResponse availability =
                productServiceClient.checkAvailability(itemRequest.getProductId(), itemRequest.getQuantity());

            if (!availability.getInStock()) {
                throw new RuntimeException(
                    "Product " + itemRequest.getProductId() + " is out of stock or insufficient quantity"
                );
            }

            BigDecimal subtotal = availability.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .productName(availability.getName())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(availability.getPrice())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(item);
            totalAmount = totalAmount.add(subtotal);
        }

        // Build and persist the order
        String orderNumber = generateOrderNumber();
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerId(request.getCustomerId())
                .status(OrderStatus.CONFIRMED)
                .totalAmount(totalAmount)
                .shippingAddress(request.getShippingAddress())
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Associate items with saved order
        orderItems.forEach(item -> {
            item.setOrder(savedOrder);
            savedOrder.getItems().add(item);
        });

        Order finalOrder = orderRepository.save(savedOrder);

        // Reserve stock for all items in Product Service
        for (OrderItemRequest itemRequest : request.getItems()) {
            productServiceClient.reserveStock(itemRequest.getProductId(), itemRequest.getQuantity());
        }

        log.info("Order {} created successfully for customer {}", orderNumber, request.getCustomerId());
        return mapToResponse(finalOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Updates order status (e.g., PAID, SHIPPED, DELIVERED).
     * Called by Payment Service callback or admin actions.
     */
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        log.info("Updating order {} status to {}", id, newStatus);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        order.setStatus(newStatus);
        return mapToResponse(orderRepository.save(order));
    }

    /**
     * Cancels an order and releases reserved stock (compensating transaction).
     */
    public OrderResponse cancelOrder(Long id) {
        log.info("Cancelling order {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SHIPPED) {
            throw new IllegalStateException("Cannot cancel an order that has been shipped or delivered");
        }

        // Release reserved stock (compensating transaction)
        if (order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.PAID) {
            order.getItems().forEach(item ->
                productServiceClient.releaseStock(item.getProductId(), item.getQuantity())
            );
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToResponse(orderRepository.save(order));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        String unique = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + timestamp + "-" + unique;
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomerId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(itemResponses)
                .shippingAddress(order.getShippingAddress())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
