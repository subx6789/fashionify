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
}
