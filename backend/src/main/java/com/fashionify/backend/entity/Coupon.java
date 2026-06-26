/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: Coupon.java
 * Purpose: JPA Entity representing a database table schema.
 * Functions/Methods: 0
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

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Column(nullable = false)
    private String type; // PERCENTAGE, FIXED, FREE_SHIPPING

    @Column(nullable = false)
    private Double value; // Replaces discountPercentage

    // Kept to satisfy legacy MySQL non-null constraint without needing manual DB migrations
    @Column(name = "discount_percentage")
    @Builder.Default
    private Double discountPercentage = 0.0;

    private Double minimumOrderAmount;

    private LocalDateTime startDate;
    private LocalDateTime expiryDate;

    private Integer maxRedemptions;
    private Integer perUserLimit;
    
    @Builder.Default
    private Integer totalRedemptions = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private LocalDateTime deletedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
