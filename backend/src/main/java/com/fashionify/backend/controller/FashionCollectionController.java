package com.fashionify.backend.controller;

import com.fashionify.backend.entity.FashionCollection;
import com.fashionify.backend.entity.Product;
import com.fashionify.backend.repository.FashionCollectionRepository;
import com.fashionify.backend.repository.ProductRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import com.fashionify.backend.service.CloudinaryService;
import java.io.IOException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collections")
public class FashionCollectionController {

    @Autowired
    private FashionCollectionRepository collectionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload-image")
    public ResponseEntity<?> handleImageUpload(@RequestParam("my_file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadImage(file, "collections");
            return ResponseEntity.ok(Map.of("success", true, "result", Map.of("url", url)));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Error uploading image"));
        }
    }

    @GetMapping
    @Cacheable("collections")
    public ResponseEntity<?> getAllCollections() {
        try {
            List<FashionCollection> collections = collectionRepository.findAll();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", collections
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    @Cacheable(value = "collections", key = "#id")
    public ResponseEntity<?> getCollectionById(@PathVariable Long id) {
        try {
            FashionCollection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", collection
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping
    @CacheEvict(value = "collections", allEntries = true)
    public ResponseEntity<?> createCollection(@RequestBody FashionCollectionRequest request) {
        try {
            FashionCollection collection = new FashionCollection();
            collection.setName(request.getName());
            collection.setDescription(request.getDescription());
            collection.setImageUrl(request.getImageUrl());
            
            if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
                List<Product> products = productRepository.findAllById(request.getProductIds());
                collection.setProducts(products);
            }

            FashionCollection savedCollection = collectionRepository.save(collection);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", savedCollection
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "collections", allEntries = true)
    public ResponseEntity<?> deleteCollection(@PathVariable Long id) {
        try {
            collectionRepository.deleteById(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Collection deleted successfully"
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
class FashionCollectionRequest {
    private String name;
    private String description;
    private String imageUrl;
    private List<Long> productIds;
}
