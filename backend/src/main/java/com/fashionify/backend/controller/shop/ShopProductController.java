package com.fashionify.backend.controller.shop;

import com.fashionify.backend.entity.Product;
import com.fashionify.backend.entity.ProductSizeVariant;
import com.fashionify.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/shop/products")
public class ShopProductController {

    @Autowired
    private ProductRepository productRepository;

    private static final int DEFAULT_PAGE_SIZE = 8;

    /**
     * GET /api/shop/products/get
     * Query params: category (CSV), brand (CSV), sortBy, page (0-indexed), size (default 8)
     * Returns: { products, currentPage, totalPages, totalProducts }
     */
    @GetMapping("/get")
    public ResponseEntity<?> getFilteredProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
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
                if (minPrice != null && effectivePrice < minPrice) return false;
                if (maxPrice != null && effectivePrice > maxPrice) return false;
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
        response.put("products", pagedProducts.stream().map(this::enrichProduct).collect(Collectors.toList()));
        response.put("currentPage", page);
        response.put("totalPages", totalPages);
        response.put("totalProducts", totalProducts);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getProductDetails(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> ResponseEntity.ok(Map.of("success", true, "data", enrichProduct(product))))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Sort buildSort(String sortBy) {
        switch (sortBy) {
            case "price-lowtohigh":  return Sort.by(Sort.Direction.ASC, "price");
            case "price-hightolow":  return Sort.by(Sort.Direction.DESC, "price");
            case "title-atoz":       return Sort.by(Sort.Direction.ASC, "title");
            case "title-ztoa":       return Sort.by(Sort.Direction.DESC, "title");
            default:                 return Sort.by(Sort.Direction.ASC, "price");
        }
    }

    public Map<String, Object> enrichProduct(Product product) {
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

        map.put("images", product.getImages());
        map.put("image", product.getImage());

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

        int totalStock = product.getSizeVariants().stream().mapToInt(ProductSizeVariant::getStock).sum();
        map.put("totalStock", totalStock);

        return map;
    }
}
