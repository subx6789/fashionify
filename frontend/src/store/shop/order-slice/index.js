import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    const response = await axios.post(
      "http://localhost:8080/api/shop/order/create",
      orderData,
      { withCredentials: true }
    );
    return response.data;
  }
);

export const confirmSimulatedOrder = createAsyncThunk(
  "/order/confirmSimulatedOrder",
  async (orderId) => {
    const response = await axios.post(
      "http://localhost:8080/api/shop/order/confirm-simulated",
      { orderId },
      { withCredentials: true }
    );
    return response.data;
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:8080/api/shop/order/list/${userId}`,
      { withCredentials: true }
    );
    return response.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      `http://localhost:8080/api/shop/order/details/${id}`,
      { withCredentials: true }
    );
    return response.data;
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId ?? null;
        if (action.payload.orderId) {
          sessionStorage.setItem(
            "currentOrderId",
            JSON.stringify(action.payload.orderId)
          );
        }
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.orderId = null;
      })
      .addCase(confirmSimulatedOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(confirmSimulatedOrder.fulfilled, (state) => {
        state.isLoading = false;
        state.orderId = null;
        sessionStorage.removeItem("currentOrderId");
      })
      .addCase(confirmSimulatedOrder.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
