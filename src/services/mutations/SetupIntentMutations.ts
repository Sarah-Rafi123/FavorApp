import { useMutation } from '@tanstack/react-query';
import { SetupIntentApis, SetupIntentResponse } from '../apis/SetupIntentApis';
import Toast from 'react-native-toast-message';

/**
 * Hook for creating Setup Intent immediately after user login
 * This prepares Stripe for future payment method collection
 */
export const useCreateSetupIntent = () => {
  return useMutation<SetupIntentResponse, Error, boolean | undefined>({
    mutationFn: (forceNew?: boolean) => SetupIntentApis.createSetupIntent(forceNew),
    onSuccess: (data) => {
      console.log('🎉 Setup Intent Mutation Success!');
      console.log('📄 Full Setup Intent Response:', JSON.stringify(data, null, 2));
      console.log('✅ Setup Intent Details:', {
        success: data.success,
        setupIntentId: data.data.setup_intent_id,
        customerId: data.data.customer_id,
        hasClientSecret: !!data.data.client_secret,
        clientSecretLength: data.data.client_secret?.length,
        message: data.message,
      });
      
      // Store setup intent data for later use
      // You might want to store this in AsyncStorage or state management
      // AsyncStorage.setItem('setup_intent_client_secret', data.data.client_secret);
      // AsyncStorage.setItem('customer_id', data.data.customer_id);
    },
    onError: (error) => {
      console.error('❌ Setup Intent Mutation Failed!');
      console.error('📄 Full Setup Intent Error:', error);
      console.error('🔍 Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
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
    // Disable retries to prevent repeated API calls
    retry: false
  });
};