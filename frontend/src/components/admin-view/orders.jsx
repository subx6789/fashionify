/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: orders.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 6
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
import AdminOrderDetailsView from "./order-details";

import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import useAdminOrderStore from "@/store/useAdminOrderStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonRepeater } from "../ui/skeleton";
import ORDER_STATUSES from "@/config/order-status.json";

const STATUS_STYLES = {
  confirmed: "bg-[#86efac] text-green-950",
  rejected: "bg-[#fca5a5] text-red-950",
  CANCELLED: "bg-[#fca5a5] text-red-950",
  pending_payment: "bg-[#fde047] text-yellow-950",
  pending: "bg-[#fde047] text-yellow-950",
  inProcess: "bg-[#93c5fd] text-blue-950",
  inShipping: "bg-[#d8b4fe] text-purple-950",
  delivered: "bg-[#34d399] text-emerald-950",
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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const orderList = useAdminOrderStore((s) => s.orderList);
  const orderDetails = useAdminOrderStore((s) => s.orderDetails);
  const isLoading = useAdminOrderStore((s) => s.isLoading);
  const getOrderDetailsForAdmin = useAdminOrderStore((s) => s.getOrderDetailsForAdmin);
  const getAllOrdersForAdmin = useAdminOrderStore((s) => s.getAllOrdersForAdmin);
  const resetOrderDetails = useAdminOrderStore((s) => s.resetOrderDetails);

  // Debounce search term by 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredOrders = useMemo(() => {
    if (!orderList) return [];

    let filtered = [...orderList];

    // Sort newest first (handles Array dates from Jackson, ISO string, and ID fallback)
    filtered.sort((a, b) => {
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

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (order) => (order.orderStatus || "").toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Filter by search term
    if (debouncedSearch.trim()) {
      const lower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          String(order.id).includes(lower) ||
          (order.user?.userName || "").toLowerCase().includes(lower) ||
          (order.user?.email || "").toLowerCase().includes(lower)
      );
    }

    return filtered;
  }, [orderList, filterStatus, debouncedSearch]);

  function handleFetchOrderDetails(getId) {
    getOrderDetailsForAdmin(getId);
  }

  useEffect(() => {
    getAllOrdersForAdmin();
  }, [getAllOrdersForAdmin]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card className="bg-card border-2 border-border rounded-sm" style={{ boxShadow: "4px 4px 0px 0px hsl(var(--neu-black))" }}>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-border pb-4 mb-4">
        <CardTitle className="font-heading font-black text-2xl tracking-tight">Orders ({filteredOrders?.length || 0})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[250px] border-2 border-border rounded-sm focus-visible:ring-0 focus-visible:border-primary"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger
              className="w-full sm:w-[180px] border-2 border-border rounded-sm font-black focus:ring-0 focus:border-primary"
              style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
            >
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="border-2 border-border rounded-sm font-bold shadow-[4px_4px_0px_0px_hsl(var(--neu-black))] cursor-pointer">
              <SelectItem className="cursor-pointer" value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map(status => (
                <SelectItem className="cursor-pointer" key={status.id} value={status.id}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile View: Cards */}
        <div className="block sm:hidden space-y-3">
          {isLoading ? (
            <SkeletonRepeater count={4} className="h-36 w-full rounded-sm border-2 border-border" />
          ) : filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((orderItem) => (
              <div
                key={orderItem?.id}
                className="p-3.5 border-2 border-border bg-card rounded-sm space-y-2.5 shadow-[2px_2px_0px_0px_hsl(var(--neu-black))]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm">#{orderItem?.id}</span>
                  <Badge
                    className={`py-0.5 px-2 border-2 border-border font-black text-[10px] uppercase tracking-wider ${STATUS_STYLES[orderItem?.orderStatus] || "bg-slate-300 text-slate-900"}`}
                  >
                    {orderItem?.orderStatus?.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div className="text-xs">
                  <span className="font-black text-foreground block">
                    {orderItem?.user?.userName || "—"}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {orderItem?.user?.email || ""}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                  <span className="font-bold text-muted-foreground">{formatDate(orderItem?.orderDate)}</span>
                  <span className="font-black text-foreground text-sm">₹{orderItem?.totalAmount}</span>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleFetchOrderDetails(orderItem?.id)}
                  className="neu-btn-primary w-full py-1.5 h-8 text-xs font-bold"
                >
                  View Details
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No orders found.
            </div>
          )}
        </div>

        {/* Tablet & Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto border-2 border-border rounded-sm" style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}>
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
              {isLoading ? (
                <SkeletonRepeater count={5}>
                  {() => (
                    <TableRow>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 rounded-md" /></TableCell>
                    </TableRow>
                  )}
                </SkeletonRepeater>
              ) : filteredOrders && filteredOrders.length > 0
                ? filteredOrders.map((orderItem) => (
                  <TableRow key={orderItem?.id} className="border-b-2 border-border hover:bg-muted/30">
                    <TableCell className="font-mono font-black text-xs">#{orderItem?.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-sm">
                          {orderItem?.user?.userName || "—"}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {orderItem?.user?.email || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold">{formatDate(orderItem?.orderDate)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 border-2 border-border font-black text-[10px] uppercase tracking-wider ${STATUS_STYLES[orderItem?.orderStatus] || "bg-slate-300 text-slate-900"}`}
                        style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
                      >
                        {orderItem?.orderStatus?.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black uppercase tracking-wider border-2 border-border bg-muted px-2 py-1 rounded-sm shadow-[1px_1px_0px_0px_hsl(var(--neu-black))]">
                        {orderItem?.paymentMethod?.replace(/_/g, " ") || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="font-black">
                      ₹{orderItem?.totalAmount}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleFetchOrderDetails(orderItem?.id)}
                        className="neu-btn-primary py-1 h-8 text-xs px-3"
                      >
                        View Details
                      </Button>
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
        <Dialog
          open={openDetailsDialog}
          onOpenChange={(open) => {
            if (!open) {
              setOpenDetailsDialog(false);
              resetOrderDetails();
            }
          }}
        >
          <AdminOrderDetailsView orderDetails={orderDetails} />
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
