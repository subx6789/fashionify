/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: index.js
 * Purpose: Redux slice/store configuration for managing global application state.
 * Functions/Methods: 4
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";

const initialState = {
  isLoading: false,
  reviews: [],
  eligibility: { eligible: false, reason: "", isChecking: false },
};

export const addReview = createAsyncThunk(
  "/order/addReview",
  async (formdata) => {
    const response = await api.post(
      "/api/shop/review/add",
      formdata
    );
    return response.data;
  }
);

export const getReviews = createAsyncThunk("/order/getReviews", async (id) => {
  const response = await api.get(`/api/shop/review/${id}`);
  return response.data;
});

export const checkRatingEligibility = createAsyncThunk(
  "/order/checkEligibility",
  async ({ productId, userId }) => {
    const response = await api.get(
      `/api/shop/review/eligibility/${productId}?userId=${userId}`
    );
    return response.data;
  }
);

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {
    resetEligibility: (state) => {
      state.eligibility = { eligible: false, reason: "", isChecking: false };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(getReviews.rejected, (state) => {
        state.isLoading = false;
        state.reviews = [];
      })
      .addCase(checkRatingEligibility.pending, (state) => {
        state.eligibility.isChecking = true;
      })
      .addCase(checkRatingEligibility.fulfilled, (state, action) => {
        state.eligibility = {
          eligible: action.payload.eligible,
          reason: action.payload.reason || "",
          isChecking: false,
        };
      })
      .addCase(checkRatingEligibility.rejected, (state) => {
        state.eligibility = { eligible: false, reason: "", isChecking: false };
      });
  },
});

export const { resetEligibility } = reviewSlice.actions;
export default reviewSlice.reducer;
