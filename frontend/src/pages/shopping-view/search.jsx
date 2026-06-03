import ShoppingProductTile from "@/components/shopping-view/product-tile";

import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getSearchResults, resetSearchResults } from "@/store/shop/search-slice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  useEffect(() => {
    if (keyword && keyword.trim() !== "") {
      dispatch(getSearchResults(keyword));
    } else {
      dispatch(resetSearchResults());
    }
  }, [keyword, dispatch]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    if (!isAuthenticated) {
      toast({ title: "Please login to add to cart", variant: "destructive" });
      navigate("/auth/login");
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg">Start typing to search products…</p>
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
                handleAddtoCart={handleAddtoCart}
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
