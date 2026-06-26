package com.fashionify.backend.controller.shop;

import com.fashionify.backend.entity.Product;
import com.fashionify.backend.entity.Review;
import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.OrderRepository;
import com.fashionify.backend.repository.ProductRepository;
import com.fashionify.backend.repository.ReviewRepository;
import com.fashionify.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shop/review")
public class ShopReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * GET /api/shop/review/eligibility/{productId}?userId=
     * Returns whether the user is eligible to rate this product.
     * Eligibility: user must have a delivered order containing this product.
     */
    @GetMapping("/eligibility/{productId}")
    public ResponseEntity<?> checkEligibility(@PathVariable Long productId,
                                               @RequestParam Long userId) {
        // Already reviewed?
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "reason", "You have already reviewed this product."));
        }

        // Has delivered order for this product?
        boolean hasDeliveredOrder = orderRepository.existsDeliveredOrderForProduct(userId, productId.toString());

        if (!hasDeliveredOrder) {
            return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "reason", "Rating available after order delivery."));
        }

        return ResponseEntity.ok(Map.of("eligible", true, "reason", ""));
    }

    /**
     * POST /api/shop/review/add
     * Only allowed if user has a delivered order for this product.
     */
    @PostMapping("/add")
    @CacheEvict(value = {"reviews", "latestReviews", "shopProducts", "adminProducts", "collections"}, allEntries = true)
    public ResponseEntity<?> addReview(@RequestBody Map<String, String> payload) {
        Long productId = Long.parseLong(payload.get("productId"));
        Long userId = Long.parseLong(payload.get("userId"));
        String userName = payload.get("userName");
        String reviewMessage = payload.get("reviewMessage");
        Integer reviewValue = Integer.parseInt(payload.get("reviewValue"));
        String fitFeedback = payload.get("fitFeedback");
        String imageUrl = payload.get("imageUrl");

        Optional<Product> productOpt = productRepository.findById(productId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (productOpt.isEmpty() || userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "User or Product not found"));
        }

        // Backend eligibility check: must have delivered order
        boolean hasDeliveredOrder = orderRepository.existsDeliveredOrderForProduct(userId, productId.toString());
        if (!hasDeliveredOrder) {
            return ResponseEntity.status(403).body(
                    Map.of("success", false,
                            "message", "Rating available only after your order has been delivered."));
        }

        // Duplicate check (DB unique constraint is the final guard)
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "You have already reviewed this product."));
        }

        Review review = Review.builder()
                .product(productOpt.get())
                .user(userOpt.get())
                .userName(userName)
                .reviewMessage(reviewMessage)
                .reviewValue(reviewValue)
                .fitFeedback(fitFeedback)
                .imageUrl(imageUrl)
                .verifiedPurchase(true)
                .build();

        reviewRepository.save(review);

        // Update product average rating
        List<Review> allReviews = reviewRepository.findByProductId(productId);
        double avg = allReviews.stream().mapToInt(Review::getReviewValue).average().orElse(0.0);
        Product product = productOpt.get();
        product.setAverageReview(avg);
        productRepository.save(product);

        // Build response DTO (avoid lazy-load serialisation issues)
        Map<String, Object> reviewDto = buildReviewDto(review);
        return ResponseEntity.ok(Map.of("success", true, "data", reviewDto));
    }

    @GetMapping("/{productId}")
    @Cacheable(value = "reviews", key = "#productId")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        List<Map<String, Object>> reviewDtos = reviewRepository.findByProductId(productId)
                .stream()
                .map(this::buildReviewDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "data", reviewDtos));
    }

    @GetMapping("/latest")
    @Cacheable("latestReviews")
    public ResponseEntity<?> getLatestReviews() {
        // Fetch top 3 latest reviews. A simple approach is sorting the list, 
        // but for efficiency it should be a custom query. We'll sort in-memory for this scale.
        List<Map<String, Object>> reviewDtos = reviewRepository.findAll().stream()
                .sorted(Comparator.comparing(Review::getCreatedAt).reversed())
                .limit(3)
                .map(this::buildReviewDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "data", reviewDtos));
    }

    private Map<String, Object> buildReviewDto(Review review) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", review.getId());
        dto.put("userName", review.getUserName());
        dto.put("reviewMessage", review.getReviewMessage());
        dto.put("reviewValue", review.getReviewValue());
        dto.put("fitFeedback", review.getFitFeedback());
        dto.put("imageUrl", review.getImageUrl());
        dto.put("createdAt", review.getCreatedAt());

        // Attach product details
        if (review.getProduct() != null) {
            dto.put("productId", review.getProduct().getId());
            dto.put("productTitle", review.getProduct().getTitle());
            if (review.getProduct().getImages() != null && !review.getProduct().getImages().isEmpty()) {
                dto.put("productImage", review.getProduct().getImages().get(0));
            }
        }

        // Attach user details and evaluate verified buyer logic
        if (review.getUser() != null) {
            dto.put("userAvatar", review.getUser().getAvatar());
            Long itemsPurchased = orderRepository.countDeliveredProductsForUser(review.getUser().getId());
            dto.put("verifiedPurchase", itemsPurchased > 2); // Show Verified Buyer only if > 2 items
        } else {
            dto.put("verifiedPurchase", false);
        }

        return dto;
    }
}
