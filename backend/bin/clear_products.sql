-- Run this once to clear all mock/old products so DataSeeder re-seeds fresh ones
-- Execute via: source /path/to/this/file in your MySQL client
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM product_size_variants;
DELETE FROM product_images;
DELETE FROM products;
SET FOREIGN_KEY_CHECKS = 1;
SELECT 'Products cleared. Restart the backend to re-seed.' AS status;
