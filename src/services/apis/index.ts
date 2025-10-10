import axios from 'axios';
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
      const tokens = await retrieveTokenSecurely();
      if (tokens) {
        config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
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
export default axiosInstance;
