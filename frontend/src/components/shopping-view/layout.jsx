/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: layout.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 1
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";

import ShoppingFooter from "./footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full flex-grow relative z-10">
        <Outlet />
      </main>
      <ShoppingFooter />
    </div>
  );
}

export default ShoppingLayout;
