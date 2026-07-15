import axios from "axios";

// In dev, Vite proxies /api -> http://localhost:5000 (see vite.config.js)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
});

// Status codes reference
export const getStatusCodes = (params = {}) => api.get("/status-codes", { params });
export const getCategories = () => api.get("/status-codes/categories");
export const getStatusCode = (code) => api.get(`/status-codes/${code}`);

// Favorites
export const getFavorites = () => api.get("/favorites");
export const addFavorite = (payload) => api.post("/favorites", payload);
export const updateFavorite = (id, payload) => api.put(`/favorites/${id}`, payload);
export const deleteFavorite = (id) => api.delete(`/favorites/${id}`);

// History
export const getHistory = (limit = 50) => api.get("/history", { params: { limit } });
export const deleteHistoryEntry = (id) => api.delete(`/history/${id}`);
export const clearHistory = () => api.delete("/history");

// API tester (real request proxy)
export const runTest = (payload) => api.post("/test", payload);

export default api;
