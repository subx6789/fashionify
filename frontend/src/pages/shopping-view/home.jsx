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

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: ({ className }) => <img src="https://cdn.simpleicons.org/nike/white" className={className} alt="Nike" /> },
  { id: "adidas", label: "Adidas", icon: ({ className }) => <img src="https://cdn.simpleicons.org/adidas/white" className={className} alt="Adidas" /> },
  { id: "puma", label: "Puma", icon: ({ className }) => <img src="https://cdn.simpleicons.org/puma/white" className={className} alt="Puma" /> },
  { id: "levi", label: "Levi's", icon: ({ className }) => <span className="text-white font-black text-xl">L</span> },
  { id: "zara", label: "Zara", icon: ({ className }) => <span className="text-white font-black text-xl tracking-tighter">ZARA</span> },
  { id: "h&m", label: "H&M", icon: ({ className }) => <span className="text-white font-black text-xl">H&M</span> },
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
            <motion.img
              key={currentSlide}
              src={slides[currentSlide]?.image}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-full object-cover object-top"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + slides.length) %
                slides.length
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-background/80 hover:bg-background/90 z-10 card-gradient rounded-full"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % slides.length
            )
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-background/80 hover:bg-background/90 z-10 card-gradient rounded-full"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Promotional Banner */}
      <section className="py-8 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-6 p-6 sm:p-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-sm">
                %
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1 tracking-tight">Get Extra <span className="text-primary">10% Savings*</span></h3>
                <p className="text-muted-foreground font-medium">With Fashionify Platinum & Partner Bank Cards</p>
              </div>
            </div>
            <Button className="shrink-0 bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 h-12 font-bold shadow-sm">
              Claim Offer
            </Button>
          </div>
        </div>
      </section>

      {/* Shop Smart, Save Bigger */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-primary to-primary-dark dark:from-red-400 dark:via-primary dark:to-primary-dark">
            Shop Smart, Save Bigger
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { price: "499", label: "UNDER ₹499", color: "from-primary to-primary-dark", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop" },
              { price: "699", label: "UNDER ₹699", color: "from-primary to-primary-dark", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop" },
              { price: "999", label: "UNDER ₹999", color: "from-amber-500 to-orange-600", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=300&auto=format&fit=crop" },
              { price: "1499", label: "UNDER ₹1499", color: "from-emerald-500 to-teal-600", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=300&auto=format&fit=crop" }
            ].map((deal, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                onClick={() => navigate('/shop/listing')}
                className="group cursor-pointer relative rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all shadow-lg shadow-black/5"
              >
                <div className={`absolute top-0 left-0 w-full py-2 bg-gradient-to-r ${deal.color} text-white text-center font-extrabold tracking-widest text-sm z-10 shadow-sm`}>
                  {deal.label}
                </div>
                <div className="h-64 sm:h-80 w-full overflow-hidden bg-muted">
                  <img src={deal.image} alt={deal.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-bold text-lg flex items-center gap-1 group-hover:text-primary-soft transition-colors">
                    Explore <ChevronRightIcon className="w-5 h-5" />
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gradient">
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
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gradient">Shop by Brand</h2>
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
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gradient">
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
          <h2 className="text-4xl font-extrabold text-center mb-16 text-gradient">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", role: "Verified Buyer", text: "Absolutely love the quality of the clothes! The shipping was incredibly fast and everything fit perfectly." },
              { name: "Mike T.", role: "Verified Buyer", text: "The modern aesthetic of the brand really stands out. Customer service was also very helpful when I needed to exchange a size." },
              { name: "Emily R.", role: "Verified Buyer", text: "My go-to store for trendy and comfortable wear. The prices are unbeatable for this level of premium quality." }
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-gradient card-gradient-hover p-8 text-center space-y-4 border-t-2 border-primary-border">
                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, idx) => (
                      <svg key={idx} className="w-6 h-6 fill-current text-yellow-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic text-lg leading-relaxed">"{review.text}"</p>
                  <div>
                    <h4 className="font-bold text-lg">{review.name}</h4>
                    <span className="text-xs text-primary-foreground bg-primary/10 text-primary dark:text-primary px-2 py-0.5 rounded-full font-semibold">{review.role}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / Contact Section */}
      <section className="py-24 bg-card border-t border-border text-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-8">
          <h2 className="text-5xl font-extrabold tracking-tight text-foreground">Join the Fashionify Club</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Subscribe to our newsletter to unlock 15% off your first order, plus updates on our latest offers and exclusive arrivals.</p>
          <div className="flex flex-col sm:flex-row w-full max-w-md mx-auto items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
            <Button className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground font-bold shadow-sm">Subscribe</Button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default ShoppingHome;
