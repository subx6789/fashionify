/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: payment-success.jsx
 * Purpose: Full page React view rendering a distinct route in the application.
 * Functions/Methods: 1
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { CheckCircle, Package, ArrowRight, ShieldCheck, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const orderId = JSON.parse(sessionStorage.getItem("currentOrderId") || "null");
  const lastPaymentMethod = sessionStorage.getItem("lastPaymentMethod") || "cod";
  const lastPaymentId = sessionStorage.getItem("lastPaymentId");
  const isRazorpay = lastPaymentMethod === "razorpay";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-800 animate-ping opacity-30" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground">
            {isRazorpay ? "Payment Successful!" : "Order Placed!"}
          </h1>
          {orderId && (
            <p className="text-muted-foreground text-sm font-medium">
              Order ID: <span className="font-bold text-foreground">#{orderId}</span>
            </p>
          )}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isRazorpay
              ? "Your payment was securely verified via Razorpay and your order is confirmed."
              : "Your order has been confirmed. You will pay in cash when it arrives at your doorstep."}
          </p>
        </div>

        {/* Payment & Delivery info */}
        <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary-dark/30 flex items-center justify-center flex-none">
              {isRazorpay ? (
                <ShieldCheck className="h-5 w-5 text-primary" />
              ) : (
                <Banknote className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {isRazorpay ? "Paid via Razorpay" : "Cash on Delivery"}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isRazorpay
                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                }`}>
                  {isRazorpay ? "Verified Paid" : "Pay at Doorstep"}
                </span>
              </div>
              {lastPaymentId && (
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  Transaction ID: <span className="font-mono text-foreground">{lastPaymentId}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                Estimated delivery: 3–5 business days
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/shop/account")}
          >
            View My Orders
          </Button>
          <Button
            className="flex-1 bg-gradient-brand text-primary-foreground hover:from-primary hover:to-primary-dark"
            onClick={() => navigate("/shop/home")}
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
