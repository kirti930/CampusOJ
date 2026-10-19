import axios from "axios";

/**
 * Central Axios instance — points to the API, sends cookies with every request.
 * All auth API calls should import this instead of raw axios.
 */
const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,         // send/receive HTTP-only cookies
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT from localStorage as a fallback Bearer header
// (only populated if the user explicitly wants non-cookie auth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise error shape so callers receive a plain Error with .message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    let message =
      err.response?.data?.error ??
      err.response?.data?.message;

    if (!message) {
      if (
        err.code === "ERR_NETWORK" ||
        err.code === "ECONNREFUSED" ||
        [502, 503, 504].includes(err.response?.status)
      ) {
        message =
          "Backend API server is not running or unreachable. Please start it with 'npm run dev --workspace=@campusoj/api'.";
      } else if (
        err.response?.status === 500 &&
        typeof err.response?.data === "string" &&
        (err.response.data.includes("ECONNREFUSED") || err.response.data.includes("proxy"))
      ) {
        message =
          "Backend API connection refused on port 5000. Please ensure the API is running (npm run dev --workspace=@campusoj/api).";
      } else {
        message = err.message ?? "An unexpected error occurred";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
