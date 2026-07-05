import { create } from "zustand";
import api from "@/services/api";
import { immer } from "zustand/middleware/immer";

const useAdminOrderStore = create(
  immer((set, get) => ({
    orderList: [],
    orderDetails: null,
    isLoading: false,

    resetOrderDetails: () => {
      set((state) => {
        state.orderDetails = null;
      });
    },

    getAllOrdersForAdmin: async () => {
      set((state) => { state.isLoading = true; });
      try {
        const response = await api.get("/api/admin/orders/get");
        set((state) => {
          state.isLoading = false;
          state.orderList = response.data?.data || [];
        });
        return { payload: response.data };
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.orderList = [];
        });
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },

    getOrderDetailsForAdmin: async (id) => {
      set((state) => { state.isLoading = true; });
      try {
        const response = await api.get(`/api/admin/orders/details/${id}`);
        set((state) => {
          state.isLoading = false;
          state.orderDetails = response.data?.data || null;
        });
        return { payload: response.data };
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.orderDetails = null;
        });
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },

    updateOrderStatus: async ({ id, orderStatus }) => {
      try {
        const response = await api.put(
          `/api/admin/orders/update/${id}`,
          { orderStatus }
        );
        const payload = { ...response.data, id, orderStatus };
        
        // Optimistic in-place update like in Redux
        set((state) => {
          const order = state.orderList.find((o) => o.id === id);
          if (order) {
            order.orderStatus = orderStatus;
          }
          if (state.orderDetails && state.orderDetails.id === id) {
            state.orderDetails.orderStatus = orderStatus;
          }
        });

        return { payload };
      } catch (error) {
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },
  }))
);

export default useAdminOrderStore;
