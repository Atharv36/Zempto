// utils/Axios.js
import axios from "axios";
import SummaryApi, { baseUrl } from "../src/config/summaryApi";
import toast from "react-hot-toast"; // optional for error handling

const Axios = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // to include cookies if needed
});

// ✅ REQUEST INTERCEPTOR
Axios.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR (Handles 401 errors and token refresh)
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);

        if (newAccessToken) {
          // Set the new token and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originalRequest);
        }
      }

      // Optional: clear storage and redirect user to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.error("Session expired. Please log in again.");
      window.location.href = "/login"; // Optional: redirect to login
    }

    return Promise.reject(error);
  }
);

// ✅ Token Refresh Function
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await Axios({
      ...SummaryApi.refreshToken,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const accessToken = response.data.data.accessToken;
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      return accessToken;
    }
  } catch (error) {
    console.error("Failed to refresh token", error);
    return null;
  }
};

export default Axios;
