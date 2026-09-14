/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: header.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 10
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { LogOut, Menu, ShoppingCart, UserCog, ShieldCheck, Heart, Search, User, Sun, Moon, X } from "lucide-react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import CartDialog from "./cart-dialog";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import useShopSearchStore from "@/store/useShopSearchStore";
import useShopCartStore from "@/store/useShopCartStore";
import useShopWishlistStore from "@/store/useShopWishlistStore";
import useAuthStore from "@/store/useAuthStore";
import { useAuthModal } from "@/context/AuthModalContext";
import BrandLogo from "@/components/common/BrandLogo";

function SearchBar({ isMobile }) {
  const [keyword, setKeyword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const debounceRef = useRef(null);
  const resetSearchResults = useShopSearchStore((state) => state.resetSearchResults);

  useEffect(() => {
    if (location.pathname === "/shop/search") {
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
      if (location.pathname === "/shop/search") {
        resetSearchResults();
        navigate("/shop/search", { replace: true });
      }
      return;
    }
    debounceRef.current = setTimeout(() => {
      navigate(`/shop/search?keyword=${encodeURIComponent(keyword)}`);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [keyword, navigate, location.pathname, resetSearchResults]);

  function handleClear() {
    setKeyword("");
    resetSearchResults();
    if (location.pathname === "/shop/search") {
      navigate("/shop/search", { replace: true });
    }
  }

  return (
    <div className={`relative w-full ${isMobile ? "" : "max-w-xl"}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        className="w-full bg-muted/70 border-2 border-border focus-visible:ring-0 focus-visible:border-primary pl-10 pr-9 h-10 rounded-sm font-body"
        placeholder="Search products, brands..."
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

function MenuItems({ onItemClick }) {
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

    if (onItemClick) onItemClick();
  }

  return (
    <nav className="flex flex-col lg:flex-row gap-6 lg:items-center h-full">
      {shoppingViewHeaderMenuItems.map((menuItem) => {
        const isActive = location.pathname === menuItem.path ||
          (menuItem.id !== 'home' && menuItem.id !== 'products' && menuItem.id !== 'search' && menuItem.id !== 'contact' && location.pathname.includes('listing') && new URLSearchParams(location.search).get('category') === menuItem.id);

        return (
          <button
            key={menuItem.id}
            onClick={() => handleNavigate(menuItem)}
            className={`text-[13px] font-bold tracking-widest lg:uppercase relative flex items-center justify-center px-4 py-2 transition-all duration-200 border-2 rounded-sm ${isActive
                ? "bg-primary text-primary-foreground border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                : "text-foreground bg-transparent border-transparent hover:bg-primary hover:text-primary-foreground hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:border-white dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
              }`}
          >
            {menuItem.label}
            {menuItem.badge && (
              <span className="absolute -top-2 -right-3 px-1.5 py-0.5 rounded-sm border border-black bg-[hsl(var(--neu-yellow))] text-black text-[9px] font-black hidden lg:block shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                {menuItem.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function HeaderRightContent() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const cartItems = useShopCartStore((state) => state.cartItems);
  const fetchCartItems = useShopCartStore((state) => state.fetchCartItems);
  const wishlistItems = useShopWishlistStore((state) => state.wishlistItems);
  const fetchWishlistItems = useShopWishlistStore((state) => state.fetchWishlistItems);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate                  = useNavigate();
  const { theme, setTheme }       = useTheme();
  const { openAuthModal }         = useAuthModal();

  function handleLogout() {
    logoutUser();
  }

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCartItems(user?.id);
      fetchWishlistItems(user?.id);
    }
  }, [fetchCartItems, fetchWishlistItems, isAuthenticated, user?.id]);

  const isDark = theme === "dark";

  function handleWishlistClick() {
    if (!isAuthenticated) {
      openAuthModal("login", { action: "wishlist" });
      return;
    }
    navigate("/shop/wishlist");
  }

  const wishlistCount = wishlistItems?.length || 0;
  const cartCount = cartItems?.items?.length || 0;

  return (
    <div className="flex items-center flex-row gap-1 sm:gap-3 lg:gap-5">
      {/* Theme Toggle - Desktop only (Mobile has it inside the slide-out menu) */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="hidden md:flex flex-col items-center justify-center cursor-pointer group p-1.5 rounded-sm hover:bg-muted/50 transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-foreground/80 group-hover:text-[hsl(var(--neu-yellow))] transition-colors" />
        ) : (
          <Moon className="h-5 w-5 text-foreground/80 group-hover:text-primary transition-colors" />
        )}
        <span className="text-[10px] font-bold mt-0.5 text-foreground/70 group-hover:text-primary transition-colors hidden lg:block">
          {isDark ? "Light" : "Dark"}
        </span>
      </button>

      {/* Profile Icon / Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex flex-col items-center justify-center cursor-pointer group p-1.5 rounded-sm outline-none bg-transparent border-0 hover:bg-muted/50 transition-colors shrink-0"
            aria-label="User profile menu"
          >
            {isAuthenticated ? (
              <Avatar className="h-7 w-7 border-2 border-border hover:border-primary transition-colors">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/micah/svg?seed=${user?.avatar || user?.userName || "Fashion"}&backgroundColor=transparent`}
                  alt="User Avatar"
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-black text-[10px]">
                  {user?.userName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-5 w-5 text-foreground/80 group-hover:text-primary transition-colors" />
            )}
            <span className="text-[10px] font-bold mt-0.5 text-foreground/70 group-hover:text-primary transition-colors hidden lg:block">
              Profile
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={8}
          avoidCollisions={true}
          collisionPadding={16}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="w-64 max-w-[calc(100vw-32px)] border-2 border-border shadow-none p-2 rounded-sm bg-card z-50"
          style={{ boxShadow: "4px 4px 0px 0px hsl(var(--neu-black))" }}
        >
          {isAuthenticated ? (
            <>
              <DropdownMenuLabel className="font-black text-sm">
                Hello, {user?.userName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2 border-border" />
              <DropdownMenuItem
                onClick={() => navigate("/shop/account")}
                className="cursor-pointer font-bold p-3 rounded-sm hover:bg-muted"
              >
                <UserCog className="mr-3 h-4 w-4" />
                Account
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem
                  onClick={() => navigate("/admin/dashboard")}
                  className="cursor-pointer text-primary font-black p-3 rounded-sm hover:bg-muted"
                >
                  <ShieldCheck className="mr-3 h-4 w-4" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="my-2 border-border" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive cursor-pointer font-bold p-3 rounded-sm hover:bg-muted"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            <div className="p-3 space-y-3">
              <div>
                <p className="font-black text-sm">Welcome</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sign in to access your account</p>
              </div>
              <button
                onClick={() => openAuthModal("login")}
                className="neu-btn-primary w-full text-sm py-2.5"
              >
                LOGIN / SIGNUP
              </button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className="flex flex-col items-center justify-center cursor-pointer group relative p-1.5 rounded-sm bg-transparent border-0 outline-none hover:bg-muted/50 transition-colors"
        aria-label="Wishlist"
      >
        <div className="relative flex items-center justify-center">
          <Heart className="h-5 w-5 text-foreground/80 group-hover:text-primary transition-colors" />
          {isAuthenticated && wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground border border-background shadow-sm">
              {wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold mt-0.5 text-foreground/70 group-hover:text-primary-dark transition-colors hidden lg:block">
          Wishlist
        </span>
      </button>

      {/* Cart Button */}
      <button
        onClick={() => setOpenCartSheet(true)}
        className="flex flex-col items-center justify-center cursor-pointer group relative p-1.5 rounded-sm outline-none bg-transparent border-0 hover:bg-muted/50 transition-colors"
        aria-label="Open cart"
      >
        <div className="relative flex items-center justify-center">
          <ShoppingCart className="h-5 w-5 text-foreground/80 group-hover:text-primary transition-colors" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground border border-background shadow-sm">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold mt-0.5 text-foreground/70 group-hover:text-primary transition-colors hidden lg:block">
          Cart
        </span>
      </button>

      {/* Cart Dialog */}
      <CartDialog
        open={openCartSheet}
        onClose={() => setOpenCartSheet(false)}
        cartItems={
          cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items
            : []
        }
      />
    </div>
  );
}

function ShoppingHeader() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-background">
      {/* Neubrutalism top accent stripe */}
      <div className="h-1 w-full bg-primary" />
      <div className="flex flex-col w-full">
        {/* Main Header Row */}
        <div className="container mx-auto px-3 sm:px-4 flex h-[58px] sm:h-[68px] md:h-[76px] items-center justify-between w-full">
          {/* Logo */}
          <div className="shrink-0 group flex items-center lg:mr-10">
            <BrandLogo className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" textClassName="text-lg sm:text-2xl tracking-tight" />
          </div>

          {/* Navigation (Desktop) */}
          <div className="hidden lg:flex h-full items-center justify-start flex-none">
            <MenuItems />
          </div>

          {/* Desktop Search - only present in layout on lg+ screens */}
          <div className="hidden lg:flex flex-1 justify-center px-4 md:px-8">
            <div className="w-full max-w-xl">
              <SearchBar isMobile={false} />
            </div>
          </div>

          {/* Right Action Icons & Mobile Drawer */}
          <div className="flex items-center shrink-0 gap-1 sm:gap-2.5 lg:gap-5">
            <HeaderRightContent />

            {/* Mobile Menu Sheet */}
            <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden shrink-0 h-8 w-8 sm:h-9 sm:w-9 border-2 border-border rounded-sm hover:bg-muted ml-0.5"
                  style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l-2 border-border p-0 flex flex-col justify-between" aria-describedby={undefined}>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div>
                  <div className="p-5 border-b-2 border-border flex items-center justify-between">
                    <BrandLogo textClassName="text-xl" />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-black uppercase text-muted-foreground tracking-wider mb-3 px-2">Navigation</p>
                    <MenuItems onItemClick={() => setOpenMobileMenu(false)} />
                  </div>
                </div>

                {/* Mobile Bottom Bar: Theme switch */}
                <div className="p-4 border-t-2 border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Appearance</span>
                  <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-sm border-2 border-border bg-background text-xs font-bold shadow-[2px_2px_0px_0px_hsl(var(--neu-black))]"
                  >
                    {isDark ? <Sun className="h-4 w-4 text-[hsl(var(--neu-yellow))]" /> : <Moon className="h-4 w-4 text-primary" />}
                    <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="container mx-auto px-3 pb-2.5 pt-0.5 lg:hidden w-full">
          <SearchBar isMobile={true} />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
