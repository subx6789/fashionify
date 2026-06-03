package com.fashionify.backend.controller.shop;

import com.fashionify.backend.entity.*;
import com.fashionify.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/shop/cart")
@org.springframework.transaction.annotation.Transactional
public class ShopCartController {

    @Autowired private CartRepository cartRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ProductSizeVariantRepository sizeVariantRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, String> payload) {
        Long userId     = Long.parseLong(payload.get("userId"));
        Long productId  = Long.parseLong(payload.get("productId"));
        int  quantity   = Integer.parseInt(payload.get("quantity"));
        String selectedSize = payload.getOrDefault("selectedSize", null);

        Optional<User>    userOpt    = userRepository.findById(userId);
        Optional<Product> productOpt = productRepository.findById(productId);

        if (userOpt.isEmpty() || productOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User or Product not found"));
        }

        // Stock check for the selected size
        if (selectedSize != null) {
            Optional<ProductSizeVariant> variantOpt = sizeVariantRepository
                    .findByProductId(productId).stream()
                    .filter(v -> v.getSize().equals(selectedSize))
                    .findFirst();
            if (variantOpt.isPresent() && variantOpt.get().getStock() < quantity) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Not enough stock for size " + selectedSize));
            }
        }

        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(userOpt.get());
            return newCart;
        });

        // Match by productId AND selectedSize (same product, different size = different cart item)
        final String sizeKey = selectedSize;
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId)
                        && Objects.equals(item.getSelectedSize(), sizeKey))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            existingItemOpt.get().setQuantity(existingItemOpt.get().getQuantity() + quantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .product(productOpt.get())
                    .quantity(quantity)
                    .selectedSize(selectedSize)
                    .build();
            cart.addItem(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return ResponseEntity.ok(Map.of("success", true, "data", savedCart));
    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            return ResponseEntity.ok(Map.of("success", true, "data", cartOpt.get()));
        }
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("items", new java.util.ArrayList<>())));
    }

    @PutMapping("/update-cart")
    public ResponseEntity<?> updateCartItemQuantity(@RequestBody Map<String, String> payload) {
        Long userId     = Long.parseLong(payload.get("userId"));
        Long productId  = Long.parseLong(payload.get("productId"));
        int  quantity   = Integer.parseInt(payload.get("quantity"));
        String selectedSize = payload.getOrDefault("selectedSize", null);

        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            final String sizeKey = selectedSize;
            Optional<CartItem> itemOpt = cart.getItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId)
                            && Objects.equals(item.getSelectedSize(), sizeKey))
                    .findFirst();

            if (itemOpt.isPresent()) {
                if (quantity <= 0) {
                    cart.removeItem(itemOpt.get());
                } else {
                    itemOpt.get().setQuantity(quantity);
                }
                return ResponseEntity.ok(Map.of("success", true, "data", cartRepository.save(cart)));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<?> deleteCartItem(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestParam(required = false) String selectedSize) {

        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            final String sizeKey = selectedSize;
            Optional<CartItem> itemOpt = cart.getItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId)
                            && Objects.equals(item.getSelectedSize(), sizeKey))
                    .findFirst();

            if (itemOpt.isPresent()) {
                cart.removeItem(itemOpt.get());
                return ResponseEntity.ok(Map.of("success", true, "data", cartRepository.save(cart)));
            }
        }
        return ResponseEntity.notFound().build();
    }
}
