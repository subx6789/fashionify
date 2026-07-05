import { create } from "zustand";
import api from "@/services/api";

const useShopAddressStore = create((set) => ({
  isLoading: false,
  addressList: [],

  addNewAddress: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/api/shop/address/add", formData);
      set({ isLoading: false });
      return { payload: response.data };
    } catch (error) {
      set({ isLoading: false });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  fetchAllAddresses: async (userId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/shop/address/get/${userId}`);
      set({
        isLoading: false,
        addressList: response.data?.data || [],
      });
      return { payload: response.data };
    } catch (error) {
      set({
        isLoading: false,
        addressList: [],
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  editaAddress: async ({ userId, addressId, formData }) => {
    try {
      const response = await api.put(
        `/api/shop/address/update/${userId}/${addressId}`,
        formData
      );
      return { payload: response.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  deleteAddress: async ({ userId, addressId }) => {
    try {
      const response = await api.delete(
        `/api/shop/address/delete/${userId}/${addressId}`
      );
      return { payload: response.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },
}));

export default useShopAddressStore;
