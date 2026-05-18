/**
 * API client for the CTF Command Center backend.
 * Attaches the JWT session token to every request and redirects to
 * the login gate on 401 responses.
 */
import axios from 'axios';
import toast from 'react-hot-toast';

const TOKEN_KEY = 'ctf_session_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle errors — redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      // Dispatch a custom event so AuthGate can react without a hard reload
      window.dispatchEvent(new CustomEvent('ctf:auth:expired'));
      return Promise.reject(error);
    }
    const message =
      error.response?.data?.detail || error.message || 'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
