import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];
      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) =>
            item.product?.id === getCartItem?.product?.id &&
            item.selectedSize === getCartItem?.selectedSize
        );
        const getCurrentProduct = productList.find((p) => p.id === getCartItem?.product?.id);
        const sizeVariant = getCurrentProduct?.sizeVariants?.find(
          (v) => v.size === getCartItem?.selectedSize
        );
        const getTotalStock = sizeVariant?.stock ?? getCurrentProduct?.totalStock ?? 0;

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getTotalStock} in stock for size ${getCartItem?.selectedSize || "this item"}`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.product?.id,
        quantity: typeOfAction === "plus" ? getCartItem?.quantity + 1 : getCartItem?.quantity - 1,
        selectedSize: getCartItem?.selectedSize || null,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Cart item is updated successfully" });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: getCartItem?.product?.id,
        selectedSize: getCartItem?.selectedSize || null,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Cart item is deleted successfully" });
      }
    });
  }

  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem?.product?.images?.[0] || cartItem?.product?.image || "https://placehold.co/600x600/png?text=No+Image"}
        alt={cartItem?.product?.title}
        onError={(e) => { e.target.src = "https://placehold.co/600x600/png?text=No+Image"; }}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-extrabold truncate">{cartItem?.product?.title}</h3>
        {cartItem?.selectedSize && (
          <span className="inline-block text-xs font-semibold text-primary-dark dark:text-primary bg-primary/10 dark:bg-primary-dark/30 px-2 py-0.5 rounded-full mt-1">
            Size: {cartItem.selectedSize}
          </span>
        )}
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          ₹
          {(
            (cartItem?.product?.salePrice > 0 ? cartItem?.product?.salePrice : cartItem?.product?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;
