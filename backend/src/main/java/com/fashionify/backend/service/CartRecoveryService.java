/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: CartRecoveryService.java
 * Purpose: Spring Boot Service containing core business logic and database orchestration.
 * Functions/Methods: 1
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.service;

import com.fashionify.backend.entity.Cart;
import com.fashionify.backend.repository.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CartRecoveryService {

    private static final Logger logger = LoggerFactory.getLogger(CartRecoveryService.class);

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Runs every hour to check for abandoned carts.
     * An abandoned cart is defined as a cart with items that hasn't been updated in over 24 hours.
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    // @Scheduled(fixedRate = 60000) // Uncomment to test every minute
    public void processAbandonedCarts() {
        logger.info("Starting Cart Recovery Service: Checking for abandoned carts...");
        
        List<Cart> allCarts = cartRepository.findAll();
        LocalDateTime thresholdTime = LocalDateTime.now().minusHours(24);
        
        long abandonedCount = 0;
        
        for (Cart cart : allCarts) {
            // Check if cart has items and was last updated before the threshold time
            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                if (cart.getUpdatedAt() != null && cart.getUpdatedAt().isBefore(thresholdTime)) {
                    abandonedCount++;
                    
                    // Send email using EmailService
                    try {
                        logger.info("Sending automated recovery email to {}", cart.getUser().getEmail());
                        String subject = "You left something behind! Complete your order with 10% off";
                        String text = String.format("Hey %s, you left %d items in your cart. Come back and use code RECOVER10 to finish your purchase!", 
                                    cart.getUser().getUserName(), cart.getItems().size());
                        emailService.sendSimpleEmail(cart.getUser().getEmail(), subject, text);
                    } catch (Exception e) {
                        logger.error("Failed to send automated recovery email to {}: {}", cart.getUser().getEmail(), e.getMessage());
                    }
                    
                    // You might also want to mark that an email was sent for this cart update
                    // so you don't spam them every hour. For a complete implementation, 
                    // add a `recoveryEmailSent` boolean to the Cart entity.
                }
            }
        }
        
        logger.info("Cart Recovery Service finished. Processed {} abandoned carts.", abandonedCount);
    }
}
