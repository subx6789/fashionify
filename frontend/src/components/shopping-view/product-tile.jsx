/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: product-tile.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 4
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Heart, Flame } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";
import { useToast } from "../ui/use-toast";
import { useAuthModal } from "@/context/AuthModalContext";
import { getOptimizedImageUrl } from "@/lib/utils";

/**
 * ShoppingProductTile — fully clickable product card.
 * The entire card navigates to the product detail page.
 * The wishlist heart is the only independent interactive element (stopPropagation).
 *
 * Hover affordance: card lifts by 3px with stronger shadow (Neubrutalism convention).
 */
function ShoppingProductTile({ product, handleGetProductDetails }) {
  const dispatch          = useDispatch();
  const { user }          = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.shopWishlist);
  const { toast }         = useToast();
  const { openAuthModal } = useAuthModal();

  const isWishlisted = wishlistItems?.some((item) => item.id === product?.id);
  const rawCoverImage = product?.images?.[0] || product?.image || "https://placehold.co/600x600/png?text=No+Image";
  const coverImage   = getOptimizedImageUrl(rawCoverImage, 400);
  const totalStock   = product?.totalStock ?? 0;

  function handleWishlistToggle(e) {
    e.stopPropagation();
    if (!user) {
      openAuthModal("login", { action: "wishlist", productId: product?.id });
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist({ userId: user?.id, productId: product?.id }));
      toast({ title: "Removed from wishlist" });
    } else {
      dispatch(addToWishlist({ userId: user?.id, productId: product?.id }));
      toast({ title: "Added to wishlist" });
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleGetProductDetails(product?.id);
    }
  }

  return (
    <div
      onClick={() => handleGetProductDetails(product?.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${product?.title}`}
      className="product-card w-full mx-auto flex flex-col h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
    >
      {/* Image area */}
      <div className="relative flex-none">
        <img
          src={coverImage}
          alt={product?.title}
          onError={(e) => { e.target.src = "https://placehold.co/600x600/png?text=No+Image"; }}
          className="w-full h-[280px] object-contain p-3 bg-muted/10 transition-transform duration-200 group-hover:scale-[1.02]"
        />

        {/* Stock badges */}
        {totalStock === 0 ? (
          <div
            className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-black px-2 py-0.5 border-2 border-border"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          >
            OUT OF STOCK
          </div>
        ) : totalStock <= 5 ? (
          <div
            className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-black px-2 py-0.5 border-2 border-border flex items-center gap-1"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          >
            <Flame className="w-3 h-3" /> {`Only ${totalStock} left`}
          </div>
        ) : totalStock <= 10 ? (
          <div
            className="absolute top-2 left-2 bg-[hsl(var(--neu-yellow))] text-[hsl(var(--neu-black))] text-[10px] font-black px-2 py-0.5 border-2 border-border"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          >
            {`Only ${totalStock} left`}
          </div>
        ) : product?.salePrice > 0 ? (
          <div
            className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-black px-2 py-0.5 border-2 border-border"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          >
            SALE
          </div>
        ) : null}

        {/* Multi-image indicator */}
        {product?.images?.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-[hsl(var(--neu-black)/0.7)] text-white text-[10px] px-1.5 py-0.5 font-bold">
            {product.images.length} photos
          </div>
        )}

        {/* Wishlist button — independent of card click */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-1.5 border-2 transition-colors z-10 rounded-sm ${
            isWishlisted
              ? "bg-red-500 border-red-500 text-white"
              : "bg-background border-border text-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-500 dark:hover:bg-red-500/20"
          }`}
          style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
        </button>
      </div>

      {/* Content — grows to fill card */}
      <div className="p-4 flex-1 flex flex-col border-t-2 border-border">
        <h2
          className="text-sm font-black mb-2 line-clamp-2 leading-snug min-h-[2.5rem] tracking-tight"
          title={product?.title}
        >
          {product?.title}
        </h2>

        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            {categoryOptionsMap[product?.category]}
          </span>
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            {brandOptionsMap[product?.brand]}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-lg font-black ${product?.salePrice > 0 ? "line-through text-muted-foreground text-sm" : "text-foreground"}`}>
            ₹{product?.price}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-lg font-black text-primary">₹{product?.salePrice}</span>
          )}
        </div>

        {/* Size pills */}
        <div className="flex flex-wrap gap-1 mt-auto min-h-[22px]">
          {product?.sizeVariants?.slice(0, 4).map((v) => (
            <span
              key={v.size}
              className={`text-[10px] px-1.5 py-0.5 border-2 font-bold ${
                v.outOfStock || v.stock === 0
                  ? "text-muted-foreground/40 border-border line-through"
                  : "text-foreground border-border"
              }`}
            >
              {v.size}
            </span>
          ))}
          {product?.sizeVariants?.length > 4 && (
            <span className="text-[10px] text-muted-foreground font-bold">
              +{product.sizeVariants.length - 4}
            </span>
          )}
        </div>

        {/* Tags */}
        {product?.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="neu-tag text-[10px]">
                {tag}
              </span>
            ))}
            {product.tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground font-bold self-center">
                +{product.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default ShoppingProductTile;
