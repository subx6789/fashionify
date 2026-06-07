import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Configured Axios instance
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
export const uploadImage = (url, data) => api.post(url, data);

export default api;
