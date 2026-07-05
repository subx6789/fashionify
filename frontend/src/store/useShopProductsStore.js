import { create } from "zustand";
import api from "@/services/api";

const useShopProductsStore = create((set) => ({
  isLoading: false,
  productList: [],
  productDetails: null,
  currentPage: 0,
  totalPages: 0,
  totalProducts: 0,

  fetchAllFilteredProducts: async ({ filterParams, sortParams, page = 0, size = 8 }) => {
    set({ isLoading: true });
    try {
      const query = new URLSearchParams({
        ...filterParams,
        sortBy: sortParams,
        page,
        size,
      });
      const result = await api.get(`/api/shop/products/get?${query}`);
      const payload = result?.data;
      set({
        isLoading: false,
        productList: payload?.products ?? payload?.data ?? [],
        currentPage: payload?.currentPage ?? 0,
        totalPages: payload?.totalPages ?? 1,
        totalProducts: payload?.totalProducts ?? 0,
      });
      return { payload };
    } catch (error) {
      set({
        isLoading: false,
        productList: [],
        currentPage: 0,
        totalPages: 0,
        totalProducts: 0,
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  fetchProductDetails: async (id) => {
    set({ isLoading: true });
    try {
      const result = await api.get(`/api/shop/products/get/${id}`);
      set({
        isLoading: false,
        productDetails: result?.data?.data || null,
      });
      return { payload: result?.data };
    } catch (error) {
      set({
        isLoading: false,
        productDetails: null,
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },
}));

export default useShopProductsStore;
