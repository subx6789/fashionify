package com.fashionify.backend.controller.shop;

import com.fashionify.backend.entity.Cart;
import com.fashionify.backend.entity.Order;
import com.fashionify.backend.entity.OrderItem;
import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.CartRepository;
import com.fashionify.backend.repository.OrderRepository;
import com.fashionify.backend.repository.ProductSizeVariantRepository;
import com.fashionify.backend.repository.UserRepository;
import com.fashionify.backend.repository.CouponRepository;
import com.fashionify.backend.repository.CouponRedemptionRepository;
import com.fashionify.backend.repository.UserCouponUsageRepository;
import com.fashionify.backend.entity.Coupon;
import com.fashionify.backend.entity.CouponRedemption;
import com.fashionify.backend.entity.UserCouponUsage;
import com.fashionify.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    private CouponRepository couponRepository;

    @Autowired
    private CouponRedemptionRepository couponRedemptionRepository;

    @Autowired
    private UserCouponUsageRepository userCouponUsageRepository;


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

    @Autowired
    private com.fashionify.backend.service.EmailService emailService;

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

        // Clear cart after successful order confirmation
        Optional<Cart> cartOpt = cartRepository.findByUserId(order.getUser().getId());
        cartOpt.ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });

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


        // Record coupon usage if any
        if (order.getAppliedPromoCode() != null && !order.getAppliedPromoCode().isEmpty()) {
            couponRepository.findByCodeAndDeletedAtIsNull(order.getAppliedPromoCode()).ifPresent(coupon -> {
                // Increment total redemptions
                coupon.setTotalRedemptions(coupon.getTotalRedemptions() + 1);
                couponRepository.save(coupon);

                // Record redemption
                CouponRedemption redemption = new CouponRedemption();
                redemption.setCouponId(coupon.getId());
                redemption.setUserId(order.getUser().getId());
                redemption.setOrderId(order.getId());
                redemption.setDiscountAmount(order.getDiscountAmount());
                couponRedemptionRepository.save(redemption);

                // Update user usage
                UserCouponUsage usage = userCouponUsageRepository.findByUserIdAndCouponId(order.getUser().getId(), coupon.getId())
                        .orElseGet(() -> {
                            UserCouponUsage newUsage = new UserCouponUsage();
                            newUsage.setUserId(order.getUser().getId());
                            newUsage.setCouponId(coupon.getId());
                            newUsage.setUsageCount(0);
                            return newUsage;
                        });
                usage.setUsageCount(usage.getUsageCount() + 1);
                userCouponUsageRepository.save(usage);
            });
        }

        // Send order confirmation email
        try {
            StringBuilder emailBody = new StringBuilder();
            emailBody.append("Hi ").append(order.getUser().getUserName()).append(",\n\n");
            emailBody.append("Thank you for your order! Your order #").append(order.getId()).append(" has been successfully placed.\n\n");
            emailBody.append("Order Details:\n");
            
            for (OrderItem item : order.getOrderItems()) {
                double itemPrice = 0.0;
                try {
                    itemPrice = Double.parseDouble(item.getPrice());
                } catch (Exception ignored) {}
                
                emailBody.append("- ").append(item.getTitle())
                         .append(" (Size: ").append(item.getSelectedSize()).append(")")
                         .append(" x ").append(item.getQuantity())
                         .append(" - Rs.").append(itemPrice * item.getQuantity()).append("\n");
            }
            
            emailBody.append("\nTotal Amount: Rs.").append(order.getTotalAmount()).append("\n\n");
            emailBody.append("We will notify you once your order is shipped.\n\n");
            emailBody.append("Thank you for shopping with Fashionify!");
            
            emailService.sendSimpleEmail(
                order.getUser().getEmail(),
                "Fashionify Order Confirmation #" + order.getId(),
                emailBody.toString()
            );
        } catch (Exception e) {
            // Log but do not fail the checkout process
            e.printStackTrace();
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
    public ResponseEntity<?> applyPromoCode(@RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("promoCode");
        Long userId = payload.get("userId") != null ? Long.valueOf(payload.get("userId").toString()) : null;
        Double cartTotal = payload.get("cartTotal") != null ? Double.valueOf(payload.get("cartTotal").toString()) : 0.0;

        if (code == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Promo code missing"));
        
        Optional<Coupon> opt = couponRepository.findByCodeAndDeletedAtIsNull(code.toUpperCase());
        if (opt.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Invalid promo code"));
        }
        Coupon coupon = opt.get();
        if (!coupon.getIsActive()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Promo code is inactive"));
        }
        if (coupon.getStartDate() != null && coupon.getStartDate().isAfter(LocalDateTime.now())) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Promo code is not active yet"));
        }
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Promo code has expired"));
        }
        if (coupon.getMinimumOrderAmount() != null && cartTotal < coupon.getMinimumOrderAmount()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Minimum order amount of ₹" + coupon.getMinimumOrderAmount() + " required"));
        }
        if (coupon.getMaxRedemptions() != null && coupon.getTotalRedemptions() >= coupon.getMaxRedemptions()) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Promo code redemption limit reached"));
        }
        if (userId != null && coupon.getPerUserLimit() != null) {
            Optional<UserCouponUsage> usageOpt = userCouponUsageRepository.findByUserIdAndCouponId(userId, coupon.getId());
            if (usageOpt.isPresent() && usageOpt.get().getUsageCount() >= coupon.getPerUserLimit()) {
                return ResponseEntity.ok(Map.of("success", false, "message", "You have reached the maximum usage limit for this coupon"));
            }
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "discountType", coupon.getType(),
            "discountValue", coupon.getValue(),
            "message", "Promo code applied successfully!"
        ));
    }

    // ── Cancel Order ──────────────────────────────────────────────────────────

    /**
     * PATCH /api/shop/order/{id}/cancel
     * Body: { "userId": 42 }
     *
     * Authorization: only the order owner can cancel.
     * Guard: cannot cancel orders that are already delivered or cancelled.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        Object userIdObj = body.get("userId");
        if (userIdObj == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "userId is required."));
        }

        Long requestingUserId;
        try {
            requestingUserId = Long.parseLong(userIdObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid userId."));
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();

        // Authorization: only the owner can cancel
        if (!order.getUser().getId().equals(requestingUserId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "You are not authorized to cancel this order."));
        }

        // Business rule: cannot cancel delivered or already-cancelled orders
        String currentStatus = order.getOrderStatus();
        if ("delivered".equalsIgnoreCase(currentStatus) || "CANCELLED".equalsIgnoreCase(currentStatus)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Order cannot be cancelled (status: " + currentStatus + ")."
            ));
        }

        order.setOrderStatus("CANCELLED");
        order.setOrderUpdateDate(LocalDateTime.now());
        orderRepository.save(order);

        // Notify user by email
        try {
            String subject = "Your Fashionify Order #" + order.getId() + " has been cancelled.";
            String text = "Hi " + order.getUser().getUserName() + ",\n\n" +
                          "Your order #" + order.getId() + " has been successfully cancelled.\n\n" +
                          "If this was a mistake, please place a new order.\n\n" +
                          "Thank you for shopping with Fashionify!";
            emailService.sendSimpleEmail(order.getUser().getEmail(), subject, text);
        } catch (Exception e) {
            // Non-fatal — log and continue
            e.printStackTrace();
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order #" + id + " cancelled successfully.",
                "orderId", id
        ));
    }
}
