import { HousePlug, LogOut, Menu, ShoppingCart, UserCog, ShieldCheck, Heart, Search, User, Sun, Moon, X } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet";
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
import CartDialog from "./cart-dialog";
import { useEffect, useRef, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { fetchWishlistItems } from "@/store/shop/wishlist-slice";
import { Input } from "../ui/input";
import { useTheme } from "@/components/theme-provider";
import { resetSearchResults } from "@/store/shop/search-slice";
import { useAuthModal } from "@/context/AuthModalContext";
import BrandLogo from "@/components/common/BrandLogo";

function SearchBar({ isMobile }) {
  const [keyword, setKeyword] = useState("");
  const [searchParams]        = useSearchParams();
  const navigate              = useNavigate();
  const location              = useLocation();
  const debounceRef           = useRef(null);
  const dispatch              = useDispatch();

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

function MenuItems() {
  const navigate       = useNavigate();
  const location       = useLocation();
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
      {shoppingViewHeaderMenuItems.map((menuItem) => {
        const isActive = location.pathname === menuItem.path || 
          (menuItem.id !== 'home' && menuItem.id !== 'products' && menuItem.id !== 'search' && menuItem.id !== 'contact' && location.pathname.includes('listing') && new URLSearchParams(location.search).get('category') === menuItem.id);
        
        return (
          <button
            key={menuItem.id}
            onClick={() => handleNavigate(menuItem)}
            className={`text-[13px] font-bold tracking-widest lg:uppercase relative flex items-center justify-center px-4 py-2 transition-all duration-200 border-2 rounded-sm ${
              isActive 
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
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems }             = useSelector((state) => state.shopCart);
  const { wishlistItems }         = useSelector((state) => state.shopWishlist);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate                  = useNavigate();
  const dispatch                  = useDispatch();
  const { theme, setTheme }       = useTheme();
  const { openAuthModal }         = useAuthModal();

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

  function handleWishlistClick() {
    if (!isAuthenticated) {
      openAuthModal("login", { action: "wishlist" });
      return;
    }
    navigate("/shop/wishlist");
  }

  return (
    <div className="flex lg:items-center flex-row gap-4 lg:gap-5">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex flex-col items-center justify-center cursor-pointer group pt-1"
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

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex flex-col items-center justify-center cursor-pointer group pt-1 outline-none">
            {isAuthenticated ? (
              <Avatar className="h-6 w-6 border-2 border-border hover:border-primary transition-colors">
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
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          className="w-64 mt-4 border-2 border-border shadow-none p-2 rounded-sm"
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

      {/* Wishlist */}
      <div
        onClick={handleWishlistClick}
        className="flex flex-col items-center justify-center cursor-pointer group relative pt-1"
      >
        <div className="relative">
          <Heart className="h-5 w-5 text-foreground/80 group-hover:text-primary-dark transition-colors" />
          {isAuthenticated && (
            <span className="absolute -top-1.5 -right-2 flex h-[15px] w-[15px] items-center justify-center rounded-none bg-primary text-[9px] font-black text-primary-foreground border border-border">
              {wishlistItems?.length || 0}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold mt-0.5 text-foreground/70 group-hover:text-primary-dark transition-colors hidden lg:block">
          Wishlist
        </span>
      </div>

      {/* Cart — now opens a centered Neubrutalist dialog, not a slide-over */}
      <div
        onClick={() => setOpenCartSheet(true)}
        className="flex flex-col items-center justify-center cursor-pointer group relative pt-1 outline-none"
        role="button"
        aria-label="Open cart"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpenCartSheet(true); }}
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5 text-foreground/80 group-hover:text-primary transition-colors" />
          <span className="absolute -top-1.5 -right-2 flex h-[15px] w-[15px] items-center justify-center rounded-none bg-primary text-[9px] font-black text-primary-foreground border border-border">
            {cartItems?.items?.length || 0}
          </span>
        </div>
        <span className="text-[10px] font-bold mt-0.5 text-foreground/70 group-hover:text-primary transition-colors hidden lg:block">
          Cart
        </span>
      </div>

      {/* Cart Dialog (portal rendered, outside the button tree) */}
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
  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-background">
      {/* Neubrutalism top accent stripe */}
      <div className="h-1 w-full bg-primary" />
      <div className="flex flex-col w-full">
        {/* Main Header Row */}
        <div className="container mx-auto px-4 flex h-[68px] md:h-[76px] items-center justify-between w-full">
          {/* Logo */}
          <div className="shrink-0 group lg:mr-10">
            <BrandLogo textClassName="text-2xl hidden sm:block" />
          </div>

          {/* Navigation */}
          <div className="hidden lg:flex h-full items-center justify-start flex-none">
            <MenuItems />
          </div>

          {/* Desktop Search */}
          <div className="flex-1 flex justify-center px-4 md:px-8">
            <div className="w-full max-w-xl hidden lg:block">
              <SearchBar isMobile={false} />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-5">
            <HeaderRightContent />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden border-2 border-border rounded-sm"
                  style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] border-l-2 border-border" aria-describedby={undefined}>
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <div className="flex flex-col gap-6 mt-8 h-full">
                  <MenuItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="container mx-auto px-4 pb-3 lg:hidden w-full">
          <SearchBar isMobile={true} />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
