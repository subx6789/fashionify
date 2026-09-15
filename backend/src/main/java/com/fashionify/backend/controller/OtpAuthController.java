/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: OtpAuthController.java
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

import com.fashionify.backend.dto.InitiateSignupRequest;
import com.fashionify.backend.dto.VerifyOtpRequest;
import com.fashionify.backend.entity.User;
import com.fashionify.backend.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * OTP-based signup flow.
 *
 * POST /api/auth/signup/initiate  — check email, generate OTP, send email
 * POST /api/auth/signup/verify    — verify OTP and finalize registration
 */
@RestController
@RequestMapping("/api/auth/signup")
@RequiredArgsConstructor
public class OtpAuthController {

    private final OtpService otpService;

    // ── Step 1: Initiate signup ───────────────────────────────────────────────

    /**
     * Body: InitiateSignupRequest with strict validation annotations.
     * Returns 200 on success, 409 if email/username taken, 400 on invalid fields.
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateSignup(@Valid @RequestBody InitiateSignupRequest body) {
        String email       = body.getEmail();
        String userName    = body.getUserName();
        String password    = body.getPassword();
        String dateOfBirth = body.getDateOfBirth();
        String gender      = body.getGender();

        try {
            otpService.initiateSignup(email.trim().toLowerCase(), userName.trim(), password, dateOfBirth.trim(), gender != null ? gender.trim() : "");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "OTP sent to " + email + ". Valid for 5 minutes."
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            String msg = switch (ex.getMessage()) {
                case "EMAIL_TAKEN"    -> "email already exists or connected with other account please try a new email";
                case "USERNAME_TAKEN" -> "This username is already taken.";
                default               -> ex.getMessage();
            };
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", msg));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Failed to send OTP. Try again later."));
        }
    }

    // ── Step 2: Verify OTP and register ──────────────────────────────────────

    /**
     * Body: VerifyOtpRequest with strict email and OTP format checks.
     * Returns 201 on success, 400 on invalid/expired OTP, 409 on race condition.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest body) {
        String email = body.getEmail();
        String otp   = body.getOtp();

        try {
            User created = otpService.verifyOtpAndRegister(email.trim().toLowerCase(), otp.trim());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Account created successfully.",
                    "userId", created.getId(),
                    "userName", created.getUserName()
            ));
        } catch (IllegalArgumentException ex) {
            String msg = switch (ex.getMessage()) {
                case "OTP_NOT_FOUND" -> "No OTP found for this email. Please restart signup.";
                case "OTP_EXPIRED"   -> "Your OTP has expired. Please restart signup.";
                case "OTP_INVALID"   -> "Incorrect OTP. Please try again.";
                default              -> ex.getMessage();
            };
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", msg));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "An account with this email already exists."));
        }
    }
}
