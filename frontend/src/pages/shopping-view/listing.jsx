/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: listing.jsx
 * Purpose: Full page React view rendering a distinct route in the application.
 * Functions/Methods: 11
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import ProductFilter from "@/components/shopping-view/filter";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductCardSkeleton from "@/components/shopping-view/product-card-skeleton";
import PaginationBar from "@/components/ui/pagination-bar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";

import { ArrowUpDownIcon, SlidersHorizontal } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import useShopCartStore from "@/store/useShopCartStore";
import useShopProductsStore from "@/store/useShopProductsStore";
import useAuthStore from "@/store/useAuthStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthModal } from "@/context/AuthModalContext";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      queryParams.push(`${key}=${encodeURIComponent(value.join(","))}`);
    } else if (value !== null && value !== "" && !Array.isArray(value)) {
      queryParams.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return queryParams.join("&");
}

function ShoppingListing() {
  const productList = useShopProductsStore((state) => state.productList);
  const isLoading = useShopProductsStore((state) => state.isLoading);
  const currentPage = useShopProductsStore((state) => state.currentPage);
  const totalPages = useShopProductsStore((state) => state.totalPages);
  const totalProducts = useShopProductsStore((state) => state.totalProducts);
  const fetchAllFilteredProducts = useShopProductsStore((state) => state.fetchAllFilteredProducts);
  
  const cartItems = useShopCartStore((state) => state.cartItems);
  const addToCart = useShopCartStore((state) => state.addToCart);
  const fetchCartItems = useShopCartStore((state) => state.fetchCartItems);
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(0);
  const [openFilterSheet, setOpenFilterSheet] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();

  const categorySearchParam = searchParams.get("category");

  function handleSort(value) {
    setSort(value);
    setPage(0); // Reset to first page on sort change
  }

  function handleFilter(getSectionId, getCurrentOption) {
    setFilters((prevFilters) => {
      let cpyFilters = { ...prevFilters };
      
      // For non-array filters (size)
      if (getSectionId === "inStockSize") {
        if (getCurrentOption !== null && getCurrentOption !== undefined && getCurrentOption !== "") {
          cpyFilters[getSectionId] = getCurrentOption;
        } else {
          delete cpyFilters[getSectionId];
        }
      } else {
        const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);

        if (indexOfCurrentSection === -1) {
          cpyFilters = { ...cpyFilters, [getSectionId]: [getCurrentOption] };
        } else {
          const indexOfCurrentOption = cpyFilters[getSectionId].indexOf(getCurrentOption);
          if (indexOfCurrentOption === -1) cpyFilters[getSectionId].push(getCurrentOption);
          else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
          if (cpyFilters[getSectionId].length === 0) {
            delete cpyFilters[getSectionId];
          }
        }
      }

      sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
      return cpyFilters;
    });
    
    setPage(0); // Reset to first page on filter change
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    if (!isAuthenticated) {
      openAuthModal("login", { action: "addToCart", productId: getCurrentProductId });
      return;
    }

    let getCartItems = cartItems.items || [];
    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 })
      .then((data) => {
        if (data?.payload?.success) {
          fetchCartItems(user?.id);
          toast({ title: "Product is added to cart" });
        }
      });
  }

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
    setPage(0);
  }, [categorySearchParam]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters, setSearchParams]);

  useEffect(() => {
    if (filters !== null && sort !== null) {
      fetchAllFilteredProducts({ filterParams: filters, sortParams: sort, page, size: 8 });
    }
  }, [fetchAllFilteredProducts, sort, filters, page]);

  // Count active filters for the badge
  const activeFiltersCount = Object.keys(filters).reduce((acc, key) => {
    if (Array.isArray(filters[key])) return acc + filters[key].length;
    if (filters[key]) return acc + 1;
    return acc;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr] gap-4 md:gap-6 p-3 sm:p-4 md:p-6"
    >
      {/* Desktop Sidebar Filter */}
      <div className="hidden md:block">
        <ProductFilter filters={filters} handleFilter={handleFilter} />
      </div>

      <div className="bg-background w-full rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold">All Products</h2>
            {!isLoading && (
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                {totalProducts} products · Page {currentPage + 1} of {totalPages || 1}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Filter Drawer Trigger */}
            <div className="md:hidden">
              <Sheet open={openFilterSheet} onOpenChange={setOpenFilterSheet}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs font-bold">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 bg-primary text-primary-foreground text-[10px] rounded-full font-black">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:max-w-sm p-0 overflow-y-auto">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-base font-extrabold text-left">Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="p-2">
                    <ProductFilter filters={filters} handleFilter={handleFilter} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs font-bold">
                  <ArrowUpDownIcon className="h-3.5 w-3.5" />
                  <span>Sort by</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem value={sortItem.id} key={sortItem.id}>
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : productList && productList.length > 0
            ? productList.map((productItem) => (
                <ShoppingProductTile
                  key={productItem.id}
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                />
              ))
            : (
              <div className="col-span-full py-20 flex flex-col items-center gap-3 text-muted-foreground">
                <span className="text-4xl">🔍</span>
                <p className="font-medium">No products found</p>
                <p className="text-sm">Try adjusting your filters or search terms.</p>
              </div>
            )}
        </div>

        {/* Pagination */}
        {!isLoading && (
          <div className="px-3 sm:px-4 pb-6">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ShoppingListing;
