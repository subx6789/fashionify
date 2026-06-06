import {
  BadgeCheck,
  LayoutDashboard,
  ShoppingBasket,
  Tag,
  Shirt,
  MessageSquare,
} from "lucide-react";
import { Fragment, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import BrandLogo from "@/components/common/BrandLogo";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnreadCount } from "@/store/admin/messages-slice";

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

  // Fetch unread count on mount so sidebar badge stays accurate
  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  return (
    <Fragment>
      {/* Mobile sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64" aria-describedby={undefined}>
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex mt-5 mb-5 items-center justify-center">
                <BrandLogo showText={true} />
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden w-[280px] flex-col border-r border-border bg-card py-8 lg:flex">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center justify-center mb-6"
        >
          <BrandLogo showText={true} />
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
