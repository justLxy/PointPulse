/**
 * API Service
 * Sets up Axios instance with interceptors for authentication and error handling
 * Interceptor pattern adapted from Axios documentation:
 * https://axios-http.com/docs/interceptors
 */
import axios from 'axios';

// API URL configuration - can be changed when deploying
// export const API_URL = 'http://localhost:8000';
// export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
export const API_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: API_URL,
  // Don't set a default Content-Type - axios will set the appropriate one 
  // including boundaries for multipart/form-data
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For debugging - log request details
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Just clear the token but don't redirect
      // Let the AuthContext handle the redirect
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      localStorage.removeItem('activeRole');
    }
    return Promise.reject(error);
  }
);

export default api; 