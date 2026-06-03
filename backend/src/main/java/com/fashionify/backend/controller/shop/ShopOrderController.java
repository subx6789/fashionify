package com.fashionify.backend.controller.shop;

import com.fashionify.backend.entity.Cart;
import com.fashionify.backend.entity.Order;
import com.fashionify.backend.entity.OrderItem;
import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.CartRepository;
import com.fashionify.backend.repository.OrderRepository;
import com.fashionify.backend.repository.ProductRepository;
import com.fashionify.backend.repository.ProductSizeVariantRepository;
import com.fashionify.backend.repository.UserRepository;
import com.fashionify.backend.service.UserPreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/shop/order")
public class ShopOrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductSizeVariantRepository sizeVariantRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserPreferenceService userPreferenceService;

    /**
     * Payment mode: "simulated" (default) or "razorpay".
     * Set app.payment.mode=razorpay in application.properties to re-enable Razorpay.
     */
    @Value("${app.payment.mode:simulated}")
    private String paymentMode;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Order orderDetails) {
        Optional<User> userOpt = userRepository.findById(orderDetails.getUser().getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
        }

        Order order = new Order();
        order.setUser(userOpt.get());
        order.setCartId(orderDetails.getCartId());
        order.setOrderStatus("pending_payment");
        order.setPaymentMethod("simulated_cod");
        order.setPaymentStatus("pending");
        order.setTotalAmount(orderDetails.getTotalAmount());
        order.setOrderDate(LocalDateTime.now());
        order.setOrderUpdateDate(LocalDateTime.now());
        order.setAddressInfo(orderDetails.getAddressInfo());
        
        order.setShippingMethod(orderDetails.getShippingMethod());
        order.setShippingCost(orderDetails.getShippingCost());
        order.setIsGiftWrapped(orderDetails.getIsGiftWrapped());
        order.setAppliedPromoCode(orderDetails.getAppliedPromoCode());
        order.setDiscountAmount(orderDetails.getDiscountAmount());

        // Save order items
        if (orderDetails.getOrderItems() != null) {
            orderDetails.getOrderItems().forEach(order::addOrderItem);
        }

        Order savedOrder = orderRepository.save(order);

        if ("razorpay".equalsIgnoreCase(paymentMode)) {
            // ── Razorpay integration placeholder ──────────────────────────────────
            // To re-enable:
            // 1. Set app.payment.mode=razorpay in application.properties
            // 2. Add real RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to .env
            // 3. Un-comment the Razorpay block below and re-import dependencies.
            //
            // try {
            //     RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            //     JSONObject req = new JSONObject();
            //     req.put("amount", (int)(orderDetails.getTotalAmount() * 100));
            //     req.put("currency", "INR");
            //     req.put("receipt", "txn_" + savedOrder.getId());
            //     com.razorpay.Order rzpOrder = client.orders.create(req);
            //     String rzpId = rzpOrder.get("id");
            //     savedOrder.setPaymentId(rzpId);
            //     orderRepository.save(savedOrder);
            //     return ResponseEntity.ok(Map.of(
            //         "success", true, "razorpayOrderId", rzpId,
            //         "amount", (int)(orderDetails.getTotalAmount() * 100),
            //         "currency", "INR", "orderId", savedOrder.getId()
            //     ));
            // } catch (Exception e) {
            //     return ResponseEntity.internalServerError()
            //         .body(Map.of("success", false, "message", "Razorpay error: " + e.getMessage()));
            // }
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "Razorpay mode not configured. Set real API keys."));
        }

        // ── Simulated mode (default) ───────────────────────────────────────────
        return ResponseEntity.ok(Map.of(
            "success", true,
            "orderId", savedOrder.getId(),
            "simulatedMode", true,
            "message", "Order created successfully (simulated checkout)"
        ));
    }

    /**
     * Simulated payment confirmation — marks order as confirmed and clears cart.
     * In Razorpay mode this would verify the payment signature.
     */
    @PostMapping("/confirm-simulated")
    public ResponseEntity<?> confirmSimulatedOrder(@RequestBody Map<String, Object> payload) {
        Object orderIdObj = payload.get("orderId");
        if (orderIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "orderId is required"));
        }

        Long orderId;
        try {
            orderId = Long.parseLong(orderIdObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid orderId"));
        }

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        order.setPaymentStatus("simulated_paid");
        order.setOrderStatus("confirmed");
        order.setOrderUpdateDate(LocalDateTime.now());
        orderRepository.save(order);

        // Decrement stock for each ordered size variant
        for (OrderItem item : order.getOrderItems()) {
            if (item.getProductId() != null && item.getSelectedSize() != null) {
                Long pid = Long.parseLong(item.getProductId());
                sizeVariantRepository.findByProductId(pid).stream()
                    .filter(v -> v.getSize().equals(item.getSelectedSize()))
                    .findFirst()
                    .ifPresent(variant -> {
                        int newStock = Math.max(0, variant.getStock() - item.getQuantity());
                        variant.setStock(newStock);
                        sizeVariantRepository.save(variant);
                    });
            }
        }

        // Clear cart
        Optional<Cart> cartOpt = cartRepository.findByUserId(order.getUser().getId());
        cartOpt.ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });

        // Record +5 preference scores for recommendation engine
        for (OrderItem item : order.getOrderItems()) {
            if (item.getProductId() != null) {
                try {
                    Long pid = Long.parseLong(item.getProductId());
                    productRepository.findById(pid).ifPresent(product -> {
                        if (product.getTags() != null && !product.getTags().isEmpty()) {
                            userPreferenceService.recordInteraction(
                                    order.getUser().getId(), product.getTags(), 5);
                        }
                    });
                } catch (NumberFormatException ignored) {}
            }
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Order confirmed successfully",
            "orderId", orderId
        ));
    }

    @GetMapping("/list/{userId}")
    public ResponseEntity<?> getAllOrdersByUser(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return ResponseEntity.ok(Map.of("success", true, "data", orders));
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            return ResponseEntity.ok(Map.of("success", true, "data", order.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/apply-promo")
    public ResponseEntity<?> applyPromoCode(@RequestBody Map<String, String> payload) {
        String code = payload.get("promoCode");
        if ("WELCOME10".equalsIgnoreCase(code)) {
            return ResponseEntity.ok(Map.of("success", true, "discountType", "PERCENTAGE", "discountValue", 10, "message", "10% discount applied!"));
        } else if ("SAVE500".equalsIgnoreCase(code)) {
            return ResponseEntity.ok(Map.of("success", true, "discountType", "FLAT", "discountValue", 500, "message", "Flat ₹500 discount applied!"));
        }
        return ResponseEntity.ok(Map.of("success", false, "message", "Invalid promo code"));
    }
}
