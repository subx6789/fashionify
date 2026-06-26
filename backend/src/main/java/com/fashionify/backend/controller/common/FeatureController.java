/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: FeatureController.java
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

package com.fashionify.backend.controller.common;

import com.fashionify.backend.entity.Feature;
import com.fashionify.backend.repository.FeatureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/common/feature")
public class FeatureController {

    @Autowired
    private FeatureRepository featureRepository;

    @PostMapping("/add")
    @CacheEvict(value = "features", allEntries = true)
    public ResponseEntity<?> addFeatureImage(@RequestBody Feature feature) {
        Feature savedFeature = featureRepository.save(feature);
        return ResponseEntity.ok(Map.of("success", true, "data", savedFeature));
    }

    @GetMapping("/get")
    @Cacheable("features")
    public ResponseEntity<?> getFeatureImages() {
        List<Feature> features = featureRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", features));
    }

    @PutMapping("/edit/{id}")
    @CacheEvict(value = "features", allEntries = true)
    public ResponseEntity<?> editFeatureImage(@PathVariable Long id, @RequestBody Feature featureDetails) {
        Feature feature = featureRepository.findById(id).orElse(null);
        if (feature == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Feature not found"));
        }
        if (featureDetails.getStartDate() != null) {
            feature.setStartDate(featureDetails.getStartDate());
        }
        if (featureDetails.getEndDate() != null) {
            feature.setEndDate(featureDetails.getEndDate());
        }
        if (featureDetails.getLinkUrl() != null) {
            feature.setLinkUrl(featureDetails.getLinkUrl());
        }
        Feature updatedFeature = featureRepository.save(feature);
        return ResponseEntity.ok(Map.of("success", true, "data", updatedFeature));
    }

    @DeleteMapping("/delete/{id}")
    @CacheEvict(value = "features", allEntries = true)
    public ResponseEntity<?> deleteFeatureImage(@PathVariable Long id) {
        Feature feature = featureRepository.findById(id).orElse(null);
        if (feature == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Feature not found"));
        }
        featureRepository.delete(feature);
        return ResponseEntity.ok(Map.of("success", true, "message", "Feature deleted successfully"));
    }
}
