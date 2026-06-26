/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: index.js
 * Purpose: Redux slice/store configuration for managing global application state.
 * Functions/Methods: 2
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/services/api";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  currentPage: 0,
  totalPages: 0,
  totalProducts: 0,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams, page = 0, size = 8 }) => {
    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
      page,
      size,
    });
    const result = await api.get(`/api/shop/products/get?${query}`);
    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id) => {
    const result = await api.get(`/api/shop/products/get/${id}`);
    return result?.data;
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // New paginated response shape: { products, currentPage, totalPages, totalProducts }
        state.productList = action.payload.products ?? action.payload.data ?? [];
        state.currentPage = action.payload.currentPage ?? 0;
        state.totalPages = action.payload.totalPages ?? 1;
        state.totalProducts = action.payload.totalProducts ?? 0;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
        state.currentPage = 0;
        state.totalPages = 0;
        state.totalProducts = 0;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});


export default shoppingProductSlice.reducer;
