import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile   from "@/components/admin-view/product-tile";
import CommonForm         from "@/components/common/form";
import { Button }         from "@/components/ui/button";
import { Input }          from "@/components/ui/input";
import { Label }          from "@/components/ui/label";
import { Skeleton, SkeletonRepeater }       from "@/components/ui/skeleton";
import { useToast }       from "@/components/ui/use-toast";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addProductBasicInfoElements,
  sizeOptionsByCategory,
  tagsByCategory,
  filterOptions,
} from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
  fetchLowStockProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector }               from "react-redux";
import {
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Tag,
  Package,
  ImageIcon,
  DollarSign,
  Info,
} from "lucide-react";

// ── Tag constants — single source of truth ──────────────────────────────────
const TAG_MIN = 1;
const TAG_MAX = 5;

const initialFormData = {
  images:        [],
  title:         "",
  description:   "",
  category:      "",
  brand:         "",
  price:         "",
  salePrice:     "",
  averageReview: 0,
  tags:          [],
};

const emptySizeVariant = { size: "", stock: "", measurements: "" };

// ── Section heading component ────────────────────────────────────────────────
function SectionHeading({ icon: Icon, label, required }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="flex items-center justify-center w-7 h-7 bg-primary border-2 border-border rounded-sm flex-shrink-0"
        style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
      >
        <Icon className="w-3.5 h-3.5 text-primary-foreground" aria-hidden="true" />
      </div>
      <span className="font-heading font-black text-sm tracking-tight">
        {label}
      </span>
      {required && (
        <span className="text-[10px] font-black text-destructive ml-1">
          * Required
        </span>
      )}
    </div>
  );
}

