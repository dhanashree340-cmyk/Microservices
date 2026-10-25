package com.ecommerce.paymentservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request DTO for initiating a refund.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {
    @NotBlank(message = "Reason for refund is required")
    private String reason;
}
