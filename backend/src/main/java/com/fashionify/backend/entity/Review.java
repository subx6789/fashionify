package com.fashionify.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews",
       indexes = @Index(name = "idx_review_product", columnList = "product_id"),
       uniqueConstraints = @UniqueConstraint(name = "uq_review_user_product",
               columnNames = {"product_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String userName;

    @Column(columnDefinition = "TEXT")
    private String reviewMessage;

    @Column(nullable = false)
    private Integer reviewValue;

    /** True if the reviewer purchased this product and the order was delivered. */
    @Column(nullable = false)
    @Builder.Default
    private boolean verifiedPurchase = false;
    
    private String fitFeedback;
    
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
