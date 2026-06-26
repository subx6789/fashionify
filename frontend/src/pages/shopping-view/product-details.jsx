/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: product-details.jsx
 * Purpose: Full page React view rendering a distinct route in the application.
 * Functions/Methods: 14
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { StarIcon, ChevronRight, ChevronLeft, Flame, AlertTriangle, Ruler, Share2, BadgeCheck, Tag, Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { Label } from "@/components/ui/label";
import StarRatingComponent from "@/components/common/star-rating";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { addReview, getReviews, checkRatingEligibility, resetEligibility } from "@/store/shop/review-slice";
import { addToWishlist, removeFromWishlist, fetchWishlistItems } from "@/store/shop/wishlist-slice";
import { useAuthModal } from "@/context/AuthModalContext";
import { joinWaitlist } from "@/services/api";

function ShoppingProductDetails() {
  const { id } = useParams();
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [fitFeedback, setFitFeedback] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWaitlisting, setIsWaitlisting] = useState(false);

  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { wishlistItems } = useSelector((state) => state.shopWishlist);
  const { reviews, eligibility } = useSelector((state) => state.shopReview);
  const { productDetails, isLoading } = useSelector((state) => state.shopProducts);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(getReviews(id));
      dispatch(resetEligibility());
    }
  }, [id, dispatch]);

  // Check review eligibility and wishlist for authenticated users
  useEffect(() => {
    if (isAuthenticated && user?.id && id) {
      dispatch(checkRatingEligibility({ productId: id, userId: user.id }));
      dispatch(fetchWishlistItems(user.id));
    }
  }, [isAuthenticated, user?.id, id, dispatch]);

  // Reset selected size when product changes
  useEffect(() => {
    setSelectedSize(null);
    setActiveImageIndex(0);
  }, [id]);

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  const images = productDetails?.images?.length > 0
    ? productDetails.images
    : productDetails?.image
      ? [productDetails.image]
      : [];

  const sizeVariants = productDetails?.sizeVariants || [];
  const totalStock = productDetails?.totalStock ?? 0;

  // Find selected variant stock info
  const selectedVariant = sizeVariants.find((v) => v.size === selectedSize);
  const selectedVariantStock = selectedVariant?.stock ?? 0;

  // Low-stock logic
  const isOverallLowStock = totalStock > 0 && totalStock <= 10;
  const isSelectedSizeLowStock = selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0;

  // Smart Size Predictor Logic
  function getRecommendedSize() {
    if (!isAuthenticated || !user || sizeVariants.length === 0) return null;
    const sizeNames = sizeVariants.map(v => String(v.size).toUpperCase());

    // Clothing Tops
    if (sizeNames.some(s => ["XS", "S", "M", "L", "XL", "XXL"].includes(s)) && user.topSize) {
      return sizeNames.includes(user.topSize.toUpperCase()) ? user.topSize : null;
    }
    // Bottoms
    if (sizeNames.some(s => ["28", "30", "32", "34", "36", "38"].includes(s)) && user.bottomSize) {
      return sizeNames.includes(user.bottomSize) ? user.bottomSize : null;
    }
    // Shoes
    if (sizeNames.some(s => ["6", "7", "8", "9", "10", "11", "12"].includes(s)) && user.shoeSize) {
      return sizeNames.includes(user.shoeSize) ? user.shoeSize : null;
    }
    return null;
  }

  const recommendedSize = getRecommendedSize();

  async function handleShare() {
    const shareData = {
      title: productDetails?.title,
      text: `Check out ${productDetails?.title} on Fashionify!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch {
      // User cancelled share or clipboard failed
    }
  }

  function handleAddToCart() {
    if (!isAuthenticated) {
      openAuthModal("login", { action: "addToCart", productId: productDetails?.id, selectedSize });
      return;
    }
    if (sizeVariants.length > 0 && !selectedSize) {
      toast({ title: "Please select a size first", variant: "destructive" });
      return;
    }
    if (selectedVariant && selectedVariant.outOfStock) {
      toast({ title: "This size is out of stock", variant: "destructive" });
      return;
    }

    let getCartItems = cartItems?.items || [];
    if (getCartItems.length) {
      const existingItem = getCartItems.find(
        (item) => String(item.productId) === String(productDetails?.id) && item.selectedSize === selectedSize
      );
      if (existingItem) {
        if (existingItem.quantity + 1 > selectedVariantStock) {
          toast({
            title: `Only ${selectedVariantStock} in stock for size ${selectedSize}`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: productDetails?.id,
        quantity: 1,
        selectedSize: selectedSize || null,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: `Added to cart${selectedSize ? ` — Size: ${selectedSize}` : ""}` });
      }
    });
  }

  async function handleNotifyMe() {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (sizeVariants.length > 0 && !selectedSize) {
      toast({ title: "Please select a size to be notified about", variant: "destructive" });
      return;
    }

    setIsWaitlisting(true);
    try {
      const response = await joinWaitlist({
        email: user?.email,
        productId: productDetails?.id,
        size: selectedSize || "One Size"
      });

      if (response.data.success) {
        toast({ title: "You're on the list!", description: response.data.message });
      }
    } catch (err) {
      toast({
        title: "Couldn't join waitlist",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsWaitlisting(false);
    }
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?.id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
        fitFeedback: fitFeedback,
        imageUrl: imageUrl,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        setFitFeedback("");
        setImageUrl("");
        dispatch(getReviews(productDetails?.id));
        // Re-check eligibility — user has now reviewed, so eligible becomes false
        dispatch(checkRatingEligibility({ productId: id, userId: user.id }));
        toast({ title: "Review added successfully!" });
      }
    });
  }

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.reviewValue, 0) / reviews.length
      : 0;

  if (isLoading || !productDetails) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <div className="rounded-2xl bg-muted/30 border border-border aspect-[4/5] animate-pulse" />
          {/* Details skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-muted/50 rounded-xl w-3/4 animate-pulse" />
            <div className="h-5 bg-muted/50 rounded-xl w-1/2 animate-pulse" />
            <div className="h-10 bg-muted/50 rounded-xl w-1/3 animate-pulse" />
            <div className="h-4 bg-muted/30 rounded w-full animate-pulse" />
            <div className="h-4 bg-muted/30 rounded w-4/5 animate-pulse" />
            <div className="h-14 bg-muted/30 rounded-xl w-full mt-8 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlistItems?.some(item => String(item.id) === String(productDetails?.id));

  function handleWishlist() {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist({ userId: user?.id, productId: productDetails?.id })).then(() => {
        toast({ title: "Removed from wishlist" });
      });
    } else {
      dispatch(addToWishlist({ userId: user?.id, productId: productDetails?.id })).then(() => {
        toast({ title: "Added to wishlist" });
      });
    }
  }

  const addToCartDisabled =
    totalStock === 0 ||
    (sizeVariants.length > 0 && !selectedSize) ||
    (selectedVariant && selectedVariant.outOfStock);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center text-sm text-muted-foreground">
          <Link to="/shop/home" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/shop/listing" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium truncate">{productDetails?.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-start">

          {/* ── Left Side: Gallery & Reviews List ─────────────────── */}
          <div className="flex flex-col gap-12">
            
            {/* ── Image Gallery ─────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-start">

            {/* Thumbnail strip (Left on Desktop, Bottom on Mobile) */}
            {images.length > 1 && (
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] scrollbar-thin pb-2 lg:pb-0 lg:pr-1 flex-none order-2 lg:order-1 lg:w-20">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`flex-none w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === activeImageIndex
                      ? "border-primary shadow-sm"
                      : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img src={url} alt={`View ${i + 1}`} onError={(e) => { e.target.src = "https://placehold.co/600x600/png?text=No+Image"; }} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="relative overflow-hidden rounded-xl bg-muted/20 border border-border aspect-[3/4] flex-1 order-1 lg:order-2 w-full">
              {images.length > 0 ? (
                <img
                  key={activeImageIndex}
                  src={images[activeImageIndex]}
                  alt={productDetails?.title}
                  onError={(e) => { e.target.src = "https://placehold.co/600x600/png?text=No+Image"; }}
                  className="w-full h-full object-contain p-2 transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}

              {/* Sale badge */}
              {productDetails?.salePrice > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-lg shadow-red-500/20">
                  Sale
                </div>
              )}

              {/* Prev/Next if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur border border-border rounded-full p-2 shadow hover:bg-background transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur border border-border rounded-full p-2 shadow hover:bg-background transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeImageIndex ? "bg-primary w-4" : "bg-white/60"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
            
          {/* ── Customer Reviews List ──────────────────────────────── */}
          <div className="space-y-6 pt-4 lg:pt-10">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-foreground">
                Customer Reviews
                <span className="text-muted-foreground text-sm font-medium bg-muted px-2.5 py-0.5 rounded-full border border-border">
                  {reviews?.length || 0}
                </span>
              </h2>

              {reviews && reviews.length > 0 ? (
                <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin pb-4">
                  {reviews.map((reviewItem, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-xl p-6 flex gap-4 shadow-sm">
                      <Avatar className="w-10 h-10 border border-border rounded-full flex-none">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {reviewItem?.userName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="font-semibold text-foreground text-sm">{reviewItem?.userName}</h3>
                          {reviewItem?.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-green-500/10 text-green-700 dark:text-green-400 font-semibold border border-green-500/20">
                              <BadgeCheck className="w-3.5 h-3.5" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <StarRatingComponent rating={reviewItem?.reviewValue} />
                            <span className="text-xs font-medium text-muted-foreground ml-1">
                              {reviewItem?.reviewValue} / 5 </span>
                          </div>
                          {reviewItem?.fitFeedback && (
                            <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                              Fit: {reviewItem.fitFeedback}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed pt-1">
                          &ldquo;{reviewItem.reviewMessage}&rdquo;
                        </p>
                        {reviewItem?.imageUrl && (
                          <div className="mt-3 max-w-[120px] rounded-lg overflow-hidden border border-border shadow-sm">
                            <img src={reviewItem.imageUrl} alt="Customer photo" className="w-full h-auto object-cover hover:scale-105 transition-transform" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[200px] bg-muted/20 border border-dashed border-border rounded-xl">
                  <div className="w-12 h-12 bg-muted/50 rounded-full mb-3 flex items-center justify-center">
                    <StarIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-semibold text-base mb-1">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to share your experience!</p>
                </div>
              )}
            </div>

          </div>

          {/* ── Right Side: Product Details & Form ─────────────────── */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {productDetails?.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded-full border border-border">
                  <StarRatingComponent rating={averageReview} />
                  <span className="text-sm font-bold text-foreground ml-1">
                    {averageReview.toFixed(1)}
                  </span>
                </div>
                <span className="text-muted-foreground text-sm font-medium hover:underline cursor-pointer">
                  {reviews?.length || 0} Reviews
                </span>
              </div>

              <Separator />

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <p className={`text-3xl font-bold text-foreground ${productDetails?.salePrice > 0 ? "line-through text-muted-foreground/50 text-2xl" : ""
                  }`}>
                  ₹{productDetails?.price}
                </p>
                {productDetails?.salePrice > 0 && (
                  <p className="text-3xl font-bold text-red-500 dark:text-red-400">
                    ₹{productDetails?.salePrice}
                  </p>
                )}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                Inclusive of all taxes
              </p>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {productDetails?.description}
              </p>

              {/* Tags */}
              {productDetails?.tags && productDetails.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <Tag className="w-4 h-4 text-muted-foreground flex-none" />
                  {productDetails.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/shop/listing`}
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors shadow-sm border border-transparent"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ── Size Selector ──────────────────────────────────── */}
            {sizeVariants.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select Size</Label>
                  <div className="flex items-center gap-3">
                    {selectedVariant?.measurements && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5" />
                        {selectedVariant.measurements}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizeVariants.map((variant) => {
                    const isSelected = selectedSize === variant.size;
                    const isOOS = variant.outOfStock || variant.stock === 0;
                    return (
                      <button
                        key={variant.size}
                        type="button"
                        disabled={isOOS}
                        onClick={() => setSelectedSize(variant.size)}
                        title={
                          isOOS
                            ? `Out of stock`
                            : variant.measurements
                              ? variant.measurements
                              : `${variant.stock} in stock`
                        }
                        className={`relative min-w-[3rem] px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all
                          ${isOOS
                            ? "border-border text-muted-foreground/40 line-through cursor-not-allowed bg-muted/20"
                            : isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                              : "border-muted-foreground/30 bg-background text-foreground hover:border-primary hover:text-primary hover:bg-primary/10"
                          }`}
                      >
                        {variant.size}
                        {/* Low stock dot indicator */}
                        {!isOOS && variant.lowStock && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-background" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected size stock info */}
                {selectedVariant && !selectedVariant.outOfStock && (
                  <p className="text-xs text-muted-foreground">
                    {selectedVariant.stock} units available in size{" "}
                    <strong>{selectedSize}</strong>
                  </p>
                )}

                {/* Smart Size Predictor Banner */}
                {recommendedSize && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3">
                    <BadgeCheck className="w-5 h-5 text-primary flex-none mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Smart Size Predictor</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Based on your Fashion Preferences, we recommend size <strong>{recommendedSize}</strong>.
                      </p>
                      {(!selectedSize || selectedSize !== recommendedSize) && (
                        <button
                          onClick={() => setSelectedSize(recommendedSize)}
                          className="text-xs font-bold text-primary hover:underline mt-1"
                        >
                          Select Size {recommendedSize}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Stock Warnings ──────────────────────────────────── */}
            {totalStock === 0 ? (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-none" />
                This product is currently out of stock.
              </div>
            ) : isSelectedSizeLowStock ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 flex-none text-orange-500" />
                Only {selectedVariant.stock} left in size {selectedSize} — Buy Now!
              </div>
            ) : isOverallLowStock && !selectedSize ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 flex-none text-orange-500" />
                Only {totalStock} items left across all sizes!
              </div>
            ) : null}

            {/* ── Add to Cart / Notify Me + Share Buttons ──────────────────────── */}
            <div className="pt-2 space-y-3">
              {totalStock === 0 ? (
                <Button
                  onClick={handleNotifyMe}
                  disabled={isWaitlisting}
                  className="w-full h-14 text-lg font-bold bg-background border-2 border-foreground text-foreground hover:bg-foreground hover:text-background rounded-xl transition-all"
                >
                  {isWaitlisting ? "Joining..." : "Notify Me When Available"}
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  {sizeVariants.length > 0 && !selectedSize && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please select a size to continue
                    </p>
                  )}
                  {selectedVariant?.outOfStock ? (
                    <Button
                      onClick={handleNotifyMe}
                      disabled={isWaitlisting}
                      className="w-full h-14 text-lg font-bold bg-background border-2 border-foreground text-foreground hover:bg-foreground hover:text-background rounded-xl transition-all"
                    >
                      {isWaitlisting ? "Joining..." : `Notify Me (Size ${selectedSize})`}
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-14 text-lg font-bold bg-gradient-brand text-primary-foreground hover:from-primary hover:to-primary-dark rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                      onClick={handleAddToCart}
                      disabled={addToCartDisabled}
                    >
                      Add to Cart
                    </Button>
                  )}
                </div>
              )}
              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleWishlist}
                  className={`w-full h-11 gap-2 rounded-xl transition-colors ${isWishlisted
                    ? "border-red-500 text-red-500 hover:bg-red-50"
                    : "border-border hover:border-red-500 hover:text-red-500"
                    }`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
                  {isWishlisted ? "Saved" : "Save to Wishlist"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="w-full h-11 gap-2 rounded-xl border-border transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <Separator />

            {/* ── Write a Review Form ──────────────────────────────── */}
            <div className="pt-6">
              {isAuthenticated ? (
                eligibility.isChecking ? (
                  <div className="p-6 animate-pulse bg-muted/30 border border-border rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground text-center">Checking eligibility…</p>
                  </div>
                ) : eligibility.eligible ? (
                  <div className="border border-border/80 rounded-xl p-6 bg-card shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4">Write a review</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-muted/30 p-3.5 rounded-xl border border-border flex-wrap">
                        <span className="text-sm font-semibold text-foreground">Your Rating:</span>
                        <div className="flex items-center gap-2">
                          <StarRatingComponent rating={rating} handleRatingChange={handleRatingChange} />
                          {rating > 0 && (
                            <span className="text-xs font-semibold text-muted-foreground ml-1">
                              {rating} out of 5
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fit Feedback (Optional)</Label>
                          <select
                            value={fitFeedback}
                            onChange={(e) => setFitFeedback(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer transition-colors"
                          >
                            <option value="">Select fit...</option>
                            <option value="Runs Small">Runs Small</option>
                            <option value="True to Size">True to Size</option>
                            <option value="Runs Large">Runs Large</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Photo URL (Optional)</Label>
                          <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Paste image URL..."
                            className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:ring-primary"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-border/60">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Review Message</Label>
                          <textarea
                            name="reviewMsg"
                            value={reviewMsg}
                            onChange={(e) => setReviewMsg(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors"
                          />
                        </div>
                        <Button
                          onClick={handleAddReview}
                          disabled={reviewMsg.trim() === "" || rating === 0}
                          className="w-full h-12 text-sm font-semibold rounded-xl"
                        >
                          Post Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-muted/30 border border-border rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-none">
                        <BadgeCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground">Verified Purchase Required</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {eligibility.reason || "You must purchase and receive this product before you can leave a review. This helps us ensure all reviews are authentic."}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-8 text-center bg-card border border-border/80 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 text-primary mx-auto rounded-full mb-4 flex items-center justify-center">
                    <StarIcon className="w-6 h-6 fill-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Have your say!</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Login to leave a review and let others know what you think of this product.
                  </p>
                  <Button onClick={() => openAuthModal("login")} className="w-full h-11 text-sm font-semibold rounded-xl">
                    Login to Review
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingProductDetails;
