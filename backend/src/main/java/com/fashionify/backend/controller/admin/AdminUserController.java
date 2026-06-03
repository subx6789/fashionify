package com.fashionify.backend.controller.admin;

import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.fashionify.backend.repository.OrderRepository orderRepository;

    @GetMapping("/get")
    public ResponseEntity<?> getAllUsersForAdmin() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> usersWithStats = new java.util.ArrayList<>();
        
        for (User user : users) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", user.getId());
            map.put("userName", user.getUserName());
            map.put("email", user.getEmail());
            map.put("role", user.getRole());
            map.put("avatar", user.getAvatar());

            List<com.fashionify.backend.entity.Order> userOrders = orderRepository.findByUserId(user.getId());
            int orderCount = userOrders.size();
            double totalSpend = userOrders.stream()
                .filter(o -> "delivered".equals(o.getOrderStatus()))
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
                .sum();

            map.put("orderCount", orderCount);
            map.put("totalSpend", totalSpend);
            usersWithStats.add(map);
        }
        
        return ResponseEntity.ok(Map.of("success", true, "data", usersWithStats));
    }

    @PutMapping("/update-role/{id}")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            String newRole = payload.get("role");
            if (newRole != null && (newRole.equals("admin") || newRole.equals("user"))) {
                user.setRole(newRole);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("success", true, "message", "User role updated successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid role"));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
