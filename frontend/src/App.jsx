import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

// Layout & core auth components (static import to keep container framing immediate)
import AdminLayout from "./components/admin-view/layout";
import ShoppingLayout from "./components/shopping-view/layout";
import CheckAuth from "./components/common/check-auth";
import { checkAuth } from "./store/auth-slice";

// UI Components
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-loaded page components for bundle splitting
const AdminDashboard = lazy(() => import("./pages/admin-view/dashboard"));
const AdminProducts = lazy(() => import("./pages/admin-view/products"));
const AdminOrders = lazy(() => import("./pages/admin-view/orders"));
const AdminFeatures = lazy(() => import("./pages/admin-view/features"));
const AdminCoupons = lazy(() => import("./pages/admin-view/coupons"));
const AdminCollections = lazy(() => import("./pages/admin-view/collections"));
const AdminMessages = lazy(() => import("./pages/admin-view/messages"));

const ShoppingHome = lazy(() => import("./pages/shopping-view/home"));
const ShoppingListing = lazy(() => import("./pages/shopping-view/listing"));
const ShoppingCheckout = lazy(() => import("./pages/shopping-view/checkout"));
const ShoppingProductDetails = lazy(() => import("./pages/shopping-view/product-details"));
const ShoppingAccount = lazy(() => import("./pages/shopping-view/account"));
const ShoppingCollectionDetails = lazy(() => import("./pages/shopping-view/collection-details"));
const PaymentSuccessPage = lazy(() => import("./pages/shopping-view/payment-success"));
const SearchProducts = lazy(() => import("./pages/shopping-view/search"));
const ShoppingAbout = lazy(() => import("./pages/shopping-view/about"));
const ShoppingContact = lazy(() => import("./pages/shopping-view/contact"));
const ShoppingWishlist = lazy(() => import("./pages/shopping-view/wishlist"));

const UnauthPage = lazy(() => import("./pages/unauth-page"));
const NotFound = lazy(() => import("./pages/not-found"));

/**
 * Loading fallback skeleton UI matching the general layouts.
 */
function LoadingFallback() {
  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 max-w-7xl mx-auto w-full mt-4">
      <Skeleton className="h-12 w-[250px] rounded-sm" />
      <Skeleton className="h-[350px] w-full rounded-sm" />
    </div>
  );
}

// Public shop routes that should render immediately without waiting for auth
const PUBLIC_INSTANT_PATHS = [
  "/shop/home",
  "/shop/listing",
  "/shop/search",
  "/shop/about",
  "/shop/contact",
  "/shop/product/",
  "/shop/collection/",
];

function App() {
  const { user, isAuthenticated, isLoading, isInitialized } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const pathname = window.location.pathname;
  const isPublicRoute = PUBLIC_INSTANT_PATHS.some((p) => pathname.startsWith(p));

  // Only block rendering with a skeleton if we're on a protected route AND haven't initialized yet
  if (!isInitialized && !isPublicRoute) return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="h-16 w-full border-b-2 border-border bg-muted/20 animate-pulse" />
      <main className="flex-1 p-6 md:p-10 flex flex-col gap-6 max-w-7xl mx-auto w-full mt-4">
        <Skeleton className="h-12 w-[300px] rounded-sm" />
        <Skeleton className="h-[400px] w-full rounded-sm" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <Skeleton className="h-[200px] w-full rounded-sm" />
          <Skeleton className="h-[200px] w-full rounded-sm" />
          <Skeleton className="h-[200px] w-full rounded-sm" />
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <CheckAuth isAuthenticated={isAuthenticated} user={user}></CheckAuth>
              }
            />


            {/* Admin panel */}
            <Route
              path="/admin"
              element={
                <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                  <AdminLayout />
                </CheckAuth>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products"  element={<AdminProducts />} />
              <Route path="orders"    element={<AdminOrders />} />
              <Route path="features"  element={<AdminFeatures />} />
              <Route path="coupons"   element={<AdminCoupons />} />
              <Route path="collections"   element={<AdminCollections />} />
              <Route path="messages"  element={<AdminMessages />} />
            </Route>

            {/* Shopping — public product pages, protected account/checkout */}
            <Route
              path="/shop"
              element={
                <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                  <ShoppingLayout />
                </CheckAuth>
              }
            >
              <Route path="home"            element={<ShoppingHome />} />
              <Route path="listing"         element={<ShoppingListing />} />
              <Route path="product/:id"     element={<ShoppingProductDetails />} />
              <Route path="search"          element={<SearchProducts />} />
              <Route path="about"           element={<ShoppingAbout />} />
              <Route path="contact"         element={<ShoppingContact />} />
              <Route path="checkout"        element={<ShoppingCheckout />} />
              <Route path="account"         element={<ShoppingAccount />} />
              <Route path="collection/:id"      element={<ShoppingCollectionDetails />} />
              <Route path="wishlist"        element={<ShoppingWishlist />} />
              <Route path="payment-success" element={<PaymentSuccessPage />} />
            </Route>

            <Route path="/unauth-page" element={<UnauthPage />} />
            <Route path="*"            element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

export default App;
