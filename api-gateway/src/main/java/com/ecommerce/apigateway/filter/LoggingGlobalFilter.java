package com.ecommerce.apigateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Global reactive filter:
 * - Injects X-Correlation-ID header into every incoming request for distributed tracing
 * - Logs request method, path, remote IP, and processing duration
 */
@Component
@Slf4j
public class LoggingGlobalFilter implements GlobalFilter, Ordered {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();

        ServerHttpRequest request = exchange.getRequest();
        String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        // Mutate request to propagate Correlation ID to downstream microservices
        ServerHttpRequest modifiedRequest = request.mutate()
                .header(CORRELATION_ID_HEADER, correlationId)
                .build();

        ServerWebExchange modifiedExchange = exchange.mutate()
                .request(modifiedRequest)
                .build();

        String finalCorrelationId = correlationId;
        log.info("[{}] -> Incoming Request: {} {} from {}",
                finalCorrelationId,
                request.getMethod(),
                request.getURI().getPath(),
                request.getRemoteAddress());

        return chain.filter(modifiedExchange).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = modifiedExchange.getResponse().getStatusCode() != null
                    ? modifiedExchange.getResponse().getStatusCode().value()
                    : 0;

            log.info("[{}] <- Response: {} in {}ms", finalCorrelationId, statusCode, duration);
        }));
    }

    @Override
    public int getOrder() {
        return -1; // High priority in filter chain
    }
}
