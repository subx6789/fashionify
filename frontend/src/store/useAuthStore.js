import { create } from "zustand";
import api from "@/services/api";

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  user: null,

  setAvatar: (avatar) => set((state) => {
    if (state.user) {
      sessionStorage.setItem("userAvatar", avatar);
      return { user: { ...state.user, avatar } };
    }
    return state;
  }),

  registerUser: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/api/auth/signup/initiate", formData);
      set({ isLoading: false, user: null, isAuthenticated: false });
      return { payload: response.data };
    } catch (error) {
      set({ isLoading: false, user: null, isAuthenticated: false });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  verifyRegisterOtp: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/api/auth/signup/verify", formData);
      set({ isLoading: false });
      return { payload: response.data };
    } catch (error) {
      set({ isLoading: false });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  loginUser: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/api/auth/login", formData);
      const data = response.data;
      set({
        isLoading: false,
        user: data.success ? { ...data.user, avatar: sessionStorage.getItem("userAvatar") || null } : null,
        isAuthenticated: data.success
      });
      return { payload: data };
    } catch (error) {
      set({ isLoading: false, user: null, isAuthenticated: false });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  adminLoginUser: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/api/admin-auth/login", formData);
      const data = response.data;
      set({
        isLoading: false,
        user: data.success ? { ...data.user, avatar: sessionStorage.getItem("userAvatar") || null } : null,
        isAuthenticated: data.success
      });
      return { payload: data };
    } catch (error) {
      set({ isLoading: false, user: null, isAuthenticated: false });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  logoutUser: async () => {
    try {
      const response = await api.post("/api/auth/logout", {});
      set({ isLoading: false, user: null, isAuthenticated: false });
      return { payload: response.data };
    } catch (error) {
       set({ isLoading: false, user: null, isAuthenticated: false });
       return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/auth/check-auth", {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
      const data = response.data;
      set({
        isLoading: false,
        isInitialized: true,
        user: data.success ? { ...data.user, avatar: sessionStorage.getItem("userAvatar") || null } : null,
        isAuthenticated: data.success
      });
      return { payload: data };
    } catch (error) {
      set({
        isLoading: false,
        isInitialized: true,
        user: null,
        isAuthenticated: false
      });
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  updatePreferences: async (formData) => {
    try {
      const response = await api.put("/api/auth/update-preferences", formData);
      const data = { ...response.data, formData };
      const state = get();
      if (state.user && data.success) {
        set({ user: { ...state.user, ...data.formData } });
      }
      return { payload: data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  updatePassword: async (formData) => {
    try {
      const response = await api.put("/api/auth/update-password", formData);
      return { payload: response.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  updateProfile: async (formData) => {
    try {
      const response = await api.put("/api/auth/update-profile", formData);
      const data = { ...response.data, formData };
      const state = get();
      if (state.user && data.success) {
        set({ user: { ...state.user, ...data.formData } });
      }
      return { payload: data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },

  deleteAccount: async () => {
    try {
      const response = await api.delete("/api/auth/delete-account");
      set({ isLoading: false, user: null, isAuthenticated: false });
      return { payload: response.data };
    } catch (error) {
      return { payload: error.response?.data || { message: "An error occurred" } };
    }
  },
}));

export default useAuthStore;
