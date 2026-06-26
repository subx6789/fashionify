package com.fashionify.backend.controller;

import com.fashionify.backend.dto.JwtResponse;
import com.fashionify.backend.dto.LoginRequest;
import com.fashionify.backend.dto.MessageResponse;
import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.UserRepository;
import com.fashionify.backend.security.JwtUtils;
import com.fashionify.backend.security.UserDetailsImpl;
import com.fashionify.backend.repository.AddressRepository;
import com.fashionify.backend.repository.CartRepository;
import com.fashionify.backend.repository.OrderRepository;
import com.fashionify.backend.repository.ReviewRepository;
import com.fashionify.backend.repository.WishlistRepository;
import com.fashionify.backend.entity.PasswordReset;
import com.fashionify.backend.repository.PasswordResetRepository;
import com.fashionify.backend.service.EmailService;
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AddressRepository addressRepository;

    @Autowired
    CartRepository cartRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    ReviewRepository reviewRepository;

    @Autowired
    WishlistRepository wishlistRepository;

    @Autowired
    PasswordResetRepository passwordResetRepository;

    @Autowired
    EmailService emailService;

    private static final java.security.SecureRandom SECURE_RANDOM = new java.security.SecureRandom();

    // Legacy /register endpoint removed to enforce OTP signup flow

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

        jwtUtils.addJwtCookie(response, jwt, allowedOrigins);

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
            userMap.put("gender", user.getGender());
            userMap.put("weight", user.getWeight());
            userMap.put("age", user.getAge());
            userMap.put("avatar", user.getAvatar());
        }

        return ResponseEntity.ok(new JwtResponse(true, "Logged in successfully", userMap));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        jwtUtils.clearJwtCookie(response, allowedOrigins);

        return ResponseEntity.ok(new MessageResponse(true, "Logged out successfully!"));
    }

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(new MessageResponse(false, "Unauthorised user!"));
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
            userMap.put("gender", user.getGender());
            userMap.put("weight", user.getWeight());
            userMap.put("age", user.getAge());
            userMap.put("avatar", user.getAvatar());
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

    @PostMapping("/forgot-password/initiate")
    @Transactional
    public ResponseEntity<?> initiateForgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "Email is required."));
        }

        String targetEmail = email.trim().toLowerCase();
        if (!userRepository.existsByEmail(targetEmail)) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "No account found with this email."));
        }

        // Purge old tokens
        passwordResetRepository.deleteAllByEmail(targetEmail);

        // Generate 6-digit code
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1000000));

        // Save new code
        PasswordReset reset = PasswordReset.builder()
                .email(targetEmail)
                .otpCode(otp)
                .build();
        passwordResetRepository.save(reset);

        // Send email
        String subject = "Fashionify — Password Reset Verification Code";
        String body = "You requested to reset your password.\n\n" +
                "Your verification code is:\n\n" +
                "  " + otp + "\n\n" +
                "This code expires in 5 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "— The Fashionify Team";
        try {
            emailService.sendSimpleEmail(targetEmail, subject, body);
        } catch (Exception e) {
            System.out.println("Failed to send password reset email to " + targetEmail + ": " + e.getMessage());
        }

        return ResponseEntity.ok(new MessageResponse(true, "Verification code sent to your email."));
    }

    @PostMapping("/forgot-password/reset")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");
        String confirmPassword = payload.get("confirmPassword");

        if (email == null || otp == null || newPassword == null || confirmPassword == null ||
            email.isBlank() || otp.isBlank() || newPassword.isBlank() || confirmPassword.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "All fields are required."));
        }

        String targetEmail = email.trim().toLowerCase();
        
        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "Passwords do not match."));
        }

        // Check password requirements
        if (newPassword.length() < 8
                || !newPassword.matches(".*[A-Z].*")
                || !newPassword.matches(".*[a-z].*")
                || !newPassword.matches(".*[0-9].*")
                || !newPassword.matches(".*[^A-Za-z0-9].*")) {
            return ResponseEntity.badRequest().body(new MessageResponse(false,
                    "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."));
        }

        PasswordReset pending = passwordResetRepository.findTopByEmailOrderByCreatedAtDesc(targetEmail).orElse(null);
        if (pending == null) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "No verification code found. Please request a new code."));
        }

        if (pending.isExpired()) {
            passwordResetRepository.deleteAllByEmail(targetEmail);
            return ResponseEntity.badRequest().body(new MessageResponse(false, "Verification code has expired."));
        }

        if (!pending.getOtpCode().equals(otp.trim())) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "Incorrect verification code."));
        }

        User user = userRepository.findByEmail(targetEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "User not found."));
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        passwordResetRepository.deleteAllByEmail(targetEmail);

        return ResponseEntity.ok(new MessageResponse(true, "Password has been reset successfully."));
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> payload, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new MessageResponse(false, "Unauthorised user!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "User not found"));
        }

        String newUserName = payload.get("userName");
        if (newUserName != null && !newUserName.equals(user.getUserName())) {
            if (userRepository.existsByUserName(newUserName)) {
                return ResponseEntity.badRequest().body(new MessageResponse(false, "Error: Username is already taken!"));
            }
            user.setUserName(newUserName);
        }

        if (payload.containsKey("gender")) user.setGender(payload.get("gender"));
        if (payload.containsKey("weight")) user.setWeight(payload.get("weight"));
        if (payload.containsKey("age")) user.setAge(payload.get("age"));
        if (payload.containsKey("avatar")) user.setAvatar(payload.get("avatar"));

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse(true, "Profile updated successfully!"));
    }

    @Transactional
    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(Authentication authentication, HttpServletResponse response) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new MessageResponse(false, "Unauthorised user!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.badRequest().body(new MessageResponse(false, "User not found"));
        }

        addressRepository.deleteByUserId(userId);
        cartRepository.deleteByUserId(userId);
        orderRepository.deleteByUserId(userId);
        reviewRepository.deleteByUserId(userId);
        wishlistRepository.deleteByUserId(userId);

        userRepository.deleteById(userId);

        jwtUtils.clearJwtCookie(response, allowedOrigins);

        return ResponseEntity.ok(new MessageResponse(true, "Account deleted successfully!"));
    }
}
