/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: ProductSizeVariantRepository.java
 * Purpose: Spring Data JPA Repository for database CRUD operations.
 * Functions/Methods: 0
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.repository;

import com.fashionify.backend.entity.ProductSizeVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductSizeVariantRepository extends JpaRepository<ProductSizeVariant, Long> {
    List<ProductSizeVariant> findByProductId(Long productId);
}
