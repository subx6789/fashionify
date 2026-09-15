package com.fashionify.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class WaitlistRequest {

    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    @Size(max = 120, message = "Email cannot exceed 120 characters.")
    private String email;

    @NotNull(message = "Product ID is required.")
    @Positive(message = "Product ID must be a positive number.")
    private Long productId;

    @NotBlank(message = "Size is required.")
    @Size(max = 10, message = "Size code cannot exceed 10 characters.")
    private String size;
}
