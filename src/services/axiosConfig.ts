import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authErrorHandler } from './authErrorHandler';

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
        console.log('🚨 401 Unauthorized error detected');
        
        // Clear invalid token
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        
        // Emit authentication error event for global handling
        authErrorHandler.emitAuthError(error);
        
        return Promise.reject(new Error('Authentication required'));
      } catch (clearError) {
        console.warn('Failed to clear auth token:', clearError);
      }
    }
    
    // Also handle authentication errors from error messages
    if (error.response?.data?.message && 
        (error.response.data.message.toLowerCase().includes('authentication required') ||
         error.response.data.message.toLowerCase().includes('token') ||
         error.response.data.message.toLowerCase().includes('unauthorized'))) {
      
      console.log('🚨 Authentication error detected in message:', error.response.data.message);
      
      try {
        // Clear invalid token
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        
        // Emit authentication error event for global handling
        authErrorHandler.emitAuthError(error);
      } catch (clearError) {
        console.warn('Failed to clear auth token:', clearError);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle specific HTTP errors while preserving original error details
    const { status, data } = error.response;
    
    // Create a new error with user-friendly message but preserve original error details
    let userMessage: string;
    
    switch (status) {
      case 400:
        userMessage = data?.message || 'Bad request';
        break;
      case 403:
        userMessage = 'Access forbidden';
        break;
      case 404:
        userMessage = 'Resource not found';
        break;
      case 422:
        userMessage = data?.message || 'Validation error';
        break;
      case 500:
        userMessage = 'Server error. Please try again later.';
        break;
      default:
        userMessage = data?.message || `HTTP Error ${status}`;
    }
    
    // Create new error with user-friendly message but preserve original error details
    const enhancedError = new Error(userMessage) as any;
    enhancedError.response = error.response;
    enhancedError.config = error.config;
    enhancedError.code = error.code;
    
    return Promise.reject(enhancedError);
  }
);

export default axiosInstance;