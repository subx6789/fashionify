package com.fashionify.backend.service;

import com.fashionify.backend.entity.OtpVerification;
import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.OtpVerificationRepository;
import com.fashionify.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpVerificationRepository otpRepo;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ── Step 1: Initiate signup — check uniqueness, generate OTP, send email ──

    /**
     * @throws IllegalStateException if email or username is already taken (HTTP 409).
     */
    @Transactional
    public void initiateSignup(String email, String userName, String rawPassword) {
        // 1a. Email uniqueness check
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("EMAIL_TAKEN");
        }
        // 1b. Username uniqueness check
        if (userRepository.existsByUserName(userName)) {
            throw new IllegalStateException("USERNAME_TAKEN");
        }

        // 2. Purge stale OTP rows for this email before issuing a new one
        otpRepo.deleteAllByEmail(email);

        // 3. Generate cryptographically secure 6-digit OTP
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

        // 4. Persist pending signup + OTP
        OtpVerification pending = OtpVerification.builder()
                .email(email)
                .userName(userName)
                .hashedPassword(passwordEncoder.encode(rawPassword))
                .otpCode(otp)
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

        // Create verified user
        User user = User.builder()
                .email(pending.getEmail())
                .userName(pending.getUserName())
                .password(pending.getHashedPassword())
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
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Fashionify — Your Verification Code");
        message.setText(
                "Hi " + userName + ",\n\n" +
                "Your one-time verification code is:\n\n" +
                "  " + otp + "\n\n" +
                "This code expires in 5 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "— The Fashionify Team"
        );
        mailSender.send(message);
    }
}
