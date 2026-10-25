package com.ecommerce.productservice;

import com.ecommerce.productservice.dto.ProductAvailabilityResponse;
import com.ecommerce.productservice.dto.ProductRequest;
import com.ecommerce.productservice.dto.ProductResponse;
import com.ecommerce.productservice.exception.InsufficientStockException;
import com.ecommerce.productservice.exception.ProductNotFoundException;
import com.ecommerce.productservice.model.Product;
import com.ecommerce.productservice.repository.ProductRepository;
import com.ecommerce.productservice.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = Product.builder()
                .id(1L)
                .name("Wireless Noise Cancelling Headphones")
                .description("Premium sound headphones")
                .price(new BigDecimal("199.99"))
                .stockQuantity(50)
                .category("Electronics")
                .sku("ELEC-HEAD-001")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should create product successfully")
    void testCreateProduct() {
        ProductRequest request = ProductRequest.builder()
                .name("Wireless Noise Cancelling Headphones")
                .description("Premium sound headphones")
                .price(new BigDecimal("199.99"))
                .stockQuantity(50)
                .category("Electronics")
                .sku("ELEC-HEAD-001")
                .build();

        when(productRepository.existsBySku("ELEC-HEAD-001")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.createProduct(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Wireless Noise Cancelling Headphones");
        assertThat(response.getPrice()).isEqualByComparingTo("199.99");
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw exception when getting non-existent product")
    void testGetProductByIdNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(99L))
                .isInstanceOf(ProductNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Should check product stock availability accurately")
    void testCheckAvailability() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        ProductAvailabilityResponse available = productService.checkAvailability(1L, 10);
        assertThat(available.getInStock()).isTrue();
        assertThat(available.getAvailableQuantity()).isEqualTo(50);

        ProductAvailabilityResponse outOfStock = productService.checkAvailability(1L, 60);
        assertThat(outOfStock.getInStock()).isFalse();
    }

    @Test
    @DisplayName("Should reserve stock when quantity is sufficient")
    void testReserveStockSuccess() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.decreaseStock(1L, 10)).thenReturn(1);

        productService.reserveStock(1L, 10);

        verify(productRepository, times(1)).decreaseStock(1L, 10);
    }

    @Test
    @DisplayName("Should throw InsufficientStockException when reserving more than available")
    void testReserveStockInsufficient() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        assertThatThrownBy(() -> productService.reserveStock(1L, 100))
                .isInstanceOf(InsufficientStockException.class);
    }
}
