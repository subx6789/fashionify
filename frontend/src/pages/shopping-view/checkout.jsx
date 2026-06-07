import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { createNewOrder, confirmSimulatedOrder } from "@/store/shop/order-slice";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingBag, MapPin, Loader2, CheckCircle, Gift, Truck, Tag } from "lucide-react";
import { applyPromoCode } from "@/services/api";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.shopOrder);
  const navigate = useNavigate();
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: "", isError: false });

  const dispatch = useDispatch();
  const { toast } = useToast();

  const totalCartAmount = useMemo(() => {
    if (!cartItems?.items?.length) return 0;
    return cartItems.items.reduce(
      (sum, currentItem) =>
        sum +
        (currentItem?.product?.salePrice > 0
          ? currentItem.product.salePrice
          : currentItem?.product?.price) *
          currentItem?.quantity,
      0
    );
  }, [cartItems]);

  const shippingCost = shippingMethod === "express" ? 100 : shippingMethod === "next-day" ? 250 : 0;
  const giftWrapCost = isGiftWrapped ? 50 : 0;
  const discountAmount = appliedPromo?.discountType === "PERCENTAGE" 
    ? (totalCartAmount * appliedPromo.discountValue / 100)
    : appliedPromo?.discountType === "FIXED" 
      ? appliedPromo.discountValue 
      : appliedPromo?.discountType === "FREE_SHIPPING"
      ? shippingCost
      : 0;
  const finalTotalAmount = Math.max(0, totalCartAmount + shippingCost + giftWrapCost - discountAmount);

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoMessage({ text: "", isError: false });
    try {
      const response = await applyPromoCode({ 
        promoCode,
        userId: user?.id,
        cartTotal: totalCartAmount
      });
      if (response.data.success) {
        setAppliedPromo({
          code: promoCode,
          discountType: response.data.discountType,
          discountValue: response.data.discountValue
        });
        setPromoMessage({ text: response.data.message, isError: false });
      } else {
        setAppliedPromo(null);
        setPromoMessage({ text: response.data.message || "Invalid promo code", isError: true });
      }
    } catch {
      setAppliedPromo(null);
      setPromoMessage({ text: "Error applying promo code", isError: true });
    } finally {
      setIsApplyingPromo(false);
    }
  }

  async function handlePlaceOrder() {
    if (!cartItems?.items?.length) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (!currentSelectedAddress) {
      toast({
        title: "Please select a delivery address to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const orderData = {
      user: { id: user?.id },
      cartId: cartItems?.id,
      orderItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.product?.id,
        title: singleCartItem?.product?.title,
        image:
          singleCartItem?.product?.images?.[0] ||
          singleCartItem?.product?.image ||
          "",
        price:
          singleCartItem?.product?.salePrice > 0
            ? singleCartItem?.product?.salePrice
            : singleCartItem?.product?.price,
        quantity: singleCartItem?.quantity,
        selectedSize: singleCartItem?.selectedSize || null,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?.id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending_payment",
      paymentMethod: "simulated_cod",
      paymentStatus: "pending",
      totalAmount: finalTotalAmount,
      shippingMethod: shippingMethod,
      shippingCost: shippingCost,
      isGiftWrapped: isGiftWrapped,
      appliedPromoCode: appliedPromo?.code || null,
      discountAmount: discountAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    const createResult = await dispatch(createNewOrder(orderData));
    if (!createResult?.payload?.success) {
      toast({ title: "Failed to create order. Please try again.", variant: "destructive" });
      setIsProcessing(false);
      return;
    }

    const orderId = createResult.payload.orderId;
    const confirmResult = await dispatch(confirmSimulatedOrder(orderId));
    if (confirmResult?.payload?.success) {
      // Sync the Redux cart state — backend has cleared the cart DB record
      dispatch(fetchCartItems(user?.id));
      toast({ title: "🎉 Order placed successfully!" });
      navigate("/shop/payment-success");
    } else {
      toast({ title: "Order created but confirmation failed. Contact support.", variant: "destructive" });
    }
    setIsProcessing(false);
  }

  const itemCount = cartItems?.items?.length || 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero image */}
      <div className="relative h-[200px] md:h-[280px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" alt="Checkout" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Checkout</h1>
          <p className="text-white/80 text-sm mt-1">{itemCount} item{itemCount !== 1 ? "s" : ""} in cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Address Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Delivery Address</h2>
            </div>
            <Address
              selectedId={currentSelectedAddress}
              setCurrentSelectedAddress={setCurrentSelectedAddress}
            />
          </div>

          {/* Order Summary */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Order Summary</h2>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              {cartItems?.items?.length > 0
                ? cartItems.items.map((item, idx) => (
                    <UserCartItemsContent key={item.productId + (item.selectedSize || "") + idx} cartItem={item} />
                  ))
                : (
                  <p className="text-muted-foreground text-center py-8">No items in cart</p>
                )}

              {/* Extras: Shipping, Gifting, Promo */}
              <div className="space-y-4 border-t border-border pt-4 mt-2">
                {/* Shipping Selection */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><Truck className="h-4 w-4" /> Shipping Speed</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className={`cursor-pointer flex items-center justify-between p-3 border rounded-lg text-sm transition-all ${shippingMethod === "standard" ? "border-primary-border bg-primary/5 dark:bg-primary-dark/20" : "border-border"}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="shipping" value="standard" checked={shippingMethod === "standard"} onChange={(e) => setShippingMethod(e.target.value)} className="accent-primary" />
                        <span>Standard</span>
                      </div>
                      <span className="font-medium">Free</span>
                    </label>
                    <label className={`cursor-pointer flex items-center justify-between p-3 border rounded-lg text-sm transition-all ${shippingMethod === "express" ? "border-primary-border bg-primary/5 dark:bg-primary-dark/20" : "border-border"}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="shipping" value="express" checked={shippingMethod === "express"} onChange={(e) => setShippingMethod(e.target.value)} className="accent-primary" />
                        <span>Express</span>
                      </div>
                      <span className="font-medium">+₹100</span>
                    </label>
                    <label className={`cursor-pointer flex items-center justify-between p-3 border rounded-lg text-sm transition-all ${shippingMethod === "next-day" ? "border-primary-border bg-primary/5 dark:bg-primary-dark/20" : "border-border"}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="shipping" value="next-day" checked={shippingMethod === "next-day"} onChange={(e) => setShippingMethod(e.target.value)} className="accent-primary" />
                        <span>Next-Day</span>
                      </div>
                      <span className="font-medium">+₹250</span>
                    </label>
                  </div>
                </div>

                {/* Gift Wrap */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><Gift className="h-4 w-4" /> Gift Options</h3>
                  <label className="cursor-pointer flex items-center gap-2 p-3 border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors">
                    <input type="checkbox" checked={isGiftWrapped} onChange={(e) => setIsGiftWrapped(e.target.checked)} className="accent-primary h-4 w-4 rounded" />
                    <span className="flex-1">Add Premium Gift Wrapping</span>
                    <span className="font-medium">+₹50</span>
                  </label>
                </div>

                {/* Promo Code */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><Tag className="h-4 w-4" /> Apply Promo Code</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. WELCOME10, SAVE500" 
                      value={promoCode} 
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button variant="secondary" onClick={handleApplyPromo} disabled={isApplyingPromo || !promoCode.trim()}>
                      {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {promoMessage.text && (
                    <p className={`text-xs font-medium ${promoMessage.isError ? "text-red-500" : "text-green-600"}`}>
                      {promoMessage.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-border pt-4 mt-2 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{totalCartAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping ({shippingMethod})</span>
                  <span>{shippingCost === 0 ? "Free" : `₹${shippingCost}`}</span>
                </div>
                {isGiftWrapped && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Gift Wrapping</span>
                    <span>₹50</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">₹{finalTotalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Simulated payment notice */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-sm">
                <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-none" />
                <p className="text-amber-700 dark:text-amber-300">
                  <strong>Cash on Delivery</strong> — No online payment required. Pay when your order arrives.
                </p>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing || isLoading || !itemCount}
                className="w-full h-14 text-base font-bold bg-gradient-brand text-primary-foreground hover:from-primary hover:to-primary-dark rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {isProcessing || isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing Order…
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
