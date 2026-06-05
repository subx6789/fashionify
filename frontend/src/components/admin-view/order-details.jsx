import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();


  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?.id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        // Optimistic update already applied in the slice — just refresh details
        dispatch(getOrderDetailsForAdmin(orderDetails?.id));
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message || "Order status updated!",
        });
      }
    });
  }

  return (
    <DialogContent aria-describedby={undefined} className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?.id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>
              {Array.isArray(orderDetails?.orderDate)
                ? `${orderDetails.orderDate[0]}-${String(orderDetails.orderDate[1]).padStart(2, '0')}-${String(orderDetails.orderDate[2]).padStart(2, '0')}`
                : orderDetails?.orderDate?.split("T")[0] || 'N/A'}
            </Label>
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
              {orderDetails?.orderItems && orderDetails?.orderItems.length > 0
                ? orderDetails?.orderItems.map((item) => (
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

        <div>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Order Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
