package com.fashionify.backend.repository;

import com.fashionify.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Legacy non-pageable (used by admin product list — returns all)
    List<Product> findByCategoryInAndBrandIn(List<String> categories, List<String> brands);

    // Server-side pageable queries for shop
    Page<Product> findByCategoryIn(List<String> categories, Pageable pageable);

    Page<Product> findByBrandIn(List<String> brands, Pageable pageable);

    Page<Product> findByCategoryInAndBrandIn(List<String> categories, List<String> brands, Pageable pageable);

    // Search
    Page<Product> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String keyword1, String keyword2, Pageable pageable);

    // Tags-based lookup (used by tag migration service)
    @Query("SELECT DISTINCT p FROM Product p JOIN p.tags t WHERE t IN :tags")
    List<Product> findByTagsIn(@Param("tags") List<String> tags, Pageable pageable);

    List<Product> findByTagsIsEmpty();
}
