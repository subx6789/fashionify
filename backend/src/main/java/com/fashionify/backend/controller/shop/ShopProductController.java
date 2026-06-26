/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: ShopProductController.java
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
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shop/products")
public class ShopProductController {

    @Autowired
    private ProductRepository productRepository;

    /**
     * GET /api/shop/products/get
     * Query params: category (CSV), brand (CSV), sortBy, page (0-indexed), size (default 8)
     * Returns: { products, currentPage, totalPages, totalProducts }
     */
    @GetMapping("/get")
    @Cacheable(value = "shopProducts", key = "{#category, #brand, #priceRanges, #inStockSize, #sortBy, #page, #size}")
    public ResponseEntity<?> getFilteredProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String priceRanges,
            @RequestParam(required = false) String inStockSize,
            @RequestParam(required = false, defaultValue = "price-lowtohigh") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "8") int size) {

        List<Product> products;

        // Base fetch
        if (category != null && !category.isEmpty() && brand != null && !brand.isEmpty()) {
            List<String> categories = Arrays.asList(category.split(","));
            List<String> brands = Arrays.asList(brand.split(","));
            products = productRepository.findByCategoryInAndBrandIn(categories, brands);
        } else if (category != null && !category.isEmpty()) {
            List<String> categories = Arrays.asList(category.split(","));
            products = productRepository.findByCategoryIn(categories, Pageable.unpaged()).getContent();
        } else if (brand != null && !brand.isEmpty()) {
            List<String> brands = Arrays.asList(brand.split(","));
            products = productRepository.findByBrandIn(brands, Pageable.unpaged()).getContent();
        } else {
            products = productRepository.findAll();
        }

        // Apply advanced filters
        List<Product> filteredProducts = products.stream()
            .filter(p -> {
                double effectivePrice = p.getSalePrice() != null && p.getSalePrice() > 0 ? p.getSalePrice() : p.getPrice();
                if (priceRanges != null && !priceRanges.isEmpty()) {
                    boolean matchesRange = false;
                    String[] ranges = priceRanges.split(",");
                    for (String range : ranges) {
                        String[] bounds = range.split("-");
                        double min = Double.parseDouble(bounds[0]);
                        double max = bounds.length > 1 ? Double.parseDouble(bounds[1]) : Double.MAX_VALUE;
                        if (effectivePrice >= min && effectivePrice <= max) {
                            matchesRange = true;
                            break;
                        }
                    }
                    if (!matchesRange) return false;
                }
                if (inStockSize != null && !inStockSize.isEmpty()) {
                    boolean hasStockInSize = p.getSizeVariants().stream()
                        .anyMatch(v -> v.getSize().equalsIgnoreCase(inStockSize) && v.getStock() > 0);
                    if (!hasStockInSize) return false;
                }
                return true;
            })
            .collect(Collectors.toList());

        // Sort
        Comparator<Product> comparator;
        switch (sortBy) {
            case "price-hightolow":
                comparator = Comparator.comparing(p -> p.getSalePrice() != null && p.getSalePrice() > 0 ? p.getSalePrice() : p.getPrice(), Comparator.reverseOrder());
                break;
            case "title-atoz":
                comparator = Comparator.comparing(Product::getTitle);
                break;
            case "title-ztoa":
                comparator = Comparator.comparing(Product::getTitle, Comparator.reverseOrder());
                break;
            case "price-lowtohigh":
            default:
                comparator = Comparator.comparing(p -> p.getSalePrice() != null && p.getSalePrice() > 0 ? p.getSalePrice() : p.getPrice());
                break;
        }
        filteredProducts.sort(comparator);

        // Paginate
        int totalProducts = filteredProducts.size();
        int totalPages = (int) Math.ceil((double) totalProducts / size);
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalProducts);
        
        List<Product> pagedProducts = (startIndex < totalProducts) 
            ? filteredProducts.subList(startIndex, endIndex) 
            : new ArrayList<>();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("products", pagedProducts.stream().map(ProductMapper::toResponseMap).collect(Collectors.toList()));
        response.put("currentPage", page);
        response.put("totalPages", totalPages);
        response.put("totalProducts", totalProducts);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/get/{id}")
    @Cacheable(value = "shopProducts", key = "'details-' + #id")
    public ResponseEntity<?> getProductDetails(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> ResponseEntity.ok(Map.of("success", true, "data", ProductMapper.toResponseMap(product))))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/price-range")
    @Cacheable(value = "shopProducts", key = "'price-range'")
    public ResponseEntity<?> getPriceRange() {
        List<Product> products = productRepository.findAll();
        
        long below500 = 0;
        long between500And1000 = 0;
        long between1000And1500 = 0;
        long between1500And2000 = 0;
        long above2000 = 0;

        Map<String, Long> categoryCounts = new HashMap<>();
        Map<String, Long> brandCounts = new HashMap<>();

        for (Product p : products) {
            double effectivePrice = p.getSalePrice() != null && p.getSalePrice() > 0 ? p.getSalePrice() : p.getPrice();
            if (effectivePrice <= 500) below500++;
            else if (effectivePrice <= 1000) between500And1000++;
            else if (effectivePrice <= 1500) between1000And1500++;
            else if (effectivePrice <= 2000) between1500And2000++;
            else above2000++;

            if (p.getCategory() != null) {
                categoryCounts.put(p.getCategory(), categoryCounts.getOrDefault(p.getCategory(), 0L) + 1);
            }
            if (p.getBrand() != null) {
                brandCounts.put(p.getBrand(), brandCounts.getOrDefault(p.getBrand(), 0L) + 1);
            }
        }
                
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("0-500", below500);
        data.put("501-1000", between500And1000);
        data.put("1001-1500", between1000And1500);
        data.put("1501-2000", between1500And2000);
        data.put("2001-1000000", above2000);
        data.put("categoryCounts", categoryCounts);
        data.put("brandCounts", brandCounts);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data
        ));
    }


}
