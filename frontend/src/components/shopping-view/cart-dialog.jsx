/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: cart-dialog.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 5
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { useNavigate }            from "react-router-dom";
import UserCartItemsContent       from "./cart-items-content";
import { useSelector }            from "react-redux";
import { useAuthModal }           from "@/context/AuthModalContext";
import { ShoppingBag, X, ArrowRight, ShoppingCart } from "lucide-react";
import { useEffect, useRef }      from "react";

/**
 * CartDialog — Neubrutalist centered modal replacing the old slide-over Sheet.
 *
 * Design tokens used exclusively from index.css / tailwind.config.js:
 *   - border-2 border-border
 *   - box-shadow: neu-xl (8px 8px 0 0 hsl(var(--neu-black)))
 *   - animate-modal-in
 *   - bg-primary / text-primary-foreground (acid lime CTA)
 *   - font-heading font-black (Space Grotesk)
 *   - neu-btn-primary
 */
function CartDialog({ open, onClose, cartItems }) {
  const navigate            = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { openAuthModal }   = useAuthModal();
  const overlayRef          = useRef(null);
  const dialogRef           = useRef(null);

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, item) =>
            sum +
            (item?.product?.salePrice > 0
              ? item?.product?.salePrice
              : item?.product?.price) *
              item?.quantity,
          0
        )
      : 0;

  // ── Keyboard: Escape closes the dialog ─────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // ── Scroll lock while dialog is open ───────────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Focus trap: move focus into dialog on open ─────────────────────────
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  function handleCheckout() {
    if (!isAuthenticated) {
      openAuthModal("login", { action: "checkout" });
      onClose();
      return;
    }
    navigate("/shop/checkout");
    onClose();
  }

  // ── Overlay click closes dialog (clicking outside content) ─────────────
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!open) return null;

  return (
    // Overlay — semi-opaque black backdrop, no glassmorphism (Neubrutalism rule)
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: "hsl(var(--neu-black) / 0.65)" }}
    >
      {/* Dialog box */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        tabIndex={-1}
        className="relative w-full max-w-lg bg-card border-2 border-border rounded-sm outline-none animate-modal-in flex flex-col"
        style={{
          boxShadow: "8px 8px 0px 0px hsl(var(--neu-black))",
          maxHeight: "min(88vh, 680px)",
        }}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Acid-lime icon block — Neubrutalism accent */}
            <div
              className="flex items-center justify-center w-9 h-9 bg-primary border-2 border-border rounded-sm"
              style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
            >
              <ShoppingBag className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading font-black text-lg leading-none tracking-tight">
                Your Cart
              </h2>
              <p className="text-xs text-muted-foreground font-bold mt-0.5">
                {cartItems?.length || 0}{" "}
                {cartItems?.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="flex items-center justify-center w-9 h-9 border-2 border-border rounded-sm bg-background transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Cart Items — scrollable ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {cartItems && cartItems.length > 0 ? (
            <div className="px-6 py-4 space-y-0 divide-y-2 divide-border">
              {cartItems.map((item, index) => (
                <div key={item.productId || index} className="py-4 first:pt-0 last:pb-0">
                  <UserCartItemsContent cartItem={item} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div
                className="w-20 h-20 border-2 border-border rounded-sm bg-muted flex items-center justify-center mb-4"
                style={{ boxShadow: "4px 4px 0px 0px hsl(var(--neu-black))" }}
              >
                <ShoppingCart className="h-9 w-9 text-muted-foreground/40" aria-hidden="true" />
              </div>
              <p className="font-heading font-black text-lg mb-1">Cart is empty</p>
              <p className="text-sm text-muted-foreground font-medium">
                Add some items to get started.
              </p>
              <button
                onClick={onClose}
                className="mt-5 neu-btn-primary px-6 py-2.5 text-sm"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* ── Footer: totals + checkout ────────────────────────────────── */}
        {cartItems && cartItems.length > 0 && (
          <div
            className="flex-shrink-0 px-6 py-4 border-t-2 border-border bg-background space-y-3"
          >
            {/* Subtotal row */}
            <div className="flex justify-between items-center">
              <span className="font-heading font-black text-base tracking-tight">
                Subtotal
              </span>
              <div className="flex flex-col items-end">
                <span
                  className="font-heading font-black text-2xl tracking-tight"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  ₹{totalCartAmount.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-muted-foreground font-bold">
                  Taxes &amp; delivery at checkout
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckout}
              className="neu-btn-primary w-full py-3.5 text-base group"
            >
              <span>Checkout</span>
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>

            {/* Continue shopping link */}
            <button
              onClick={onClose}
              className="w-full text-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDialog;
