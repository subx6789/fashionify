/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: cart-items-content.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 7
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector }        from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast }                         from "../ui/use-toast";

/**
 * CartItemsContent — Neubrutalist item row used inside CartDialog.
 *
 * Styling follows index.css design tokens:
 *   - border-2 border-border on image
 *   - neu-btn quantity controls with sharp shadows
 *   - font-heading font-black for prices
 *   - Acid lime size badge
 */
function UserCartItemsContent({ cartItem }) {
  const { user }        = useSelector((state) => state.auth);
  const { cartItems }   = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch        = useDispatch();
  const { toast }       = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction === "plus") {
      const allItems     = cartItems.items || [];
      const currentIndex = allItems.findIndex(
        (item) =>
          item.product?.id === getCartItem?.product?.id &&
          item.selectedSize === getCartItem?.selectedSize
      );
      const currentProduct = productList.find(
        (p) => p.id === getCartItem?.product?.id
      );
      const sizeVariant = currentProduct?.sizeVariants?.find(
        (v) => v.size === getCartItem?.selectedSize
      );
      const totalStock =
        sizeVariant?.stock ?? currentProduct?.totalStock ?? 0;

      if (currentIndex > -1) {
        const currentQty = allItems[currentIndex].quantity;
        if (currentQty + 1 > totalStock) {
          toast({
            title: `Only ${totalStock} in stock for size ${
              getCartItem?.selectedSize || "this item"
            }`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId:       user?.id,
        productId:    getCartItem?.product?.id,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
        selectedSize: getCartItem?.selectedSize || null,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Cart updated" });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({
        userId:       user?.id,
        productId:    getCartItem?.product?.id,
        selectedSize: getCartItem?.selectedSize || null,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Item removed" });
      }
    });
  }

  const itemPrice =
    (cartItem?.product?.salePrice > 0
      ? cartItem?.product?.salePrice
      : cartItem?.product?.price) * cartItem?.quantity;

  return (
    <div className="flex items-start gap-4">
      {/* Product image with Neubrutalist border */}
      <div
        className="flex-shrink-0 w-[72px] h-[72px] border-2 border-border rounded-sm overflow-hidden bg-muted/20"
        style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
      >
        <img
          src={
            cartItem?.product?.images?.[0] ||
            cartItem?.product?.image ||
            "https://placehold.co/72x72/png?text=N/A"
          }
          alt={cartItem?.product?.title}
          onError={(e) => {
            e.target.src = "https://placehold.co/72x72/png?text=N/A";
          }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info + controls */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-black text-sm leading-tight line-clamp-2 mb-1">
          {cartItem?.product?.title}
        </h3>

        {/* Size badge (acid lime) */}
        {cartItem?.selectedSize && (
          <span
            className="inline-flex items-center text-[11px] font-black px-2 py-0.5 rounded-sm border-2 border-border bg-primary text-primary-foreground mb-2"
            style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
          >
            {cartItem.selectedSize}
          </span>
        )}

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-1">
          {/* Decrease */}
          <button
            aria-label="Decrease quantity"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
            className="w-7 h-7 flex items-center justify-center border-2 border-border rounded-sm bg-background font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
            style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
          >
            <Minus className="w-3 h-3" aria-hidden="true" />
          </button>

          {/* Quantity count */}
          <span className="font-heading font-black text-sm w-6 text-center">
            {cartItem?.quantity}
          </span>

          {/* Increase */}
          <button
            aria-label="Increase quantity"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
            className="w-7 h-7 flex items-center justify-center border-2 border-border rounded-sm bg-background font-black text-sm transition-all hover:bg-muted"
            style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Price + delete column */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="font-heading font-black text-base">
          ₹{itemPrice.toLocaleString("en-IN")}
        </span>
        <button
          onClick={() => handleCartItemDelete(cartItem)}
          aria-label={`Remove ${cartItem?.product?.title} from cart`}
          className="flex items-center justify-center w-7 h-7 border-2 border-border rounded-sm bg-background text-muted-foreground transition-all hover:text-destructive hover:border-destructive"
          style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
