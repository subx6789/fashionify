import { create } from "zustand";
import api from "@/services/api";
import { immer } from "zustand/middleware/immer";

const BASE = "/api/admin/messages";

const useAdminMessagesStore = create(
  immer((set, get) => ({
    messages: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchMessages: async (filter = "all") => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const url =
          filter === "unread" ? `${BASE}/unread`
            : filter === "resolved" ? `${BASE}/resolved`
              : BASE;
        const res = await api.get(url);
        set((state) => {
          state.isLoading = false;
          state.messages = res.data?.data || [];
        });
        return { payload: res.data };
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = error.message;
        });
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },

    fetchUnreadCount: async () => {
      try {
        const res = await api.get(`${BASE}/unread-count`);
        set((state) => {
          state.unreadCount = res.data?.count ?? 0;
        });
        return { payload: res.data };
      } catch (error) {
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },

    markMessageRead: async ({ id, read }) => {
      try {
        const res = await api.patch(`${BASE}/${id}/read`, { read });
        set((state) => {
          const updated = res.data?.data;
          if (updated) {
            const idx = state.messages.findIndex((m) => m.id === updated.id);
            if (idx !== -1) state.messages[idx] = updated;
          }
          state.unreadCount = state.messages.filter((m) => !m.read).length;
        });
        return { payload: res.data };
      } catch (error) {
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },

    markMessageResolved: async ({ id, resolved }) => {
      try {
        const res = await api.patch(`${BASE}/${id}/resolve`, { resolved });
        set((state) => {
          const updated = res.data?.data;
          if (updated) {
            const idx = state.messages.findIndex((m) => m.id === updated.id);
            if (idx !== -1) state.messages[idx] = updated;
          }
          state.unreadCount = state.messages.filter((m) => !m.read).length;
        });
        return { payload: res.data };
      } catch (error) {
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    },

    deleteMessage: async (id) => {
      try {
        await api.delete(`${BASE}/${id}`);
        set((state) => {
          state.messages = state.messages.filter((m) => m.id !== id);
          state.unreadCount = state.messages.filter((m) => !m.read).length;
        });
        return { payload: id };
      } catch (error) {
        return { payload: error.response?.data || { message: "An error occurred" } };
      }
    }
  }))
);

export default useAdminMessagesStore;
