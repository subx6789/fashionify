/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: JwtUtils.java
 * Purpose: Core application module.
 * Functions/Methods: 7
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;
    
    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, "token");
        if (cookie != null) {
            return cookie.getValue();
        } else {
            return null;
        }
    }

    /**
     * Enforce security standards: sets an HttpOnly JWT cookie with local/production specific options.
     */
    public void addJwtCookie(HttpServletResponse response, String jwt, String allowedOrigins) {
        boolean isLocal = allowedOrigins == null || allowedOrigins.contains("localhost") || allowedOrigins.contains("127.0.0.1");
        boolean cookieSecure = !isLocal;
        String cookieSameSite = isLocal ? "Lax" : "None";

        String cookieHeader = "token=" + jwt + "; Path=/; HttpOnly; Max-Age=86400; SameSite=" + cookieSameSite;
        if (cookieSecure) {
            cookieHeader += "; Secure";
        }
        response.addHeader("Set-Cookie", cookieHeader);
    }

    /**
     * Clears the HTTP-only JWT cookie upon logout or account deletion.
     */
    public void clearJwtCookie(HttpServletResponse response, String allowedOrigins) {
        boolean isLocal = allowedOrigins == null || allowedOrigins.contains("localhost") || allowedOrigins.contains("127.0.0.1");
        boolean cookieSecure = !isLocal;
        String cookieSameSite = isLocal ? "Lax" : "None";

        String cookieHeader = "token=; Path=/; HttpOnly; Max-Age=0; SameSite=" + cookieSameSite;
        if (cookieSecure) {
            cookieHeader += "; Secure";
        }
        response.addHeader("Set-Cookie", cookieHeader);
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getEmail())) // MERN app usually used ID or Email. Let's use Email for subject, or we can use ID.
                .claim("id", userPrincipal.getId())
                .claim("role", userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "").toLowerCase())
                .claim("userName", userPrincipal.getUsername())
                .claim("email", userPrincipal.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String getEmailFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
}
