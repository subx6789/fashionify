/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: OtpVerification.java
 * Purpose: JPA Entity representing a database table schema.
 * Functions/Methods: 1
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Stores a pending OTP for email verification during signup.
 * Expires after 5 minutes (enforced in OtpService).
 * Row is deleted after successful verification.
 */
@Entity
@Table(name = "otp_verifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The email address being verified. */
    @Column(nullable = false)
    private String email;

    /** 6-digit OTP code (stored as plain string; short-lived, not sensitive). */
    @Column(nullable = false, length = 6)
    private String otpCode;

    /** Pending username supplied during signup — persisted here until OTP verified. */
    @Column(nullable = false)
    private String userName;

    private String dateOfBirth;
    
    private String gender;

    /** BCrypt-hashed password supplied during signup. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String hashedPassword;

    /** Expiry = createdAt + 5 minutes. Checked server-side. */
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt  = this.createdAt.plusMinutes(5);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
}
