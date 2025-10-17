import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { getCurrentUser } from '../services/apis/AuthApis';

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
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
  removeUser: () => Promise<void>;
  setRegistrationData: (data: { email: string; password: string; termsAccepted: boolean }) => void;
  clearRegistrationData: () => void;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  registrationData: null,
  
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
  
  removeUser: async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      set({ user: null, accessToken: null, refreshToken: null });
    } catch (error) {
      console.error('Failed to remove tokens:', error);
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
}));

export default useAuthStore;