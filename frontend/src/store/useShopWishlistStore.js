import { create } from "zustand";
import api from "@/services/api";

const useShopWishlistStore = create((set) => ({
  isLoading: false,
  wishlistItems: [],

  addToWishlist: async ({ userId, productId }) => {
    set({ isLoading: true });
    try {
      const response = await api.post(
        "/api/shop/wishlist/add",
        { userId, productId }
      );
      set({
        isLoading: false,
        wishlistItems: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({ isLoading: false });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  fetchWishlistItems: async (userId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/shop/wishlist/get/${userId}`);
      set({
        isLoading: false,
        wishlistItems: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({
        isLoading: false,
        wishlistItems: [],
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  removeFromWishlist: async ({ userId, productId }) => {
    set({ isLoading: true });
    try {
      const response = await api.delete(
        `/api/shop/wishlist/delete/${userId}/${productId}`
      );
      set({
        isLoading: false,
        wishlistItems: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({ isLoading: false });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },
}));

export default useShopWishlistStore;
