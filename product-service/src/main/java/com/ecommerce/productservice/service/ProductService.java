package com.ecommerce.productservice.service;

import com.ecommerce.productservice.dto.*;
import com.ecommerce.productservice.exception.*;
import com.ecommerce.productservice.model.Product;
import com.ecommerce.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Product Service - business logic layer for product management.
 * Handles CRUD operations, stock management, and product queries.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * Creates a new product in the catalog.
     */
    public ProductResponse createProduct(ProductRequest request) {
        log.info("Creating product: {}", request.getName());

        if (request.getSku() != null && productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Product with SKU " + request.getSku() + " already exists");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .category(request.getCategory())
                .sku(request.getSku())
                .active(true)
                .build();

        Product saved = productRepository.save(product);
        log.info("Product created with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Retrieves a single product by ID.
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        log.debug("Fetching product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return mapToResponse(product);
    }

    /**
     * Retrieves all active products.
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        log.debug("Fetching all active products");
        return productRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves products by category.
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Searches products by name (case-insensitive).
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(name)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing product.
     */
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        log.info("Updating product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(request.getCategory());

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    /**
     * Soft-deletes a product (sets active = false).
     */
    public void deleteProduct(Long id) {
        log.info("Soft-deleting product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        product.setActive(false);
        productRepository.save(product);
    }

    /**
     * Checks availability of a product - used by Order Service.
     */
    @Transactional(readOnly = true)
    public ProductAvailabilityResponse checkAvailability(Long productId, int requestedQuantity) {
        log.debug("Checking availability for product: {}, qty: {}", productId, requestedQuantity);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        return ProductAvailabilityResponse.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .availableQuantity(product.getStockQuantity())
                .inStock(product.getStockQuantity() >= requestedQuantity)
                .build();
    }

    /**
     * Reserves (decrements) stock - called when an order is confirmed.
     */
    public void reserveStock(Long productId, int quantity) {
        log.info("Reserving {} units of product {}", quantity, productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        if (product.getStockQuantity() < quantity) {
            throw new InsufficientStockException(productId, quantity, product.getStockQuantity());
        }

        int updated = productRepository.decreaseStock(productId, quantity);
        if (updated == 0) {
            throw new InsufficientStockException(productId, quantity, product.getStockQuantity());
        }
        log.info("Reserved {} units of product {}", quantity, productId);
    }

    /**
     * Releases (increments) stock - called on order cancellation.
     */
    public void releaseStock(Long productId, int quantity) {
        log.info("Releasing {} units back to product {}", quantity, productId);
        productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        productRepository.increaseStock(productId, quantity);
    }

    // ─── Mapper ──────────────────────────────────────────────────────────────

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .category(product.getCategory())
                .sku(product.getSku())
                .active(product.getActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
