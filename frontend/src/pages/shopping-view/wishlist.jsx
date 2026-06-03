import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { fetchWishlistItems } from "@/store/shop/wishlist-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { HeartCrack } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ShoppingWishlist() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { wishlistItems, isLoading } = useSelector((state) => state.shopWishlist);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWishlistItems(user.id));
    }
  }, [dispatch, user]);

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[60vh]">
      <h1 className="text-3xl font-extrabold mb-8 text-foreground">My Wishlist</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : wishlistItems && wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ShoppingProductTile
              key={product.id}
              product={product}
              handleAddtoCart={handleAddtoCart}
              handleGetProductDetails={handleGetProductDetails}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <HeartCrack className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground">Looks like you haven't added anything to your wishlist yet.</p>
        </div>
      )}
    </div>
  );
}

export default ShoppingWishlist;
