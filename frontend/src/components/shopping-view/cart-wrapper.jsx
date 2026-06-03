import { useNavigate } from "react-router-dom";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { useSelector } from "react-redux";
import { useAuthModal } from "@/context/AuthModalContext";
import { ShoppingBag } from "lucide-react";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate           = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { openAuthModal }  = useAuthModal();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.product?.salePrice > 0
              ? currentItem?.product?.salePrice
              : currentItem?.product?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleCheckout() {
    if (!isAuthenticated) {
      openAuthModal("login", { action: "checkout" });
      setOpenCartSheet(false);
      return;
    }
    navigate("/shop/checkout");
    setOpenCartSheet(false);
  }

  return (
    <SheetContent className="sm:max-w-md border-l-2 border-border p-0">
      <SheetHeader className="px-6 py-4 border-b-2 border-border">
        <SheetTitle className="font-heading font-black flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Your Cart
          <span className="ml-1 text-sm font-bold text-muted-foreground">
            ({cartItems?.length || 0} items)
          </span>
        </SheetTitle>
      </SheetHeader>

      <div className="flex flex-col h-[calc(100%-80px)]">
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cartItems && cartItems.length > 0
            ? cartItems.map((item, index) => (
                <UserCartItemsContent key={item.productId || index} cartItem={item} />
              ))
            : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="font-bold text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Add some items to get started</p>
              </div>
            )}
        </div>

        {cartItems && cartItems.length > 0 && (
          <div className="px-6 py-4 border-t-2 border-border space-y-4 bg-background">
            <div className="flex justify-between items-center">
              <span className="font-heading font-black text-lg">Total</span>
              <span className="font-heading font-black text-xl text-primary">₹{totalCartAmount}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="neu-btn-primary w-full py-3.5 text-base"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </SheetContent>
  );
}

export default UserCartWrapper;
