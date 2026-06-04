import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.webp";
import bannerThree from "../../assets/banner-3.webp";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { getFeatureImages } from "@/store/common-slice";
import { useAuthModal } from "@/context/AuthModalContext";
import axios from "axios";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: ({ className }) => <img src="https://cdn.simpleicons.org/nike/000000" className={className} alt="Nike" /> },
  { id: "adidas", label: "Adidas", icon: ({ className }) => <img src="https://cdn.simpleicons.org/adidas/000000" className={className} alt="Adidas" /> },
  { id: "puma", label: "Puma", icon: ({ className }) => <img src="https://cdn.simpleicons.org/puma/000000" className={className} alt="Puma" /> },
  { id: "levi", label: "Levi's", icon: ({ className }) => <span className="text-primary-foreground font-black text-xl">L</span> },
  { id: "zara", label: "Zara", icon: ({ className }) => <span className="text-primary-foreground font-black text-xl tracking-tighter">ZARA</span> },
  { id: "h&m", label: "H&M", icon: ({ className }) => <span className="text-primary-foreground font-black text-xl">H&M</span> },
];

const defaultSlides = [
  { image: bannerOne },
  { image: bannerTwo },
  { image: bannerThree },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [mockProducts, setMockProducts] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [latestReviews, setLatestReviews] = useState([]);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + "/api/shop/review/latest");
        if (res.data.success) {
          setLatestReviews(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLatestReviews();
  }, []);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + "/api/outfits");
        if (res.data.success) {
          setOutfits(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchOutfits();
  }, []);

  const activeFeatureImages = useMemo(() => {
    if (!featureImageList || featureImageList.length === 0) return [];
    const today = new Date().toISOString().split("T")[0];
    return featureImageList.filter(slide => {
      if (slide.startDate && today < slide.startDate) return false;
      if (slide.endDate && today > slide.endDate) return false;
      return true;
    });
  }, [featureImageList]);

  const slides = activeFeatureImages.length > 0 ? activeFeatureImages : defaultSlides;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    const isMock = mockProducts.find(p => p.id === getCurrentProductId);
    if (isMock && (!productList || productList.length === 0)) {
      toast({
        title: "Mock Data Preview",
        description: "This is a placeholder product. Add real products from the Admin panel.",
      });
      return;
    }
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId) {
    if (!isAuthenticated) {
      openAuthModal("login", { action: "addToCart", productId: getCurrentProductId });
      return;
    }

    const isMock = mockProducts.find(p => p.id === getCurrentProductId);
    if (isMock && (!productList || productList.length === 0)) {
      toast({
        title: "Added to Cart (Mock Preview)",
        description: "This is a placeholder product. Add real products from the Admin panel for full cart functionality.",
      });
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  async function handleAddOutfitToCart(outfit) {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (!outfit.products || outfit.products.length === 0) return;

    setAddingToCart(true);
    try {
      // Add each product to cart (requires size selection in a real app, but for demo we just add it with null size or default)
      for (const product of outfit.products) {
        await dispatch(
          addToCart({
            userId: user?.id,
            productId: product.id,
            quantity: 1,
            selectedSize: product.sizeVariants?.[0]?.size || null,
          })
        );
      }
      dispatch(fetchCartItems(user?.id));
      toast({ title: `Added "${outfit.name}" to cart!` });
    } catch (err) {
      toast({ title: "Failed to add outfit to cart", variant: "destructive" });
    } finally {
      setAddingToCart(false);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [slides]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products?limit=8')
      .then(res => res.json())
      .then(data => {
        const mappedData = data.map(item => ({
          id: item.id.toString(),
          title: item.title,
          price: item.price,
          salePrice: null,
          image: item.image,
          category: item.category,
          brand: 'Generic',
        }));
        setMockProducts(mappedData);
      })
      .catch(err => console.error("Failed to fetch mock data:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] xl:aspect-[2.5/1] max-h-[600px] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <AnimatePresence>
          {slides && slides.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-full"
            >
              <img
                src={slides[currentSlide]?.image}
                alt="Banner"
                className={`w-full h-full object-cover object-fill ${slides[currentSlide]?.linkUrl ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (slides[currentSlide]?.linkUrl) {
                    navigate(slides[currentSlide].linkUrl);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <Button
          variant="outline"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + slides.length) %
                slides.length
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 dark:bg-black/40 dark:hover:bg-black/60 backdrop-blur-md border border-white/40 dark:border-white/20 text-foreground z-10 rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-lg"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % slides.length
            )
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 dark:bg-black/40 dark:hover:bg-black/60 backdrop-blur-md border border-white/40 dark:border-white/20 text-foreground z-10 rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-lg"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </Button>
      </div>

      {/* Shop the Look Section */}
      {outfits.length > 0 && (
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-extrabold text-center mb-4 uppercase tracking-tight text-foreground">
              Shop the Look
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Curated outfits by our expert stylists. Add entire looks to your cart with a single click.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {outfits.map((outfit) => (
                <div
                  key={outfit.id}
                  onClick={() => navigate(`/shop/outfit/${outfit.id}`)}
                  className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col group cursor-pointer"
                >
                  <div className="h-80 relative overflow-hidden bg-muted">
                    <img
                      src={outfit.imageUrl}
                      alt={outfit.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold mb-2">{outfit.name}</h3>
                    <p className="text-muted-foreground text-sm flex-1">{outfit.description}</p>
                    <div className="mt-4 mb-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Included in this look</p>
                      <div className="flex -space-x-3 overflow-hidden p-1">
                        {outfit.products?.map((p, i) => (
                          <img
                            key={p.id}
                            src={p.image || p.images?.[0]}
                            alt={p.title}
                            title={p.title}
                            className={`inline-block h-12 w-12 rounded-full ring-2 ring-background object-cover`}
                            style={{ zIndex: 10 - i }}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddOutfitToCart(outfit);
                      }}
                      disabled={addingToCart}
                      className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold h-12 mt-auto rounded-xl shadow-md"
                    >
                      {addingToCart ? "Adding..." : "Add All to Cart"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12 dark:text-gradient">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categoriesWithIcon.map((categoryItem, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                key={categoryItem.id}
              >
                <Card
                  onClick={() =>
                    handleNavigateToListingPage(categoryItem, "category")
                  }
                  className="cursor-pointer card-gradient card-gradient-hover group overflow-hidden border-t-2 border-primary-border"
                >
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                      <categoryItem.icon className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-lg group-hover:text-primary transition-colors">{categoryItem.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12 dark:text-gradient">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brandsWithIcon.map((brandItem, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                key={brandItem.id}
              >
                <Card
                  onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                  className="cursor-pointer card-gradient card-gradient-hover group overflow-hidden border-t-2 border-primary-border"
                >
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                      <brandItem.icon className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-lg group-hover:text-primary transition-colors">{brandItem.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12 dark:text-gradient">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {(productList && productList.length > 0 ? productList.slice(0, 8) : mockProducts).map((productItem) => (
              <ShoppingProductTile
                key={productItem.id}
                handleGetProductDetails={handleGetProductDetails}
                product={productItem}
                handleAddtoCart={handleAddtoCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-muted/40 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16 dark:text-gradient">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(latestReviews && latestReviews.length > 0 ? latestReviews : [
              { userName: "Sarah J.", verifiedPurchase: true, reviewMessage: "Absolutely love the quality of the clothes! The shipping was incredibly fast and everything fit perfectly.", reviewValue: 5 },
              { userName: "Mike T.", verifiedPurchase: true, reviewMessage: "The modern aesthetic of the brand really stands out. Customer service was also very helpful when I needed to exchange a size.", reviewValue: 5 },
              { userName: "Emily R.", verifiedPurchase: true, reviewMessage: "My go-to store for trendy and comfortable wear. The prices are unbeatable for this level of premium quality.", reviewValue: 5 }
            ]).map((review, i) => (
              <motion.div
                key={review.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-gradient card-gradient-hover p-8 text-center space-y-4 border-t-2 border-primary-border h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, idx) => (
                        <svg key={idx} className={`w-6 h-6 fill-current ${idx < review.reviewValue ? "text-yellow-500" : "text-gray-600"}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <p className="text-muted-foreground italic text-lg leading-relaxed mb-6">"{review.reviewMessage}"</p>
                  </div>

                  <div className="border-t border-border/50 pt-4 mt-auto">
                    {review.productId && (
                      <div className="flex items-center gap-3 mb-4 bg-background/50 p-2 rounded-lg cursor-pointer hover:bg-background/80 transition-colors" onClick={() => navigate(`/shop/product/${review.productId}`)}>
                        {review.productImage ? (
                          <img src={review.productImage} alt={review.productTitle} className="w-10 h-10 object-cover rounded-md" />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center"><ShoppingBasket className="w-5 h-5 text-muted-foreground" /></div>
                        )}
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Reviewing</p>
                          <p className="text-sm font-semibold truncate text-foreground">{review.productTitle}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                        <img
                          src={`https://api.dicebear.com/9.x/micah/svg?seed=${review.userAvatar || review.userName || "Fashion"}&backgroundColor=transparent`}
                          alt={review.userName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="font-bold text-base text-foreground leading-tight">{review.userName}</h4>
                        {review.verifiedPurchase && (
                          <span className="text-[10px] text-green-700 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide inline-flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShoppingHome;
