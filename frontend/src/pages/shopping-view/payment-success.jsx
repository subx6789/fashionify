import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const orderId = JSON.parse(sessionStorage.getItem("currentOrderId") || "null");

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
          <h1 className="text-3xl font-extrabold text-foreground">Order Placed!</h1>
          {orderId && (
            <p className="text-muted-foreground text-sm font-medium">
              Order ID: <span className="font-bold text-foreground">#{orderId}</span>
            </p>
          )}
          <p className="text-muted-foreground">
            Your order has been confirmed. You&apos;ll pay when it arrives at your door.
          </p>
        </div>

        {/* Delivery info */}
        <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary-dark/30 flex items-center justify-center flex-none">
              <Package className="h-4 w-4 text-primary dark:text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Estimated delivery: 3–5 business days</p>
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
            className="flex-1 bg-gradient-brand text-primary-foreground hover:from-primary hover:to-primary-dark text-primary-foreground"
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
