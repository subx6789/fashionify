import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        formData,
        {
          withCredentials: true,
        }
      );
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
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        formData,
        {
          withCredentials: true,
        }
      );
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
      const response = await axios.post(
        "http://localhost:8080/api/admin-auth/login",
        formData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",

  async () => {
    const response = await axios.post(
      "http://localhost:8080/api/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",

  async () => {
    const response = await axios.get(
      "http://localhost:8080/api/auth/check-auth",
      {
        withCredentials: true,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );

    return response.data;
  }
);

export const updatePreferences = createAsyncThunk(
  "/auth/updatePreferences",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        "http://localhost:8080/api/auth/update-preferences",
        formData,
        { withCredentials: true }
      );
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
      const response = await axios.put(
        "http://localhost:8080/api/auth/update-password",
        formData,
        { withCredentials: true }
      );
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
    setUser: (state, action) => {},
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
        state.user = action.payload.success ? { ...action.payload.user, avatar: sessionStorage.getItem("userAvatar") || null } : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
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
      });
  },
});

export const { setUser, setAvatar } = authSlice.actions;
export default authSlice.reducer;
