/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: WaitlistRepository.java
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

import com.fashionify.backend.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {
    List<Waitlist> findByProductIdAndSizeAndIsNotifiedFalse(Long productId, String size);
    boolean existsByEmailAndProductIdAndSizeAndIsNotifiedFalse(String email, Long productId, String size);
    void deleteByProductId(Long productId);
}