// ── AdminProducts page ────────────────────────────────────────────────────────
function AdminProducts() {
  const [openDialog, setOpenDialog]             = useState(false);
  const [formData, setFormData]                 = useState(initialFormData);
  const [imageFiles, setImageFiles]             = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [sizeVariants, setSizeVariants]         = useState([]);
  const [selectedTags, setSelectedTags]         = useState([]);
  const [tagError, setTagError]                 = useState("");
  const [submitAttempted, setSubmitAttempted]   = useState(false);
  const [currentEditedId, setCurrentEditedId]   = useState(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [productToDelete, setProductToDelete]   = useState(null);

  const [isSubmitting, setIsSubmitting]         = useState(false);

  const [searchTerm, setSearchTerm]             = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterCategory, setFilterCategory]     = useState("all");

  const { productList, lowStockProducts, isLoading } = useSelector((s) => s.adminProducts);
  const dispatch  = useDispatch();
  const { toast } = useToast();
  const dialogRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchLowStockProducts());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  function refreshAll() {
    dispatch(fetchAllProducts());
    dispatch(fetchLowStockProducts());
  }

  // ── Dialog keyboard / scroll lock ────────────────────────────────────────
  useEffect(() => {
    if (!openDialog) return;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleEsc(e) {
      if (e.key === "Escape") closeDialog();
    }
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [openDialog]);

  // ── Suggested sizes for selected category ────────────────────────────────
  const suggestedSizes = sizeOptionsByCategory[formData.category] || [];

  function addSuggestedSize(size) {
    if (sizeVariants.find((v) => v.size === size)) return;
    setSizeVariants((prev) => [...prev, { size, stock: "", measurements: "" }]);
  }

  function addCustomSize() {
    setSizeVariants((prev) => [...prev, { ...emptySizeVariant }]);
  }

  function updateVariant(index, field, value) {
    setSizeVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function removeVariant(index) {
    setSizeVariants((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Tag management ───────────────────────────────────────────────────────
  function addTag(tag) {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    if (selectedTags.includes(trimmed)) {
      toast({ title: "Tag already added", variant: "destructive" });
      return;
    }
    if (selectedTags.length >= TAG_MAX) {
      toast({ title: `Maximum ${TAG_MAX} tags allowed`, variant: "destructive" });
      return;
    }
    setSelectedTags((prev) => [...prev, trimmed]);
    setTagError(""); // clear error when user adds a tag
  }

  function removeTag(tag) {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }

  // handleCustomTagKeyDown removed — custom tag entry is disabled.
  // Tags are strictly restricted to the predefined tagsByCategory taxonomy.

  // ── Dialog open / close ──────────────────────────────────────────────────
  function openDialogFor(product = null) {
    setSubmitAttempted(false);
    setTagError("");
    setOpenDialog(true);

    if (product) {
      setCurrentEditedId(product.id);
      setFormData({
        title:         product.title         || "",
        description:   product.description   || "",
        category:      product.category      || "",
        brand:         product.brand         || "",
        price:         product.price         || "",
        salePrice:     product.salePrice     || "",
        averageReview: product.averageReview || 0,
        images:        product.images        || [],
        tags:          product.tags          || [],
      });
      setSelectedTags(product.tags           || []);
      setUploadedImageUrls(product.images    || []);
      setImageFiles([]);
      setSizeVariants(
        (product.sizeVariants || []).map((v) => ({
          size:         v.size,
          stock:        v.stock,
          measurements: v.measurements || "",
        }))
      );
    } else {
      setCurrentEditedId(null);
      setFormData(initialFormData);
      setImageFiles([]);
      setUploadedImageUrls([]);
      setSizeVariants([]);
      setSelectedTags([]);
    }
  }

  function closeDialog() {
    setOpenDialog(false);
    setCurrentEditedId(null);
    setFormData(initialFormData);
    setImageFiles([]);
    setUploadedImageUrls([]);
    setSizeVariants([]);
    setSelectedTags([]);
    setTagError("");
    setSubmitAttempted(false);
  }

  // ── Validation ───────────────────────────────────────────────────────────
  function isFormValid() {
    return (
      formData.title &&
      formData.category &&
      formData.brand &&
      formData.price &&
      uploadedImageUrls.length > 0 &&
      sizeVariants.length > 0 &&
      sizeVariants.every(
        (v) => v.size && v.stock !== "" && parseInt(v.stock) >= 0
      ) &&
      selectedTags.length >= TAG_MIN &&
      selectedTags.length <= TAG_MAX
    );
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  function onSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);

    // Surface tag error with clear message
    if (selectedTags.length < TAG_MIN) {
      setTagError(`At least ${TAG_MIN} tag is required (max ${TAG_MAX}).`);
      return;
    }
    if (!isFormValid()) return;

    setIsSubmitting(true);
    const payload = {
      ...formData,
      images:       uploadedImageUrls,
      tags:         selectedTags,
      sizeVariants: sizeVariants.map((v) => ({
        size:         v.size,
        stock:        parseInt(v.stock) || 0,
        measurements: v.measurements || null,
      })),
    };

    if (currentEditedId !== null) {
      dispatch(editProduct({ id: currentEditedId, formData: payload })).then((data) => {
        setIsSubmitting(false);
        if (data?.payload?.success) {
          refreshAll();
          closeDialog();
          toast({ title: "Product updated successfully" });
        }
      });
    } else {
      dispatch(addNewProduct(payload)).then((data) => {
        setIsSubmitting(false);
        if (data?.payload?.success) {
          refreshAll();
          closeDialog();
          toast({ title: "Product added successfully" });
        }
      });
    }
  }

  function handleDeleteClick(id) {
    setProductToDelete(id);
  }

  function confirmDelete() {
    if (!productToDelete) return;
    dispatch(deleteProduct(productToDelete)).then((data) => {
      if (data?.payload?.success) refreshAll();
      setProductToDelete(null);
    });
  }

  const displayList   = showLowStockOnly ? (lowStockProducts || []) : (productList || []);
  
  const filteredProducts = useMemo(() => {
    let list = [...displayList];

    if (debouncedSearchTerm.trim()) {
      const q = debouncedSearchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          String(p.id).includes(q)
      );
    }

    if (filterCategory !== "all") {
      list = list.filter((p) => p.category === filterCategory);
    }

    // Sort by newest first (descending by ID if no createdAt available, or by updateDate)
    list.sort((a, b) => {
      const dateA = new Date(a.updateDate || a.createDate || 0).getTime();
      const dateB = new Date(b.updateDate || b.createDate || 0).getTime();
      if (dateA && dateB && dateA !== dateB) return dateB - dateA;
      return (b.id || 0) - (a.id || 0);
    });

    return list;
  }, [displayList, debouncedSearchTerm, filterCategory]);

  const lowStockCount = (lowStockProducts || []).length;
  const tagCount      = selectedTags.length;
  const tagCountColor =
    tagCount === TAG_MAX ? "text-[hsl(var(--neu-yellow))]" :
    tagCount  >= TAG_MIN ? "text-primary" : "text-muted-foreground";

  return (
    <Fragment>
      {/* ── Header bar ───────────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black">Products</h2>
          {lowStockCount > 0 && (
            <button
              onClick={() => setShowLowStockOnly((s) => !s)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-all ${
                showLowStockOnly
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {lowStockCount} Low Stock{showLowStockOnly ? " — Show All" : ""}
            </button>
          )}
        </div>

        {/* Add New Product button — Neubrutalist */}
        <button
          onClick={() => openDialogFor()}
          className="neu-btn-primary px-5 py-2.5 text-sm"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add New Product
        </button>
      </div>

      {/* ── Filters bar ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search products by name, ID, or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-[300px] border-2 border-border rounded-sm focus-visible:ring-0 focus-visible:border-primary neu-input"
          style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger
            className="w-full sm:w-[200px] border-2 border-border rounded-sm font-black focus:ring-0 focus:border-primary bg-background"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          >
            <SelectValue placeholder="Filter Category" />
          </SelectTrigger>
          <SelectContent className="border-2 border-border rounded-sm font-bold shadow-[4px_4px_0px_0px_hsl(var(--neu-black))] cursor-pointer">
            <SelectItem className="cursor-pointer" value="all">All Categories</SelectItem>
            {filterOptions.category.map((cat) => (
              <SelectItem className="cursor-pointer" key={cat.id} value={cat.id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          <SkeletonRepeater count={8} className="h-[420px] w-full rounded-sm border-2 border-border" />
        ) : filteredProducts.length > 0
          ? filteredProducts.map((productItem) => (
              <AdminProductTile
                key={productItem.id}
                setFormData={(p) => openDialogFor(p)}
                setOpenCreateProductsDialog={setOpenDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDeleteClick}
              />
            ))
          : (
            <div className="col-span-full text-center py-20 text-muted-foreground font-bold">
              {showLowStockOnly
                ? "No low-stock products 🎉"
                : "No products yet. Add your first product!"}
            </div>
          )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          PRODUCT CREATE / EDIT DIALOG — Neubrutalist centered modal
          Replaces the old slide-over Sheet.
          ════════════════════════════════════════════════════════════════════ */}
      {openDialog && (
        <div
          ref={overlayRef}
          onClick={(e) => { if (e.target === overlayRef.current) closeDialog(); }}
          role="presentation"
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto"
          style={{ background: "hsl(var(--neu-black) / 0.65)" }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={currentEditedId ? "Edit Product" : "Add New Product"}
            tabIndex={-1}
            className="relative w-full max-w-2xl bg-card border-2 border-border rounded-sm outline-none animate-modal-in my-4"
            style={{ boxShadow: "8px 8px 0px 0px hsl(var(--neu-black))" }}
          >
            {/* ── Dialog header ───────────────────────────────────────── */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b-2 border-border bg-card rounded-t-sm">
              <div>
                <h2 className="font-heading font-black text-lg tracking-tight">
                  {currentEditedId !== null ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-xs text-muted-foreground font-bold mt-0.5">
                  Fields marked <span className="text-destructive">*</span> are required
                </p>
              </div>
              <button
                onClick={closeDialog}
                aria-label="Close dialog"
                className="flex items-center justify-center w-9 h-9 border-2 border-border rounded-sm bg-background transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* ── Scrollable form body ─────────────────────────────────── */}
            <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-12rem)]">

              {/* ── SECTION 1: Images ───────────────────────────────── */}
              <section aria-label="Product images">
                <SectionHeading icon={ImageIcon} label="Product Images" required />
                <div className="border-2 border-border rounded-sm p-1" style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}>
                  <ProductImageUpload
                    imageFiles={imageFiles}
                    setImageFiles={setImageFiles}
                    uploadedImageUrls={uploadedImageUrls}
                    setUploadedImageUrls={setUploadedImageUrls}
                    setImageLoadingState={setImageLoadingState}
                    imageLoadingState={imageLoadingState}
                    isEditMode={currentEditedId !== null}
                    title="Product Images"
                    helpText="(First image is cover. Optimal: 1600x2000px, 4:5)"
                  />
                </div>
                {submitAttempted && uploadedImageUrls.length === 0 && (
                  <p className="text-xs text-destructive font-bold mt-1.5">
                    At least one product image is required.
                  </p>
                )}
              </section>

              {/* ── SECTION 2: Basic Info ───────────────────────────── */}
              <section aria-label="Basic product information">
                <SectionHeading icon={Info} label="Basic Info" required />
                <div className="border-2 border-border rounded-sm p-4" style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}>
                  <CommonForm
                    onSubmit={(e) => e.preventDefault()}
                    formData={formData}
                    setFormData={setFormData}
                    buttonText={null}
                    formControls={addProductBasicInfoElements}
                    isBtnDisabled={true}
                  />
                </div>
              </section>

              {/* ── SECTION 3: Pricing ──────────────────────────────── */}
              <section aria-label="Product pricing">
                <SectionHeading icon={DollarSign} label="Pricing" required />
                <div
                  className="grid grid-cols-2 gap-3 border-2 border-border rounded-sm p-4"
                  style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                >
                  <div>
                    <Label className="text-xs font-black mb-1.5 block">
                      Price <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.price}
                        onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
                        className="neu-input pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-black mb-1.5 block">
                      Sale Price <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.salePrice}
                        onChange={(e) => setFormData((f) => ({ ...f, salePrice: e.target.value }))}
                        className="neu-input pl-7"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── SECTION 4: Size & Stock ─────────────────────────── */}
              <section aria-label="Size variants and stock">
                <SectionHeading icon={Package} label="Sizes & Stock" required />
                <div
                  className="border-2 border-border rounded-sm p-4 space-y-4"
                  style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                >
                  {/* Suggested quick-add chips */}
                  {suggestedSizes.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-bold">
                        Quick-add sizes for <strong>{formData.category || "your category"}</strong>:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedSizes.map((size) => {
                          const already = sizeVariants.find((v) => v.size === size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => addSuggestedSize(size)}
                              disabled={!!already}
                              className={`text-xs px-2.5 py-1 rounded-sm border-2 font-bold transition-all ${
                                already
                                  ? "bg-primary text-primary-foreground border-border opacity-70 cursor-not-allowed"
                                  : "border-border hover:bg-primary hover:text-primary-foreground hover:border-border"
                              }`}
                              style={{ boxShadow: already ? "none" : "1px 1px 0px 0px hsl(var(--neu-black))" }}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Variant rows */}
                  {sizeVariants.length > 0 && (
                    <div className="space-y-2">
                      {sizeVariants.map((variant, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr_80px_auto] gap-2 items-center p-3 rounded-sm bg-muted/30 border-2 border-border"
                          style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
                        >
                          <div className="space-y-1.5">
                            <Input
                              value={variant.size}
                              onChange={(e) => updateVariant(index, "size", e.target.value)}
                              placeholder="Size (e.g. M, UK 9)"
                              className="h-8 text-sm font-bold"
                            />
                            <Input
                              value={variant.measurements}
                              onChange={(e) => updateVariant(index, "measurements", e.target.value)}
                              placeholder='Measurements (e.g. Chest 40")'
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, "stock", e.target.value)}
                              placeholder="Qty"
                              className="h-8 text-sm text-center font-black"
                            />
                            <span className="text-[10px] text-muted-foreground font-bold">stock</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            aria-label={`Remove size ${variant.size}`}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="w-full py-2 text-sm font-black border-2 border-dashed border-border rounded-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Add Custom Size
                  </button>

                  {submitAttempted && sizeVariants.length === 0 && (
                    <p className="text-xs text-destructive font-bold">
                      At least one size variant is required.
                    </p>
                  )}
                </div>
              </section>

              {/* ── SECTION 5: Tags (REQUIRED, 1–5) ─────────────────── */}
              <section aria-label="Product tags">
                <SectionHeading icon={Tag} label="Tags" required />
                <div
                  className={`border-2 rounded-sm p-4 space-y-3 transition-colors ${
                    tagError ? "border-destructive" : "border-border"
                  }`}
                  style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                >
                  {/* Tag count + header */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-bold">
                      {formData.category
                        ? <>Select from <strong className="text-foreground">{formData.category}</strong> tags below. <span className="text-foreground">1–5 required.</span></>
                        : <span className="text-foreground">Select a category above first.</span>}
                    </p>
                    <span
                      className={`text-xs font-black tabular-nums ${tagCountColor}`}
                      aria-live="polite"
                    >
                      {tagCount}/{TAG_MAX}
                    </span>
                  </div>

                  {/* Selected tag chips */}
                  {selectedTags.length > 0 && (
                    <div
                      className="flex flex-wrap gap-1.5 p-2 bg-muted/20 border-2 border-border rounded-sm"
                      aria-label="Selected tags"
                    >
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-sm border-2 border-border bg-primary text-primary-foreground"
                          style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
                        >
                          {tag}
                          <button
                            type="button"
                            aria-label={`Remove tag: ${tag}`}
                            onClick={() => {
                              removeTag(tag);
                              if (selectedTags.length - 1 < TAG_MIN) {
                                setTagError(`At least ${TAG_MIN} tag is required.`);
                              } else {
                                setTagError("");
                              }
                            }}
                            className="hover:opacity-70 transition-opacity ml-0.5"
                          >
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* No category selected — gate message */}
                  {!formData.category && (
                    <div className="py-4 text-center border-2 border-dashed border-border rounded-sm">
                      <p className="text-xs font-black text-muted-foreground">
                        ↑ Select a category in Basic Info to see available tags
                      </p>
                    </div>
                  )}

                  {/* Category tags — only shown when category is selected */}
                  {formData.category && (
                  <div>
                    <p className="text-[11px] text-muted-foreground font-bold mb-2">
                      Available tags for <strong className="text-foreground">{formData.category}</strong>:
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {(tagsByCategory[formData.category] || []).map((tag) => {
                        const isSelected   = selectedTags.includes(tag);
                        const maxReached   = selectedTags.length >= TAG_MAX && !isSelected;
                        return (
                          <button
                            key={tag}
                            type="button"
                            disabled={maxReached}
                            aria-pressed={isSelected}
                            onClick={() => {
                              if (isSelected) {
                                removeTag(tag);
                                if (selectedTags.length - 1 < TAG_MIN) setTagError(`At least ${TAG_MIN} tag is required.`);
                                else setTagError("");
                              } else {
                                addTag(tag);
                              }
                            }}
                            className={`text-xs px-2.5 py-1 rounded-sm border-2 font-bold transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-border"
                                : maxReached
                                ? "opacity-40 cursor-not-allowed border-border"
                                : "border-border hover:bg-primary hover:text-primary-foreground"
                            }`}
                            style={{
                              boxShadow: isSelected ? "none" : "1px 1px 0px 0px hsl(var(--neu-black))",
                            }}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  )} {/* end formData.category guard */}

                  {/* Inline tag validation message */}
                  {tagError && (
                    <p
                      role="alert"
                      className="text-xs text-destructive font-black flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                      {tagError}
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* ── Dialog footer: submit ─────────────────────────────────── */}
            <div className="sticky bottom-0 px-6 py-4 border-t-2 border-border bg-card rounded-b-sm flex items-center gap-3">
              <button
                type="button"
                onClick={closeDialog}
                className="neu-btn-outline px-5 py-2.5 text-sm flex-shrink-0"
              >
                Cancel
              </button>
              <Button
                onClick={onSubmit}
                isLoading={imageLoadingState || isSubmitting}
                className="neu-btn-primary flex-1 py-2.5 h-auto text-sm transition-opacity"
              >
                {imageLoadingState
                  ? "Uploading images…"
                  : currentEditedId !== null
                  ? "Update Product"
                  : "Add Product"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Product?"
        warningText="Deleting this product will automatically CANCEL all active user orders containing it. It will also be permanently removed from all user carts, wishlists, and active collections. This action cannot be undone."
      />
    </Fragment>
  );
}

export default AdminProducts;
