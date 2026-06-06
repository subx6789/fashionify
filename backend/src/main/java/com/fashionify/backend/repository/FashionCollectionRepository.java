package com.fashionify.backend.repository;

import com.fashionify.backend.entity.FashionCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FashionCollectionRepository extends JpaRepository<FashionCollection, Long> {
}
