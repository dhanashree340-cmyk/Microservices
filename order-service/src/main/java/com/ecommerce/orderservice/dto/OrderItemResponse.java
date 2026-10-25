package com.ecommerce.orderservice.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Response DTO for an individual order line item.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
