/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: messages-slice.js
 * Purpose: Redux slice/store configuration for managing global application state.
 * Functions/Methods: 7
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

const BASE = "/api/admin/messages";

// ── Async thunks ─────────────────────────────────────────────────────────────

export const fetchMessages = createAsyncThunk(
  "adminMessages/fetchAll",
  async (filter = "all") => {
    const url = filter === "unread"   ? `${BASE}/unread`
               : filter === "resolved" ? `${BASE}/resolved`
               : BASE;
    const res = await api.get(url);
    return res.data;
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "adminMessages/fetchUnreadCount",
  async () => {
    const res = await api.get(`${BASE}/unread-count`);
    return res.data;
  }
);

export const markMessageRead = createAsyncThunk(
  "adminMessages/markRead",
  async ({ id, read }) => {
    const res = await api.patch(`${BASE}/${id}/read`, { read });
    return res.data;
  }
);

export const markMessageResolved = createAsyncThunk(
  "adminMessages/markResolved",
  async ({ id, resolved }) => {
    const res = await api.patch(`${BASE}/${id}/resolve`, { resolved });
    return res.data;
  }
);

export const deleteMessage = createAsyncThunk(
  "adminMessages/delete",
  async (id) => {
    await api.delete(`${BASE}/${id}`);
    return id;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  messages:    [],
  unreadCount: 0,
  isLoading:   false,
  error:       null,
};

const adminMessagesSlice = createSlice({
  name: "adminMessages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchMessages.pending,  (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages  = action.payload.data || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count ?? 0;
      })

      // mark read — update in-place
      .addCase(markMessageRead.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const idx = state.messages.findIndex((m) => m.id === updated.id);
        if (idx !== -1) state.messages[idx] = updated;
        // Recalculate unread count from current state
        state.unreadCount = state.messages.filter((m) => !m.read).length;
      })

      // mark resolved — update in-place
      .addCase(markMessageResolved.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const idx = state.messages.findIndex((m) => m.id === updated.id);
        if (idx !== -1) state.messages[idx] = updated;
        state.unreadCount = state.messages.filter((m) => !m.read).length;
      })

      // delete — remove from list
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.messages  = state.messages.filter((m) => m.id !== deletedId);
        state.unreadCount = state.messages.filter((m) => !m.read).length;
      });
  },
});

export default adminMessagesSlice.reducer;
