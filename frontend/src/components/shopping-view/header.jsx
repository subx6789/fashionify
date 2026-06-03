import { HousePlug, LogOut, Menu, ShoppingCart, UserCog, ShieldCheck, Heart, Search, User, Sun, Moon, X } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useRef, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { fetchWishlistItems } from "@/store/shop/wishlist-slice";
import { Input } from "../ui/input";
import { useTheme } from "@/components/theme-provider";
import { resetSearchResults } from "@/store/shop/search-slice";

function SearchBar({ isMobile }) {
  const [keyword, setKeyword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const debounceRef = useRef(null);
  const dispatch = useDispatch();

  // Sync input when navigating to/from search page
  useEffect(() => {
    if (location.pathname === "/shop/search") {
      // Only set keyword from URL if it's currently empty, so we don't interrupt active typing
      const urlKeyword = searchParams.get("keyword") || "";
      setKeyword((prev) => prev ? prev : urlKeyword);
    } else {
      setKeyword("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!keyword.trim()) {
      // If user cleared input while on the search page, reset results immediately
      if (location.pathname === "/shop/search") {
        dispatch(resetSearchResults());
        navigate("/shop/search", { replace: true });
      }
      return;
    }

    debounceRef.current = setTimeout(() => {
      navigate(`/shop/search?keyword=${encodeURIComponent(keyword)}`);
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [keyword, navigate, location.pathname, dispatch]);

  function handleClear() {
    setKeyword("");
    dispatch(resetSearchResults());
    if (location.pathname === "/shop/search") {
      navigate("/shop/search", { replace: true });
    }
  }

  return (
    <div className={`relative w-full ${isMobile ? "" : "max-w-xl"}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      <Input
        className="w-full bg-muted/70 border-transparent focus-visible:ring-1 focus-visible:ring-purple-500 pl-11 pr-9 h-10 rounded-md shadow-sm"
        placeholder="Search for products, brands and more"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      {keyword && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search" &&
      getCurrentMenuItem.id !== "about" &&
      getCurrentMenuItem.id !== "contact"
        ? { category: [getCurrentMenuItem.id] }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(new URLSearchParams(`?category=${getCurrentMenuItem.id}`))
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col lg:flex-row gap-6 lg:items-center h-full">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <button
          key={menuItem.id}
          onClick={() => handleNavigate(menuItem)}
          className="text-[13px] font-bold tracking-widest text-foreground/80 hover:text-purple-600 lg:uppercase relative flex items-center h-full group py-3 lg:py-0"
        >
          {menuItem.label}
          {menuItem.badge && (
            <span className="absolute -top-2 -right-7 text-[9px] font-bold text-pink-500 hidden lg:block">
              {menuItem.badge}
            </span>
          )}
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-t-md hidden lg:block" />
        </button>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { wishlistItems } = useSelector((state) => state.shopWishlist);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchCartItems(user?.id));
      dispatch(fetchWishlistItems(user?.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  const isDark = theme === "dark";

  return (
    <div className="flex lg:items-center flex-row gap-4 lg:gap-6">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex flex-col items-center justify-center cursor-pointer group pt-1"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-foreground/90 group-hover:text-yellow-400 transition-colors" />
        ) : (
          <Moon className="h-5 w-5 text-foreground/90 group-hover:text-purple-600 transition-colors" />
        )}
        <span className="text-[11px] font-semibold mt-1 text-foreground/90 group-hover:text-purple-600 transition-colors hidden lg:block">
          {isDark ? "Light" : "Dark"}
        </span>
      </button>

      {/* Profile Icon with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex flex-col items-center justify-center cursor-pointer group pt-1 outline-none">
            {isAuthenticated ? (
              <Avatar className="h-6 w-6 bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/30 transition-transform hover:scale-105 mb-0.5">
                <AvatarImage src={`https://api.dicebear.com/9.x/micah/svg?seed=${user?.avatar || user?.userName || "Fashion"}&backgroundColor=transparent`} alt="User Avatar" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-[10px]">
                  {user?.userName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-5 w-5 text-foreground/90 group-hover:text-purple-600 transition-colors" />
            )}
            <span className="text-[11px] font-semibold mt-1 text-foreground/90 group-hover:text-purple-600 transition-colors hidden lg:block">Profile</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-64 mt-4 border-border shadow-lg p-2 rounded-xl">
          {isAuthenticated ? (
            <>
              <DropdownMenuLabel className="font-bold text-sm">Hello, {user?.userName}</DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem onClick={() => navigate("/shop/account")} className="cursor-pointer font-medium p-3 rounded-lg">
                <UserCog className="mr-3 h-4 w-4" />
                Account
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="cursor-pointer text-indigo-500 font-bold p-3 rounded-lg">
                  <ShieldCheck className="mr-3 h-4 w-4" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer font-medium p-3 rounded-lg">
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            <div className="p-4">
              <DropdownMenuLabel className="font-bold text-sm p-0 mb-1">Welcome</DropdownMenuLabel>
              <p className="text-xs text-muted-foreground mb-4">To access account and manage orders</p>
              <Button onClick={() => navigate("/auth/login")} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-md h-10 font-bold text-xs tracking-wide">
                LOGIN / SIGNUP
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wishlist */}
      <div
        onClick={() => navigate("/shop/wishlist")}
        className="flex flex-col items-center justify-center cursor-pointer group relative pt-1"
      >
        <div className="relative">
          <Heart className="h-5 w-5 text-foreground/90 group-hover:text-pink-500 transition-colors" />
          <span className="absolute -top-1.5 -right-2 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-sm">
            {wishlistItems?.length || 0}
          </span>
        </div>
        <span className="text-[11px] font-semibold mt-1 text-foreground/90 group-hover:text-pink-500 transition-colors hidden lg:block">Wishlist</span>
      </div>

      {/* Cart */}
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <div
          onClick={() => setOpenCartSheet(true)}
          className="flex flex-col items-center justify-center cursor-pointer group relative pt-1 outline-none"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-foreground/90 group-hover:text-purple-600 transition-colors" />
            <span className="absolute -top-1.5 -right-2 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white shadow-sm">
              {cartItems?.items?.length || 0}
            </span>
          </div>
          <span className="text-[11px] font-semibold mt-1 text-foreground/90 group-hover:text-purple-600 transition-colors hidden lg:block">Cart</span>
        </div>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />
      </Sheet>
    </div>
  );
}

function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background shadow-sm">
      <div className="flex flex-col w-full">
        {/* Main Header Row */}
        <div className="flex h-[70px] md:h-[80px] items-center justify-between px-4 md:px-8 w-full max-w-7xl mx-auto lg:max-w-none lg:px-12">
          {/* Left Logo */}
          <Link to="/shop/home" className="flex items-center gap-3 lg:mr-10 shrink-0 group">
            <div className="p-1 rounded-md bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform">
              <HousePlug className="h-7 w-7" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent hidden sm:block">Fashionify</span>
          </Link>

          {/* Navigation Links (Hidden on mobile) */}
          <div className="hidden lg:flex h-full items-center justify-start flex-none">
            <MenuItems />
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 flex justify-center px-4 md:px-8">
            <div className="w-full max-w-xl hidden lg:block">
              <SearchBar isMobile={false} />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Right Icons */}
            <HeaderRightContent />

            {/* Mobile Menu Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle header menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-8 h-full">
                  <MenuItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden w-full px-4 pb-3">
          <SearchBar isMobile={true} />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
