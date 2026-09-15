package com.fashionify.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactRequest {

    @NotBlank(message = "Name is required.")
    @Size(min = 2, max = 80, message = "Name must be between 2 and 80 characters.")
    private String name;

    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    @Size(max = 120, message = "Email cannot exceed 120 characters.")
    private String email;

    @NotBlank(message = "Subject is required.")
    @Size(min = 2, max = 150, message = "Subject must be between 2 and 150 characters.")
    private String subject;

    @NotBlank(message = "Message body is required.")
    @Size(min = 5, max = 3000, message = "Message must be between 5 and 3000 characters.")
    private String message;
}
