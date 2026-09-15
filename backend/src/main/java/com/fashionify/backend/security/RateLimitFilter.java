package com.fashionify.backend.security;

import com.fashionify.backend.config.RateLimitConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Multi-Tier Rate Limiter Filter:
 * 1. Auth routes (/api/auth/**, /api/admin-auth/**): Per-IP and Per-Account failure backoff.
 * 2. Public endpoints (/api/contact, /api/newsletter, /api/shop/search, etc.): Per-IP window limit.
 * 3. Authenticated actions: Per-User ID window limit.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    @Autowired
    private RateLimitConfig rateLimitConfig;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory sliding window counters
    // Key: tier + ":" + identifier -> Counter
    private final Map<String, RequestCounter> counters = new ConcurrentHashMap<>();

    // Exponential backoff tracking for auth accounts
    // Key: email -> AccountBackoffState
    private final Map<String, AccountBackoffState> accountBackoffs = new ConcurrentHashMap<>();

    private static class RequestCounter {
        long windowStartMs;
        final AtomicInteger count = new AtomicInteger(0);

        RequestCounter(long windowStartMs) {
            this.windowStartMs = windowStartMs;
        }
    }

    public static class AccountBackoffState {
        int failedAttempts = 0;
        long lockedUntilMs = 0;
        long lastFailureMs = 0;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip CORS preflight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        long now = System.currentTimeMillis();

        // 1. Auth Endpoint Tier
        if (isAuthEndpoint(path)) {
            // Check IP limit
            long windowMs = rateLimitConfig.getAuthIpWindowSeconds() * 1000;
            int maxRequests = rateLimitConfig.getAuthIpLimit();
            String key = "AUTH_IP:" + clientIp;

            long retryAfterSeconds = checkWindowRateLimit(key, maxRequests, windowMs, now);
            if (retryAfterSeconds > 0) {
                rejectRateLimit(response, retryAfterSeconds, "Too many authentication attempts from this IP. Please try again later.");
                return;
            }

            filterChain.doFilter(request, response);
            return;
        }

        // 2. Public Endpoints Tier
        if (isPublicEndpoint(path)) {
            long windowMs = rateLimitConfig.getPublicIpWindowSeconds() * 1000;
            int maxRequests = rateLimitConfig.getPublicIpLimit();
            String key = "PUB_IP:" + clientIp;

            long retryAfterSeconds = checkWindowRateLimit(key, maxRequests, windowMs, now);
            if (retryAfterSeconds > 0) {
                rejectRateLimit(response, retryAfterSeconds, "Too many requests. Please slow down.");
                return;
            }

            filterChain.doFilter(request, response);
            return;
        }

        // 3. Authenticated Endpoints Tier
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String userIdentifier = auth.getName();
            long windowMs = rateLimitConfig.getAuthenticatedUserWindowSeconds() * 1000;
            int maxRequests = rateLimitConfig.getAuthenticatedUserLimit();
            String key = "AUTH_USER:" + userIdentifier;

            long retryAfterSeconds = checkWindowRateLimit(key, maxRequests, windowMs, now);
            if (retryAfterSeconds > 0) {
                rejectRateLimit(response, retryAfterSeconds, "Rate limit exceeded for user account. Please wait a moment.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Records a failed auth attempt for an account and computes exponential backoff.
     */
    public long recordAuthFailureAndGetBackoff(String email) {
        if (email == null || email.isBlank()) return 0;
        String normalized = email.trim().toLowerCase();
        long now = System.currentTimeMillis();

        AccountBackoffState state = accountBackoffs.computeIfAbsent(normalized, k -> new AccountBackoffState());
        synchronized (state) {
            // Reset if last failure was outside window
            long windowMs = rateLimitConfig.getAuthAccountWindowSeconds() * 1000;
            if (now - state.lastFailureMs > windowMs) {
                state.failedAttempts = 0;
            }

            state.failedAttempts++;
            state.lastFailureMs = now;

            if (state.failedAttempts >= rateLimitConfig.getAuthAccountMaxAttempts()) {
                int over = state.failedAttempts - rateLimitConfig.getAuthAccountMaxAttempts();
                // Exponential multiplier: base * 2^over
                long backoffSeconds = rateLimitConfig.getAuthInitialBackoffSeconds() * (1L << Math.min(over, 6));
                backoffSeconds = Math.min(backoffSeconds, rateLimitConfig.getAuthMaxBackoffSeconds());

                state.lockedUntilMs = now + (backoffSeconds * 1000);
                log.warn("Account {} exceeded failed auth attempts ({}), applying exponential backoff: {}s",
                        normalized, state.failedAttempts, backoffSeconds);
                return backoffSeconds;
            }
        }
        return 0;
    }

    /**
     * Checks if an account is currently in an exponential backoff lockout.
     */
    public long getAccountLockoutSeconds(String email) {
        if (email == null || email.isBlank()) return 0;
        String normalized = email.trim().toLowerCase();
        AccountBackoffState state = accountBackoffs.get(normalized);
        if (state == null) return 0;

        long now = System.currentTimeMillis();
        synchronized (state) {
            if (state.lockedUntilMs > now) {
                return (state.lockedUntilMs - now + 999) / 1000;
            }
        }
        return 0;
    }

    /**
     * Clears backoff on successful login.
     */
    public void recordAuthSuccess(String email) {
        if (email == null || email.isBlank()) return;
        accountBackoffs.remove(email.trim().toLowerCase());
    }

    private long checkWindowRateLimit(String key, int maxRequests, long windowMs, long now) {
        RequestCounter counter = counters.compute(key, (k, existing) -> {
            if (existing == null || (now - existing.windowStartMs) >= windowMs) {
                RequestCounter fresh = new RequestCounter(now);
                fresh.count.incrementAndGet();
                return fresh;
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (counter.count.get() > maxRequests) {
            long remainingMs = windowMs - (now - counter.windowStartMs);
            return Math.max(1, (remainingMs + 999) / 1000);
        }
        return 0;
    }

    private void rejectRateLimit(HttpServletResponse response, long retryAfterSeconds, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = Map.of(
                "success", false,
                "message", message,
                "retryAfterSeconds", retryAfterSeconds
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    private boolean isAuthEndpoint(String path) {
        return path.startsWith("/api/auth/") || path.startsWith("/api/admin-auth/");
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/contact")
                || path.startsWith("/api/newsletter")
                || path.startsWith("/api/waitlist")
                || path.startsWith("/api/shop/search")
                || path.startsWith("/api/shop/products");
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }
}
