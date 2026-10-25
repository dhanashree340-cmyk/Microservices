package com.ecommerce.productservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO for creating or updating a product.
 * Decouples the API contract from the internal entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 150)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin("0.01")
    private BigDecimal price;

    @NotNull(message = "Stock quantity is required")
    @Min(0)
    private Integer stockQuantity;

    @NotBlank(message = "Category is required")
    private String category;

    private String sku;
}
