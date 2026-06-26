/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: api.js
 * Purpose: API service helper to make external network requests.
 * Functions/Methods: 19
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import axios from "axios";

/**
 * Centrally configured API base URL, derived from env configuration.
 */
const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Centrally configured Axios instance.
 * Automatically handles cross-origin credentials (cookies) and injects base URL.
 * Custom thunks and services should use this instance to avoid boilerplate setup.
 */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Shop / General API endpoints
export const getPriceRange = () => api.get("/api/shop/products/price-range");
export const getCollections = () => api.get("/api/collections");
export const getCollectionById = (id) => api.get(`/api/collections/${id}`);
export const getLatestReviews = () => api.get("/api/shop/review/latest");
export const getCoupons = () => api.get("/api/coupons");
export const createCoupon = (payload) => api.post("/api/coupons", payload);
export const deleteCoupon = (id) => api.delete(`/api/coupons/${id}`);
export const submitContactForm = (payload) => api.post("/api/contact", payload);
export const joinWaitlist = (payload) => api.post("/api/waitlist", payload);
export const applyPromoCode = (payload) => api.post("/api/shop/order/apply-promo", payload);
export const subscribeNewsletter = (payload) => api.post("/api/newsletter/subscribe", payload);

// OTP Auth endpoints
export const initiateSignup = (payload) => api.post("/api/auth/signup/initiate", payload);
export const verifyOtp = (payload) => api.post("/api/auth/signup/verify", payload);

// Admin-specific endpoints
export const getAdminProducts = () => api.get("/api/admin/products/get");
export const createCollection = (payload) => api.post("/api/collections", payload);
export const deleteCollection = (id) => api.delete(`/api/collections/${id}`);
export const uploadProductImage = (data) => api.post("/api/admin/products/upload-image", data);
export const uploadCollectionImage = (data) => api.post("/api/collections/upload-image", data);
export const uploadImage = (url, data, config) => api.post(url, data, config);

export default api;
