import axios from "axios";
import { API_CONFIG } from "./api.config";
import { useAuthStore } from "../store/authStore";

// Create axios instance with base configuration
const api = axios.create(API_CONFIG);

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState();
    const token = state.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth state and redirect to login
      useAuthStore.getState().logout();
      window.location.href = "/signin";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
