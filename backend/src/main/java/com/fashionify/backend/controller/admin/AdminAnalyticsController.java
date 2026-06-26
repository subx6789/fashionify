/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: AdminAnalyticsController.java
 * Purpose: Spring Boot REST Controller handling incoming HTTP requests and routing.
 * Functions/Methods: 0
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.controller.admin;

import com.fashionify.backend.entity.Order;
import com.fashionify.backend.repository.OrderRepository;
import com.fashionify.backend.repository.UserRepository;
import com.fashionify.backend.repository.WishlistRepository;
import com.fashionify.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.Cacheable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    @Cacheable(value = "analytics", key = "#start.toString() + '-' + #end.toString()")
    public ResponseEntity<?> getAnalytics(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = end.atTime(23, 59, 59);

        // Fetch confirmed/simulated_paid orders in the date range
        List<Order> allOrders = orderRepository.findAll();
        List<Order> rangeOrders = allOrders.stream()
                .filter(o -> o.getOrderDate() != null
                        && !o.getOrderDate().isBefore(startDt)
                        && !o.getOrderDate().isAfter(endDt))
                .collect(Collectors.toList());

        List<Order> paidOrders = rangeOrders.stream()
                .filter(o -> "confirmed".equals(o.getOrderStatus()))
                .collect(Collectors.toList());

        // ── Summary metrics ─────────────────────────────────────────────────────
        double totalRevenue = paidOrders.stream()
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                .sum();

        long totalOrders = rangeOrders.size();

        long totalProductsSold = paidOrders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .mapToLong(item -> item.getQuantity())
                .sum();

        long totalUsers = userRepository.count();

        long wishlistCount = wishlistRepository.count();

        long totalProducts = productRepository.count();

        double avgOrderValue = paidOrders.isEmpty() ? 0 :
                totalRevenue / paidOrders.size();

        // ── Revenue by day ──────────────────────────────────────────────────────
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Double> revenueByDayMap = new LinkedHashMap<>();
        Map<String, Long> ordersByDayMap = new LinkedHashMap<>();

        // Initialise all days with zero
        LocalDate cur = start;
        while (!cur.isAfter(end)) {
            String label = cur.format(fmt);
            revenueByDayMap.put(label, 0.0);
            ordersByDayMap.put(label, 0L);
            cur = cur.plusDays(1);
        }

        for (Order o : paidOrders) {
            String day = o.getOrderDate().toLocalDate().format(fmt);
            revenueByDayMap.merge(day, o.getTotalAmount() != null ? o.getTotalAmount() : 0.0, (a, b) -> a + b);
        }
        for (Order o : rangeOrders) {
            String day = o.getOrderDate().toLocalDate().format(fmt);
            ordersByDayMap.merge(day, 1L, (a, b) -> a + b);
        }

        List<Map<String, Object>> revenueByDay = revenueByDayMap.entrySet().stream()
                .map(e -> Map.<String, Object>of("date", e.getKey(), "revenue", Math.round(e.getValue() * 100.0) / 100.0))
                .collect(Collectors.toList());

        List<Map<String, Object>> ordersByDay = ordersByDayMap.entrySet().stream()
                .map(e -> Map.<String, Object>of("date", e.getKey(), "orders", e.getValue()))
                .collect(Collectors.toList());

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        summary.put("totalOrders", totalOrders);
        summary.put("totalProductsSold", totalProductsSold);
        summary.put("totalUsers", totalUsers);
        summary.put("wishlistCount", wishlistCount);
        summary.put("totalProducts", totalProducts);
        summary.put("avgOrderValue", Math.round(avgOrderValue * 100.0) / 100.0);
        summary.put("revenueByDay", revenueByDay);
        summary.put("ordersByDay", ordersByDay);

        return ResponseEntity.ok(Map.of("success", true, "data", summary));
    }
}
