/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: ShopAddressController.java
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

package com.fashionify.backend.controller.shop;

import com.fashionify.backend.entity.Address;
import com.fashionify.backend.entity.User;
import com.fashionify.backend.repository.AddressRepository;
import com.fashionify.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shop/address")
public class ShopAddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addAddress(@RequestBody Map<String, String> payload) {
        Long userId = Long.parseLong(payload.get("userId"));
        Optional<User> user = userRepository.findById(userId);
        
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
        }

        Address address = Address.builder()
                .user(user.get())
                .address(payload.get("address"))
                .city(payload.get("city"))
                .pincode(payload.get("pincode"))
                .phone(payload.get("phone"))
                .notes(payload.get("notes"))
                .build();

        Address savedAddress = addressRepository.save(address);
        return ResponseEntity.ok(Map.of("success", true, "data", savedAddress));
    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<?> getAddress(@PathVariable Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        return ResponseEntity.ok(Map.of("success", true, "data", addresses));
    }

    @PutMapping("/update/{userId}/{addressId}")
    public ResponseEntity<?> editAddress(@PathVariable Long userId, @PathVariable Long addressId, @RequestBody Map<String, String> payload) {
        Optional<Address> optionalAddress = addressRepository.findById(addressId);
        
        if (optionalAddress.isPresent()) {
            Address address = optionalAddress.get();
            if (!address.getUser().getId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
            }
            
            address.setAddress(payload.get("address"));
            address.setCity(payload.get("city"));
            address.setPincode(payload.get("pincode"));
            address.setPhone(payload.get("phone"));
            address.setNotes(payload.get("notes"));
            
            Address updatedAddress = addressRepository.save(address);
            return ResponseEntity.ok(Map.of("success", true, "data", updatedAddress));
        }
        
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{userId}/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        Optional<Address> optionalAddress = addressRepository.findById(addressId);
        
        if (optionalAddress.isPresent()) {
            Address address = optionalAddress.get();
            if (!address.getUser().getId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
            }
            
            addressRepository.deleteById(addressId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Address deleted successfully"));
        }
        
        return ResponseEntity.notFound().build();
    }
}
