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

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest loginRequest,
                                        HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

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

        boolean isLocal = allowedOrigins == null || allowedOrigins.contains("localhost") || allowedOrigins.contains("127.0.0.1");
        boolean cookieSecure = !isLocal;
        String cookieSameSite = isLocal ? "Lax" : "None";

        String cookieHeader = "token=" + jwt + "; Path=/; HttpOnly; Max-Age=86400; SameSite=" + cookieSameSite;
        if (cookieSecure) {
            cookieHeader += "; Secure";
        }
        response.addHeader("Set-Cookie", cookieHeader);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("email", userDetails.getEmail());
        userMap.put("role", role);
        userMap.put("id", userDetails.getId());
        userMap.put("userName", userDetails.getUsername());

        return ResponseEntity.ok(new JwtResponse(true, "Admin login successful", userMap));
    }
}
