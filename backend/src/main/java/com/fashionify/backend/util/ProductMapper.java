/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: ProductMapper.java
 * Purpose: Core application module.
 * Functions/Methods: 0
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.util;

import com.fashionify.backend.entity.Product;
import com.fashionify.backend.entity.ProductSizeVariant;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Utility class to map Product entity objects to unified UI-friendly response maps.
 * Centralizing this logic ensures consistency between administrative and shopping views.
 */
public class ProductMapper {

    /**
     * Transforms a Product entity to a detailed data map with stock summaries,
     * size variant metadata, and image compatibility fallbacks.
     *
     * @param product the Product entity to enrich
     * @return a LinkedHashMap containing the formatted product properties
     */
    public static Map<String, Object> toResponseMap(Product product) {
        if (product == null) {
            return Map.of();
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", product.getId());
        map.put("title", product.getTitle());
        map.put("description", product.getDescription());
        map.put("category", product.getCategory());
        map.put("brand", product.getBrand());
        map.put("price", product.getPrice());
        map.put("salePrice", product.getSalePrice());
        map.put("averageReview", product.getAverageReview());
        map.put("createdAt", product.getCreatedAt());
        map.put("updatedAt", product.getUpdatedAt());
        map.put("tags", product.getTags() != null ? product.getTags() : List.of());

        // Images compatibility fallbacks
        map.put("images", product.getImages());
        map.put("image", product.getImage()); // Exposes first image as "image" for backward compat

        // Enriched size variants
        List<Map<String, Object>> variants = product.getSizeVariants().stream().map(v -> {
            Map<String, Object> vm = new LinkedHashMap<>();
            vm.put("id", v.getId());
            vm.put("size", v.getSize());
            vm.put("stock", v.getStock());
            vm.put("measurements", v.getMeasurements());
            vm.put("lowStock", v.getStock() <= 5 && v.getStock() > 0);
            vm.put("outOfStock", v.getStock() == 0);
            return vm;
        }).collect(Collectors.toList());
        map.put("sizeVariants", variants);

        // Computed stock totals and alerts
        int totalStock = product.getSizeVariants().stream().mapToInt(ProductSizeVariant::getStock).sum();
        map.put("totalStock", totalStock);
        
        boolean hasLowStock = product.getSizeVariants().stream().anyMatch(v -> v.getStock() <= 5 && v.getStock() > 0);
        map.put("hasLowStock", hasLowStock);

        return map;
    }
}
