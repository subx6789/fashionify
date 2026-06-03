package com.fashionify.backend.controller.common;

import com.fashionify.backend.entity.Feature;
import com.fashionify.backend.repository.FeatureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/common/feature")
public class FeatureController {

    @Autowired
    private FeatureRepository featureRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addFeatureImage(@RequestBody Feature feature) {
        Feature savedFeature = featureRepository.save(feature);
        return ResponseEntity.ok(Map.of("success", true, "data", savedFeature));
    }

    @GetMapping("/get")
    public ResponseEntity<?> getFeatureImages() {
        List<Feature> features = featureRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", features));
    }

    @PutMapping("/edit/{id}")
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
        Feature updatedFeature = featureRepository.save(feature);
        return ResponseEntity.ok(Map.of("success", true, "data", updatedFeature));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteFeatureImage(@PathVariable Long id) {
        Feature feature = featureRepository.findById(id).orElse(null);
        if (feature == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Feature not found"));
        }
        featureRepository.delete(feature);
        return ResponseEntity.ok(Map.of("success", true, "message", "Feature deleted successfully"));
    }
}
