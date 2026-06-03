package com.fashionify.backend.controller;

import com.fashionify.backend.dto.JwtResponse;
import com.fashionify.backend.dto.LoginRequest;
import com.fashionify.backend.dto.MessageResponse;
import com.fashionify.backend.dto.RegisterRequest;
import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.UserRepository;
import com.fashionify.backend.security.JwtUtils;
import com.fashionify.backend.security.UserDetailsImpl;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(false, "Error: Email is already in use!"));
        }

        if (userRepository.existsByUserName(signUpRequest.getUserName())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(false, "Error: Username is already taken!"));
        }

        // Backend password strength validation
        String password = signUpRequest.getPassword();
        if (password == null || password.length() < 8
                || !password.matches(".*[A-Z].*")
                || !password.matches(".*[a-z].*")
                || !password.matches(".*[0-9].*")
                || !password.matches(".*[^A-Za-z0-9].*")) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(false,
                            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."));
        }

        long userCount = userRepository.count();
        String role = (userCount == 0) ? "admin" : "user";

        // Create new user's account
        User user = User.builder()
                .userName(signUpRequest.getUserName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse(true, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority()
                .replace("ROLE_", "").toLowerCase();

        // User login portal must only allow role=user
        if (!"user".equals(role)) {
            return ResponseEntity.status(403)
                    .body(new MessageResponse(false,
                            "Access denied. Admin accounts must use the Admin Login portal."));
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        Cookie cookie = new Cookie("token", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24);
        response.addCookie(cookie);
        response.addHeader("Set-Cookie",
            "token=" + jwt + "; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax");

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("email", userDetails.getEmail());
        userMap.put("role", role);
        userMap.put("id", userDetails.getId());
        userMap.put("userName", userDetails.getUsername());
        
        if (user != null) {
            userMap.put("topSize", user.getTopSize());
            userMap.put("bottomSize", user.getBottomSize());
            userMap.put("shoeSize", user.getShoeSize());
            userMap.put("preferredStyle", user.getPreferredStyle());
        }

        return ResponseEntity.ok(new JwtResponse(true, "Logged in successfully", userMap));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(new MessageResponse(true, "Logged out successfully!"));
    }

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new MessageResponse(false, "Unauthorised user!"));
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("email", userDetails.getEmail());
        userMap.put("role", userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "").toLowerCase());
        userMap.put("id", userDetails.getId());
        userMap.put("userName", userDetails.getUsername());

        if (user != null) {
            userMap.put("topSize", user.getTopSize());
            userMap.put("bottomSize", user.getBottomSize());
            userMap.put("shoeSize", user.getShoeSize());
            userMap.put("preferredStyle", user.getPreferredStyle());
        }

        return ResponseEntity.ok(new JwtResponse(true, "Authenticated user!", userMap));
    }

    @PutMapping("/update-preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody Map<String, String> payload, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new MessageResponse(false, "Unauthorised user!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "User not found"));
        }

        if (payload.containsKey("topSize")) user.setTopSize(payload.get("topSize"));
        if (payload.containsKey("bottomSize")) user.setBottomSize(payload.get("bottomSize"));
        if (payload.containsKey("shoeSize")) user.setShoeSize(payload.get("shoeSize"));
        if (payload.containsKey("preferredStyle")) user.setPreferredStyle(payload.get("preferredStyle"));

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse(true, "Preferences updated successfully!"));
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> payload, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new MessageResponse(false, "Unauthorised user!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "User not found"));
        }

        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        if (!encoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "Incorrect old password"));
        }

        if (newPassword == null || newPassword.length() < 8
                || !newPassword.matches(".*[A-Z].*")
                || !newPassword.matches(".*[a-z].*")
                || !newPassword.matches(".*[0-9].*")
                || !newPassword.matches(".*[^A-Za-z0-9].*")) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(false,
                            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."));
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse(true, "Password updated successfully!"));
    }
}
