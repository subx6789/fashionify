import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements, sizeOptionsByCategory, tagsByCategory } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
  fetchLowStockProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, Plus, Trash2, X } from "lucide-react";

const initialFormData = {
  images: [],
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  averageReview: 0,
  tags: [],
};

const emptySizeVariant = { size: "", stock: "", measurements: "" };

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Multi-image state
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);

  // Size variants state
  const [sizeVariants, setSizeVariants] = useState([]);
  // Tags state (max 5)
  const [selectedTags, setSelectedTags] = useState([]);

  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const { productList, lowStockProducts } = useSelector((s) => s.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchLowStockProducts());
  }, [dispatch]);

  // Reload low-stock after any mutation
  function refreshAll() {
    dispatch(fetchAllProducts());
    dispatch(fetchLowStockProducts());
  }

  // Suggested sizes for the selected category
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

  function openSheet(product = null) {
    setOpenCreateProductsDialog(true);
    if (product) {
      setCurrentEditedId(product.id);
      setFormData({
        title: product.title || "",
        description: product.description || "",
        category: product.category || "",
        brand: product.brand || "",
        price: product.price || "",
        salePrice: product.salePrice || "",
        averageReview: product.averageReview || 0,
        images: product.images || [],
        tags: product.tags || [],
      });
      setSelectedTags(product.tags || []);
      setUploadedImageUrls(product.images || []);
      setImageFiles([]);
      setSizeVariants(
        (product.sizeVariants || []).map((v) => ({
          size: v.size,
          stock: v.stock,
          measurements: v.measurements || "",
        }))
      );
    } else {
      setSelectedTags([]);
    }
  }

  function closeSheet() {
    setOpenCreateProductsDialog(false);
    setCurrentEditedId(null);
    setFormData(initialFormData);
    setImageFiles([]);
    setUploadedImageUrls([]);
    setSizeVariants([]);
    setSelectedTags([]);
  }

  function onSubmit(event) {
    event.preventDefault();

    const payload = {
      ...formData,
      images: uploadedImageUrls,
      tags: selectedTags,
      sizeVariants: sizeVariants.map((v) => ({
        size: v.size,
        stock: parseInt(v.stock) || 0,
        measurements: v.measurements || null,
      })),
    };

    if (currentEditedId !== null) {
      dispatch(editProduct({ id: currentEditedId, formData: payload })).then((data) => {
        if (data?.payload?.success) {
          refreshAll();
          closeSheet();
          toast({ title: "Product updated successfully" });
        }
      });
    } else {
      dispatch(addNewProduct(payload)).then((data) => {
        if (data?.payload?.success) {
          refreshAll();
          closeSheet();
          toast({ title: "Product added successfully" });
        }
      });
    }
  }

  function handleDelete(id) {
    dispatch(deleteProduct(id)).then((data) => {
      if (data?.payload?.success) refreshAll();
    });
  }

  function isFormValid() {
    return (
      formData.title &&
      formData.category &&
      formData.brand &&
      formData.price &&
      uploadedImageUrls.length > 0 &&
      sizeVariants.length > 0 &&
      sizeVariants.every((v) => v.size && v.stock !== "" && parseInt(v.stock) >= 0)
    );
  }

  const displayList = showLowStockOnly
    ? (lowStockProducts || [])
    : (productList || []);

  const lowStockCount = (lowStockProducts || []).length;

  return (
    <Fragment>
      {/* Header bar */}
      <div className="mb-5 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Products</h2>
          {lowStockCount > 0 && (
            <button
              onClick={() => setShowLowStockOnly((s) => !s)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-all ${showLowStockOnly
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {lowStockCount} Low Stock{showLowStockOnly ? " — Show All" : ""}
            </button>
          )}
        </div>
        <Button onClick={() => openSheet()}>Add New Product</Button>
      </div>

      {/* Product grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {displayList.length > 0
          ? displayList.map((productItem) => (
            <AdminProductTile
              key={productItem.id}
              setFormData={(p) => openSheet(p)}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
              product={productItem}
              handleDelete={handleDelete}
            />
          ))
          : (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              {showLowStockOnly ? "No low-stock products 🎉" : "No products yet. Add your first product!"}
            </div>
          )}
      </div>

      {/* Create / Edit Sheet */}
      <Sheet open={openCreateProductsDialog} onOpenChange={closeSheet}>
        <SheetContent side="right" className="overflow-auto w-full sm:max-w-lg">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>

          {/* Multi-image upload */}
          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={false}
          />

          {/* Core product fields */}
          <div className="py-4">
            <CommonForm
              onSubmit={(e) => e.preventDefault()}
              formData={formData}
              setFormData={setFormData}
              buttonText={null}
              formControls={addProductFormElements}
              isBtnDisabled={true}
            />
          </div>

          {/* Size Variant Manager */}
          <div className="mb-6">
            <Label className="text-base font-semibold mb-3 block">
              Size & Stock
            </Label>

            {/* Suggested sizes */}
            {suggestedSizes.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Quick-add sizes for <strong>{formData.category}</strong>:
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
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${already
                            ? "bg-primary text-primary-foreground border-primary-border opacity-70 cursor-not-allowed"
                            : "border-border hover:border-primary-border hover:text-primary hover:bg-primary/5 dark:hover:bg-primary-dark/20"
                          }`}
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
              <div className="space-y-2 mb-3">
                {sizeVariants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_80px_auto] gap-2 items-center p-3 rounded-xl bg-muted/30 border border-border"
                  >
                    <div className="space-y-1.5">
                      <Input
                        value={variant.size}
                        onChange={(e) => updateVariant(index, "size", e.target.value)}
                        placeholder="Size (e.g. M, UK 9)"
                        className="h-8 text-sm"
                      />
                      <Input
                        value={variant.measurements}
                        onChange={(e) => updateVariant(index, "measurements", e.target.value)}
                        placeholder="Measurements (optional, e.g. Chest 40&quot;)"
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
                        className="h-8 text-sm text-center"
                      />
                      <span className="text-[10px] text-muted-foreground">stock</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomSize}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Custom Size
            </Button>
          </div>

          {/* Tag Picker */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-semibold">Tags</Label>
              <span className="text-xs text-muted-foreground">{selectedTags.length}/5 selected</span>
            </div>

            {/* Selected tags chips */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs bg-primary/10 dark:bg-primary-dark/40 text-primary-dark dark:text-primary-soft px-2.5 py-1 rounded-full font-medium border border-primary-border dark:border-primary-border"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Available tags based on category */}
            <p className="text-xs text-muted-foreground mb-2">
              {formData.category
                ? `Suggested tags for ${formData.category}:`
                : "Select a category first to see tag suggestions."}
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {(tagsByCategory[formData.category] || []).map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const maxReached = selectedTags.length >= 5 && !isSelected;
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={maxReached}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags((prev) => prev.filter((t) => t !== tag));
                      } else if (selectedTags.length < 5) {
                        setSelectedTags((prev) => [...prev, tag]);
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${isSelected
                        ? "bg-primary text-primary-foreground border-primary-border"
                        : maxReached
                          ? "opacity-40 cursor-not-allowed border-border"
                          : "border-border hover:border-primary-border hover:text-primary hover:bg-primary/5 dark:hover:bg-primary-dark/20"
                      }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={onSubmit}
            disabled={!isFormValid() || imageLoadingState}
            className="w-full"
          >
            {currentEditedId !== null ? "Update Product" : "Add Product"}
          </Button>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
