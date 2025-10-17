import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base configuration
export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.favorapp.net/api/v1',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      console.log('🔍 Interceptor checking token for:', config.url);
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔍 Retrieved token from AsyncStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Added auth token to request:', config.url);
      } else {
        console.warn('⚠️ No auth token found for request:', config.url);
        // Check if this is an auth endpoint (login, register, etc.) that doesn't need a token
        const authEndpoints = ['/auth/login', '/auth/register', '/auth/forgot_password'];
        const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));
        
        if (!isAuthEndpoint) {
          // For non-auth endpoints, this might be an authentication issue
          console.warn('⚠️ Making API request without token to protected endpoint');
          // Let's also check what's in AsyncStorage
          const allKeys = await AsyncStorage.getAllKeys();
          console.log('🔍 All AsyncStorage keys:', allKeys);
        }
      }
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Clear invalid token
        await AsyncStorage.removeItem('auth_token');
        
        // You might want to redirect to login screen here
        // For now, just reject the promise
        return Promise.reject(new Error('Authentication required'));
      } catch (clearError) {
        console.warn('Failed to clear auth token:', clearError);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle specific HTTP errors
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return Promise.reject(new Error(data?.message || 'Bad request'));
      case 403:
        return Promise.reject(new Error('Access forbidden'));
      case 404:
        return Promise.reject(new Error('Resource not found'));
      case 422:
        return Promise.reject(new Error(data?.message || 'Validation error'));
      case 500:
        return Promise.reject(new Error('Server error. Please try again later.'));
      default:
        return Promise.reject(new Error(data?.message || `HTTP Error ${status}`));
    }
  }
);

export default axiosInstance;