import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  removeTokenSecurely,
  retrieveTokenSecurely,
  storeTokenSecurely,
} from '../../utils';

const axiosInstance = axios.create({
  baseURL: 'https://api.favorapp.net/api/v1',
  timeout: 20000,
});

const refreshAccessToken = async () => {
  try {
    const tokens = await retrieveTokenSecurely();

    if (!tokens) {
      throw new Error('No refresh token available');
    }
    const { accessToken, refreshToken } = tokens;
    const response = await axios.post(
      `${axiosInstance.defaults.baseURL}/token/refresh`,
      {
        refreshToken: refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log('Refresh Token Response -> ', response.data);

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
    await storeTokenSecurely({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    return newAccessToken;
  } catch (error) {
    console.error('Failed to refresh token');
    throw error;
  }
};

// Interceptor to attach the token to each request
axiosInstance.interceptors.request.use(
  async config => {
    // Skip auth for registration, skills, OTP verification, login, resend OTP, forgot password, verify reset OTP, and reset password endpoints
    const authSkipEndpoints = ['/auth/register', '/skills/available', '/auth/verify_otp', '/auth/login', '/auth/resend_otp', '/auth/forgot_password', '/auth/verify_reset_otp', '/auth/reset_password'];
    const shouldSkipAuth = authSkipEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!shouldSkipAuth) {
      console.log('🔍 Checking tokens for request:', config.url);
      
      // Get tokens from AsyncStorage using the same keys as auth store
      const accessToken = await AsyncStorage.getItem('auth_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('🔐 Token attached to request:', config.url);
        console.log('📊 Token details:', {
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken?.length,
          accessTokenStart: accessToken?.substring(0, 20) + '...',
          hasRefreshToken: !!refreshToken
        });
      } else {
        console.error('❌ No valid tokens found for authenticated request:', config.url);
        console.error('📊 Token status:', {
          accessTokenExists: !!accessToken,
          refreshTokenExists: !!refreshToken
        });
      }
    } else {
      console.log('⏭️ Skipping auth for:', config.url);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const genericMessage = 'Something went wrong.';

    console.error('[INTERCEPTOR - ERROR] => ', {
      message: error.message,
      code: error.code,
      response: error.response?.data?.message || error
    });

    // Network error (no response from server)
    if (error.message === 'Network Error') {
      error.userMessage = genericMessage;
      return Promise.reject(error);
    }

    // Timeout or no response
    if (error.code === 'ECONNABORTED' || !error.response) {
      error.userMessage = genericMessage;
      return Promise.reject(error);
    }

    // HTML response from server (like 404 HTML page)
    if (
      typeof error.response.data === 'string' &&
      error.response.data.startsWith('<')
    ) {
      error.userMessage = genericMessage;
      return Promise.reject(error);
    }

    // Try to extract meaningful backend error message
    const backendMessage = error.response?.data?.message;

    if (typeof backendMessage === 'string') {
      error.userMessage = backendMessage;
    } else {
      error.userMessage = genericMessage;
    }

    return Promise.reject(error);
  }
);

// Removed re-exports to fix circular dependency issues
// Import these directly from their respective files instead
export * from './ProfileApis';
export default axiosInstance;
