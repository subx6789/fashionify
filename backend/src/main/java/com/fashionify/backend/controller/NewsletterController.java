package com.fashionify.backend.controller;

import com.fashionify.backend.entity.NewsletterSubscription;
import com.fashionify.backend.repository.NewsletterRepository;
import com.fashionify.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    @Autowired
    private NewsletterRepository newsletterRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");

        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid email address"));
        }

        email = email.trim().toLowerCase();

        if (newsletterRepository.existsByEmail(email)) {
            // Already subscribed
            return ResponseEntity.ok(Map.of("success", true, "message", "You are already subscribed to our newsletter!"));
        }

        NewsletterSubscription subscription = new NewsletterSubscription();
        subscription.setEmail(email);
        newsletterRepository.save(subscription);

        // Send a welcome email
        try {
            String subject = "Welcome to Fashionify Newsletter!";
            String text = "Thank you for subscribing to the Fashionify Newsletter. You will now receive our latest deals, exclusive offers, and fashion tips right in your inbox!";
            emailService.sendSimpleEmail(email, subject, text);
        } catch (Exception e) {
            System.err.println("Failed to send welcome newsletter email to " + email + ": " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Successfully subscribed to newsletter!"));
    }
}
