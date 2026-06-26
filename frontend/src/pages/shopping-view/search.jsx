/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: search.jsx
 * Purpose: Full page React view rendering a distinct route in the application.
 * Functions/Methods: 5
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import ShoppingProductTile from "@/components/shopping-view/product-tile";

import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getSearchResults, resetSearchResults } from "@/store/shop/search-slice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthModal } from "@/context/AuthModalContext";

/** Popular tags that are representative of the category taxonomy — used as quick-search chips in the empty state. */
const POPULAR_TAG_SUGGESTIONS = [
  "trendy", "oversized", "casual", "streetwear", "summer wear",
  "premium", "graphic print", "minimalist", "floral", "ethnic",
];

function SearchProducts() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const dispatch = useDispatch();
  const { searchResults, isLoading } = useSelector((state) => state.shopSearch);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (keyword && keyword.trim() !== "") {
      dispatch(getSearchResults(keyword));
    } else {
      dispatch(resetSearchResults());
    }
  }, [keyword, dispatch]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    if (!isAuthenticated) {
      openAuthModal("login", { action: "addToCart", productId: getCurrentProductId });
      return;
    }

    let getCartItems = cartItems.items || [];
    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      }
    });
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  return (
    <div className="container mx-auto md:px-6 px-4 py-8">


      {/* Loading indicator */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full mx-auto flex flex-col h-[480px] border border-muted/50 rounded-xl overflow-hidden bg-card/50 shadow-sm">
              <Skeleton className="w-full h-[300px] rounded-none bg-muted/60" />
              <div className="p-4 flex-1 flex flex-col gap-3">
                <Skeleton className="h-5 w-3/4 bg-muted/60" />
                <div className="flex justify-between items-center mt-1">
                  <Skeleton className="h-4 w-1/3 bg-muted/60" />
                  <Skeleton className="h-4 w-1/3 bg-muted/60" />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <Skeleton className="h-5 w-1/4 bg-muted/60" />
                  <Skeleton className="h-5 w-1/4 bg-muted/60" />
                </div>
                <div className="flex gap-2 mt-auto">
                  <Skeleton className="h-4 w-8 bg-muted/60" />
                  <Skeleton className="h-4 w-8 bg-muted/60" />
                  <Skeleton className="h-4 w-8 bg-muted/60" />
                </div>
              </div>
              <div className="px-4 pb-4">
                <Skeleton className="h-10 w-full bg-muted/60 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && keyword.trim() && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No results found</h2>
          <p className="text-muted-foreground">
            No products match &ldquo;<strong>{keyword}</strong>&rdquo;. Try a different search term.
          </p>
        </div>
      )}

      {!isLoading && !keyword.trim() && (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg font-bold mb-6">Start typing to search products…</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">
            Popular searches
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {POPULAR_TAG_SUGGESTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/shop/search?keyword=${encodeURIComponent(tag)}`)}
                className="text-sm font-black px-3 py-1.5 border-2 border-border rounded-sm bg-background hover:bg-primary hover:text-primary-foreground transition-all"
                style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isLoading && searchResults.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;<strong>{keyword}</strong>&rdquo;
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {searchResults.map((item) => (
              <ShoppingProductTile
                key={item.id}
                product={item}
                handleGetProductDetails={handleGetProductDetails}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SearchProducts;
