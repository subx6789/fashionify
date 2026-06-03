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
    @Autowired private OutfitRepository outfitRepository;
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
                admin = User.builder()
                        .userName("Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode(adminPassword))
                        .role("admin")
                        .build();
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
        // if (existing.stream().anyMatch(p -> !p.getSizeVariants().isEmpty())) return; // Temporarily commented out to force re-seeding

        // Delete old mock products (no size variants)
        if (!existing.isEmpty()) {
            cartRepository.deleteAll();
            reviewRepository.deleteAll();
            outfitRepository.deleteAll();
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

         createProduct(
    "Premium Polo T-Shirt",
    "Classic polo crafted from breathable cotton pique fabric.",
    "men", "lacoste",
    1499.0, 1199.0,
    List.of(
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop"
    ),
    List.of(
        variant("S", 20, "Chest 36\""),
        variant("M", 25, "Chest 38\""),
        variant("L", 18, "Chest 40\""),
        variant("XL", 10, "Chest 42\"")
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
createProduct(
    "Casual Linen Shirt",
    "Lightweight linen shirt perfect for summer.",
    "men", "zara",
    2199.0, 1899.0,
    List.of(
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop"
    ),
    List.of(
        variant("S", 15, "Chest 37\""),
        variant("M", 25, "Chest 39\""),
        variant("L", 20, "Chest 41\"")
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
createProduct(
    "Oversized Denim Jacket",
    "Trendy oversized denim jacket with vintage wash.",
    "women", "levi",
    3499.0, 2999.0,
    List.of(
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop"
    ),
    List.of(
        variant("S", 12, "Bust 34\""),
        variant("M", 18, "Bust 36\""),
        variant("L", 10, "Bust 38\"")
    )
);
        // Women's Oversized Hoodie
        createProduct(
            "Oversized Fleece Hoodie",
            "Ultra-soft fleece hoodie with a relaxed oversized fit. Kangaroo pocket, drawstring hood and ribbed cuffs for a cosy streetwear look.",
            "women", "h&m",
            1799.0, null,
            List.of(
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&auto=format&fit=crop"
            ),
            List.of(
                variant("XS", 14, "Chest 40\", Length 26\""),
                variant("S", 20, "Chest 42\", Length 27\""),
                variant("M", 22, "Chest 44\", Length 28\""),
                variant("L", 16, "Chest 46\", Length 29\"")
            )
        );
createProduct(
    "Ribbed Crop Top",
    "Soft stretch ribbed crop top with modern fit.",
    "women", "h&m",
    899.0, null,
    List.of(
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop"
    ),
    List.of(
        variant("XS", 20, "Bust 30\""),
        variant("S", 25, "Bust 32\""),
        variant("M", 20, "Bust 34\"")
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

        createProduct(
    "Urban Street Sneakers",
    "Comfortable sneakers designed for everyday wear.",
    "footwear", "puma",
    3999.0, 3499.0,
    List.of(
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop"
    ),
    List.of(
        variant("UK 6", 10, "25cm"),
        variant("UK 7", 15, "26cm"),
        variant("UK 8", 20, "27cm"),
        variant("UK 9", 18, "28cm")
    )
);


createProduct(
    "Performance Running Shoes",
    "Responsive cushioning and breathable mesh upper.",
    "footwear", "adidas",
    6999.0, 5999.0,
    List.of(
        "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop"
    ),
    List.of(
        variant("UK 7", 10, "26cm"),
        variant("UK 8", 15, "27cm"),
        variant("UK 9", 12, "28cm"),
        variant("UK 10", 8, "29cm")
    )
);


createProduct(
    "Fitness Smart Watch",
    "Track fitness, sleep and notifications.",
    "accessories", "apple",
    8999.0, 7999.0,
    List.of(
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format&fit=crop"
    ),
    List.of(
        variant("42mm", 25, "Standard"),
        variant("44mm", 20, "Large")
    )
);



createProduct(
    "Travel Backpack",
    "Water-resistant backpack with laptop compartment.",
    "accessories", "nike",
    2499.0, 1999.0,
    List.of(
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&auto=format&fit=crop"
    ),
    List.of(
        variant("20L", 15, "Compact"),
        variant("30L", 20, "Standard"),
        variant("40L", 10, "Large")
    )
);

        // Leather Belt
        createProduct(
            "Genuine Leather Belt",
            "Handcrafted from full-grain genuine leather with a polished brushed-metal buckle. Timeless accessory for any outfit.",
            "accessories", "adidas",
            1299.0, null,
            List.of(
                "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop"
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
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop"
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
