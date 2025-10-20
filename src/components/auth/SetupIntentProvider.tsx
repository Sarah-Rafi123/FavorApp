import React, { useEffect, useRef } from 'react';
import { useCreateSetupIntent } from '../../services/mutations/SetupIntentMutations';
import { usePaymentIntentStore } from '../../store/usePaymentIntentStore';
import useAuthStore from '../../store/useAuthStore';

interface SetupIntentProviderProps {
  children: React.ReactNode;
}

/**
 * SetupIntentProvider automatically creates a Setup Intent when user logs in
 * This creates a setup intent for payment method collection
 */
export const SetupIntentProvider: React.FC<SetupIntentProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { 
    paymentIntentData, 
    setPaymentIntentData, 
    setLoading, 
    setError,
    loadPaymentIntentFromStorage 
  } = usePaymentIntentStore();

  const createSetupIntentMutation = useCreateSetupIntent();
  const hasCreatedSetupIntent = useRef(false);
  const currentUserId = useRef<string | null>(null);

  // Load existing payment intent data on component mount
  useEffect(() => {
    loadPaymentIntentFromStorage();
  }, [loadPaymentIntentFromStorage]);

  // Note: Setup Intent creation is now handled on-demand when user adds payment method
  // No automatic creation on login to avoid authentication timing issues
  useEffect(() => {
    // Update current user ID when user logs in
    if (user && currentUserId.current !== user.id) {
      console.log('👤 User logged in:', user.id);
      currentUserId.current = user.id;
      hasCreatedSetupIntent.current = false; // Reset for new user
    }
  }, [user]);

  // Clear payment intent data when user logs out
  useEffect(() => {
    if (!user && paymentIntentData) {
      console.log('👋 User logged out, clearing Setup Intent data');
      usePaymentIntentStore.getState().clearPaymentIntentData();
      
      // Reset flags for next login
      hasCreatedSetupIntent.current = false;
      currentUserId.current = null;
    }
  }, [user, paymentIntentData]);

  return <>{children}</>;
};