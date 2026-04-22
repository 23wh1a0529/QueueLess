import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Tokens
export const generateToken = (data) => API.post("/tokens", data);
export const getMyTokens = () => API.get("/tokens/my");
export const getQueueStatus = () => API.get("/tokens/queue-status");
export const getAllTokens = (params) => API.get("/tokens", { params });
export const updateTokenStatus = (id, status) =>
  API.put(`/tokens/${id}/status`, { status });

// Users
export const getProfile = () => API.get("/users/profile");
export const updateProfile = (data) => API.put("/users/profile", data);
export const getAllUsers = () => API.get("/users");
