package com.ecommerce.productservice.controller;

import com.ecommerce.productservice.dto.*;
import com.ecommerce.productservice.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Product API.
 *
 * Base URL: /api/products
 *
 * Endpoints:
 *   GET    /api/products              - list all active products
 *   GET    /api/products/{id}         - get product by ID
 *   GET    /api/products/category/{c} - filter by category
 *   GET    /api/products/search?name= - search by name
 *   POST   /api/products              - create product
 *   PUT    /api/products/{id}         - update product
 *   DELETE /api/products/{id}         - soft delete
 *   GET    /api/products/{id}/availability?qty= - check stock
 *   POST   /api/products/{id}/reserve?qty=      - reserve stock
 *   POST   /api/products/{id}/release?qty=      - release stock
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        log.info("GET /api/products");
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        log.info("GET /api/products/{}", id);
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(
            @PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(
            @RequestParam String name) {
        return ResponseEntity.ok(productService.searchProducts(name));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request) {
        log.info("POST /api/products - {}", request.getName());
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        log.info("PUT /api/products/{}", id);
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("DELETE /api/products/{}", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Called by Order Service to check if enough stock exists.
     */
    @GetMapping("/{id}/availability")
    public ResponseEntity<ProductAvailabilityResponse> checkAvailability(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int qty) {
        return ResponseEntity.ok(productService.checkAvailability(id, qty));
    }

    /**
     * Called by Order Service to reserve (decrement) stock on order placement.
     */
    @PostMapping("/{id}/reserve")
    public ResponseEntity<Void> reserveStock(
            @PathVariable Long id,
            @RequestParam int qty) {
        log.info("Reserving {} units for product {}", qty, id);
        productService.reserveStock(id, qty);
        return ResponseEntity.ok().build();
    }

    /**
     * Called by Order Service to release stock on order cancellation.
     */
    @PostMapping("/{id}/release")
    public ResponseEntity<Void> releaseStock(
            @PathVariable Long id,
            @RequestParam int qty) {
        log.info("Releasing {} units for product {}", qty, id);
        productService.releaseStock(id, qty);
        return ResponseEntity.ok().build();
    }
}
