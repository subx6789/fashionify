/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: index.js
 * Purpose: Redux slice/store configuration for managing global application state.
 * Functions/Methods: 11
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
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  user: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/signup/initiate", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

export const verifyRegisterOtp = createAsyncThunk(
  "/auth/verifyOtp",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/signup/verify", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/login", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

export const adminLoginUser = createAsyncThunk(
  "/auth/adminLogin",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/admin-auth/login", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",
  async () => {
    const response = await api.post("/api/auth/logout", {});
    return response.data;
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",
  async () => {
    const response = await api.get("/api/auth/check-auth", {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
    return response.data;
  }
);

export const updatePreferences = createAsyncThunk(
  "/auth/updatePreferences",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/api/auth/update-preferences", formData);
      return { ...response.data, formData };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

export const updatePassword = createAsyncThunk(
  "/auth/updatePassword",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/api/auth/update-password", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

export const updateProfile = createAsyncThunk(
  "/auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/api/auth/update-profile", formData);
      return { ...response.data, formData };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "/auth/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/api/auth/delete-account");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    setAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
        sessionStorage.setItem("userAvatar", action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(verifyRegisterOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyRegisterOtp.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(verifyRegisterOtp.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? { ...action.payload.user, avatar: sessionStorage.getItem("userAvatar") || null } : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload.success ? { ...action.payload.user, avatar: sessionStorage.getItem("userAvatar") || null } : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(adminLoginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminLoginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? { ...action.payload.user, avatar: sessionStorage.getItem("userAvatar") || null } : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(adminLoginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        if (state.user && action.payload.success) {
          state.user = { ...state.user, ...action.payload.formData };
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user && action.payload.success) {
          state.user = { ...state.user, ...action.payload.formData };
        }
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setAvatar } = authSlice.actions;
export default authSlice.reducer;
