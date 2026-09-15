package com.fashionify.backend.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * File upload validator that strictly enforces:
 * 1. Maximum file size (5MB).
 * 2. Allowed MIME types and extensions.
 * 3. Magic-byte signature verification.
 * 4. Image decoding verification to prevent malicious code/polyglots execution.
 */
@Component
public class FileUploadValidator {

    public static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".webp"
    );

    public void validateImage(MultipartFile file) throws IllegalArgumentException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload rejected: No file provided or file is empty.");
        }

        // 1. File Size Verification
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Upload rejected: File size exceeds the maximum limit of 5MB.");
        }

        // 2. Extension Verification
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Upload rejected: Missing filename.");
        }

        String lowerFilename = originalFilename.toLowerCase();
        boolean hasAllowedExt = ALLOWED_EXTENSIONS.stream().anyMatch(lowerFilename::endsWith);
        if (!hasAllowedExt) {
            throw new IllegalArgumentException("Upload rejected: Unsupported file extension. Only JPG, PNG, and WEBP are permitted.");
        }

        // 3. MIME type verification
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Upload rejected: Invalid content type. Permitted formats: JPEG, PNG, WEBP.");
        }

        // 4. Magic-byte signature validation
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new IllegalArgumentException("Upload rejected: Unable to read file content.");
        }

        if (!isValidMagicBytes(bytes)) {
            throw new IllegalArgumentException("Upload rejected: File content does not match a genuine image signature.");
        }

        // 5. Image decode verification (unless pure webp where ImageIO might lack default native SPI plugins)
        if (!lowerFilename.endsWith(".webp") && !"image/webp".equalsIgnoreCase(contentType)) {
            try {
                BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
                if (image == null || image.getWidth() <= 0 || image.getHeight() <= 0) {
                    throw new IllegalArgumentException("Upload rejected: File content could not be parsed as a valid image.");
                }
            } catch (Exception e) {
                throw new IllegalArgumentException("Upload rejected: Corrupted or malicious image payload detected.");
            }
        }
    }

    private boolean isValidMagicBytes(byte[] bytes) {
        if (bytes == null || bytes.length < 12) {
            return false;
        }

        // JPEG: FF D8 FF
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return true;
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if ((bytes[0] & 0xFF) == 0x89 && (bytes[1] & 0xFF) == 0x50 &&
            (bytes[2] & 0xFF) == 0x4E && (bytes[3] & 0xFF) == 0x47 &&
            (bytes[4] & 0xFF) == 0x0D && (bytes[5] & 0xFF) == 0x0A &&
            (bytes[6] & 0xFF) == 0x1A && (bytes[7] & 0xFF) == 0x0A) {
            return true;
        }

        // WEBP: "RIFF" .... "WEBP"
        if (bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
            bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return true;
        }

        return false;
    }
}
