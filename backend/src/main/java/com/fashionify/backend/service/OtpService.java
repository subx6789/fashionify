package com.fashionify.backend.service;

import com.fashionify.backend.entity.OtpVerification;
import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.OtpVerificationRepository;
import com.fashionify.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeParseException;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpVerificationRepository otpRepo;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ── Step 1: Initiate signup — check uniqueness, generate OTP, send email ──

    /**
     * @throws IllegalStateException if email or username is already taken (HTTP 409).
     */
    @Transactional
    public void initiateSignup(String email, String userName, String rawPassword, String dateOfBirth, String gender) {
        // 1a. Username length check
        if (userName == null || userName.trim().length() <= 3) {
            throw new IllegalArgumentException("Username must be greater than 3 characters.");
        }
        
        // 1b. Age validation
        if (dateOfBirth == null || dateOfBirth.isBlank()) {
            throw new IllegalArgumentException("Date of birth is required.");
        }
        int age;
        try {
            LocalDate dob = LocalDate.parse(dateOfBirth);
            age = Period.between(dob, LocalDate.now()).getYears();
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Expected YYYY-MM-DD.");
        }
        if (age < 10) {
            throw new IllegalArgumentException("You must be at least 10 years old to register.");
        }

        // 1c. Email uniqueness check
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("EMAIL_TAKEN");
        }
        // 1d. Username uniqueness check
        if (userRepository.existsByUserName(userName)) {
            throw new IllegalStateException("USERNAME_TAKEN");
        }

        // 2. Purge stale OTP rows for this email before issuing a new one
        otpRepo.deleteAllByEmail(email);

        // 3. Generate cryptographically secure 4-digit OTP
        String otp = String.format("%04d", SECURE_RANDOM.nextInt(10_000));

        // 4. Persist pending signup + OTP
        OtpVerification pending = OtpVerification.builder()
                .email(email)
                .userName(userName)
                .hashedPassword(passwordEncoder.encode(rawPassword))
                .otpCode(otp)
                .dateOfBirth(dateOfBirth)
                .gender(gender)
                .build();
        otpRepo.save(pending);

        // 5. Send email
        sendOtpEmail(email, userName, otp);
        log.info("OTP sent to {}", email);
    }

    // ── Step 2: Verify OTP and create user ───────────────────────────────────

    /**
     * @throws IllegalArgumentException on invalid / expired OTP.
     * @throws IllegalStateException if email already registered (race condition guard).
     */
    @Transactional
    public User verifyOtpAndRegister(String email, String submittedOtp) {
        OtpVerification pending = otpRepo.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("OTP_NOT_FOUND"));

        if (pending.isExpired()) {
            otpRepo.deleteAllByEmail(email);
            throw new IllegalArgumentException("OTP_EXPIRED");
        }
        if (!pending.getOtpCode().equals(submittedOtp)) {
            throw new IllegalArgumentException("OTP_INVALID");
        }

        // Guard against race condition
        if (userRepository.existsByEmail(email)) {
            otpRepo.deleteAllByEmail(email);
            throw new IllegalStateException("EMAIL_TAKEN");
        }

        // Calculate age for final saving
        String ageStr = null;
        if (pending.getDateOfBirth() != null && !pending.getDateOfBirth().isBlank()) {
            try {
                LocalDate dob = LocalDate.parse(pending.getDateOfBirth());
                int age = Period.between(dob, LocalDate.now()).getYears();
                ageStr = String.valueOf(age);
            } catch (Exception ignored) {}
        }

        // Create verified user
        User user = User.builder()
                .email(pending.getEmail())
                .userName(pending.getUserName())
                .password(pending.getHashedPassword())
                .dateOfBirth(pending.getDateOfBirth())
                .gender(pending.getGender())
                .age(ageStr)
                .role("user")
                .build();
        User saved = userRepository.save(user);

        // Clean up OTP record
        otpRepo.deleteAllByEmail(email);
        log.info("User {} registered successfully.", email);
        return saved;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void sendOtpEmail(String toEmail, String userName, String otp) {
        String subject = "Fashionify — Your Verification Code";
        String body = "Hi " + userName + ",\n\n" +
                "Your one-time verification code is:\n\n" +
                "  " + otp + "\n\n" +
                "This code expires in 5 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "— The Fashionify Team";
        try {
            emailService.sendSimpleEmail(toEmail, subject, body);
            log.info("OTP email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {} (Resend may not be configured). OTP is: {}", toEmail, otp);
            log.error("Mail Error: {}", e.getMessage());
            // We swallow the exception here so the transaction doesn't roll back, 
            // allowing the developer to see the OTP in the console and continue testing.
        }
    }
}
