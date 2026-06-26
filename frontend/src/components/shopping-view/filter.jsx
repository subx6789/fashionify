/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: filter.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 4
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { filterOptions } from "@/config";
import { Fragment, useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { getPriceRange } from "@/services/api";

function ProductFilter({ filters, handleFilter }) {
  const [filterCounts, setFilterCounts] = useState({});
  const [expandedFilters, setExpandedFilters] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const [showSearch, setShowSearch] = useState({});

  useEffect(() => {
    async function fetchFilterCounts() {
      try {
        const res = await getPriceRange();
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

        {Object.keys(filterOptions).map((keyItem) => {
          const isExpanded = expandedFilters[keyItem];
          const options = filterOptions[keyItem];
          const query = searchQueries[keyItem] || "";

          const filteredOptions = options.filter(opt =>
            opt.label.toLowerCase().includes(query.toLowerCase())
          );

          const INITIAL_COUNT = 6;
          const visibleOptions = (isExpanded || query) ? filteredOptions : filteredOptions.slice(0, INITIAL_COUNT);
          const hiddenCount = filteredOptions.length - INITIAL_COUNT;

          return (
            <Fragment key={keyItem}>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold uppercase tracking-wider">{keyItem}</h3>
                  {options.length > INITIAL_COUNT && (
                    <button
                      onClick={() => setShowSearch(prev => ({ ...prev, [keyItem]: !prev[keyItem] }))}
                      className="p-1.5 hover:bg-muted rounded-full transition-colors"
                    >
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {showSearch[keyItem] && (
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder={`Search ${keyItem}...`}
                      value={query}
                      onChange={(e) => setSearchQueries(prev => ({ ...prev, [keyItem]: e.target.value }))}
                      className="w-full bg-muted/50 border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="grid gap-3">
                  {visibleOptions.map((option) => (
                    <Label key={option.id} className="flex font-medium items-center gap-3 cursor-pointer group">
                      <Checkbox
                        checked={
                          filters &&
                          Object.keys(filters).length > 0 &&
                          filters[keyItem] &&
                          filters[keyItem].indexOf(option.id) > -1
                        }
                        onCheckedChange={() => handleFilter(keyItem, option.id)}
                        className="w-5 h-5 rounded-sm"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({
                          keyItem === "category"
                            ? filterCounts?.categoryCounts?.[option.id] || 0
                            : filterCounts?.brandCounts?.[option.id] || 0
                        })
                      </span>
                    </Label>
                  ))}
                </div>

                {!isExpanded && !query && hiddenCount > 0 && (
                  <button
                    className=" dark:text-primary mt-4 text-sm font-bold text-left transition-colors flex items-center"
                    onClick={() => setExpandedFilters(prev => ({ ...prev, [keyItem]: true }))}
                  >
                    + {hiddenCount} more
                  </button>
                )}
                {isExpanded && !query && hiddenCount > 0 && (
                  <button
                    className="text-muted-foreground hover:text-foreground mt-4 text-sm font-bold text-left transition-colors"
                    onClick={() => setExpandedFilters(prev => ({ ...prev, [keyItem]: false }))}
                  >
                    - Show less
                  </button>
                )}
              </div>
              <Separator className="my-6" />
            </Fragment>
          );
        })}

        {/* Price Range Checkboxes */}
        <div className="pb-4">
          <h3 className="text-base font-bold uppercase tracking-wider mb-3">Price</h3>
          <div className="grid gap-3">
            {priceRangeOptions.map((option) => (
              <Label key={option.id} className="flex font-medium items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={
                    filters &&
                    Object.keys(filters).length > 0 &&
                    filters["priceRanges"] &&
                    filters["priceRanges"].indexOf(option.id) > -1
                  }
                  onCheckedChange={() => handleFilter("priceRanges", option.id)}
                  className="w-5 h-5 rounded-sm"
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  ({filterCounts[option.id] || 0})
                </span>
              </Label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFilter;
