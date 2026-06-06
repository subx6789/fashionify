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
