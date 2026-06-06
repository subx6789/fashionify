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
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  const dispatch = useDispatch();
  const { productList, isLoading, currentPage, totalPages, totalProducts } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(0);
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

    dispatch(addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
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
  }, [filters]);

  useEffect(() => {
    if (filters !== null && sort !== null) {
      dispatch(fetchAllFilteredProducts({ filterParams: filters, sortParams: sort, page, size: 8 }));
    }
  }, [dispatch, sort, filters, page]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 p-4 md:p-6"
    >
      <ProductFilter filters={filters} handleFilter={handleFilter} />

      <div className="bg-background w-full rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">All Products</h2>
            {!isLoading && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalProducts} products · Page {currentPage + 1} of {totalPages || 1}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowUpDownIcon className="h-4 w-4" />
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

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
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
          <div className="px-4 pb-6">
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
