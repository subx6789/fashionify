import { CheckCircle, Package, Truck, Home } from "lucide-react";
import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

const STEPS = [
  { id: "pending", label: "Pending", icon: CheckCircle },
  { id: "inProcess", label: "Processing", icon: Package },
  { id: "inShipping", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Home },
];

function getStepIndex(status) {
  if (!status) return 0;
  status = status.toLowerCase();
  if (status === "pending_payment" || status === "pending") return 0;
  if (status === "confirmed" || status === "inprocess") return 1;
  if (status === "inshipping" || status === "shipped") return 2;
  if (status === "delivered") return 3;
  if (status === "rejected") return -1;
  return 0;
}

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <DialogContent aria-describedby={undefined} className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <div className="grid gap-6">
        
        {/* Visual Stepper */}
        {orderDetails?.orderStatus !== "rejected" && (
          <div className="mt-4 px-4">
            <div className="relative flex items-center justify-between w-full">
              {STEPS.map((step, index) => {
                const currentIndex = getStepIndex(orderDetails?.orderStatus);
                const isCompleted = index <= currentIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "bg-background border-muted-foreground/30 text-muted-foreground/50"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
              
              {/* Connecting Lines */}
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-muted-foreground/20 -z-10" />
              <div 
                className="absolute top-5 left-[10%] h-0.5 bg-primary -z-10 transition-all duration-500" 
                style={{ width: `${Math.max(0, (getStepIndex(orderDetails?.orderStatus) / (STEPS.length - 1)) * 80)}%` }} 
              />
            </div>
          </div>
        )}

        {orderDetails?.orderStatus === "rejected" && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-center font-semibold">
            Order Cancelled / Rejected
          </div>
        )}

        <div className="grid gap-2">
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?.id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>₹{orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>{orderDetails?.paymentStatus}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 text-white ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium text-lg">Order Items</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item) => (
                    <li className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border border-border/50" key={item.id || item.title}>
                      <span className="font-medium text-sm">{item.title || item.product?.title || 'Product'}</span>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-semibold text-foreground">₹{item.price}</span>
                      </div>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium text-lg">Shipping Info</div>
            <div className="grid gap-1 text-sm text-muted-foreground bg-muted/40 p-4 rounded-lg border border-border/50">
              <span className="font-semibold text-foreground text-base mb-1">{user.userName}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city} — {orderDetails?.addressInfo?.pincode}</span>
              <span className="mt-1">Phone: {orderDetails?.addressInfo?.phone}</span>
              {orderDetails?.addressInfo?.notes && (
                <span className="italic mt-2 text-xs bg-muted/60 p-2 rounded-md">Note: {orderDetails?.addressInfo?.notes}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
