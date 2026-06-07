package com.fashionify.backend.controller.admin;

import com.fashionify.backend.entity.Order;
import com.fashionify.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private com.fashionify.backend.service.EmailService emailService;

    @GetMapping("/get")
    public ResponseEntity<?> getAllOrdersForAdmin() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", orders));
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<?> getOrderDetailsForAdmin(@PathVariable Long id) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            return ResponseEntity.ok(Map.of("success", true, "data", order.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            String newStatus = statusMap.get("orderStatus");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Order status cannot be empty"));
            }
            order.setOrderStatus(newStatus);
            order.setOrderUpdateDate(LocalDateTime.now());
            orderRepository.save(order);
            
            // Send email notification for important status updates
            if ("delivered".equalsIgnoreCase(newStatus)) {
                String subject = "Your Fashionify Order has been Delivered!";
                String text = "Hi " + order.getUser().getUserName() + ",\n\n" +
                              "Great news! Your order #" + order.getId() + " has been successfully delivered. " +
                              "We hope you love your new items!\n\n" +
                              "Thank you for shopping with Fashionify!";
                emailService.sendSimpleEmail(order.getUser().getEmail(), subject, text);
            } else if ("shipped".equalsIgnoreCase(newStatus) || "inShipping".equalsIgnoreCase(newStatus) || "in transit".equalsIgnoreCase(newStatus)) {
                String subject = "Your Fashionify Order is on its way!";
                String text = "Hi " + order.getUser().getUserName() + ",\n\n" +
                              "Good news! Your order #" + order.getId() + " has been shipped and is currently on its way to you.\n\n" +
                              "Thank you for shopping with Fashionify!";
                emailService.sendSimpleEmail(order.getUser().getEmail(), subject, text);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Order status is updated successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
