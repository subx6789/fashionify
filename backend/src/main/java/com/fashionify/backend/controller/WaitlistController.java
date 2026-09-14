/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: WaitlistController.java
 * Purpose: Spring Boot REST Controller handling incoming HTTP requests and routing.
 * Functions/Methods: 0
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.controller;

import com.fashionify.backend.entity.Waitlist;
import com.fashionify.backend.repository.WaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    @Autowired
    private WaitlistRepository waitlistRepository;

    @PostMapping
    public ResponseEntity<?> joinWaitlist(@jakarta.validation.Valid @RequestBody com.fashionify.backend.dto.WaitlistRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Long productId = request.getProductId();
        String size = request.getSize().trim();

        if (waitlistRepository.existsByEmailAndProductIdAndSizeAndIsNotifiedFalse(
                email, productId, size)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "You are already on the waitlist for this item."
            ));
        }
        
        Waitlist waitlist = new Waitlist();
        waitlist.setEmail(email);
        waitlist.setProductId(productId);
        waitlist.setSize(size);
        
        Waitlist saved = waitlistRepository.save(waitlist);
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully joined the waitlist! We will notify you when it's back in stock.",
                "data", saved
        ));
    }
}
