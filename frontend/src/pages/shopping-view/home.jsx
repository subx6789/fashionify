import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
  Footprints,
  Sparkles,
  Glasses,
  User2Icon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton, SkeletonRepeater } from "@/components/ui/skeleton";
import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { getFeatureImages } from "@/store/common-slice";
import { useAuthModal } from "@/context/AuthModalContext";
import { getLatestReviews, getCollections } from "@/services/api";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: User2Icon },
  { id: "women", label: "Women", icon: ShirtIcon },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: Glasses },
  { id: "footwear", label: "Footwear", icon: Footprints },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: ({ className }) => <img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" className={className} alt="Nike" /> },
  { id: "adidas", label: "Adidas", icon: ({ className }) => <img src="https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" className={className} alt="Adidas" /> },
  { id: "puma", label: "Puma", icon: ({ className }) => <img src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Puma-logo-%28text%29.svg" className={className} alt="Puma" /> },
  { id: "levi", label: "Levi's", icon: ({ className }) => <img src="https://upload.wikimedia.org/wikipedia/commons/7/75/Levi%27s_logo.svg" className={className} alt="Levi's" /> },
  { id: "zara", label: "Zara", icon: ({ className }) => <img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg" className={className} alt="Zara" /> },
  { id: "h&m", label: "H&M", icon: ({ className }) => <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg" className={className} alt="H&M" /> },
];



function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, isLoading: isProductLoading } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList, isLoading: isFeatureLoading } = useSelector((state) => state.commonFeature);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [collections, setCollections] = useState([]);
  const [isCollectionsLoading, setIsCollectionsLoading] = useState(true);
  const [latestReviews, setLatestReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        setIsReviewsLoading(true);
        const res = await getLatestReviews();
        if (res.data.success) {
          setLatestReviews(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    fetchLatestReviews();
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsCollectionsLoading(true);
        const res = await getCollections();
        if (res.data.success) {
          setCollections(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCollectionsLoading(false);
      }
    };
    fetchCollections();
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

  const slides = activeFeatureImages;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const collectionsScrollRef = useRef(null);

  const scrollCollections = (direction) => {
    if (collectionsScrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 800 : 350;
      collectionsScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
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
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId) {
    if (!isAuthenticated) {
      openAuthModal("login", { action: "addToCart", productId: getCurrentProductId });
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

  return (
    <div className="flex flex-col min-h-screen container mx-auto px-4 pb-12">
      <div className="w-full mt-8 mb-12">
        <div className="neu-card relative w-full h-[380px] md:h-[500px] lg:h-[550px] max-h-[600px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 group">
          {isFeatureLoading ? (
            <Skeleton className="w-full h-full rounded-sm" />
          ) : (
            <>
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
                      className={`w-full h-full object-cover ${slides[currentSlide]?.linkUrl ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (slides[currentSlide]?.linkUrl) {
                          navigate(slides[currentSlide].linkUrl);
                        }
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-1 z-10">
                {slides && slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="w-12 h-12 flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer"
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <span
                      className={`h-2.5 md:h-3 rounded-full border-2 border-black transition-all duration-300 block ${currentSlide === index
                        ? "w-6 md:w-8 bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "w-2.5 md:w-3 bg-white hover:bg-gray-200"
                        }`}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Shop by Collections Section */}
      {(isCollectionsLoading || collections.length > 0) && (
        <section className="py-16 mb-12 bg-muted/20 rounded-lg">
          <div className="w-full px-4 md:px-8">
            <h2 className="text-4xl font-extrabold text-center mb-4 uppercase tracking-tight dark:text-primary">
              Shop by Collections
            </h2>
            <div className="relative group/carousel">
              {isCollectionsLoading ? (
                <div className="flex items-stretch overflow-x-hidden pt-4 pb-8 gap-6 px-4">
                  <SkeletonRepeater count={3} className="flex-none w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[30vw] h-96 rounded-xl" />
                </div>
              ) : (
                <div ref={collectionsScrollRef} className="flex items-stretch overflow-x-auto snap-x snap-mandatory pt-4 pb-8 gap-6 px-4 hide-scrollbar scroll-smooth">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      onClick={() => navigate(`/shop/collection/${collection.id}`)}
                      className="product-card flex-none w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[30vw] snap-center flex flex-col group cursor-pointer"
                    >
                      <div className="h-80 relative overflow-hidden bg-muted border-b-2 border-border">
                        <img
                          src={collection.imageUrl}
                          alt={collection.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                        {/* Hover indicator strip inside image area like product cards */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-6 flex flex-col flex-1 bg-card">
                        <h3 className="text-2xl font-black mb-2 tracking-tight line-clamp-1 text-foreground">{collection.name}</h3>
                        <p className="text-muted-foreground text-sm font-bold mb-4">{collection.description}</p>
                        <div className="mt-auto">
                          <div className="flex -space-x-3 overflow-hidden p-1 pt-2">
                            {collection.products?.map((p, i) => (
                              <img
                                key={p.id}
                                src={p.image || p.images?.[0]}
                                alt={p.title}
                                title={p.title}
                                className={`inline-block h-12 w-12 rounded-full border-2 border-border object-cover`}
                                style={{ zIndex: 10 - i }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {collections.length > 2 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scrollCollections('left')}
                    className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6 w-12 h-12 rounded-full bg-card border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neu-black))] hover:bg-muted opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 hidden md:flex"
                    aria-label="Previous collection"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scrollCollections('right')}
                    className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 w-12 h-12 rounded-full bg-card border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neu-black))] hover:bg-muted opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 hidden md:flex"
                    aria-label="Next collection"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 mb-12 bg-muted/30 rounded-lg">
        <div className="w-full px-4 md:px-8">
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
                    <div className="w-16 h-16 mb-4 rounded-full bg-white dark:bg-white text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_hsl(var(--neu-black))] transition-transform group-hover:scale-110 p-3">
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

      <section className="py-16 mb-12 bg-muted/30 rounded-lg">
        <div className="w-full px-4 md:px-8">
          <h2 className="text-4xl font-extrabold text-center mb-12 dark:text-gradient">Shop by Iconic Brands</h2>
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
                    <div className="w-16 h-16 mb-4 rounded-full bg-white dark:bg-white text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_hsl(var(--neu-black))] transition-transform group-hover:scale-110 p-3">
                      <brandItem.icon className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-lg group-hover:text-primary transition-colors">{brandItem.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 mb-12 bg-muted/20 rounded-lg">
        <div className="w-full px-4 md:px-8">
          <h2 className="text-4xl font-extrabold text-center mb-12 dark:text-gradient">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {isProductLoading ? (
              <SkeletonRepeater count={8} className="h-[400px] w-full rounded-xl" />
            ) : productList && productList.length > 0 ? productList.slice(0, 8).map((productItem) => (
              <ShoppingProductTile
                key={productItem.id}
                handleGetProductDetails={handleGetProductDetails}
                product={productItem}
              />
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingBasket className="w-12 h-12 mb-4 opacity-20" />
                <p>No products available right now.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      {(isReviewsLoading || (latestReviews && latestReviews.length > 0)) && (
        <section className="py-16 mb-12 bg-muted/40 relative overflow-hidden rounded-lg">
          <div className="w-full px-4 md:px-8">
            <h2 className="text-4xl font-extrabold text-center mb-16 dark:text-gradient">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {isReviewsLoading ? (
                <SkeletonRepeater count={3} className="h-64 w-full rounded-xl" />
              ) : latestReviews.map((review, i) => (
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
                          <h3 className="font-bold text-base text-foreground leading-tight">{review.userName}</h3>
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
      )}
    </div>
  );
}

export default ShoppingHome;
