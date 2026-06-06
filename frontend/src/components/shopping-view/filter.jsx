import { filterOptions } from "@/config";
import { Fragment, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import axios from "axios";

function ProductFilter({ filters, handleFilter }) {
  const [filterCounts, setFilterCounts] = useState({});

  useEffect(() => {
    async function fetchFilterCounts() {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + "/api/shop/products/price-range");
        if (res.data.success) {
          setFilterCounts(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch filter counts", err);
      }
    }
    fetchFilterCounts();
  }, []);

  const priceRangeOptions = [
    { id: "0-500", label: "Below Rs.500" },
    { id: "501-1000", label: "Rs.500-1000" },
    { id: "1001-1500", label: "Rs.1001-1500" },
    { id: "1501-2000", label: "Rs.1501-2000" },
    { id: "2001-1000000", label: "Rs.2000+" }
  ];

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
                    {option.label} ({
                      keyItem === "category"
                        ? filterCounts?.categoryCounts?.[option.id] || 0
                        : filterCounts?.brandCounts?.[option.id] || 0
                    })
                  </Label>
                ))}
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}

        {/* Price Range Checkboxes */}
        <div className="pb-4">
          <h3 className="text-base font-bold mb-3">Price</h3>
          <div className="grid gap-2 mt-2">
            {priceRangeOptions.map((option) => (
              <Label key={option.id} className="flex font-medium items-center gap-2 ">
                <Checkbox
                  checked={
                    filters &&
                    Object.keys(filters).length > 0 &&
                    filters["priceRanges"] &&
                    filters["priceRanges"].indexOf(option.id) > -1
                  }
                  onCheckedChange={() => handleFilter("priceRanges", option.id)}
                />
                {option.label} ({filterCounts[option.id] || 0})
              </Label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFilter;
