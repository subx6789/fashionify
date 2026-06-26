/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: check-auth.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 3
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

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


  // Admin routes — must be authenticated admin
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) return <Navigate to="/shop/home" replace />;
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
