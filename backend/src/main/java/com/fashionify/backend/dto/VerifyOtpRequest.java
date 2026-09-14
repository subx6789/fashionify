package com.fashionify.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    @Size(max = 120, message = "Email cannot exceed 120 characters.")
    private String email;

    @NotBlank(message = "OTP code is required.")
    @Pattern(regexp = "^\\d{4,6}$", message = "OTP must be a numeric code between 4 and 6 digits.")
    private String otp;
}
