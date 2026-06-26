/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: JwtResponse.java
 * Purpose: Data Transfer Object used for safely transferring data between client and server.
 * Functions/Methods: 0
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private boolean success;
    private String message;
    private Object user;
}
