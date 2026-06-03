import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>
      <div className="p-4 space-y-6">


        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-base font-bold">{keyItem}</h3>
              <div className="grid gap-2 mt-2">
                {filterOptions[keyItem].map((option) => (
                  <Label key={option.id} className="flex font-medium items-center gap-2 ">
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItem] &&
                        filters[keyItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}

        {/* Price Range */}
        <div>
          <h3 className="text-base font-bold mb-3">Price Range</h3>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Min ₹" 
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filters?.minPrice || ""}
              onChange={(e) => handleFilter("minPrice", e.target.value)}
            />
            <span className="text-muted-foreground">-</span>
            <input 
              type="number" 
              placeholder="Max ₹" 
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filters?.maxPrice || ""}
              onChange={(e) => handleFilter("maxPrice", e.target.value)}
            />
          </div>
        </div>
        <Separator />

        {/* In-Stock Size */}
        <div>
          <h3 className="text-base font-bold mb-3">In-Stock Size</h3>
          <select 
            className="w-full h-9 rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filters?.inStockSize || ""}
            onChange={(e) => handleFilter("inStockSize", e.target.value)}
          >
            <option value="" className="bg-background text-foreground">Any Size</option>
            <option value="XS" className="bg-background text-foreground">XS</option>
            <option value="S" className="bg-background text-foreground">S</option>
            <option value="M" className="bg-background text-foreground">M</option>
            <option value="L" className="bg-background text-foreground">L</option>
            <option value="XL" className="bg-background text-foreground">XL</option>
            <option value="XXL" className="bg-background text-foreground">XXL</option>
            <option value="UK 6" className="bg-background text-foreground">UK 6</option>
            <option value="UK 7" className="bg-background text-foreground">UK 7</option>
            <option value="UK 8" className="bg-background text-foreground">UK 8</option>
            <option value="UK 9" className="bg-background text-foreground">UK 9</option>
            <option value="UK 10" className="bg-background text-foreground">UK 10</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ProductFilter;
