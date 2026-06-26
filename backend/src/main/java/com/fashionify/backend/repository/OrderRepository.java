/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: OrderRepository.java
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

import com.fashionify.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);
    void deleteByUserId(Long userId);

    @Query("""
        SELECT o FROM Order o
        JOIN o.orderItems oi
        WHERE oi.productId = :productId
        AND o.orderStatus NOT IN ('delivered', 'CANCELLED')
        """)
    List<Order> findActiveOrdersByProductId(@Param("productId") String productId);

    // Used by verified-purchase rating check
    @Query("""
        SELECT COUNT(o) > 0 FROM Order o
        JOIN o.orderItems oi
        WHERE o.user.id = :userId
        AND oi.productId = :productId
        AND o.orderStatus = 'delivered'
        """)
    boolean existsDeliveredOrderForProduct(@Param("userId") Long userId,
                                           @Param("productId") String productId);

    // Used by verified-buyer check to count total products purchased
    @Query("""
        SELECT COALESCE(SUM(oi.quantity), 0) FROM Order o
        JOIN o.orderItems oi
        WHERE o.user.id = :userId
        AND o.orderStatus = 'delivered'
        """)
    Long countDeliveredProductsForUser(@Param("userId") Long userId);
}
