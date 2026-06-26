/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: AdminProductController.java
 * Purpose: Spring Boot REST Controller handling incoming HTTP requests and routing.
 * Functions/Methods: 2
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.controller.admin;

import com.fashionify.backend.entity.Product;
import com.fashionify.backend.entity.ProductSizeVariant;
import com.fashionify.backend.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import com.fashionify.backend.util.ProductMapper;
import com.fashionify.backend.repository.ProductSizeVariantRepository;
import com.fashionify.backend.repository.WaitlistRepository;
import com.fashionify.backend.repository.CartRepository;
import com.fashionify.backend.repository.ReviewRepository;
import com.fashionify.backend.repository.WishlistRepository;
import com.fashionify.backend.repository.FashionCollectionRepository;
import com.fashionify.backend.repository.OrderRepository;
import com.fashionify.backend.entity.Waitlist;
import com.fashionify.backend.entity.Cart;
import com.fashionify.backend.entity.FashionCollection;
import com.fashionify.backend.entity.Order;
import com.fashionify.backend.service.CloudinaryService;
import com.fashionify.backend.service.EmailService;
import com.fashionify.backend.service.TagMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductSizeVariantRepository sizeVariantRepository;

    @Autowired
    private WaitlistRepository waitlistRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private FashionCollectionRepository collectionRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TagMigrationService tagMigrationService;

    // ── Image Upload ─────────────────────────────────────────────────────────
    @PostMapping("/upload-image")
    public ResponseEntity<?> handleImageUpload(@RequestParam("my_file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadImage(file, "products");
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("result", Map.of("url", url));
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Error uploading image"));
        }
    }

    // ── Add Product ──────────────────────────────────────────────────────────
    @PostMapping("/add")
    @CacheEvict(value = {"shopProducts", "adminProducts", "lowStockProducts", "collections", "analytics"}, allEntries = true)
    public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> payload) {
        // Validate tags before persisting — minimum 1, maximum 5
        ResponseEntity<?> tagError = validateTagsInPayload(payload);
        if (tagError != null) return tagError;

        Product product = buildProductFromPayload(payload, new Product());
        Product saved = productRepository.save(product);
        saveVariants(saved, payload);
        return ResponseEntity.ok(Map.of("success", true, "data", ProductMapper.toResponseMap(saved)));
    }

    // ── Get All Products ──────────────────────────────────────────────────────
    @GetMapping("/get")
    @Cacheable("adminProducts")
    public ResponseEntity<?> fetchAllProducts() {
        List<Map<String, Object>> enriched = productRepository.findAll()
                .stream().map(ProductMapper::toResponseMap).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "data", enriched));
    }

    // ── Low-Stock Alert Endpoint (any size stock ≤ 5) ────────────────────────
    @GetMapping("/low-stock")
    @Cacheable("lowStockProducts")
    public ResponseEntity<?> getLowStockProducts() {
        List<Map<String, Object>> lowStock = productRepository.findAll().stream()
                .filter(p -> p.getSizeVariants().stream().anyMatch(v -> v.getStock() <= 5))
                .map(ProductMapper::toResponseMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "data", lowStock));
    }

    // ── Edit Product ─────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    @PutMapping("/edit/{id}")
    @CacheEvict(value = {"shopProducts", "adminProducts", "lowStockProducts", "collections", "analytics"}, allEntries = true)
    public ResponseEntity<?> editProduct(@PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        // Validate tags before persisting — minimum 1, maximum 5
        ResponseEntity<?> tagError = validateTagsInPayload(payload);
        if (tagError != null) return tagError;

        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();

        Product product = opt.get();
        buildProductFromPayload(payload, product);
        Product saved = productRepository.save(product);

        // Replace variants
        sizeVariantRepository.deleteAll(sizeVariantRepository.findByProductId(id));
        saveVariants(saved, payload);
        
        // Fulfill Waitlist if any new variants have stock > 0
        if (payload.containsKey("sizeVariants")) {
            List<Map<String, Object>> variants = (List<Map<String, Object>>) payload.get("sizeVariants");
            if (variants != null) {
                for (Map<String, Object> v : variants) {
                    int stock = Integer.parseInt(v.get("stock").toString());
                    if (stock > 0) {
                        String size = (String) v.get("size");
                        List<Waitlist> waitlistedUsers = waitlistRepository.findByProductIdAndSizeAndIsNotifiedFalse(id, size);
                        for (Waitlist wl : waitlistedUsers) {
                            wl.setIsNotified(true);
                            waitlistRepository.save(wl);
                            try {
                                System.out.println("NOTIFYING " + wl.getEmail() + " THAT " + saved.getTitle() + " SIZE " + size + " IS BACK IN STOCK!");
                                String subject = "Your waitlisted item is back in stock!";
                                String text = String.format("Good news! The item %s (Size: %s) is now back in stock. Grab it before it's gone!", saved.getTitle(), size);
                                emailService.sendSimpleEmail(wl.getEmail(), subject, text);
                            } catch (Exception e) {
                                System.err.println("Failed to send waitlist back-in-stock notification email to " + wl.getEmail() + ": " + e.getMessage());
                            }
                        }
                    }
                }
            }
        }

        // Reload
        Product reloaded = productRepository.findById(saved.getId()).orElse(saved);
        return ResponseEntity.ok(Map.of("success", true, "data", ProductMapper.toResponseMap(reloaded)));
    }

    // ── Delete Product ────────────────────────────────────────────────────────
    @Transactional
    @DeleteMapping("/delete/{id}")
    @CacheEvict(value = {"shopProducts", "adminProducts", "lowStockProducts", "collections", "analytics"}, allEntries = true)
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            // Remove from carts
            List<Cart> allCarts = cartRepository.findAll();
            for (Cart cart : allCarts) {
                boolean removed = cart.getItems().removeIf(item -> item.getProduct().getId().equals(id));
                if (removed) cartRepository.save(cart);
            }

            // Remove from collections
            List<FashionCollection> allCollections = collectionRepository.findAll();
            for (FashionCollection collection : allCollections) {
                boolean removed = collection.getProducts().removeIf(p -> p.getId().equals(id));
                if (removed) collectionRepository.save(collection);
            }

            // Cancel active orders containing this product
            List<Order> activeOrders = orderRepository.findActiveOrdersByProductId(String.valueOf(id));
            for (Order order : activeOrders) {
                order.setOrderStatus("CANCELLED");
                order.setOrderUpdateDate(LocalDateTime.now());
                orderRepository.save(order);

                // Notify user
                try {
                    String subject = "Important: Update regarding your Order #" + order.getId();
                    String text = "Hi " + order.getUser().getUserName() + ",\n\n" +
                                  "We sincerely apologize, but an item in your order #" + order.getId() + 
                                  " is no longer available in our catalogue. As a result, your order has been automatically cancelled.\n\n" +
                                  "Any payments made will be refunded shortly. We apologize for the inconvenience.\n\n" +
                                  "Thank you for shopping with Fashionify!";
                    emailService.sendSimpleEmail(order.getUser().getEmail(), subject, text);
                } catch (Exception e) {
                    System.err.println("Failed to send cancellation email to " + order.getUser().getEmail() + ": " + e.getMessage());
                }
            }

            // Delete reviews, waitlists, and wishlists associated with the product
            reviewRepository.deleteByProductId(id);
            waitlistRepository.deleteByProductId(id);
            wishlistRepository.deleteByProductId(id);

            // Finally, delete the product itself
            productRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Product deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    // ── Tag Migration ─────────────────────────────────────────────────────────
    @PostMapping("/tags/migrate")
    @CacheEvict(value = {"shopProducts", "adminProducts", "lowStockProducts", "collections", "analytics"}, allEntries = true)
    public ResponseEntity<?> migrateTags(@RequestBody Map<String, Object> payload) {
        boolean previewOnly = Boolean.TRUE.equals(payload.get("previewOnly"));
        boolean forceOverwrite = Boolean.TRUE.equals(payload.get("forceOverwrite"));
        
        List<Product> productsToProcess;
        if (forceOverwrite) {
            productsToProcess = productRepository.findAll();
        } else {
            productsToProcess = productRepository.findByTagsIsEmpty();
        }
        
        long totalFound = productRepository.count();
        long totalProcessed = productsToProcess.size();
        long updated = 0;
        long skipped = 0;
        
        List<Map<String, Object>> previewResults = new ArrayList<>();
        
        for (Product p : productsToProcess) {
            if (!forceOverwrite && p.getTags() != null && !p.getTags().isEmpty()) {
                skipped++;
                continue;
            }
            
            List<String> newTags = tagMigrationService.generateTagsForProduct(p);
            
            if (previewOnly) {
                if (previewResults.size() < 20) { // Limit preview to 20 for payload size
                    Map<String, Object> previewItem = new HashMap<>();
                    previewItem.put("id", p.getId());
                    previewItem.put("title", p.getTitle());
                    previewItem.put("oldTags", p.getTags() != null ? p.getTags() : List.of());
                    previewItem.put("newTags", newTags);
                    previewResults.add(previewItem);
                }
                updated++;
            } else {
                p.setTags(newTags);
                productRepository.save(p);
                updated++;
            }
        }
        
        long manualTags = totalFound - productRepository.findByTagsIsEmpty().size();
        if (!previewOnly && !forceOverwrite) {
            manualTags = totalFound - totalProcessed; // rough approximation for report
        }
        
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalProducts", totalFound);
        report.put("productsToProcess", totalProcessed);
        report.put("updated", updated);
        report.put("skipped", skipped);
        report.put("manualTags", forceOverwrite ? 0 : manualTags);
        report.put("missingTags", previewOnly ? productsToProcess.size() : 0);
        
        if (previewOnly) {
            report.put("previewSamples", previewResults);
        }
        
        return ResponseEntity.ok(Map.of("success", true, "data", report, "message", previewOnly ? "Preview generated" : "Migration completed"));
    }

    @PostMapping("/tags/regenerate/{id}")
    public ResponseEntity<?> regenerateTagsForProduct(@PathVariable Long id) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        Product p = opt.get();
        List<String> newTags = tagMigrationService.generateTagsForProduct(p);
        
        return ResponseEntity.ok(Map.of("success", true, "data", newTags));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Validates that the request payload contains 1–5 non-blank tags.
     * Returns a 400 ResponseEntity if invalid, null if valid.
     * Centralised here so add and edit share identical rules.
     */
    @SuppressWarnings("unchecked")
    private ResponseEntity<?> validateTagsInPayload(Map<String, Object> payload) {
        // Tags key must be present
        if (!payload.containsKey("tags")) {
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "message", "Tags are required. Please add 1 to 5 tags."));
        }
        List<String> rawTags = (List<String>) payload.get("tags");
        long validCount = rawTags == null ? 0 :
                rawTags.stream().filter(t -> t != null && !t.isBlank()).distinct().count();
        if (validCount < 1) {
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "message", "At least 1 tag is required."));
        }
        if (validCount > 5) {
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "message", "A maximum of 5 tags is allowed."));
        }
        return null; // valid
    }

    @SuppressWarnings("unchecked")
    private Product buildProductFromPayload(Map<String, Object> payload, Product product) {
        if (payload.containsKey("title"))
            product.setTitle((String) payload.get("title"));
        if (payload.containsKey("description"))
            product.setDescription((String) payload.get("description"));
        if (payload.containsKey("category"))
            product.setCategory((String) payload.get("category"));
        if (payload.containsKey("brand"))
            product.setBrand((String) payload.get("brand"));
        if (payload.containsKey("averageReview")) {
            Object ar = payload.get("averageReview");
            product.setAverageReview(ar == null ? 0.0 : Double.parseDouble(ar.toString()));
        }
        if (payload.containsKey("price")) {
            product.setPrice(Double.parseDouble(payload.get("price").toString()));
        }
        if (payload.containsKey("salePrice")) {
            Object sp = payload.get("salePrice");
            product.setSalePrice(sp == null || sp.toString().isEmpty() ? null
                    : Double.parseDouble(sp.toString()));
        }
        // Images list
        if (payload.containsKey("images")) {
            List<String> imgs = (List<String>) payload.get("images");
            product.setImages(imgs != null ? imgs : new ArrayList<>());
        }
        // Tags — max 5, no duplicates, only non-blank values
        if (payload.containsKey("tags")) {
            List<String> rawTags = (List<String>) payload.get("tags");
            if (rawTags != null) {
                List<String> cleanedTags = rawTags.stream()
                        .filter(t -> t != null && !t.isBlank())
                        .distinct()
                        .limit(5)
                        .collect(java.util.stream.Collectors.toList());
                product.setTags(cleanedTags);
            } else {
                product.setTags(new ArrayList<>());
            }
        }
        return product;
    }

    @SuppressWarnings("unchecked")
    private void saveVariants(Product product, Map<String, Object> payload) {
        if (!payload.containsKey("sizeVariants"))
            return;
        List<Map<String, Object>> variants = (List<Map<String, Object>>) payload.get("sizeVariants");
        if (variants == null)
            return;
        for (Map<String, Object> v : variants) {
            ProductSizeVariant variant = ProductSizeVariant.builder()
                    .product(product)
                    .size((String) v.get("size"))
                    .stock(Integer.parseInt(v.get("stock").toString()))
                    .measurements(v.containsKey("measurements") ? (String) v.get("measurements") : null)
                    .build();
            sizeVariantRepository.save(variant);
        }
    }


}
