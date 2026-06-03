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
            List<Coupon> coupons = couponRepository.findAll();
            return ResponseEntity.ok(Map.of("success", true, "data", coupons));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            coupon.setCode(coupon.getCode().toUpperCase());
            Coupon saved = couponRepository.save(coupon);
            return ResponseEntity.ok(Map.of("success", true, "data", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            couponRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Coupon deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validateCoupon(@PathVariable String code) {
        try {
            Optional<Coupon> opt = couponRepository.findByCode(code.toUpperCase());
            if (opt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid coupon code"));
            }
            Coupon coupon = opt.get();
            if (!coupon.getIsActive()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Coupon is inactive"));
            }
            if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Coupon has expired"));
            }

            return ResponseEntity.ok(Map.of("success", true, "data", coupon));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
