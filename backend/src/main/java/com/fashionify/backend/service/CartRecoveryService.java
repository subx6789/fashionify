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
                    
                    // In a real application, you would send an email using JavaMailSender here.
                    // For now, we simulate this via logger since there's no SMTP server configured.
                    logger.info("---------------------------------------------------------");
                    logger.info("🔔 ABANDONED CART ALERT");
                    logger.info("User ID: {}", cart.getUser().getId());
                    logger.info("User Email: {}", cart.getUser().getEmail());
                    logger.info("Items left behind: {}", cart.getItems().size());
                    logger.info("Action: Simulating automated recovery email to {}", cart.getUser().getEmail());
                    logger.info("Subject: You left something behind! Complete your order with 10% off");
                    logger.info("Body: Hey {}, you left {} items in your cart. Come back and use code RECOVER10 to finish your purchase!", 
                                cart.getUser().getUserName(), cart.getItems().size());
                    logger.info("---------------------------------------------------------");
                    
                    // You might also want to mark that an email was sent for this cart update
                    // so you don't spam them every hour. For a complete implementation, 
                    // add a `recoveryEmailSent` boolean to the Cart entity.
                }
            }
        }
        
        logger.info("Cart Recovery Service finished. Processed {} abandoned carts.", abandonedCount);
    }
}
