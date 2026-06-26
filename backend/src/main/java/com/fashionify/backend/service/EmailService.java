/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: EmailService.java
 * Purpose: Spring Boot Service containing core business logic and database orchestration.
 * Functions/Methods: 1
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

/**
 * Service for sending plain-text emails using Brevo REST API.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.from.email:info@fashionify.com}")
    private String fromEmail;

    @Value("${brevo.from.name:Fashionify}")
    private String fromName;

    /**
     * Sends a plain-text email using Brevo API.
     *
     * @param to      recipient address
     * @param subject email subject line
     * @param body    plain-text body
     */
    public void sendSimpleEmail(String to, String subject, String body) {
        if (brevoApiKey == null || brevoApiKey.isBlank() || brevoApiKey.contains("placeholder") || brevoApiKey.contains("your_api_key")) {
            log.warn("Brevo API key is not configured. Skipping sending email to {}. Subject: {}", to, subject);
            log.info("Email body would be:\n{}", body);
            return;
        }

        try {
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", fromName, "email", fromEmail),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "textContent", body
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "Fashionify-Backend/1.0")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email successfully sent to {} via Brevo. Response: {}", to, response.body());
            } else {
                log.error("Failed to send email to {} via Brevo. Status code: {}, Response: {}", to, response.statusCode(), response.body());
                throw new RuntimeException("Brevo API error: " + response.body());
            }
        } catch (Exception e) {
            log.error("Error sending email via Brevo to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email via Brevo", e);
        }
    }
}

