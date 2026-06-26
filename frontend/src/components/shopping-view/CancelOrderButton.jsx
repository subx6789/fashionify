/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: CancelOrderButton.jsx
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

import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cancelOrder, getAllOrdersByUserId } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, X, AlertTriangle } from "lucide-react";

/**
 * CancelOrderButton
 *
 * Neubrutalism-styled Cancel Order button + confirmation modal.
 * Props:
 *   orderId  — number | string
 *   status   — current order status string (hides button if delivered/cancelled)
 *   onSuccess — optional callback after successful cancel
 */
function CancelOrderButton({ orderId, status, onSuccess }) {
  const [open, setOpen]       = useState(false);
  const [busy, setBusy]       = useState(false);
  const cancelBtnRef          = useRef(null);

  const dispatch              = useDispatch();
  const { user }              = useSelector((state) => state.auth);
  const { toast }             = useToast();

  // Only show for cancellable statuses
  const cancellable = !["CANCELLED", "delivered", "inShipping"].includes(status);
  if (!cancellable) return null;

  function openModal()  { setOpen(true);  }
  function closeModal() { if (!busy) setOpen(false); }

  async function handleConfirm() {
    setBusy(true);
    try {
      const result = await dispatch(cancelOrder({ orderId, userId: user?.id }));
      if (result?.payload?.success) {
        toast({ title: "Order cancelled successfully." });
        setOpen(false);
        dispatch(getAllOrdersByUserId(user?.id));
        onSuccess?.();
      } else {
        toast({
          title: result?.payload?.message || "Could not cancel the order.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "An error occurred. Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* ── Trigger Button ─────────────────────────────────────────────────── */}
      <button
        ref={cancelBtnRef}
        onClick={openModal}
        className="
          inline-flex items-center gap-2
          px-4 py-2
          text-sm font-bold
          bg-white text-[var(--color-black)]
          border-2 border-[var(--color-black)]
          rounded-none
          transition-all duration-100
          hover:bg-[var(--color-acid-green)] hover:text-[var(--color-black)]
          active:translate-x-[2px] active:translate-y-[2px]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
        "
        style={{ boxShadow: "var(--shadow-neubrutal-sm)" }}
      >
        <X className="w-4 h-4" />
        Cancel Order
      </button>

      {/* ── Confirmation Modal ──────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div
            className="
              w-full max-w-sm
              bg-white
              border-[3px] border-[var(--color-black)]
              rounded-none p-6
              flex flex-col gap-5
            "
            style={{ boxShadow: "var(--shadow-neubrutal-xl)" }}
          >
            {/* Icon + heading */}
            <div className="flex items-start gap-3">
              <div
                className="flex-none w-10 h-10 flex items-center justify-center border-2 border-black rounded-none"
                style={{ background: "var(--color-acid-green)" }}
              >
                <AlertTriangle className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2
                  id="cancel-modal-title"
                  className="font-black text-lg leading-tight text-black"
                >
                  Cancel this order?
                </h2>
                <p className="text-sm text-gray-600 mt-1 leading-snug">
                  This cannot be undone. Your order will be permanently cancelled
                  and you will receive a confirmation email.
                </p>
              </div>
            </div>

            {/* Order ID chip */}
            <div
              className="px-3 py-2 border-2 border-black text-xs font-bold font-mono bg-gray-50"
              style={{ boxShadow: "var(--shadow-neubrutal-sm)" }}
            >
              Order #{orderId}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {/* Keep Order */}
              <button
                onClick={closeModal}
                disabled={busy}
                className="
                  flex-1 py-2.5 text-sm font-bold
                  bg-white text-black
                  border-2 border-black rounded-none
                  hover:bg-gray-100
                  active:translate-x-[2px] active:translate-y-[2px]
                  transition-all duration-100
                  disabled:opacity-50 disabled:pointer-events-none
                "
                style={{ boxShadow: "var(--shadow-neubrutal-sm)" }}
              >
                Keep Order
              </button>

              {/* Confirm Cancel */}
              <button
                onClick={handleConfirm}
                disabled={busy}
                className="
                  flex-1 py-2.5 text-sm font-bold
                  bg-[var(--color-black)] text-[var(--color-acid-green)]
                  border-2 border-black rounded-none
                  hover:bg-gray-900
                  active:translate-x-[2px] active:translate-y-[2px]
                  transition-all duration-100
                  disabled:opacity-60 disabled:pointer-events-none
                  flex items-center justify-center gap-2
                "
                style={{ boxShadow: "var(--shadow-neubrutal-sm)" }}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling…
                  </>
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CancelOrderButton;
