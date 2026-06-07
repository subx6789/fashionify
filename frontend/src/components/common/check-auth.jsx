import { Navigate, useLocation } from "react-router-dom";

// Public shop routes — browsable without authentication
const PUBLIC_SHOP_PREFIXES = [
  "/shop/home",
  "/shop/listing",
  "/shop/search",
  "/shop/about",
  "/shop/contact",
  "/shop/product/", // product detail pages are fully public
  "/shop/collection/", // collection detail pages are fully public
];

function isPublicShopRoute(pathname) {
  return PUBLIC_SHOP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();
  const { pathname } = location;

  // Root → always go to shop home
  if (pathname === "/") {
    return <Navigate to="/shop/home" replace />;
  }

  // Admin login — always public
  if (pathname.startsWith("/admin-auth")) {
    if (isAuthenticated && user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Admin routes — must be authenticated admin
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) return <Navigate to="/admin-auth/login" replace />;
    if (user?.role !== "admin") return <Navigate to="/unauth-page" replace />;
    return <>{children}</>;
  }

  // Public shop routes — allow everyone, no auth check
  if (isPublicShopRoute(pathname)) {
    return <>{children}</>;
  }

  // Protected shop routes (checkout, account, wishlist) — require auth.
  // Redirect unauthenticated users to shop home; they can open the auth modal there.
  if (pathname.startsWith("/shop") && !isAuthenticated) {
    return <Navigate to="/shop/home" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;
