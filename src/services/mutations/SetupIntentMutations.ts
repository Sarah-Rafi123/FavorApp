import { useMutation } from '@tanstack/react-query';
import { SetupIntentApis, SetupIntentResponse } from '../apis/SetupIntentApis';
import Toast from 'react-native-toast-message';

/**
 * Hook for creating Setup Intent immediately after user login
 * This prepares Stripe for future payment method collection
 */
export const useCreateSetupIntent = () => {
  return useMutation<SetupIntentResponse, Error, void>({
    mutationFn: () => SetupIntentApis.createSetupIntent(),
    onSuccess: (data) => {
      console.log('Setup Intent created:', {
        setupIntentId: data.data.setup_intent_id,
        customerId: data.data.customer_id,
      });
      
      // Store setup intent data for later use
      // You might want to store this in AsyncStorage or state management
      // AsyncStorage.setItem('setup_intent_client_secret', data.data.client_secret);
      // AsyncStorage.setItem('customer_id', data.data.customer_id);
    },
    onError: (error) => {
      console.error('Setup Intent creation failed:', error);
      
      // Only show toast for non-authentication errors
      // Authentication errors should be handled by the auth flow
      if (!error.message.includes('Authentication required')) {
        Toast.show({
          type: 'error',
          text1: 'Payment Setup Error',
          text2: error.message,
          visibilityTime: 4000,
        });
      }
    },
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error.message.includes('Authentication required')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};