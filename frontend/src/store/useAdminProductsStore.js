import { create } from "zustand";
import api from "@/services/api";

const useAdminProductsStore = create((set, get) => ({
  isLoading: false,
  productList: [],
  lowStockProducts: [],

  addNewProduct: async (formData) => {
    try {
      const result = await api.post(
        "/api/admin/products/add",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return { payload: result?.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  fetchAllProducts: async () => {
    set({ isLoading: true });
    try {
      const result = await api.get("/api/admin/products/get");
      set({
        isLoading: false,
        productList: result?.data?.data || []
      });
      return { payload: result?.data };
    } catch (error) {
      set({ isLoading: false, productList: [] });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  fetchLowStockProducts: async () => {
    try {
      const result = await api.get("/api/admin/products/low-stock");
      set({
        lowStockProducts: result?.data?.data || []
      });
      return { payload: result?.data };
    } catch (error) {
      set({ lowStockProducts: [] });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  editProduct: async ({ id, formData }) => {
    try {
      const result = await api.put(
        `/api/admin/products/edit/${id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return { payload: result?.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  deleteProduct: async (id) => {
    try {
      const result = await api.delete(`/api/admin/products/delete/${id}`);
      return { payload: result?.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  }
}));

export default useAdminProductsStore;
