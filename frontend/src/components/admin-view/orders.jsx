import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";

const STATUS_STYLES = {
  confirmed: "bg-green-500",
  rejected: "bg-red-600",
  pending_payment: "bg-amber-500",
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  shipped: "bg-primary",
  delivered: "bg-green-700",
};

function formatDate(orderDate) {
  if (!orderDate) return "N/A";
  if (Array.isArray(orderDate)) {
    return `${orderDate[0]}-${String(orderDate[1]).padStart(2, "0")}-${String(orderDate[2]).padStart(2, "0")}`;
  }
  return orderDate.split("T")[0];
}

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails, isLoading } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle>All Orders ({orderList?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading orders…</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>
                    <span className="sr-only">Details</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderList && orderList.length > 0
                  ? orderList.map((orderItem) => (
                      <TableRow key={orderItem?.id}>
                        <TableCell className="font-mono text-xs">#{orderItem?.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {orderItem?.user?.userName || "—"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {orderItem?.user?.email || ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(orderItem?.orderDate)}</TableCell>
                        <TableCell>
                          <Badge
                            className={`py-1 px-3 text-white ${
                              STATUS_STYLES[orderItem?.orderStatus] || "bg-slate-500"
                            }`}
                          >
                            {orderItem?.orderStatus?.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">
                            {orderItem?.paymentMethod?.replace(/_/g, " ") || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{orderItem?.totalAmount}
                        </TableCell>
                        <TableCell>
                          <Dialog
                            open={openDetailsDialog}
                            onOpenChange={() => {
                              setOpenDetailsDialog(false);
                              dispatch(resetOrderDetails());
                            }}
                          >
                            <Button
                              size="sm"
                              onClick={() => handleFetchOrderDetails(orderItem?.id)}
                            >
                              View Details
                            </Button>
                            <AdminOrderDetailsView orderDetails={orderDetails} />
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
