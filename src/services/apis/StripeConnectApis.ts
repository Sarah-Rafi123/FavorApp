import axiosInstance from './index';

const USE_MOCK_SERVICE = process.env.EXPO_PUBLIC_USE_MOCK_PAYMENTS === 'true' || !process.env.EXPO_PUBLIC_API_BASE_URL;

export interface StripeConnectAccountResponse {
  success: boolean;
  data: {
    account_id: string;
    account_type: string;
    charges_enabled: boolean;
    details_submitted: boolean;
    payouts_enabled: boolean;
    already_exists: boolean;
  };
  message: string;
}

export interface StripeConnectError {
  success: false;
  errors: string[];
  message: string;
}

export const StripeConnectApis = {
  /**
   * Creates a Stripe Express Connect account
   * This is required for payment processing
   * 
   * @returns Promise<StripeConnectAccountResponse> - Connect account details
   */
  createConnectAccount: async (): Promise<StripeConnectAccountResponse> => {
    if (USE_MOCK_SERVICE) {
      console.log('Using mock service for Stripe Connect Account creation');
      // Mock successful response
      return {
        success: true,
        data: {
          account_id: `acct_mock_${Math.random().toString(36).substr(2, 9)}`,
          account_type: 'express',
          charges_enabled: true,
          details_submitted: true,
          payouts_enabled: true,
          already_exists: false
        },
        message: 'Payment account created successfully. Please complete onboarding.'
      };
    }

    try {
      console.log('🚀 Making Stripe Connect Account API call to: /stripe_connect/create_account');
      const response = await axiosInstance.post('/stripe_connect/create_account');
      
      console.log('🎉 Stripe Connect Account API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      console.log('✅ Stripe Connect Account Details:', {
        success: response.data.success,
        account_id: response.data.data.account_id,
        account_type: response.data.data.account_type,
        charges_enabled: response.data.data.charges_enabled,
        details_submitted: response.data.data.details_submitted,
        payouts_enabled: response.data.data.payouts_enabled,
        already_exists: response.data.data.already_exists,
        message: response.data.message,
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Stripe Connect Account API Error!');
      console.error('📄 Full API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle different error scenarios
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 422) {
        const errorMessage = error.response?.data?.message || 'Stripe Connect account creation failed';
        throw new Error(`Payment account setup failed: ${errorMessage}`);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating payment account. Please try again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to create payment account. Please try again.');
      }
    }
  },
};