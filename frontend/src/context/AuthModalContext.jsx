import { createContext, useContext, useCallback, useRef, useState } from "react";

/**
 * AuthModalContext — centralized auth modal state.
 * Consumers call openAuthModal(mode, intent) instead of navigating to /auth/login.
 *
 * intent: { action, ...args } — the action to retry after auth.
 * e.g. { action: 'addToCart', productId: '123', selectedSize: 'M' }
 */
const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const intentRef               = useRef(null);

  const openAuthModal = useCallback((initialMode = "login", intent = null) => {
    setMode(initialMode);
    intentRef.current = intent;
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    // Small delay before clearing intent so the close animation can finish
    setTimeout(() => { intentRef.current = null; }, 300);
  }, []);

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{ isOpen, mode, intentRef, openAuthModal, closeAuthModal, switchMode }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used inside AuthModalProvider");
  return ctx;
}
