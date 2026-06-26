/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: order-details.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 5
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CommonForm from "../common/form";
import { DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { useToast } from "../ui/use-toast";
import { Calendar, CreditCard, Package, MapPin, ClipboardList } from "lucide-react";
import ORDER_STATUSES from "@/config/order-status.json";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { productList } = useSelector((state) => state.adminProducts);

  useEffect(() => {
    if (orderDetails && (!productList || productList.length === 0)) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, orderDetails, productList]);

  useEffect(() => {
    if (orderDetails?.orderStatus) {
      setFormData({
        status: orderDetails.orderStatus,
      });
    }
  }, [orderDetails]);

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    if (!status || status.trim() === "") {
      toast({
        title: "Please select a valid status.",
        variant: "destructive",
      });
      return;
    }

    if (status === orderDetails?.orderStatus) {
      toast({
        title: "Order is already in this status.",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      updateOrderStatus({ id: orderDetails?.id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?.id));
        toast({
          title: data?.payload?.message || "Order status updated!",
        });
      }
    });
  }

  function formatPaymentMethod(method) {
    if (!method) return "N/A";
    if (method === "simulated_cod") return "Cash on Delivery";
    return method.toUpperCase();
  }

  function formatStatus(status) {
    if (!status) return "N/A";
    if (status === "inProcess") return "In Process";
    if (status === "inShipping") return "In Shipping";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  return (
    <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl p-6">
      <DialogDescription className="sr-only">
        Admin view of order details including items, pricing, shipping address, and status update options.
      </DialogDescription>
      <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center justify-between border-b border-border pb-4 mb-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <span>Order Details</span>
        </div>
        <span className="text-sm font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
          ID: #{orderDetails?.id}
        </span>
      </DialogTitle>

      <div className="grid gap-6 mt-4">
        {/* General Metadata Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-xl border border-border/60">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Order Date
            </span>
            <p className="text-sm font-semibold text-foreground">
              {Array.isArray(orderDetails?.orderDate)
                ? `${orderDetails.orderDate[0]}-${String(orderDetails.orderDate[1]).padStart(2, '0')}-${String(orderDetails.orderDate[2]).padStart(2, '0')}`
                : orderDetails?.orderDate?.split("T")[0] || 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              ₹ Total Price
            </span>
            <p className="text-sm font-bold text-foreground">₹{orderDetails?.totalAmount}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" /> Payment Method
            </span>
            <p className="text-sm font-semibold text-foreground">{formatPaymentMethod(orderDetails?.paymentMethod)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payment Status</span>
            <div>
              <Badge className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${orderDetails?.paymentStatus === "paid" || orderDetails?.paymentStatus === "simulated_paid"
                  ? "bg-green-500/10 text-green-700 border-green-500/20"
                  : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                }`}>
                {orderDetails?.paymentStatus === "simulated_paid" ? "Paid" : orderDetails?.paymentStatus}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Order Status</span>
            <div>
              <Badge className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${orderDetails?.orderStatus === "delivered"
                  ? "bg-green-500/10 text-green-700 border-green-500/20"
                  : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-500/10 text-red-700 border-red-500/20"
                    : orderDetails?.orderStatus === "inShipping"
                      ? "bg-purple-500/10 text-purple-700 border-purple-500/20"
                      : orderDetails?.orderStatus === "inProcess"
                        ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                }`}>
                {formatStatus(orderDetails?.orderStatus)}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Order Items Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span>Order Items</span>
          </div>
          <div className="border border-border/80 rounded-xl overflow-hidden bg-card">
            <ul className="divide-y divide-border/60">
              {orderDetails?.orderItems && orderDetails?.orderItems.length > 0 ? (
                orderDetails?.orderItems.map((item) => {
                  const productItem = productList?.find((p) => String(p.id) === String(item.productId));
                  const resolvedImage = item.image || productItem?.images?.[0] || productItem?.image || "";

                  return (
                    <li className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors gap-4" key={item.id || item.title}>
                      <div className="flex items-center gap-4">
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
                        <div className="space-y-0.5">
                          <span className="font-semibold text-sm text-foreground block leading-tight">{item.title || item.product?.title || 'Product'}</span>
                          <p className="text-xs text-muted-foreground font-medium">Product ID: {item.productId || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">Price per item: ₹{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm flex-none">
                        <span className="text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="font-bold text-foreground">₹{item.price * item.quantity}</span>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="p-4 text-center text-sm text-muted-foreground">No items in this order</li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Shipping details and Order update columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>Shipping Details</span>
            </div>
            <div className="border border-border/80 rounded-xl p-4 bg-muted/10 space-y-1.5 text-sm">
              <p className="font-bold text-foreground text-sm flex items-center gap-1.5 mb-2 border-b border-border/40 pb-2">
                <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                {user.userName}
              </p>
              <p className="text-muted-foreground leading-relaxed font-medium">{orderDetails?.addressInfo?.address}</p>
              <p className="text-muted-foreground font-semibold">{orderDetails?.addressInfo?.city} — {orderDetails?.addressInfo?.pincode}</p>
              <p className="text-muted-foreground font-bold pt-1">Phone: {orderDetails?.addressInfo?.phone}</p>
              {orderDetails?.addressInfo?.notes && (
                <div className="mt-3 bg-muted/40 p-2.5 rounded-lg border border-border/40 text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground block mb-0.5">Note from Customer:</span>
                  {orderDetails?.addressInfo?.notes}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Update Order Status</h4>
            <div className="border border-border/80 rounded-xl p-4 bg-card shadow-sm">
              <CommonForm
                formControls={[
                  {
                    label: "Select Status",
                    name: "status",
                    componentType: "select",
                    options: ORDER_STATUSES.filter(status => status.adminSelectable),
                  },
                ]}
                formData={formData}
                setFormData={setFormData}
                buttonText={"Update Status"}
                onSubmit={handleUpdateStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

AdminOrderDetailsView.propTypes = {
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

export default AdminOrderDetailsView;
