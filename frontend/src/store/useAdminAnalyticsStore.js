import { create } from "zustand";
import api from "@/services/api";
import { immer } from "zustand/middleware/immer";

const useAdminAnalyticsStore = create(
  immer((set, get) => ({
    isLoading: false,
    data: null,

    fetchAnalytics: async ({ startDate, endDate }) => {
      set((state) => { state.isLoading = true; });
      try {
        const response = await api.get(
          `/api/admin/analytics?start=${startDate}&end=${endDate}`
        );
        set((state) => {
          state.isLoading = false;
          state.data = response.data?.data || null;
        });
        return { payload: response.data };
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.data = null;
        });
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },
  }))
);

export default useAdminAnalyticsStore;
