package com.ecommerce.orderservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for a single line item in an order request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
