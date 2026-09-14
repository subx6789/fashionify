/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: AdminAuthController.java
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

import com.fashionify.backend.dto.JwtResponse;
import com.fashionify.backend.dto.LoginRequest;
import com.fashionify.backend.dto.MessageResponse;
import com.fashionify.backend.security.JwtUtils;
import com.fashionify.backend.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Dedicated admin login endpoint — only allows accounts with role=admin.
 * Mapped to /api/admin-auth/login so the frontend admin portal uses a
 * completely separate path from the customer login.
 */
@RestController
@RequestMapping("/api/admin-auth")
public class AdminAuthController {
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    private com.fashionify.backend.security.RateLimitFilter rateLimitFilter;

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest loginRequest,
                                        HttpServletResponse response) {
        String email = loginRequest.getEmail().trim().toLowerCase();

        // Check account exponential backoff lockout
        long lockoutSeconds = rateLimitFilter.getAccountLockoutSeconds(email);
        if (lockoutSeconds > 0) {
            return ResponseEntity.status(429)
                    .header("Retry-After", String.valueOf(lockoutSeconds))
                    .body(Map.of(
                            "success", false,
                            "message", "Admin account temporarily locked due to consecutive failed attempts. Please retry in " + lockoutSeconds + " seconds.",
                            "retryAfterSeconds", lockoutSeconds
                    ));
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, loginRequest.getPassword()));
        } catch (org.springframework.security.core.AuthenticationException e) {
            long backoff = rateLimitFilter.recordAuthFailureAndGetBackoff(email);
            String errorMsg = backoff > 0
                    ? "Too many failed admin attempts. Account locked for " + backoff + " seconds."
                    : "Invalid email or password.";
            return ResponseEntity.status(backoff > 0 ? 429 : 401)
                    .body(Map.of("success", false, "message", errorMsg));
        }

        // On successful authentication, reset backoff
        rateLimitFilter.recordAuthSuccess(email);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority()
                .replace("ROLE_", "").toLowerCase();

        // Admin portal must only allow role=admin
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403)
                    .body(new MessageResponse(false,
                            "Access denied. This portal is for administrators only. Please use the Customer Login."));
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        jwtUtils.addJwtCookie(response, jwt, allowedOrigins);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("email", userDetails.getEmail());
        userMap.put("role", role);
        userMap.put("id", userDetails.getId());
        userMap.put("userName", userDetails.getUsername());

        return ResponseEntity.ok(new JwtResponse(true, "Admin login successful", userMap));
    }
}
