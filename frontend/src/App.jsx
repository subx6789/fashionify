import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AuthLayout from "./components/auth/layout";
import AdminLogin from "./pages/admin-view/admin-login";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import AdminCoupons from "./pages/admin-view/coupons";
import AdminCollections from "./pages/admin-view/collections";
import AdminMessages from "./pages/admin-view/messages";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingProductDetails from "./pages/shopping-view/product-details";
import ShoppingAccount from "./pages/shopping-view/account";
import ShoppingCollectionDetails from "./pages/shopping-view/collection-details";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";
import ShoppingAbout from "./pages/shopping-view/about";
import ShoppingContact from "./pages/shopping-view/contact";
import ShoppingWishlist from "./pages/shopping-view/wishlist";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return (
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
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}></CheckAuth>
          }
        />

        {/* Admin auth — dedicated page (not modal) */}
        <Route
          path="/admin-auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AdminLogin />} />
        </Route>

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
          <Route path="paypal-return"   element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
        </Route>

        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*"            element={<NotFound />} />
      </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
