package com.fashionify.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "app.rate-limiting")
@Data
public class RateLimitConfig {

    // Auth endpoints: per-IP baseline limits
    private int authIpLimit = 15;
    private long authIpWindowSeconds = 60;

    // Auth endpoints: per-account (email) baseline limits before exponential backoff
    private int authAccountMaxAttempts = 5;
    private long authAccountWindowSeconds = 300; // 5 minutes
    private long authInitialBackoffSeconds = 30; // base backoff multiplier
    private long authMaxBackoffSeconds = 3600;   // 1 hour cap

    // Public endpoints limits per IP (e.g. search, contact, newsletter)
    private int publicIpLimit = 60;
    private long publicIpWindowSeconds = 60;

    // Authenticated endpoints limits per User ID
    private int authenticatedUserLimit = 180;
    private long authenticatedUserWindowSeconds = 60;
}
