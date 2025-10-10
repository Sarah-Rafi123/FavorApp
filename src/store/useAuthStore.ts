import { create } from 'zustand';
import { User } from '../types';

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
  registrationData: {
    email: string;
    password: string;
    termsAccepted: boolean;
  } | null;
  setUser: (user: User) => void;
  removeUser: () => void;
  setRegistrationData: (data: { email: string; password: string; termsAccepted: boolean }) => void;
  clearRegistrationData: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  registrationData: null,
  setUser: (user) => set({ user }),
  removeUser: () => set({ user: null }),
  setRegistrationData: (data) => set({ registrationData: data }),
  clearRegistrationData: () => set({ registrationData: null }),
}));

export default useAuthStore;