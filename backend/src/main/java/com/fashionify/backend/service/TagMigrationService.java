/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: TagMigrationService.java
 * Purpose: Spring Boot Service containing core business logic and database orchestration.
 * Functions/Methods: 1
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

package com.fashionify.backend.service;

import com.fashionify.backend.entity.Product;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service to automatically generate and assign tags for products.
 * Uses heuristics based on product category, title, description, and brand.
 */
@Service
public class TagMigrationService {

    private static final Map<String, List<String>> TAGS_BY_CATEGORY = new HashMap<>();

    static {
        TAGS_BY_CATEGORY.put("men", Arrays.asList(
                "trendy", "oversized", "streetwear", "genz", "pure cotton",
                "premium cotton", "graphic print", "minimalist", "casual", "summer wear",
                "formal", "office wear", "slim fit", "business casual", "linen", "luxury",
                "relaxed fit", "vintage wash", "stretch denim", "urban", "baggy",
                "heavy weight", "fleece", "cozy", "winter essential"
        ));
        TAGS_BY_CATEGORY.put("women", Arrays.asList(
                "trendy", "floral", "minimalist", "casual", "summer wear", "festive",
                "ethnic", "boho", "western", "elegant", "premium", "party wear",
                "oversized", "slim fit", "comfort fit", "linen", "pastel",
                "graphic print", "streetwear", "pure cotton"
        ));
        TAGS_BY_CATEGORY.put("kids", Arrays.asList(
                "playful", "comfortable", "soft cotton", "summer wear", "school",
                "casual", "unisex", "trendy", "pastel", "vibrant colors"
        ));
        TAGS_BY_CATEGORY.put("accessories", Arrays.asList(
                "trending", "everyday carry", "minimalist", "premium", "fashion essential",
                "gifting", "luxury", "unisex", "statement piece", "classic"
        ));
        TAGS_BY_CATEGORY.put("footwear", Arrays.asList(
                "casual", "formal", "sports", "lightweight", "premium",
                "everyday", "slip-on", "lace-up", "comfort", "trending"
        ));
    }

    private static final Map<String, List<String>> FALLBACK_TAGS = new HashMap<>();
    static {
        FALLBACK_TAGS.put("men", Arrays.asList("casual", "trendy", "urban"));
        FALLBACK_TAGS.put("women", Arrays.asList("casual", "trendy", "premium"));
        FALLBACK_TAGS.put("kids", Arrays.asList("comfortable", "casual", "playful"));
        FALLBACK_TAGS.put("accessories", Arrays.asList("everyday carry", "classic", "trending"));
        FALLBACK_TAGS.put("footwear", Arrays.asList("everyday", "comfort", "casual"));
    }

    private static final Map<String, String> KEYWORD_TO_TAG = new HashMap<>();
    static {
        KEYWORD_TO_TAG.put("cotton", "pure cotton");
        KEYWORD_TO_TAG.put("linen", "linen");
        KEYWORD_TO_TAG.put("denim", "stretch denim");
        KEYWORD_TO_TAG.put("fleece", "fleece");
        KEYWORD_TO_TAG.put("oversized", "oversized");
        KEYWORD_TO_TAG.put("baggy", "baggy");
        KEYWORD_TO_TAG.put("slim", "slim fit");
        KEYWORD_TO_TAG.put("relaxed", "relaxed fit");
        KEYWORD_TO_TAG.put("comfort", "comfort fit");
        KEYWORD_TO_TAG.put("graphic", "graphic print");
        KEYWORD_TO_TAG.put("print", "graphic print");
        KEYWORD_TO_TAG.put("floral", "floral");
        KEYWORD_TO_TAG.put("boho", "boho");
        KEYWORD_TO_TAG.put("ethnic", "ethnic");
        KEYWORD_TO_TAG.put("traditional", "ethnic");
        KEYWORD_TO_TAG.put("kurta", "ethnic");
        KEYWORD_TO_TAG.put("western", "western");
        KEYWORD_TO_TAG.put("vintage", "vintage wash");
        KEYWORD_TO_TAG.put("formal", "formal");
        KEYWORD_TO_TAG.put("office", "office wear");
        KEYWORD_TO_TAG.put("business", "business casual");
        KEYWORD_TO_TAG.put("casual", "casual");
        KEYWORD_TO_TAG.put("summer", "summer wear");
        KEYWORD_TO_TAG.put("winter", "winter essential");
        KEYWORD_TO_TAG.put("cozy", "cozy");
        KEYWORD_TO_TAG.put("party", "party wear");
        KEYWORD_TO_TAG.put("wedding", "festive");
        KEYWORD_TO_TAG.put("festive", "festive");
        KEYWORD_TO_TAG.put("elegant", "elegant");
        KEYWORD_TO_TAG.put("streetwear", "streetwear");
        KEYWORD_TO_TAG.put("street", "streetwear");
        KEYWORD_TO_TAG.put("minimalist", "minimalist");
        KEYWORD_TO_TAG.put("simple", "minimalist");
        KEYWORD_TO_TAG.put("premium", "premium");
        KEYWORD_TO_TAG.put("luxury", "luxury");
        KEYWORD_TO_TAG.put("handcrafted", "premium");
        KEYWORD_TO_TAG.put("trendy", "trendy");
        KEYWORD_TO_TAG.put("genz", "genz");
        KEYWORD_TO_TAG.put("pastel", "pastel");
        KEYWORD_TO_TAG.put("vibrant", "vibrant colors");
        KEYWORD_TO_TAG.put("unisex", "unisex");
        KEYWORD_TO_TAG.put("sports", "sports");
        KEYWORD_TO_TAG.put("running", "sports");
        KEYWORD_TO_TAG.put("sneaker", "casual");
        KEYWORD_TO_TAG.put("slip-on", "slip-on");
        KEYWORD_TO_TAG.put("slip on", "slip-on");
        KEYWORD_TO_TAG.put("lace", "lace-up");
        KEYWORD_TO_TAG.put("lightweight", "lightweight");
    }

    public List<String> generateTagsForProduct(Product product) {
        String category = product.getCategory() != null ? product.getCategory().toLowerCase() : "men";
        List<String> allowedTags = TAGS_BY_CATEGORY.getOrDefault(category, TAGS_BY_CATEGORY.get("men"));
        
        Set<String> generatedTags = new LinkedHashSet<>();
        String textToAnalyze = (product.getTitle() + " " + product.getDescription() + " " + product.getBrand()).toLowerCase();

        for (Map.Entry<String, String> entry : KEYWORD_TO_TAG.entrySet()) {
            if (Pattern.compile("\\b" + Pattern.quote(entry.getKey()) + "\\b").matcher(textToAnalyze).find()) {
                if (allowedTags.contains(entry.getValue())) generatedTags.add(entry.getValue());
            }
        }
        
        if (generatedTags.size() < 3) {
            for (String fallback : FALLBACK_TAGS.getOrDefault(category, FALLBACK_TAGS.get("men"))) {
                if (generatedTags.size() >= 3) break;
                if (allowedTags.contains(fallback)) generatedTags.add(fallback);
            }
        }
        
        return generatedTags.stream().limit(5).collect(Collectors.toList());
    }
}
