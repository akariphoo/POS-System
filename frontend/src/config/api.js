import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect if it's a login request (let the login component handle it)
    const isLoginRequest = error.config?.url?.includes('/login');
    
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      toast.error("Session expired. Please login again.");

      // Clear token and user info
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
