import axios from "axios";
import toast from "react-hot-toast";

// ---------------------------------------------------------------------------
// Base client
// ---------------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000, // 30s — yt-dlp can be slow
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------------------------
// Request interceptor
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config) => {
    // Log outgoing requests in dev
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params || "");
    }
    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Response interceptor
// ---------------------------------------------------------------------------

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail
      || error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || "Something went wrong";

    // Don't show toast for 404s — let the caller handle those
    if (status === 404) {
      return Promise.reject({ status, message: detail, raw: error });
    }

    // Known expected errors — show user-friendly message
    if (status === 400) {
      toast.error(detail);
      return Promise.reject({ status, message: detail, raw: error });
    }

    // Rate limited
    if (status === 429) {
      toast.error("Too many requests — slow down a bit!");
      return Promise.reject({ status, message: "Rate limited", raw: error });
    }

    // Backend unavailable (yt-dlp / ytmusicapi failures)
    if (status === 503) {
      toast.error("Service unavailable — please try again");
      return Promise.reject({ status, message: detail, raw: error });
    }

    // Network error (backend not running)
    if (!error.response) {
      toast.error("Cannot reach server — is the backend running?");
      return Promise.reject({ status: 0, message: "Network error", raw: error });
    }

    // Everything else — generic
    toast.error("Something went wrong");
    return Promise.reject({ status, message: detail, raw: error });
  }
);

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default apiClient;

/**
 * For multipart/form-data requests (thumbnail uploads etc.)
 * Usage: apiClient.post("/playlists/1/thumbnail", formData, multipartConfig)
 */
export const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};
