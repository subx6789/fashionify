/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: ShopSearchController.java
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

import com.fashionify.backend.entity.Product;
import com.fashionify.backend.repository.ProductRepository;
import com.fashionify.backend.util.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shop/search")
public class ShopSearchController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/{keyword}")
    public ResponseEntity<?> searchProducts(
            @PathVariable String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Keyword is required"));
        }

        // ── Primary search: title and description (paginated, sorted) ──
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "title"));
        Page<Product> titleDescResults = productRepository
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        keyword, keyword, pageRequest);

        // ── Secondary search: tags (eager, all matching — then deduplicate) ──
        // Tag results augment the primary results; deduplication preserves title/desc rank
        List<Product> tagResults = productRepository.findByTagContainingIgnoreCase(keyword);

        // Merge: title/desc results first (maintains sort), then tag matches not already included
        Set<Long> primaryIds = titleDescResults.getContent().stream()
                .map(Product::getId)
                .collect(Collectors.toSet());

        List<Map<String, Object>> merged = new ArrayList<>();

        // Add primary results (sorted by title)
        titleDescResults.getContent().forEach(p -> merged.add(ProductMapper.toResponseMap(p)));

        // Append tag-matched results not already in primary list
        tagResults.stream()
                .filter(p -> !primaryIds.contains(p.getId()))
                .forEach(p -> merged.add(ProductMapper.toResponseMap(p)));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", merged,
                "currentPage", titleDescResults.getNumber(),
                "totalPages", titleDescResults.getTotalPages(),
                // totalProducts reflects the combined unique count
                "totalProducts", merged.size()
        ));
    }
}
