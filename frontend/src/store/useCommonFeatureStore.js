import { create } from "zustand";
import api from "@/services/api";

const useCommonFeatureStore = create((set) => ({
  isLoading: false,
  featureImageList: [],

  getFeatureImages: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/common/feature/get");
      set({
        isLoading: false,
        featureImageList: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({
        isLoading: false,
        featureImageList: [],
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  addFeatureImage: async (image) => {
    try {
      const response = await api.post("/api/common/feature/add", { image });
      return { payload: response.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  editFeatureImage: async ({ id, startDate, endDate }) => {
    try {
      const response = await api.put(
        `/api/common/feature/edit/${id}`,
        { startDate, endDate }
      );
      return { payload: response.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  deleteFeatureImage: async (id) => {
    try {
      const response = await api.delete(`/api/common/feature/delete/${id}`);
      return { payload: response.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },
}));

export default useCommonFeatureStore;
