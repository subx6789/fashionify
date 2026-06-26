/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: order-details.jsx
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

import { useEffect } from "react";
import { CheckCircle, Package, Truck, Home, Download, ClipboardList } from "lucide-react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { Badge } from "../ui/badge";
import { DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { jsPDF } from "jspdf";

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
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { productList } = useSelector((state) => state.shopProducts);

  useEffect(() => {
    if (orderDetails && (!productList || productList.length === 0)) {
      dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh", page: 0, size: 100 }));
    }
  }, [dispatch, orderDetails, productList]);

  const invoiceId = `INV-${orderDetails?.id}-${orderDetails?.orderDate ? (Array.isArray(orderDetails.orderDate) ? `${orderDetails.orderDate[0]}${String(orderDetails.orderDate[1]).padStart(2,"0")}${String(orderDetails.orderDate[2]).padStart(2,"0")}` : orderDetails.orderDate.split("T")[0].replace(/-/g, "")) : "N/A"}`;

  function handleDownloadReceipt(item) {
    const logoImg = new Image();
    logoImg.src = "/favicon.png";

    const productItem = productList?.find((p) => String(p.id) === String(item.productId));
    const resolvedImage = item.image || productItem?.images?.[0] || productItem?.image || "";

    const productImg = new Image();
    if (resolvedImage) {
      productImg.crossOrigin = "anonymous";
      if (resolvedImage.startsWith("data:")) {
        productImg.src = resolvedImage;
      } else {
        productImg.src = resolvedImage + (resolvedImage.includes("?") ? "&" : "?") + "t=" + new Date().getTime();
      }
    }

    let loadedCount = 0;
    const totalToLoad = resolvedImage ? 2 : 1;

    const startPdfGeneration = () => {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const formattedDate = orderDetails?.orderDate 
        ? (typeof orderDetails.orderDate === "string" 
            ? orderDetails.orderDate.split("T")[0] 
            : Array.isArray(orderDetails.orderDate) 
              ? `${orderDetails.orderDate[0]}-${String(orderDetails.orderDate[1]).padStart(2,"0")}-${String(orderDetails.orderDate[2]).padStart(2,"0")}` 
              : "N/A") 
        : "N/A";

      // Theme colors from index.css (Warm editorial theme with Acid Lime highlight)
      const primaryColor = [198, 255, 0]; // Acid Lime Green: hsl(77 100% 50%)
      const headerTextColor = [0, 0, 0]; // Primary text on primary surface is black
      const darkTextColor = [31, 41, 55]; // Charcoal/Black text
      const lightTextColor = [107, 114, 128]; // Muted text
      const cardBgColor = [250, 247, 240]; // Warm off-white: hsl(40 33% 96%)
      const softHighlightColor = [244, 255, 208]; // Soft lime tint: hsl(77 100% 90%)

      // Header Banner (Acid Lime)
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 35, "F");

      // Draw Logo if loaded
      if (logoImg.src && logoImg.width > 0) {
        doc.addImage(logoImg, "PNG", 15, 10, 15, 15);
        doc.setTextColor(...headerTextColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("FASHIONIFY", 34, 21);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("E-COMMERCE RECEIPT", 34, 27);
      } else {
        doc.setTextColor(...headerTextColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("FASHIONIFY", 15, 22);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("E-COMMERCE RECEIPT", 15, 28);
      }

      // Invoice Meta (right aligned in header)
      doc.setTextColor(...headerTextColor);
      doc.setFontSize(9);
      doc.text(`Invoice No: ${invoiceId}`, 200, 15, { align: "right" });
      doc.text(`Order Date: ${formattedDate}`, 200, 21, { align: "right" });
      doc.text(`Order ID: #${orderDetails?.id}`, 200, 27, { align: "right" });

      // Section 1: Customer Details & Shipping Details
      doc.setTextColor(...darkTextColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("SHIPPING DETAILS", 15, 50);

      // Warm off-white box for shipping details (matching the theme background)
      doc.setFillColor(...cardBgColor);
      doc.rect(15, 55, 180, 35, "F");
      
      // Draw outline
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(15, 55, 180, 35, "D");

      doc.setTextColor(...darkTextColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(user?.userName || "Valued Customer", 20, 62);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...lightTextColor);
      doc.text(`Address: ${orderDetails?.addressInfo?.address || "N/A"}`, 20, 68);
      doc.text(`City:    ${orderDetails?.addressInfo?.city || "N/A"} - ${orderDetails?.addressInfo?.pincode || "N/A"}`, 20, 74);
      doc.text(`Phone:   ${orderDetails?.addressInfo?.phone || "N/A"}`, 20, 80);

      // Section 2: Order Summary
      doc.setTextColor(...darkTextColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("ORDER SUMMARY", 15, 105);

      // Table Header using Soft Lime Highlight
      doc.setFillColor(...softHighlightColor);
      doc.rect(15, 110, 180, 10, "F");
      doc.rect(15, 110, 180, 10, "D");

      doc.setTextColor(...darkTextColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Item", 18, 116);
      doc.text("Product Description", 32, 116);
      doc.text("Size", 110, 116);
      doc.text("Qty", 130, 116);
      doc.text("Unit Price", 150, 116);
      doc.text("Total", 180, 116);

      // Table Row
      doc.setFont("helvetica", "normal");
      
      // Draw Product Image
      let imageDrawn = false;
      if (productImg.src && productImg.width > 0) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = productImg.width;
          canvas.height = productImg.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(productImg, 0, 0);
          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          doc.addImage(imgData, "JPEG", 18, 122, 9, 12);
          imageDrawn = true;
        } catch (err) {
          console.error("Error drawing product image in PDF:", err);
        }
      }

      if (!imageDrawn) {
        doc.setDrawColor(120, 120, 120);
        doc.setFillColor(240, 240, 240);
        doc.rect(18, 122, 9, 12, "FD");
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text("No Img", 19, 129);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...darkTextColor);
      doc.text(item.title || item.product?.title || "Product", 32, 129);
      doc.text(item.selectedSize || "N/A", 110, 129);
      doc.text(String(item.quantity || 1), 130, 129);
      doc.text(`INR ${item.price || 0}`, 150, 129);
      doc.text(`INR ${(item.price || 0) * (item.quantity || 1)}`, 180, 129);

      // Table line separator
      doc.setDrawColor(0, 0, 0);
      doc.line(15, 137, 195, 137);

      // Totals Section
      doc.setFont("helvetica", "bold");
      doc.text("Subtotal:", 145, 147);
      doc.text(`INR ${(item.price || 0) * (item.quantity || 1)}`, 180, 147);

      doc.text("Shipping & Handling:", 128, 153);
      doc.text("INR 0.00", 180, 153);

      doc.setFontSize(10);
      doc.text("Total Amount Paid:", 128, 161);
      doc.text(`INR ${(item.price || 0) * (item.quantity || 1)}`, 180, 161);

      // Draw solid line above total amount
      doc.setDrawColor(...darkTextColor);
      doc.setLineWidth(0.5);
      doc.line(125, 156, 195, 156);

      // Section 3: Payment Details
      doc.setFontSize(10);
      doc.setTextColor(...darkTextColor);
      doc.text("PAYMENT INFORMATION", 15, 178);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...lightTextColor);
      doc.text(`Method: ${orderDetails?.paymentMethod?.toUpperCase().replace("SIMULATED_", "") || "N/A"}`, 15, 185);
      doc.text(`Status: ${orderDetails?.paymentStatus?.toUpperCase().replace("SIMULATED_", "") || "N/A"}`, 15, 191);

      // Footer Branding / Note
      doc.setDrawColor(209, 213, 219);
      doc.line(15, 260, 195, 260);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...lightTextColor);
      doc.text("If you have any questions about this receipt, please contact support@fashionify.com", 105, 268, { align: "center" });
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text("Thank you for shopping with FASHIONIFY!", 105, 275, { align: "center" });

      // Download the PDF
      doc.save(`receipt-${invoiceId}-${item.productId || 'item'}.pdf`);
    };

    const checkLoadStatus = () => {
      loadedCount++;
      if (loadedCount === totalToLoad) {
        startPdfGeneration();
      }
    };

    logoImg.onload = checkLoadStatus;
    logoImg.onerror = () => {
      logoImg.src = "";
      checkLoadStatus();
    };

    if (resolvedImage) {
      productImg.onload = checkLoadStatus;
      productImg.onerror = () => {
        productImg.crossOrigin = null;
        productImg.src = "";
        checkLoadStatus();
      };
    } else {
      checkLoadStatus();
    }
  }

  return (
    <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl p-0">
      <DialogDescription className="sr-only">
        Customer order details view displaying purchase details, order timeline status tracker, and receipts.
      </DialogDescription>
      <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center justify-between border-b border-border pb-4 mb-2 pt-6 px-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <span>Order Details</span>
        </div>
        <span className="text-sm font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
          ID: #{orderDetails?.id}
        </span>
      </DialogTitle>

      <div className="grid gap-6 px-6 pb-6">
        
        {/* Visual Stepper */}
        {orderDetails?.orderStatus !== "rejected" && (
          <div className="mt-4">
            <div className="relative flex items-center justify-between w-full">
              {STEPS.map((step, index) => {
                const currentIndex = getStepIndex(orderDetails?.orderStatus);
                const isCompleted = index <= currentIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted 
                        ? "bg-primary border-primary text-primary-foreground shadow-md" 
                        : "bg-background border-border text-muted-foreground/50"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] mt-2 font-bold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
              
              {/* Connecting Lines */}
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-border -z-10" />
              <div 
                className="absolute top-5 left-[10%] h-0.5 bg-primary -z-10 transition-all duration-500" 
                style={{ width: `${Math.max(0, (getStepIndex(orderDetails?.orderStatus) / (STEPS.length - 1)) * 80)}%` }} 
              />
            </div>
          </div>
        )}

        {orderDetails?.orderStatus === "rejected" && (
          <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-center text-sm">
            Order Cancelled / Rejected
          </div>
        )}

        {/* General Metadata Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-xl border border-border/60">
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Invoice ID</span>
            <p className="text-xs font-semibold text-foreground truncate">{invoiceId}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Order Date</span>
            <p className="text-xs font-semibold text-foreground">
              {orderDetails?.orderDate ? (
                typeof orderDetails.orderDate === "string" 
                  ? orderDetails.orderDate.split("T")[0] 
                  : Array.isArray(orderDetails.orderDate) 
                    ? `${orderDetails.orderDate[0]}-${String(orderDetails.orderDate[1]).padStart(2,"0")}-${String(orderDetails.orderDate[2]).padStart(2,"0")}` 
                    : "N/A"
              ) : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Order Price</span>
            <p className="text-xs font-bold text-foreground">₹{orderDetails?.totalAmount}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Payment Method</span>
            <p className="text-xs font-semibold text-foreground capitalize">{orderDetails?.paymentMethod?.replace('simulated_', '')}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Payment Status</span>
            <p className="text-xs font-semibold text-foreground capitalize">{orderDetails?.paymentStatus?.replace('simulated_', '')}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Order Status</span>
            <div>
              <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                orderDetails?.orderStatus === "delivered"
                  ? "bg-green-500/10 text-green-700 border-green-500/20"
                  : orderDetails?.orderStatus === "rejected"
                  ? "bg-red-500/10 text-red-700 border-red-500/20"
                  : "bg-blue-500/10 text-blue-700 border-blue-500/20"
              }`}>
                {orderDetails?.orderStatus}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Order Items */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Items</h4>
          <div className="border border-border/80 rounded-xl overflow-hidden bg-card">
            <ul className="divide-y divide-border/60">
              {orderDetails?.orderItems && orderDetails?.orderItems.length > 0 ? (
                 orderDetails?.orderItems.map((item) => {
                  const productItem = productList?.find((p) => String(p.id) === String(item.productId));
                  const resolvedImage = item.image || productItem?.images?.[0] || productItem?.image || "";

                  return (
                    <li 
                      className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors gap-4" 
                      key={item.id || item.title}
                    >
                      <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => item.productId && navigate(`/shop/product/${item.productId}`)}>
                        {/* Product Image */}
                        <div className="w-12 h-16 rounded-lg overflow-hidden border border-border bg-muted flex-none flex items-center justify-center">
                          {resolvedImage ? (
                            <img
                              src={resolvedImage}
                              alt={item.title || "Product"}
                              onError={(e) => { e.target.src = "https://placehold.co/100x150/png?text=No+Image"; }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm text-foreground leading-tight hover:underline">{item.title || item.product?.title || 'Product'}</span>
                        {item.selectedSize && (
                          <span className="text-xs text-muted-foreground font-semibold">Size: {item.selectedSize}</span>
                        )}
                        <p className="text-xs text-muted-foreground">Price per item: ₹{item.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm flex-none">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-muted-foreground text-xs">Qty: {item.quantity}</span>
                        <span className="font-bold text-foreground">₹{item.price * item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReceipt(item);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline mt-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Receipt
                        </button>
                      </div>
                    </div>
                  </li>
                )})
              ) : (
                <li className="p-4 text-center text-sm text-muted-foreground">No items in this order</li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Shipping Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Shipping Info</h4>
          <div className="border border-border/80 rounded-xl p-4 bg-muted/10 space-y-1 text-sm">
            <span className="font-bold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border/40 pb-2">
              <span className="w-2.5 h-2.5 bg-primary rounded-full" />
              {user.userName}
            </span>
            <p className="text-muted-foreground font-medium">{orderDetails?.addressInfo?.address}</p>
            <p className="text-muted-foreground">{orderDetails?.addressInfo?.city} — {orderDetails?.addressInfo?.pincode}</p>
            <p className="text-muted-foreground font-bold pt-1">Phone: {orderDetails?.addressInfo?.phone}</p>
            {orderDetails?.addressInfo?.notes && (
              <div className="mt-3 bg-muted/40 p-2.5 rounded-lg border border-border/40 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block mb-0.5">Note:</span>
                {orderDetails?.addressInfo?.notes}
              </div>
            )}
          </div>
        </div>

      </div>
    </DialogContent>
  );
}

ShoppingOrderDetailsView.propTypes = {
  orderDetails: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orderDate: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    totalAmount: PropTypes.number,
    paymentMethod: PropTypes.string,
    paymentStatus: PropTypes.string,
    orderStatus: PropTypes.string,
    orderItems: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        quantity: PropTypes.number,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        image: PropTypes.string,
        selectedSize: PropTypes.string,
        product: PropTypes.shape({
          title: PropTypes.string,
        }),
      })
    ),
    addressInfo: PropTypes.shape({
      address: PropTypes.string,
      city: PropTypes.string,
      pincode: PropTypes.string,
      phone: PropTypes.string,
      notes: PropTypes.string,
    }),
  }),
};

export default ShoppingOrderDetailsView;
