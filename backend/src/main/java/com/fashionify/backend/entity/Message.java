package com.fashionify.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Stores contact form submissions from the public-facing Contact Us page.
 * Admins manage these via the AdminMessageController.
 */
@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Whether the admin has opened/read this message. Defaults to false. */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    /** Whether the admin has marked this issue as resolved. Defaults to false. */
    @Column(nullable = false)
    @Builder.Default
    private boolean resolved = false;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
