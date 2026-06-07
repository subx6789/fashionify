package com.fashionify.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global Exception Handler to catch all unhandled exceptions
 * and prevent internal implementation details / stack traces
 * from leaking to the frontend clients.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception ex, WebRequest request) {
        // Log the detailed exception trace internally
        logger.error("Unhandled exception occurred: ", ex);
        
        // Return a clean, generic message to the client
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("message", "An unexpected error occurred. Please contact system support.");
        
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
