import axios from 'axios';

// Base URL comes from an environment variable — never hardcoded, so this
// frontend can point at any deployment of the existing backend.
const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'taskboard_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

// Attach the JWT to every outgoing request, matching the backend's
// expected `Authorization: Bearer <token>` header.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A single place to listen for "the session just became invalid" so the
// AuthContext can react (clear user, redirect to /login) without every
// call site needing to know about it.
const sessionListeners = new Set();
export const onSessionExpired = (cb) => {
  sessionListeners.add(cb);
  return () => sessionListeners.delete(cb);
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      sessionListeners.forEach((cb) => cb());
    }

    // Normalize into a shape every caller can rely on, matching the
    // backend's standard error response: { success, message, errors }
    const backendPayload = error?.response?.data;
    const normalized = {
      status: status || 0,
      message:
        backendPayload?.message ||
        (status === 0 || !status
          ? 'Unable to reach the server. Please check your connection.'
          : 'Something went wrong. Please try again.'),
      errors: backendPayload?.errors || [],
    };

    return Promise.reject(normalized);
  }
);

export default api;
