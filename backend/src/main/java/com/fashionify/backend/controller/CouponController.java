package com.fashionify.backend.controller;

import com.fashionify.backend.entity.Coupon;
import com.fashionify.backend.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @GetMapping
    public ResponseEntity<?> getAllCoupons() {
        try {
            List<Coupon> coupons = couponRepository.findAllByDeletedAtIsNull();
            return ResponseEntity.ok(Map.of("success", true, "data", coupons));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            if (coupon.getIsActive() == null) {
                coupon.setIsActive(true);
            }
            if (coupon.getTotalRedemptions() == null) {
                coupon.setTotalRedemptions(0);
            }
            if (coupon.getDiscountPercentage() == null) {
                coupon.setDiscountPercentage(0.0);
            }
            coupon.setCode(coupon.getCode().toUpperCase());
            Coupon saved = couponRepository.save(coupon);
            return ResponseEntity.ok(Map.of("success", true, "data", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon couponDetails) {
        try {
            Optional<Coupon> opt = couponRepository.findById(id);
            if (opt.isEmpty() || opt.get().getDeletedAt() != null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Coupon not found"));
            }
            Coupon coupon = opt.get();
            coupon.setCode(couponDetails.getCode().toUpperCase());
            coupon.setDescription(couponDetails.getDescription());
            coupon.setType(couponDetails.getType());
            coupon.setValue(couponDetails.getValue());
            coupon.setMinimumOrderAmount(couponDetails.getMinimumOrderAmount());
            coupon.setStartDate(couponDetails.getStartDate());
            coupon.setExpiryDate(couponDetails.getExpiryDate());
            coupon.setMaxRedemptions(couponDetails.getMaxRedemptions());
            coupon.setPerUserLimit(couponDetails.getPerUserLimit());
            coupon.setIsActive(couponDetails.getIsActive() != null ? couponDetails.getIsActive() : true);
            coupon.setDiscountPercentage(0.0); // Maintain legacy field

            Coupon updated = couponRepository.save(coupon);
            return ResponseEntity.ok(Map.of("success", true, "data", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            Optional<Coupon> opt = couponRepository.findById(id);
            if (opt.isPresent()) {
                Coupon coupon = opt.get();
                coupon.setDeletedAt(LocalDateTime.now());
                couponRepository.save(coupon);
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Coupon deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validateCoupon(@PathVariable String code) {
        try {
            Optional<Coupon> opt = couponRepository.findByCodeAndDeletedAtIsNull(code.toUpperCase());
            if (opt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid coupon code"));
            }
            Coupon coupon = opt.get();
            if (!coupon.getIsActive()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Coupon is inactive"));
            }
            if (coupon.getStartDate() != null && coupon.getStartDate().isAfter(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Coupon is not active yet"));
            }
            if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Coupon has expired"));
            }
            if (coupon.getMaxRedemptions() != null && coupon.getTotalRedemptions() >= coupon.getMaxRedemptions()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Coupon redemption limit reached"));
            }

            return ResponseEntity.ok(Map.of("success", true, "data", coupon));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
