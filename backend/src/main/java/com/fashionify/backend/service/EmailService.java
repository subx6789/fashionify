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
 * Service for sending plain-text emails using Resend REST API.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email:Fashionify <onboarding@resend.dev>}")
    private String fromEmail;

    /**
     * Sends a plain-text email using Resend API.
     *
     * @param to      recipient address
     * @param subject email subject line
     * @param body    plain-text body
     */
    public void sendSimpleEmail(String to, String subject, String body) {
        if (resendApiKey == null || resendApiKey.isBlank() || resendApiKey.contains("placeholder") || resendApiKey.contains("your_api_key")) {
            log.warn("Resend API key is not configured. Skipping sending email to {}. Subject: {}", to, subject);
            log.info("Email body would be:\n{}", body);
            return;
        }

        try {
            Map<String, Object> payload = Map.of(
                    "from", fromEmail,
                    "to", List.of(to),
                    "subject", subject,
                    "text", body
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "Fashionify-Backend/1.0")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email successfully sent to {} via Resend. Response: {}", to, response.body());
            } else {
                log.error("Failed to send email to {} via Resend. Status code: {}, Response: {}", to, response.statusCode(), response.body());
                throw new RuntimeException("Resend API error: " + response.body());
            }
        } catch (Exception e) {
            log.error("Error sending email via Resend to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email via Resend", e);
        }
    }
}
