/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: sidebar.jsx
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

import {
  BadgeCheck,
  LayoutDashboard,
  ShoppingBasket,
  Tag,
  Shirt,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { Fragment, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import BrandLogo from "@/components/common/BrandLogo";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnreadCount } from "@/store/admin/messages-slice";
import { logoutUser } from "@/store/auth-slice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const adminSidebarMenuItems = [
  {
    id:    "dashboard",
    label: "Dashboard",
    path:  "/admin/dashboard",
    icon:  <LayoutDashboard />,
  },
  {
    id:    "products",
    label: "Products",
    path:  "/admin/products",
    icon:  <ShoppingBasket />,
  },
  {
    id:    "orders",
    label: "Orders",
    path:  "/admin/orders",
    icon:  <BadgeCheck />,
  },
  {
    id:    "coupons",
    label: "Coupons",
    path:  "/admin/coupons",
    icon:  <Tag />,
  },
  {
    id:    "collections",
    label: "Collections",
    path:  "/admin/collections",
    icon:  <Shirt size={24} />,
  },
  {
    id:    "messages",
    label: "Messages",
    path:  "/admin/messages",
    icon:  <MessageSquare />,
  },
];

function MenuItems({ setOpen }) {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { unreadCount } = useSelector((s) => s.adminMessages);

  return (
    <nav className="mt-8 flex-col flex gap-1 px-4" aria-label="Admin navigation">
      {adminSidebarMenuItems.map((menuItem) => {
        const isActive = location.pathname === menuItem.path;
        const showBadge = menuItem.id === "messages" && unreadCount > 0;

        return (
          <div
            key={menuItem.id}
            onClick={() => {
              navigate(menuItem.path);
              if (setOpen) setOpen(false);
            }}
            className={`flex cursor-pointer text-sm font-bold items-center gap-3 rounded-sm px-4 py-3 transition-all relative ${
              isActive
                ? "bg-primary text-primary-foreground border-2 border-border"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border-2 border-transparent"
            }`}
            style={isActive ? { boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" } : {}}
            role="button"
            tabIndex={0}
            aria-current={isActive ? "page" : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(menuItem.path);
                if (setOpen) setOpen(false);
              }
            }}
          >
            <div className="w-4 h-4 flex-shrink-0">{menuItem.icon}</div>
            <span className="flex-1">{menuItem.label}</span>

            {/* Unread messages badge */}
            {showBadge && (
              <span
                className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-black rounded-sm bg-foreground text-background border border-border"
                aria-label={`${unreadCount} unread messages`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);

  // Fetch unread count on mount so sidebar badge stays accurate
  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  function handleLogout() {
    dispatch(logoutUser());
  }

  const UserProfileBlock = (
    <div className="mt-auto p-5 border-t-2 border-border bg-muted/10">
      <div className="flex items-center gap-3">
        <Avatar className="border-2 border-border w-10 h-10 shadow-[2px_2px_0px_0px_hsl(var(--neu-black))]">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/micah/svg?seed=${user?.avatar || user?.userName || "Fashion"}&backgroundColor=transparent`}
            alt="User Avatar"
          />
          <AvatarFallback className="bg-primary text-primary-foreground font-black">
            {user?.userName?.[0]?.toUpperCase() || "A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-black truncate text-foreground">{user?.userName || "Admin"}</span>
          <span className="text-[10px] font-bold text-muted-foreground truncate">{user?.email || "admin@example.com"}</span>
        </div>
      </div>
      <button 
        onClick={handleLogout}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-black border-2 border-border bg-background rounded-sm hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors shadow-[2px_2px_0px_0px_hsl(var(--neu-black))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_hsl(var(--neu-black))]"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );

  return (
    <Fragment>
      {/* Mobile sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0" aria-describedby={undefined}>
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b-2 border-border px-4 py-5">
              <SheetTitle className="flex items-center justify-center">
                <BrandLogo showText={true} />
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <MenuItems setOpen={setOpen} />
            </div>
            {UserProfileBlock}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden w-[280px] flex-col border-r-2 border-border bg-card lg:flex h-screen sticky top-0">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center justify-center py-6 border-b-2 border-border"
        >
          <BrandLogo showText={true} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <MenuItems />
        </div>
        {UserProfileBlock}
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
