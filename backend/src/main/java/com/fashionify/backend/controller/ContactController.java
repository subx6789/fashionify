/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: ContactController.java
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

package com.fashionify.backend.controller;

import com.fashionify.backend.entity.Message;
import com.fashionify.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public endpoint for the Contact Us form.
 * No authentication required — permitted in SecurityConfig.
 */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private MessageRepository messageRepository;

    @PostMapping
    public ResponseEntity<?> submitContactForm(@jakarta.validation.Valid @RequestBody com.fashionify.backend.dto.ContactRequest payload) {
        Message saved = messageRepository.save(
            Message.builder()
                .name(payload.getName().trim())
                .email(payload.getEmail().trim().toLowerCase())
                .subject(payload.getSubject().trim())
                .message(payload.getMessage().trim())
                .build()
        );

        return ResponseEntity.status(201).body(
            Map.of("success", true, "message", "Your message has been received. We will get back to you shortly.", "id", saved.getId()));
    }
}
