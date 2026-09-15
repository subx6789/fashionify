/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: checkout.jsx
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

import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import useShopOrderStore from "@/store/useShopOrderStore";
import useShopCartStore from "@/store/useShopCartStore";
import useAuthStore from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingBag, MapPin, Loader2, CheckCircle, Gift, Truck, Tag, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { applyPromoCode } from "@/services/api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function ShoppingCheckout() {
  const cartItems = useShopCartStore((state) => state.cartItems);
  const fetchCartItems = useShopCartStore((state) => state.fetchCartItems);
  const user = useAuthStore((state) => state.user);
  const isLoading = useShopOrderStore((state) => state.isLoading);
  const createNewOrder = useShopOrderStore((state) => state.createNewOrder);
  const confirmSimulatedOrder = useShopOrderStore((state) => state.confirmSimulatedOrder);
  const verifyPayment = useShopOrderStore((state) => state.verifyPayment);
  const navigate = useNavigate();
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: "", isError: false });

  const { toast } = useToast();

  // ============================================================================
  // CART CALCULATION LOGIC
  // ============================================================================
  // We use React's useMemo hook here so that the total amount is only 
  // recalculated when the `cartItems` array changes. This saves performance 
  // by preventing unnecessary math calculations on every re-render.
  // ============================================================================
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

  // ============================================================================
  // DYNAMIC PRICING VARIABLES
  // ============================================================================
  // Calculate extra costs (shipping and gift wrapping) based on user selection.
  // We also calculate discounts dynamically if a promo code is active.
  // ============================================================================
  const shippingCost = shippingMethod === "express" ? 100 : shippingMethod === "next-day" ? 250 : 0;
  const giftWrapCost = isGiftWrapped ? 50 : 0;
  const discountAmount = appliedPromo?.discountType === "PERCENTAGE" 
    ? (totalCartAmount * appliedPromo.discountValue / 100)
    : appliedPromo?.discountType === "FIXED" 
      ? appliedPromo.discountValue 
      : appliedPromo?.discountType === "FREE_SHIPPING"
      ? shippingCost
      : 0;
      
  // Math.max(0, ...) ensures the final total never goes below zero.
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
      orderStatus: paymentMethod === "razorpay" ? "pending_payment" : "confirmed",
      paymentMethod: paymentMethod,
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

    // Cash on Delivery flow
    if (paymentMethod === "cod") {
      const createResult = await createNewOrder(orderData);
      if (createResult?.payload?.success) {
        const orderId = createResult.payload.orderId;
        sessionStorage.setItem("currentOrderId", JSON.stringify(orderId));
        sessionStorage.setItem("lastPaymentMethod", "cod");
        sessionStorage.removeItem("lastPaymentId");
        fetchCartItems(user?.id);
        toast({ title: "🎉 Order placed successfully with Cash on Delivery!" });
        navigate("/shop/payment-success");
      } else {
        toast({
          title: createResult?.payload?.message || "Failed to place order. Please try again.",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
      return;
    }

    // Razorpay Online Flow
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      toast({
        title: "Razorpay SDK failed to load",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const createResult = await createNewOrder(orderData);
    if (!createResult?.payload?.success) {
      toast({
        title: createResult?.payload?.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const { orderId, razorpayOrderId, amount, currency, keyId } = createResult.payload;

    const options = {
      key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "",
      amount: amount,
      currency: currency || "INR",
      name: "Fashionify",
      description: `Order #${orderId} Payment`,
      image: "/favicon.png",
      order_id: razorpayOrderId,
      handler: async function (response) {
        setIsProcessing(true);
        try {
          const verifyResult = await verifyPayment({
            orderId: orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verifyResult?.payload?.success) {
            sessionStorage.setItem("currentOrderId", JSON.stringify(orderId));
            sessionStorage.setItem("lastPaymentMethod", "razorpay");
            sessionStorage.setItem("lastPaymentId", response.razorpay_payment_id);
            fetchCartItems(user?.id);
            toast({ title: "🎉 Payment verified! Order confirmed." });
            navigate("/shop/payment-success");
          } else {
            toast({
              title: "Payment verification failed",
              description: verifyResult?.payload?.message || "Please contact support.",
              variant: "destructive",
            });
          }
        } catch {
          toast({
            title: "Verification error",
            description: "Something went wrong while confirming your payment.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: user?.userName || "",
        email: user?.email || "",
        contact: currentSelectedAddress?.phone || "",
      },
      theme: {
        color: "#c6ff00",
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          toast({
            title: "Payment cancelled",
            description: "You closed the payment window. You can retry payment anytime.",
          });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (resp) {
      setIsProcessing(false);
      toast({
        title: "Payment failed",
        description: resp.error?.description || "Transaction declined by gateway.",
        variant: "destructive",
      });
    });
    rzp.open();
  }

  const itemCount = cartItems?.items?.length || 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero image */}
      <div className="relative h-[140px] sm:h-[200px] md:h-[280px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" alt="Checkout" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-center w-full px-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">Checkout</h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">{itemCount} item{itemCount !== 1 ? "s" : ""} in cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 sm:py-8">
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
                {/* Payment Method Selection */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Payment Method
                    </h3>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 100% Secure
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Razorpay Option */}
                    <label
                      onClick={() => setPaymentMethod("razorpay")}
                      className={`cursor-pointer flex items-start gap-3 p-3.5 border rounded-xl transition-all relative ${
                        paymentMethod === "razorpay"
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === "razorpay"}
                        onChange={() => setPaymentMethod("razorpay")}
                        className="accent-primary mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">Razorpay (Online Payment)</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                            Fast & Secure
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          UPI (Google Pay, PhonePe, Paytm), Debit / Credit Cards, NetBanking & Wallets
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] font-semibold text-muted-foreground">
                          <span className="px-1.5 py-0.5 rounded bg-muted/60 border border-border">UPI</span>
                          <span className="px-1.5 py-0.5 rounded bg-muted/60 border border-border">Cards</span>
                          <span className="px-1.5 py-0.5 rounded bg-muted/60 border border-border">NetBanking</span>
                          <span className="px-1.5 py-0.5 rounded bg-muted/60 border border-border">Wallets</span>
                        </div>
                      </div>
                    </label>

                    {/* Cash on Delivery Option */}
                    <label
                      onClick={() => setPaymentMethod("cod")}
                      className={`cursor-pointer flex items-start gap-3 p-3.5 border rounded-xl transition-all relative ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-primary mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">Cash on Delivery (COD)</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                            Doorstep Pay
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pay with cash or scan QR at your doorstep when your package is delivered.
                        </p>
                      </div>
                    </label>
                  </div>
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

              {/* Payment status notice */}
              {paymentMethod === "razorpay" ? (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-none" />
                  <p className="text-foreground text-xs leading-relaxed">
                    <strong>Razorpay Instant Checkout:</strong> You will be prompted with Razorpay&apos;s encrypted modal to complete payment via UPI, Cards, or NetBanking.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-sm">
                  <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-none" />
                  <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                    <strong>Cash on Delivery:</strong> No online payment required right now. Pay when your order arrives at your doorstep.
                  </p>
                </div>
              )}

              {/* Place Order / Pay Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing || isLoading || !itemCount}
                className="w-full h-14 text-base font-bold bg-gradient-brand text-primary-foreground hover:from-primary hover:to-primary-dark rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
              >
                {isProcessing || isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing {paymentMethod === "razorpay" ? "Payment…" : "Order…"}
                  </>
                ) : paymentMethod === "razorpay" ? (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Pay ₹{finalTotalAmount.toFixed(2)} via Razorpay
                  </>
                ) : (
                  <>
                    <Banknote className="h-5 w-5" />
                    Place Order (Cash on Delivery)
                  </>
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
