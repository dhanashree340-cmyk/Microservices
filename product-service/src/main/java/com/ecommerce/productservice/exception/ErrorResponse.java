package com.ecommerce.productservice.exception;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Structured error response body returned on API errors.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
}
