/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: Product.java
 * Purpose: JPA Entity representing a database table schema.
 * Functions/Methods: 2
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_category", columnList = "category"),
    @Index(name = "idx_product_brand", columnList = "brand"),
    @Index(name = "idx_product_price", columnList = "price")
})

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Multiple images; first element is the cover image
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    private String brand;

    @Column(nullable = false)
    private Double price;

    private Double salePrice;

    // Per-size variants (stock lives here)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ProductSizeVariant> sizeVariants = new ArrayList<>();

    // Product tags — max 5, stored in product_tags join table, indexed for recommendation queries
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_tags",
            joinColumns = @JoinColumn(name = "product_id"),
            indexes = @Index(name = "idx_product_tag_tag", columnList = "tag"))
    @Column(name = "tag", length = 64)
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private Double averageReview;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Computed — sum of all size variant stocks
    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty("totalStock")
    public Integer getTotalStock() {
        if (sizeVariants == null || sizeVariants.isEmpty()) return 0;
        return sizeVariants.stream().mapToInt(ProductSizeVariant::getStock).sum();
    }

    // Expose the first image as "image" for backward compat with existing frontend tiles
    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty("image")
    public String getImage() {
        if (images != null && !images.isEmpty()) return images.get(0);
        return null;
    }
}
