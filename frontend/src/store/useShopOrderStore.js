import { create } from "zustand";
import api from "@/services/api";
import { immer } from "zustand/middleware/immer";

const useShopOrderStore = create(
  immer((set) => ({
    isLoading: false,
    orderId: null,
    orderList: [],
    orderDetails: null,

    resetOrderDetails: () => {
      set((state) => {
        state.orderDetails = null;
      });
    },

    createNewOrder: async (orderData) => {
      set((state) => { state.isLoading = true; });
      try {
        const response = await api.post("/api/shop/order/create", orderData);
        const orderId = response.data?.orderId ?? null;
        set((state) => {
          state.isLoading = false;
          state.orderId = orderId;
        });
        if (orderId) {
          sessionStorage.setItem("currentOrderId", JSON.stringify(orderId));
        }
        return { payload: response.data };
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.orderId = null;
        });
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },

    confirmSimulatedOrder: async (orderId) => {
      set((state) => { state.isLoading = true; });
      try {
        const response = await api.post("/api/shop/order/confirm-simulated", { orderId });
        set((state) => {
          state.isLoading = false;
          state.orderId = null;
        });
        sessionStorage.removeItem("currentOrderId");
        return { payload: response.data };
      } catch (error) {
        set((state) => {
          state.isLoading = false;
        });
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },

    getAllOrdersByUserId: async (userId) => {
      set((state) => { state.isLoading = true; });
      try {
        const response = await api.get(`/api/shop/order/list/${userId}`);
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

    getOrderDetails: async (id) => {
      set((state) => { state.isLoading = true; });
      try {
        const response = await api.get(`/api/shop/order/details/${id}`);
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

    cancelOrder: async ({ orderId, userId }) => {
      set((state) => { state.isLoading = true; });
      try {
        const response = await api.patch(
          `/api/shop/order/${orderId}/cancel`,
          { userId }
        );
        set((state) => {
          state.isLoading = false;
          const order = state.orderList.find((o) => o.id === orderId);
          if (order) order.orderStatus = "CANCELLED";
        });
        return { payload: response.data };
      } catch (error) {
        set((state) => {
          state.isLoading = false;
        });
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },
  }))
);

export default useShopOrderStore;
