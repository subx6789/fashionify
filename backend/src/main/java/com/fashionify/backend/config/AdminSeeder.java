package com.fashionify.backend.config;

import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        List<User> allAdmins = userRepository.findAll().stream()
                .filter(u -> "admin".equalsIgnoreCase(u.getRole()))
                .toList();

        if (allAdmins.isEmpty()) {
            // Check if 'admin' username is taken, to prevent unique constraint violation
            String userName = "admin";
            if (userRepository.existsByUserName(userName)) {
                userName = "admin_" + System.currentTimeMillis();
            }

            // Create a new admin
            User newAdmin = User.builder()
                    .userName(userName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role("admin")
                    .build();
            userRepository.save(newAdmin);
            System.out.println("Seeded new admin: " + adminEmail);
        } else {
            // Update the first admin found to match the new credentials
            User primaryAdmin = allAdmins.get(0);
            primaryAdmin.setEmail(adminEmail);
            primaryAdmin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(primaryAdmin);
            System.out.println("Updated existing admin with new credentials: " + adminEmail);
            
            // Demote other admins to avoid foreign key constraint issues on delete
            for (int i = 1; i < allAdmins.size(); i++) {
                User extraAdmin = allAdmins.get(i);
                extraAdmin.setRole("user");
                userRepository.save(extraAdmin);
                System.out.println("Demoted extra admin to user: " + extraAdmin.getEmail());
            }
        }
    }
}
