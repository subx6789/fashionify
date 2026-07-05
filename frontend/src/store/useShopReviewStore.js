import { create } from "zustand";
import api from "@/services/api";

const useShopReviewStore = create((set) => ({
  isLoading: false,
  reviews: [],
  eligibility: { eligible: false, reason: "", isChecking: false },

  resetEligibility: () => {
    set({ eligibility: { eligible: false, reason: "", isChecking: false } });
  },

  addReview: async (formdata) => {
    try {
      const response = await api.post("/api/shop/review/add", formdata);
      return { payload: response.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  getReviews: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/shop/review/${id}`);
      set({
        isLoading: false,
        reviews: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({
        isLoading: false,
        reviews: [],
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  checkRatingEligibility: async ({ productId, userId }) => {
    set((state) => ({ eligibility: { ...state.eligibility, isChecking: true } }));
    try {
      const response = await api.get(
        `/api/shop/review/eligibility/${productId}?userId=${userId}`
      );
      set({
        eligibility: {
          eligible: response.data?.eligible,
          reason: response.data?.reason || "",
          isChecking: false,
        },
      });
      return { payload: response.data };
    } catch (error) {
      set({
        eligibility: { eligible: false, reason: "", isChecking: false },
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },
}));

export default useShopReviewStore;
