/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: confirm-delete-dialog.jsx
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

import { X, AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  warningText = "This action cannot be undone.",
  isLoading = false
}) {
  const dialogRef = useRef(null);

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleEsc(e) {
      if (e.key === "Escape" && !isLoading) onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ background: "hsl(var(--neu-black) / 0.65)" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="relative w-full max-w-md bg-card border-2 border-border rounded-sm outline-none animate-modal-in"
        style={{ boxShadow: "8px 8px 0px 0px hsl(var(--neu-black))" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b-2 border-border bg-card rounded-t-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 bg-destructive border-2 border-border rounded-sm flex-shrink-0" style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}>
                <AlertTriangle className="w-3.5 h-3.5 text-destructive-foreground" />
            </div>
            <h2 className="font-heading font-black text-lg tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center justify-center w-9 h-9 border-2 border-border rounded-sm bg-background transition-all hover:bg-muted focus-visible:outline-none disabled:opacity-50"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm font-bold text-muted-foreground leading-relaxed">
            {warningText}
          </p>
        </div>

        <div className="px-6 py-4 border-t-2 border-border bg-card rounded-b-sm flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="neu-btn-outline px-4 py-2 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-black border-2 border-border rounded-sm bg-destructive text-destructive-foreground hover:opacity-90 transition-all disabled:opacity-50"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          >
            {isLoading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
