package com.fashionify.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DataMigrationRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataMigrationRunner.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Check if outfits table exists
            Integer outfitCount = null;
            try {
                outfitCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM outfits", Integer.class);
            } catch (Exception e) {
                logger.info("Outfits table does not exist. Skipping migration.");
                return;
            }

            if (outfitCount != null && outfitCount > 0) {
                // Check if collections table is empty
                Integer collectionCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM collections", Integer.class);
                
                if (collectionCount != null && collectionCount == 0) {
                    logger.info("Starting data migration from outfits to collections...");

                    // Migrate base table
                    jdbcTemplate.execute("INSERT INTO collections (id, name, description, image_url, created_at) " +
                                         "SELECT id, name, description, image_url, created_at FROM outfits");

                    // Migrate join table
                    // First check if outfit_products exists and has data
                    Integer joinCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM outfit_products", Integer.class);
                    if (joinCount != null && joinCount > 0) {
                        jdbcTemplate.execute("INSERT INTO collection_products (collection_id, product_id) " +
                                             "SELECT outfit_id, product_id FROM outfit_products");
                    }

                    logger.info("Data migration completed successfully.");
                } else {
                    logger.info("Collections table already has data. Skipping migration.");
                }
            }
        } catch (Exception e) {
            logger.error("Error during data migration: ", e);
        }
    }
}
