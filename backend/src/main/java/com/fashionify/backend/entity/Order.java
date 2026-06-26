/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: Order.java
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String cartId; // To track original cart if needed

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @Embedded
    private OrderAddress addressInfo;

    private String orderStatus;
    private String paymentMethod;
    private String paymentStatus;
    private Double totalAmount;
    
    private LocalDateTime orderDate;
    private LocalDateTime orderUpdateDate;
    
    private String paymentId;
    private String payerId;

    private String shippingMethod;
    private Double shippingCost;
    private Boolean isGiftWrapped;
    private String appliedPromoCode;
    private Double discountAmount;

    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    public void removeOrderItem(OrderItem item) {
        orderItems.remove(item);
        item.setOrder(null);
    }
}
