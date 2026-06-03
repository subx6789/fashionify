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
    public ResponseEntity<?> joinWaitlist(@RequestBody Waitlist request) {
        try {
            if (waitlistRepository.existsByEmailAndProductIdAndSizeAndIsNotifiedFalse(
                    request.getEmail(), request.getProductId(), request.getSize())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "You are already on the waitlist for this item."
                ));
            }
            
            Waitlist waitlist = new Waitlist();
            waitlist.setEmail(request.getEmail());
            waitlist.setProductId(request.getProductId());
            waitlist.setSize(request.getSize());
            
            Waitlist saved = waitlistRepository.save(waitlist);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Successfully joined the waitlist! We will notify you when it's back in stock.",
                    "data", saved
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}
