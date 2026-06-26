/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: AdminMessageController.java
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

import com.fashionify.backend.entity.Message;
import com.fashionify.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Admin-only endpoints for managing Contact Us submissions.
 * All routes are under /api/admin/messages — restricted to admin role in SecurityConfig.
 */
@RestController
@RequestMapping("/api/admin/messages")
public class AdminMessageController {

    @Autowired
    private MessageRepository messageRepository;

    // ── List messages ───────────────────────────────────────────────────────

    /** All messages, newest first. */
    @GetMapping
    public ResponseEntity<?> getAllMessages() {
        List<Message> messages = messageRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of("success", true, "data", messages));
    }

    /** Unread messages only. */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadMessages() {
        List<Message> messages = messageRepository.findByReadFalseOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of("success", true, "data", messages));
    }

    /** Resolved messages only. */
    @GetMapping("/resolved")
    public ResponseEntity<?> getResolvedMessages() {
        List<Message> messages = messageRepository.findByResolvedTrueOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of("success", true, "data", messages));
    }

    /** Unread count for sidebar badge. */
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        long count = messageRepository.countByReadFalse();
        return ResponseEntity.ok(Map.of("success", true, "count", count));
    }

    // ── Update read/resolved status ─────────────────────────────────────────

    /** Toggle read status — pass { "read": true/false } in body. */
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> updateReadStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Optional<Message> opt = messageRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Message msg = opt.get();
        msg.setRead(Boolean.TRUE.equals(body.get("read")));
        messageRepository.save(msg);
        return ResponseEntity.ok(Map.of("success", true, "data", msg));
    }

    /** Toggle resolved status — pass { "resolved": true/false } in body. */
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<?> updateResolvedStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Optional<Message> opt = messageRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Message msg = opt.get();
        msg.setResolved(Boolean.TRUE.equals(body.get("resolved")));
        // Resolving also marks as read automatically — logical business rule
        if (msg.isResolved()) msg.setRead(true);
        messageRepository.save(msg);
        return ResponseEntity.ok(Map.of("success", true, "data", msg));
    }

    // ── Delete ──────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        if (!messageRepository.existsById(id)) return ResponseEntity.notFound().build();
        messageRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Message deleted."));
    }
}
