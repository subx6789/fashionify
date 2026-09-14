/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: GlobalExceptionHandler.java
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global Exception Handler to catch all unhandled exceptions
 * and prevent internal implementation details / stack traces
 * from leaking to the frontend clients.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle authentication exceptions (e.g., bad credentials, user not found).
     * Returns 401 Unauthorized.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        logger.warn("Authentication failed: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        
        String message = "Invalid email or password.";
        if (ex instanceof org.springframework.security.authentication.BadCredentialsException) {
            message = "Invalid email or password.";
        } else if (ex.getMessage() != null) {
            message = ex.getMessage();
        }
        body.put("message", message);

        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle access denied exceptions (e.g., authorization failures).
     * Returns 403 Forbidden.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        logger.warn("Access denied: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Access denied.");

        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    /**
     * Handle request validation exceptions (e.g., invalid/missing field constraints).
     * Returns 400 Bad Request.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        logger.warn("Validation failed for request: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);

        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        body.put("message", errorMessage.isEmpty() ? "Validation failed." : errorMessage);

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle raw database / SQL / DataIntegrity exceptions.
     * Prevents internal table names, constraint names, or SQL fragments from leaking to clients.
     * Returns 400 or 500 with generic, user-safe message while logging the full exception server-side.
     */
    @ExceptionHandler({
        org.springframework.dao.DataAccessException.class,
        java.sql.SQLException.class,
        org.hibernate.HibernateException.class,
        jakarta.persistence.PersistenceException.class
    })
    public ResponseEntity<?> handleDatabaseExceptions(Exception ex, WebRequest request) {
        // Log the complete trace and SQL error securely on the server
        logger.error("Database or persistence exception occurred: ", ex);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("message", "A data processing error occurred. Please verify your inputs and try again.");

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle illegal argument exceptions safely.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        logger.warn("Illegal argument error: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Invalid request parameters.");

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Catch-all handler for general system exceptions.
     * Returns 500 Internal Server Error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception ex, WebRequest request) {
        // Log the detailed exception trace internally
        logger.error("Unhandled exception occurred: ", ex);
        
        // Return a clean, generic message to the client - NEVER leak stack trace or internal paths
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("message", "An unexpected error occurred. Please contact system support.");
        
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
