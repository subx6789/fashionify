/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: product-tile.jsx
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

import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { AlertTriangle, Package } from "lucide-react";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const coverImage =
    product?.images?.[0] || product?.image || "/placeholder.png";

  const totalStock = product?.totalStock ?? 0;
  const hasLowStock = product?.hasLowStock || false;
  const isOutOfStock = totalStock === 0;

  const lowStockVariants = (product?.sizeVariants || []).filter(
    (v) => v.stock <= 5 && v.stock > 0
  );

  return (
    <Card className="w-full mx-auto bg-card border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neu-black))] rounded-sm overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(var(--neu-black))]">
      {/* Image area — fixed height */}
      <div className="relative flex-none">
        <img
          src={coverImage}
          alt={product?.title}
          className="w-full h-[260px] object-contain p-4 bg-muted/20 border-b-2 border-border"
        />

        {/* Stock status badges */}
        {isOutOfStock ? (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white font-black border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_hsl(var(--neu-black))]">
            Out Of Stock
          </Badge>
        ) : hasLowStock ? (
          <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 font-black border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_hsl(var(--neu-black))]">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </Badge>
        ) : null}

        {/* Image count indicator */}
        {product?.images?.length > 1 && (
          <div className="absolute top-2 right-2 bg-foreground text-background font-black text-[10px] px-2 py-1 rounded-sm border-2 border-black shadow-[2px_2px_0px_0px_hsl(var(--neu-black))]">
            +{product.images.length - 1} more
          </div>
        )}
      </div>

      {/* Content — grows to fill, footer pinned at bottom */}
      <CardContent className="pt-3 pb-1 flex-1 flex flex-col">
        {/* Title — max 2 lines */}
        <h2
          className="text-base font-black mb-2 line-clamp-2 leading-snug min-h-[2.5rem]"
          title={product?.title}
        >
          {product?.title}
        </h2>

        {/* Prices */}
        <div className="flex justify-between items-center mb-2">
          <span
            className={`${product?.salePrice > 0 ? "line-through text-muted-foreground opacity-70" : "text-foreground"
              } text-sm font-black`}
          >
            ₹{product?.price}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-sm font-black dark:text-primary dark:bg-primary/10 px-2 py-0.5 rounded-sm dark:border-2 dark:border-primary/20">
              ₹{product?.salePrice}
            </span>
          )}
        </div>

        {/* Stock overview */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1">
          <Package className="w-3.5 h-3.5" />
          <span>
            Total Stock:{" "}
            <strong className={isOutOfStock ? "text-red-500 font-black" : "text-foreground font-black"}>
              {totalStock}
            </strong>
          </span>
        </div>

        {/* Low-stock sizes breakdown */}
        {lowStockVariants.length > 0 && (
          <div className="mt-2 p-2 rounded-sm bg-[hsl(var(--neu-yellow)/0.1)] border-2 border-black shadow-[2px_2px_0px_0px_hsl(var(--neu-black))]">
            <p className="text-[11px] font-black text-amber-700 flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3" /> Low stock sizes:
            </p>
            <div className="flex flex-wrap gap-1">
              {lowStockVariants.map((v) => (
                <span
                  key={v.id || v.size}
                  className="text-[10px] bg-background text-foreground px-1.5 py-0.5 rounded-sm font-black border-2 border-black"
                >
                  {v.size}: {v.stock} left
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer always at bottom */}
      <CardFooter className="flex justify-between items-center gap-3 pt-2 pb-4 px-4 border-t-2 border-border mt-auto bg-muted/10">
        <Button
          size="sm"
          className="flex-1 font-black border-2 border-border rounded-sm shadow-[2px_2px_0px_0px_hsl(var(--neu-black))] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_hsl(var(--neu-black))] transition-all bg-background text-foreground hover:bg-muted"
          onClick={() => {
            setOpenCreateProductsDialog(true);
            setCurrentEditedId(product?.id);
            setFormData(product);
          }}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="flex-1 font-black border-2 border-border rounded-sm shadow-[2px_2px_0px_0px_hsl(var(--neu-black))] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_hsl(var(--neu-black))] transition-all"
          onClick={() => handleDelete(product?.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdminProductTile;
