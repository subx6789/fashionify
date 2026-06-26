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
  data: null,
};

export const fetchAnalytics = createAsyncThunk(
  "/admin/fetchAnalytics",
  async ({ startDate, endDate }) => {
    const response = await api.get(
      `/api/admin/analytics?start=${startDate}&end=${endDate}`
    );
    return response.data;
  }
);

const adminAnalyticsSlice = createSlice({
  name: "adminAnalytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchAnalytics.rejected, (state) => {
        state.isLoading = false;
        state.data = null;
      });
  },
});

export default adminAnalyticsSlice.reducer;
