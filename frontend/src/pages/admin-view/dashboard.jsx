/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: dashboard.jsx
 * Purpose: Full page React view rendering a distinct route in the application.
 * Functions/Methods: 10
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addFeatureImage, getFeatureImages, deleteFeatureImage, editFeatureImage } from "@/store/common-slice";
import { fetchLowStockProducts } from "@/store/admin/products-slice";
import { fetchAnalytics } from "@/store/admin/analytics-slice";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { AlertTriangle, Package, TrendingUp, ShoppingBag, IndianRupee, Heart, BarChart3, Loader2, Calendar, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton, SkeletonRepeater } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Date helpers ────────────────────────────────────────────────────────────
function toISODate(d) {
  return d.toISOString().split("T")[0];
}

const DATE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom range" },
];

function getPresetRange(id) {
  const now = new Date();
  switch (id) {
    case "today":
      return { start: toISODate(now), end: toISODate(now) };
    case "7d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { start: toISODate(s), end: toISODate(now) };
    }
    case "30d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      return { start: toISODate(s), end: toISODate(now) };
    }
    case "month":
      return {
        start: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: toISODate(now),
      };
    case "year":
      return {
        start: toISODate(new Date(now.getFullYear(), 0, 1)),
        end: toISODate(now),
      };
    default:
      return { start: toISODate(now), end: toISODate(now) };
  }
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, desc, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, prefix = "" }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{ color: entry.color }}>
            {entry.name}: {prefix}{typeof entry.value === "number" ? entry.value.toLocaleString("en-IN") : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [activePreset, setActivePreset] = useState("30d");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const [editingSlide, setEditingSlide] = useState(null);
  const [editDates, setEditDates] = useState({ startDate: "", endDate: "", linkUrl: "" });
  const [slideToDelete, setSlideToDelete] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { lowStockProducts } = useSelector((state) => state.adminProducts);
  const { data: analytics, isLoading: analyticsLoading } = useSelector((state) => state.adminAnalytics);

  const { start, end } = useMemo(() => {
    if (activePreset === "custom") {
      return customRange.start && customRange.end
        ? customRange
        : getPresetRange("today");
    }
    return getPresetRange(activePreset);
  }, [activePreset, customRange]);

  useEffect(() => {
    dispatch(getFeatureImages());
    dispatch(fetchLowStockProducts());
  }, [dispatch]);

  useEffect(() => {
    if (start && end) {
      dispatch(fetchAnalytics({ startDate: start, endDate: end }));
    }
  }, [dispatch, start, end]);

  function handleUploadFeatureImage() {
    const url = uploadedImageUrls[0];
    if (!url) return;
    dispatch(addFeatureImage(url)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFiles([]);
        setUploadedImageUrls([]);
      }
    });
  }

  function confirmDeleteSlide() {
    if (!slideToDelete) return;
    dispatch(deleteFeatureImage(slideToDelete)).then(() => {
      dispatch(getFeatureImages());
      setSlideToDelete(null);
    });
  }

  function handleEditSlide() {
    if (!editingSlide) return;
    dispatch(editFeatureImage({ id: editingSlide.id, ...editDates })).then(() => {
      dispatch(getFeatureImages());
      setEditingSlide(null);
    });
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${(analytics?.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      desc: "From confirmed orders",
      icon: IndianRupee,
      color: "bg-primary",
    },
    {
      title: "Total Orders",
      value: analytics?.totalOrders ?? "—",
      desc: "All orders in period",
      icon: ShoppingBag,
      color: "bg-primary",
    },
    {
      title: "Products Sold",
      value: analytics?.totalProductsSold ?? "—",
      desc: "Units from confirmed orders",
      icon: BarChart3,
      color: "bg-blue-500",
    },
    {
      title: "Avg. Order Value",
      value: `₹${(analytics?.avgOrderValue ?? 0).toLocaleString("en-IN")}`,
      desc: "Per confirmed order",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Wishlist Entries",
      value: analytics?.wishlistCount ?? "—",
      desc: "Total wishlist items",
      icon: Heart,
      color: "bg-primary",
    },
    {
      title: "Total Products",
      value: analytics?.totalProducts ?? "—",
      desc: "Products in catalogue",
      icon: Package,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-lg">Real-time insights from your store.</p>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-wrap gap-2 items-center">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {DATE_PRESETS.filter((p) => p.id !== "custom").map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePreset(p.id);
              setShowCustomPicker(false);
            }}
            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-all ${activePreset === p.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => {
            setActivePreset("custom");
            setShowCustomPicker(true);
          }}
          className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-all ${activePreset === "custom"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
        >
          Custom range
        </button>
        {showCustomPicker && (
          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))}
              className="text-sm border border-border rounded-lg px-2 py-1.5 bg-card text-foreground"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))}
              className="text-sm border border-border rounded-lg px-2 py-1.5 bg-card text-foreground"
            />
          </div>
        )}
        <span className="text-xs text-muted-foreground ml-2">
          {start} → {end}
        </span>
        {analyticsLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {analyticsLoading ? (
          <SkeletonRepeater count={6} className="h-28 w-full rounded-xl" />
        ) : (
          statCards.map((s, i) => (
            <StatCard key={s.title} {...s} delay={i * 0.07} />
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Revenue Over Period</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="w-full h-[240px] rounded-md" />
              ) : analytics?.revenueByDay?.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={analytics.revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v.slice(5)}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip content={<ChartTooltip prefix="₹" />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#9333ea"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                  No revenue data for this period.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Orders Over Period</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="w-full h-[240px] rounded-md" />
              ) : analytics?.ordersByDay?.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analytics.ordersByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v.slice(5)}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} className="text-muted-foreground" />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="orders" name="Orders" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                  No order data for this period.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low-Stock Alert */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alert — {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} running low
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {lowStockProducts.map((p) => {
                  const criticalVariants = (p.sizeVariants || []).filter((v) => v.stock <= 5 && v.stock > 0);
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-none" />
                        <span className="font-semibold text-amber-800 dark:text-amber-300 truncate max-w-[180px]">
                          {p.title}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {criticalVariants.map((v) => (
                          <span
                            key={v.size}
                            className="text-xs bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium"
                          >
                            {v.size}: {v.stock}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:border-amber-600 dark:hover:bg-amber-900/30"
                onClick={() => navigate("/admin/products")}
              >
                Manage Stock →
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Slideshow Management */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Homepage Slideshow Management</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isCustomStyling={true}
            multiple={false}
            title="Upload Banner Image"
            helpText="1 landscape image (optimal: 1920x1080)"
            dropText="Drag & drop or click to upload banner"
            subDropText="Supported formats: JPG, PNG, AVIF (Max 5MB)"
            imageClass="w-full max-w-3xl aspect-[16/9] object-cover rounded-md"
          />
          <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
            Upload Image
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {featureImageList && featureImageList.length > 0
              ? featureImageList.map((featureImgItem, idx) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative overflow-hidden rounded-sm shadow-sm group"
                  key={idx}
                >
                  <img
                    src={featureImgItem.image}
                    className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
                    alt={`Feature ${idx + 1}`}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          setEditingSlide(featureImgItem);
                          setEditDates({
                            startDate: featureImgItem.startDate || "",
                            endDate: featureImgItem.endDate || "",
                            linkUrl: featureImgItem.linkUrl || ""
                          });
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setSlideToDelete(featureImgItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-white font-medium text-xs text-center px-2">
                      {featureImgItem.startDate || featureImgItem.endDate
                        ? `Active: ${featureImgItem.startDate || 'Any'} to ${featureImgItem.endDate || 'Any'}`
                        : 'Always Active'}
                    </span>
                  </div>
                </motion.div>
              ))
              : null}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingSlide} onOpenChange={(open) => !open && setEditingSlide(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slide Active Dates</DialogTitle>
            <DialogDescription className="sr-only">
              Edit start and end dates and optional redirect link for the slideshow banner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={editDates.startDate}
                onChange={(e) => setEditDates(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={editDates.endDate}
                onChange={(e) => setEditDates(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Link URL (Optional)</Label>
              <Input
                type="text"
                placeholder="/shop/listing?category=men"
                value={editDates.linkUrl}
                onChange={(e) => setEditDates(prev => ({ ...prev, linkUrl: e.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">Leave dates empty to make the slide always active. Add a link URL to make the slide clickable.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSlide(null)}>Cancel</Button>
            <Button onClick={handleEditSlide}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={!!slideToDelete}
        onClose={() => setSlideToDelete(null)}
        onConfirm={confirmDeleteSlide}
        title="Delete Feature Image?"
        warningText="Deleting this feature image will instantly remove it from the homepage carousel. This action cannot be undone."
      />
    </div>
  );
}

export default AdminDashboard;
