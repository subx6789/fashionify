import { create } from "zustand";
import api from "@/services/api";

const useShopCartStore = create((set) => ({
  cartItems: [],
  isLoading: false,

  addToCart: async ({ userId, productId, quantity, selectedSize }) => {
    set({ isLoading: true });
    try {
      const response = await api.post(
        "/api/shop/cart/add",
        { userId, productId, quantity, selectedSize }
      );
      set({
        isLoading: false,
        cartItems: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({
        isLoading: false,
        cartItems: [],
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  fetchCartItems: async (userId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/shop/cart/get/${userId}`);
      set({
        isLoading: false,
        cartItems: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({
        isLoading: false,
        cartItems: [],
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  deleteCartItem: async ({ userId, productId, selectedSize }) => {
    set({ isLoading: true });
    try {
      const params = selectedSize ? `?selectedSize=${encodeURIComponent(selectedSize)}` : "";
      const response = await api.delete(
        `/api/shop/cart/${userId}/${productId}${params}`
      );
      set({
        isLoading: false,
        cartItems: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({
        isLoading: false,
        cartItems: [],
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  updateCartQuantity: async ({ userId, productId, quantity, selectedSize }) => {
    set({ isLoading: true });
    try {
      const response = await api.put(
        "/api/shop/cart/update-cart",
        { userId, productId, quantity, selectedSize }
      );
      set({
        isLoading: false,
        cartItems: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({
        isLoading: false,
        cartItems: [],
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },
}));

export default useShopCartStore;
