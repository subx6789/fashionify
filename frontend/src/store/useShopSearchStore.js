import { create } from "zustand";
import api from "@/services/api";

const useShopSearchStore = create((set) => ({
  isLoading: false,
  searchResults: [],

  resetSearchResults: () => {
    set({ searchResults: [] });
  },

  getSearchResults: async (keyword) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/shop/search/${keyword}`);
      set({
        isLoading: false,
        searchResults: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({
        isLoading: false,
        searchResults: [],
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },
}));

export default useShopSearchStore;
