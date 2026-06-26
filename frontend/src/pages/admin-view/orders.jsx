/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: orders.jsx
 * Purpose: Full page React view rendering a distinct route in the application.
 * Functions/Methods: 1
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import AdminOrdersView from "@/components/admin-view/orders";

function AdminOrders() {
  return (
    <div>
      <AdminOrdersView />
    </div>
  );
}

export default AdminOrders;
