package com.fashionify.backend.config;

import com.fashionify.backend.entity.*;
import com.fashionify.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@Order(2)
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ProductRepository productRepository;
    @Autowired private ProductSizeVariantRepository sizeVariantRepository;
    @Autowired private FeatureRepository featureRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private CartRepository cartRepository;
    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedFeatureImages();
        seedProducts();
    }

    // ── Admin ──────────────────────────────────────────────────────────────

    private void seedAdmin() {
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin != null) {
            admin.setRole("admin");
            admin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(admin);
            System.out.println("✅ Existing user promoted to Admin");
        } else {
            admin = userRepository.findByUserName("Admin").orElse(null);
            if (admin == null) {
                admin = new User(null, "Admin", adminEmail, passwordEncoder.encode(adminPassword), "admin", null, null);
                userRepository.save(admin);
                System.out.println("✅ Admin created: " + adminEmail);
            } else {
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                userRepository.save(admin);
                System.out.println("✅ Admin details synced");
            }
        }
    }

    // ── Feature Images ─────────────────────────────────────────────────────

    private void seedFeatureImages() {
        if (featureRepository.count() > 0) return;
        List.of(
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"
        ).forEach(url -> featureRepository.save(Feature.builder().image(url).build()));
        System.out.println("✅ Feature images seeded");
    }

    // ── Products ───────────────────────────────────────────────────────────

    private void seedProducts() {
        // Purge any products that were seeded without size variants (old mock data)
        List<Product> existing = productRepository.findAll();
        boolean hasProperProducts = existing.stream()
                .anyMatch(p -> !p.getSizeVariants().isEmpty());
        if (hasProperProducts) return;

        // Delete old mock products (no size variants)
        if (!existing.isEmpty()) {
            cartRepository.deleteAll();
            reviewRepository.deleteAll();
            sizeVariantRepository.deleteAll();
            productRepository.deleteAll();
            System.out.println("🗑️  Purged " + existing.size() + " old mock products");
        }

        // Men's T-Shirt
        createProduct(
            "Classic Fit Cotton T-Shirt",
            "Premium 100% cotton crew-neck tee with a comfortable classic fit. Breathable, durable and perfect for everyday wear.",
            "men", "nike",
            999.0, null,
            List.of(
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop"
            ),
            List.of(
                variant("S", 20, "Chest 36\", Length 27\""),
                variant("M", 35, "Chest 38\", Length 28\""),
                variant("L", 28, "Chest 40\", Length 29\""),
                variant("XL", 15, "Chest 42\", Length 30\""),
                variant("XXL", 8, "Chest 44\", Length 31\"")
            )
        );

        // Men's Slim Fit Jeans
        createProduct(
            "Slim Fit Stretch Jeans",
            "Modern slim fit jeans crafted from premium stretch denim for all-day comfort. Features 5-pocket styling and a mid-rise waist.",
            "men", "levi",
            2499.0, 1999.0,
            List.of(
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop"
            ),
            List.of(
                variant("S", 12, "Waist 28\", Inseam 30\""),
                variant("M", 22, "Waist 30\", Inseam 30\""),
                variant("L", 18, "Waist 32\", Inseam 32\""),
                variant("XL", 7, "Waist 34\", Inseam 32\"")
            )
        );

        // Women's Floral Dress
        createProduct(
            "Floral Wrap Midi Dress",
            "Elegant wrap-style midi dress in a vibrant floral print. Adjustable tie waist, V-neckline and flutter sleeves for a feminine silhouette.",
            "women", "zara",
            3299.0, 2499.0,
            List.of(
                "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop"
            ),
            List.of(
                variant("XS", 10, "Bust 32\", Waist 24\""),
                variant("S", 25, "Bust 34\", Waist 26\""),
                variant("M", 30, "Bust 36\", Waist 28\""),
                variant("L", 18, "Bust 38\", Waist 30\""),
                variant("XL", 5, "Bust 40\", Waist 32\"")
            )
        );

        // Women's Oversized Hoodie
        createProduct(
            "Oversized Fleece Hoodie",
            "Ultra-soft fleece hoodie with a relaxed oversized fit. Kangaroo pocket, drawstring hood and ribbed cuffs for a cosy streetwear look.",
            "women", "h&m",
            1799.0, null,
            List.of(
                "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=800&auto=format&fit=crop"
            ),
            List.of(
                variant("XS", 14, "Chest 40\", Length 26\""),
                variant("S", 20, "Chest 42\", Length 27\""),
                variant("M", 22, "Chest 44\", Length 28\""),
                variant("L", 16, "Chest 46\", Length 29\"")
            )
        );

        // Kids' Graphic Tee
        createProduct(
            "Kids Dino Graphic Tee",
            "Fun and vibrant dinosaur print tee made from soft organic cotton. Machine washable with a comfortable round neck.",
            "kids", "puma",
            599.0, null,
            List.of(
                "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop"
            ),
            List.of(
                variant("2Y (86cm)", 30, "Chest 20\", Length 14\""),
                variant("4Y (98cm)", 28, "Chest 22\", Length 16\""),
                variant("6Y (110cm)", 22, "Chest 24\", Length 18\""),
                variant("8Y (122cm)", 18, "Chest 26\", Length 20\""),
                variant("10Y (134cm)", 4, "Chest 28\", Length 21\"")
            )
        );

        // Nike Running Shoes
        createProduct(
            "Air Cushion Running Shoes",
            "Lightweight and breathable running shoes with responsive air-cushion midsole. Engineered mesh upper for superior ventilation.",
            "footwear", "nike",
            5999.0, 4999.0,
            List.of(
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop"
            ),
            List.of(
                variant("UK 6", 8,  "Length 25.5cm"),
                variant("UK 7", 15, "Length 26.5cm"),
                variant("UK 8", 20, "Length 27.5cm"),
                variant("UK 9", 18, "Length 28.5cm"),
                variant("UK 10", 3, "Length 29.5cm"),
                variant("UK 11", 6, "Length 30.5cm")
            )
        );

        // Leather Belt
        createProduct(
            "Genuine Leather Belt",
            "Handcrafted from full-grain genuine leather with a polished brushed-metal buckle. Timeless accessory for any outfit.",
            "accessories", "adidas",
            1299.0, null,
            List.of(
                "https://images.unsplash.com/photo-1624222247344-dc42b6aab5dd?w=800&auto=format&fit=crop"
            ),
            List.of(
                variant("S/M", 40, "Fits waist 28–34\""),
                variant("M/L", 35, "Fits waist 34–40\""),
                variant("One Size", 10, "Adjustable up to 44\"")
            )
        );

        // Adidas Track Pants
        createProduct(
            "Classic Track Pants",
            "Iconic 3-stripe track pants in comfortable polyester. Elastic waist with drawstring, side pockets and tapered leg.",
            "men", "adidas",
            2199.0, 1799.0,
            List.of(
                "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop"
            ),
            List.of(
                variant("S",  18, "Waist 28–30\""),
                variant("M",  25, "Waist 30–32\""),
                variant("L",  20, "Waist 32–34\""),
                variant("XL", 12, "Waist 34–36\""),
                variant("XXL", 3, "Waist 36–38\"")
            )
        );

        System.out.println("✅ Sample products seeded");
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private SizeVariantDef variant(String size, int stock, String measurements) {
        return new SizeVariantDef(size, stock, measurements);
    }

    private void createProduct(String title, String description, String category, String brand,
                                Double price, Double salePrice, List<String> images,
                                List<SizeVariantDef> variants) {
        Product product = Product.builder()
                .title(title)
                .description(description)
                .category(category)
                .brand(brand)
                .price(price)
                .salePrice(salePrice)
                .images(images)
                .averageReview(0.0)
                .build();
        Product saved = productRepository.save(product);

        for (SizeVariantDef v : variants) {
            sizeVariantRepository.save(
                ProductSizeVariant.builder()
                    .product(saved)
                    .size(v.size)
                    .stock(v.stock)
                    .measurements(v.measurements)
                    .build()
            );
        }
    }

    private record SizeVariantDef(String size, int stock, String measurements) {}
}
