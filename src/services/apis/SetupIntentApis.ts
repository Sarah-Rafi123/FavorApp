import axiosInstance from './index';
import { SetupIntentMockService } from '../mock/SetupIntentMockService';

const USE_MOCK_SERVICE = process.env.EXPO_PUBLIC_USE_MOCK_PAYMENTS === 'true' || !process.env.EXPO_PUBLIC_API_URL;

export interface SetupIntentResponse {
  success: boolean;
  data: {
    client_secret: string;
    setup_intent_id: string;
    customer_id: string;
  };
  message: string;
}

export interface SetupIntentError {
  success: false;
  error: string;
  message: string;
}

export const SetupIntentApis = {
  /**
   * Creates a Stripe SetupIntent for collecting payment method details
   * This endpoint requires authentication and will be called automatically after login
   * 
   * @returns Promise<SetupIntentResponse> - Setup intent with client_secret
   */
  createSetupIntent: async (): Promise<SetupIntentResponse> => {
    if (USE_MOCK_SERVICE) {
      console.log('Using mock service for Setup Intent creation');
      return SetupIntentMockService.createSetupIntent();
    }

    try {
      const response = await axiosInstance.post('/payment_methods/setup_intent');
      
      console.log('Setup Intent created successfully:', {
        setup_intent_id: response.data.data.setup_intent_id,
        customer_id: response.data.data.customer_id,
        hasClientSecret: !!response.data.data.client_secret,
      });

      return response.data;
    } catch (error: any) {
      console.error('Setup Intent API Error:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 422) {
        const errorMessage = error.response?.data?.message || 'Stripe error occurred';
        throw new Error(`Payment setup failed: ${errorMessage}`);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to setup payment method. Please try again.');
      }
    }
  },
};