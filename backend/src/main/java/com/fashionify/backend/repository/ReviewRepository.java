package com.fashionify.backend.repository;

import com.fashionify.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductId(Long productId);

    boolean existsByProductIdAndUserId(Long productId, Long userId);
    void deleteByProductId(Long productId);
    void deleteByUserId(Long userId);
}
