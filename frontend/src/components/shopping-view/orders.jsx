/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: orders.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 2
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { useEffect, useState, useMemo } from "react";
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
import ShoppingOrderDetailsView from "./order-details";
import useShopOrderStore from "@/store/useShopOrderStore";
import useAuthStore from "@/store/useAuthStore";
import { Badge } from "../ui/badge";
import CancelOrderButton from "./CancelOrderButton";

function formatDate(orderDate) {
  if (!orderDate) return "N/A";
  if (Array.isArray(orderDate)) {
    return `${orderDate[0]}-${String(orderDate[1]).padStart(2, "0")}-${String(orderDate[2]).padStart(2, "0")}`;
  }
  if (typeof orderDate === "string") {
    return orderDate.split("T")[0];
  }
  return String(orderDate);
}

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const user = useAuthStore((state) => state.user);
  const orderList = useShopOrderStore((state) => state.orderList);
  const orderDetails = useShopOrderStore((state) => state.orderDetails);
  const getOrderDetails = useShopOrderStore((state) => state.getOrderDetails);
  const getAllOrdersByUserId = useShopOrderStore((state) => state.getAllOrdersByUserId);
  const resetOrderDetails = useShopOrderStore((state) => state.resetOrderDetails);

  // Sort orders with the most recently purchased first
  const sortedOrders = useMemo(() => {
    if (!orderList || orderList.length === 0) return [];
    return [...orderList].sort((a, b) => {
      const getTime = (d) => {
        if (!d) return 0;
        if (Array.isArray(d)) {
          return new Date(d[0], (d[1] || 1) - 1, d[2] || 1, d[3] || 0, d[4] || 0, d[5] || 0).getTime();
        }
        return new Date(d).getTime() || 0;
      };
      const timeDiff = getTime(b.orderDate) - getTime(a.orderDate);
      if (timeDiff !== 0 && !isNaN(timeDiff)) return timeDiff;
      return (b.id || 0) - (a.id || 0);
    });
  }, [orderList]);

  function handleFetchOrderDetails(getId) {
    getOrderDetails(getId);
  }

  useEffect(() => {
    if (user?.id) getAllOrdersByUserId(user.id);
  }, [getAllOrdersByUserId, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Single Dialog instance for all orders */}
        <Dialog
          open={openDetailsDialog}
          onOpenChange={() => {
            setOpenDetailsDialog(false);
            resetOrderDetails();
          }}
        >
          <ShoppingOrderDetailsView orderDetails={orderDetails} />
        </Dialog>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden space-y-3">
          {sortedOrders && sortedOrders.length > 0 ? (
            sortedOrders.map((orderItem) => (
              <div
                key={orderItem?.id}
                className="p-3.5 border-2 border-border bg-card rounded-md space-y-2.5 shadow-[2px_2px_0px_0px_hsl(var(--neu-black))]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm">Order #{orderItem?.id}</span>
                  <Badge
                    className={`py-0.5 px-2 text-[10px] uppercase font-black ${
                      orderItem?.orderStatus === "confirmed"
                        ? "bg-green-500 text-white"
                        : orderItem?.orderStatus === "rejected"
                        ? "bg-red-600 text-white"
                        : orderItem?.orderStatus === "delivered"
                        ? "bg-primary text-primary-foreground"
                        : orderItem?.orderStatus === "CANCELLED"
                        ? "bg-gray-300 text-gray-800"
                        : "bg-black text-white"
                    }`}
                  >
                    {orderItem?.orderStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(orderItem?.orderDate)}</span>
                  <span className="font-bold text-foreground text-sm">₹{orderItem?.totalAmount}</span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <Button
                    size="sm"
                    className="flex-1 text-xs py-1.5 h-8 font-bold"
                    onClick={() => handleFetchOrderDetails(orderItem?.id)}
                  >
                    View Details
                  </Button>
                  <CancelOrderButton
                    orderId={orderItem?.id}
                    status={orderItem?.orderStatus}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No orders yet.
            </div>
          )}
        </div>

        {/* Tablet & Desktop View: Table */}
        <div className="hidden sm:block w-full overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Order Price</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders && sortedOrders.length > 0
                ? sortedOrders.map((orderItem) => (
                    <TableRow key={orderItem?.id}>
                      <TableCell className="font-semibold">{orderItem?.id}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(orderItem?.orderDate)}</TableCell>
                      <TableCell>
                        <Badge
                          className={`py-1 px-3 ${
                            orderItem?.orderStatus === "confirmed"
                              ? "bg-green-500 text-white"
                              : orderItem?.orderStatus === "rejected"
                              ? "bg-red-600 text-white"
                              : orderItem?.orderStatus === "delivered"
                              ? "bg-primary text-primary-foreground"
                              : orderItem?.orderStatus === "CANCELLED"
                              ? "bg-gray-300 text-gray-800"
                              : "bg-black text-white"
                          }`}
                        >
                          {orderItem?.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold whitespace-nowrap">₹{orderItem?.totalAmount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="whitespace-nowrap text-xs"
                            onClick={() => handleFetchOrderDetails(orderItem?.id)}
                          >
                            View Details
                          </Button>
                          <CancelOrderButton
                            orderId={orderItem?.id}
                            status={orderItem?.orderStatus}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
