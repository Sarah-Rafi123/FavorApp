import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { getCurrentUser } from '../services/apis/AuthApis';
import { authErrorHandler } from '../services/authErrorHandler';
import Toast from 'react-native-toast-message';
import { QueryClient } from '@tanstack/react-query';

/**
 * Authentication store manages the user's authentication state.
 * Provides functionality to set and remove the current user, and manage registration flow.
 * 
 * @example
 * ```tsx
 * // Access the current user
 * const user = useAuthStore(state => state.user);
 * 
 * // Set user after login
 * const setUser = useAuthStore(state => state.setUser);
 * setUser(userData);
 * 
 * // Remove user on logout
 * const removeUser = useAuthStore(state => state.removeUser);
 * removeUser();
 * ```
 */

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  registrationData: {
    email: string;
    password: string;
    termsAccepted: boolean;
  } | null;
  queryClient: QueryClient | null;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
  setUserAndTokens: (user: User, accessToken: string, refreshToken?: string) => Promise<void>;
  removeUser: () => Promise<void>;
  setRegistrationData: (data: { email: string; password: string; termsAccepted: boolean }) => void;
  clearRegistrationData: () => void;
  initializeAuth: () => Promise<void>;
  handleAuthError: () => Promise<void>;
  setQueryClient: (queryClient: QueryClient) => void;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  registrationData: null,
  queryClient: null,
  
  setUser: (user) => set({ user }),
  
  setTokens: async (accessToken: string, refreshToken?: string) => {
    try {
      console.log('🔑 setTokens called with:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      await AsyncStorage.setItem('auth_token', accessToken);
      console.log('✅ Access token stored in AsyncStorage');
      
      if (refreshToken) {
        await AsyncStorage.setItem('refresh_token', refreshToken);
        console.log('✅ Refresh token stored in AsyncStorage');
      }
      
      set({ accessToken, refreshToken });
      console.log('✅ Tokens set in auth store');
      
      // Verify storage worked
      const storedToken = await AsyncStorage.getItem('auth_token');
      console.log('🔍 Verification - stored token exists:', !!storedToken);
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
    }
  },

  setUserAndTokens: async (user: User, accessToken: string, refreshToken?: string) => {
    try {
      console.log('🔑 setUserAndTokens called with:', { 
        user: user.firstName, 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken 
      });
      
      // Store tokens in AsyncStorage first
      await AsyncStorage.setItem('auth_token', accessToken);
      console.log('✅ Access token stored in AsyncStorage');
      
      if (refreshToken) {
        await AsyncStorage.setItem('refresh_token', refreshToken);
        console.log('✅ Refresh token stored in AsyncStorage');
      }
      
      // Set both user and tokens atomically in a single state update
      set({ user, accessToken, refreshToken });
      console.log('✅ User and tokens set atomically in auth store');
      
      // Verify storage worked
      const storedToken = await AsyncStorage.getItem('auth_token');
      console.log('🔍 Verification - stored token exists:', !!storedToken);
    } catch (error) {
      console.error('❌ Failed to store user and tokens:', error);
    }
  },
  
  removeUser: async () => {
    try {
      console.log('🚪 Logging out user - clearing all data');
      
      // Clear from AsyncStorage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('was_ever_authenticated');
      
      // Clear React Query cache for user-specific data
      const { queryClient } = get();
      if (queryClient) {
        console.log('🧹 Clearing React Query cache');
        queryClient.removeQueries({ queryKey: ['profile'] });
        queryClient.removeQueries({ queryKey: ['stripeBalance'] });
        queryClient.removeQueries({ queryKey: ['userReviews'] });
        queryClient.removeQueries({ queryKey: ['myFavors'] });
        queryClient.removeQueries({ queryKey: ['favors'] });
        queryClient.removeQueries({ queryKey: ['browseFavors'] });
        // Clear all user-specific queries
        queryClient.clear();
        console.log('✅ React Query cache cleared');
      }
      
      // Clear auth state
      set({ user: null, accessToken: null, refreshToken: null, registrationData: null });
      console.log('✅ Auth state cleared');
    } catch (error) {
      console.error('❌ Failed to remove user data:', error);
    }
  },
  
  initializeAuth: async () => {
    try {
      console.log('🔄 Initializing authentication...');
      const accessToken = await AsyncStorage.getItem('auth_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      console.log('🔍 Found stored tokens:', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken
      });
      
      if (accessToken) {
        // First set the tokens in store
        set({ accessToken, refreshToken });
        console.log('✅ Tokens restored to store');
        
        // Try to fetch user data with the token
        try {
          console.log('🔄 Fetching user data with stored token...');
          const userResponse = await getCurrentUser();
          
          if (userResponse.success && userResponse.data?.user) {
            set({ user: {
              id: userResponse.data.user.id.toString(),
              firstName: userResponse.data.user.first_name,
              email: userResponse.data.user.email,
            }});
            console.log('✅ User data restored from token:', userResponse.data.user.first_name);
          } else {
            console.warn('⚠️ Invalid user response structure:', userResponse);
            throw new Error('Invalid user response');
          }
        } catch (userError) {
          console.warn('⚠️ Failed to fetch user data with stored token:', userError);
          // Token might be invalid, clear everything
          console.log('🧹 Clearing invalid tokens...');
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('refresh_token');
          set({ accessToken: null, refreshToken: null, user: null });
        }
      } else {
        console.log('ℹ️ No stored tokens found');
        // Ensure store is clean
        set({ accessToken: null, refreshToken: null, user: null });
      }
    } catch (error) {
      console.error('❌ Failed to initialize auth:', error);
      // Ensure store is clean on error
      set({ accessToken: null, refreshToken: null, user: null });
    }
  },
  
  setRegistrationData: (data) => set({ registrationData: data }),
  clearRegistrationData: () => set({ registrationData: null }),
  
  handleAuthError: async () => {
    console.log('🚨 Handling authentication error - logging out user');
    try {
      // Clear all auth data from AsyncStorage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('was_ever_authenticated');
      
      // Clear React Query cache for user-specific data
      const { queryClient } = get();
      if (queryClient) {
        console.log('🧹 Clearing React Query cache due to auth error');
        queryClient.clear();
        console.log('✅ React Query cache cleared');
      }
      
      // Clear auth state
      set({ user: null, accessToken: null, refreshToken: null, registrationData: null });
      
      // Show user notification
      Toast.show({
        type: 'error',
        text1: 'Session Expired',
        text2: 'Please log in again to continue',
        visibilityTime: 4000,
      });
      
      console.log('✅ User logged out successfully due to authentication error');
    } catch (error) {
      console.error('❌ Failed to clear auth data during error handling:', error);
    }
  },

  setQueryClient: (queryClient: QueryClient) => set({ queryClient }),
}));

// Set up global authentication error handler
authErrorHandler.onAuthError((error) => {
  console.log('🚨 Global auth error handler triggered:', error.message);
  const { handleAuthError } = useAuthStore.getState();
  handleAuthError();
});

export default useAuthStore;