package com.fashionify.backend.controller.shop;

import com.fashionify.backend.entity.Product;
import com.fashionify.backend.entity.Wishlist;
import com.fashionify.backend.repository.ProductRepository;
import com.fashionify.backend.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shop/wishlist")
@CrossOrigin(origins = "http://localhost:5173/")
public class ShopWishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        Long productId = payload.get("productId");

        Map<String, Object> response = new HashMap<>();

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            response.put("success", false);
            response.put("message", "Product is already in wishlist");
            return ResponseEntity.badRequest().body(response);
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUserId(userId);
        wishlist.setProductId(productId);
        wishlistRepository.save(wishlist);

        List<Product> products = fetchWishlistProducts(userId);
        response.put("success", true);
        response.put("data", products);
        response.put("message", "Added to wishlist");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<?> getWishlist(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        List<Product> products = fetchWishlistProducts(userId);

        response.put("success", true);
        response.put("data", products);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{userId}/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        Map<String, Object> response = new HashMap<>();

        wishlistRepository.deleteByUserIdAndProductId(userId, productId);

        List<Product> products = fetchWishlistProducts(userId);
        response.put("success", true);
        response.put("data", products);
        response.put("message", "Removed from wishlist");
        return ResponseEntity.ok(response);
    }

    private List<Product> fetchWishlistProducts(Long userId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
        List<Long> productIds = wishlists.stream().map(Wishlist::getProductId).collect(Collectors.toList());
        return productRepository.findAllById(productIds);
    }
}
