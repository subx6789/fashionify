package com.fashionify.backend.controller;

import com.fashionify.backend.entity.Outfit;
import com.fashionify.backend.entity.Product;
import com.fashionify.backend.repository.OutfitRepository;
import com.fashionify.backend.repository.ProductRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/outfits")
public class OutfitController {

    @Autowired
    private OutfitRepository outfitRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<?> getAllOutfits() {
        try {
            List<Outfit> outfits = outfitRepository.findAll();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", outfits
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOutfit(@RequestBody OutfitRequest request) {
        try {
            Outfit outfit = new Outfit();
            outfit.setName(request.getName());
            outfit.setDescription(request.getDescription());
            outfit.setImageUrl(request.getImageUrl());
            
            if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
                List<Product> products = productRepository.findAllById(request.getProductIds());
                outfit.setProducts(products);
            }

            Outfit savedOutfit = outfitRepository.save(outfit);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", savedOutfit
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOutfit(@PathVariable Long id) {
        try {
            outfitRepository.deleteById(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Outfit deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}

@Data
class OutfitRequest {
    private String name;
    private String description;
    private String imageUrl;
    private List<Long> productIds;
}
