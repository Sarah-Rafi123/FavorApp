import { axiosInstance } from '../axiosConfig';

const USE_MOCK_SERVICE = process.env.EXPO_PUBLIC_USE_MOCK_PAYMENTS === 'true';

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

export interface StripeConnectSetupResponse {
  success: boolean;
  message: string;
  data: {
    onboarding_url: string;
    account_id: string;
    account_created: boolean;
    expires_at: string;
  };
}

export interface StripeConnectAccountStatusResponse {
  success: boolean;
  data: {
    has_account: boolean;
    account_id?: string;
    onboarding_complete: boolean;
    details_submitted?: boolean;
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
    can_receive_payments: boolean;
    requirements?: {
      currently_due: string[];
      eventually_due: string[];
      disabled_reason: string | null;
    };
    message: string;
  };
}

export interface StripeConnectBalanceResponse {
  success: boolean;
  data: {
    has_account: boolean;
    available: number;
    pending: number;
    currency: string;
    details: {
      available_funds: Array<{ amount: number; currency: string }>;
      pending_funds: Array<{ amount: number; currency: string }>;
    };
  };
}

export interface StripeConnectSetupRequest {
  return_url?: string;
  refresh_url?: string;
  test_mode?: boolean;
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
          account_id: `acct_mock_${Math.random().toString(36).substring(2, 11)}`,
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

  /**
   * Set up payment account
   * Creates Stripe account if user doesn't have one
   * Returns Stripe onboarding URL
   */
  setup: async (returnUrl?: string, refreshUrl?: string): Promise<StripeConnectSetupResponse> => {
    if (USE_MOCK_SERVICE) {
      console.log('Using mock service for Stripe Connect Setup');
      return {
        success: true,
        message: 'Payment account created! Open the link to complete setup.',
        data: {
          onboarding_url: `https://connect.stripe.com/setup/e/mock_${Math.random().toString(36).substring(2, 11)}`,
          account_id: `acct_mock_${Math.random().toString(36).substring(2, 11)}`,
          account_created: true,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
        }
      };
    }

    try {
      console.log('🚀 Making Stripe Connect Setup API call to: /stripe_connect/setup');
      
      // Only include URLs if they're provided and look valid
      const requestBody: StripeConnectSetupRequest = {};
      if (returnUrl && returnUrl.startsWith('http')) {
        requestBody.return_url = returnUrl;
      }
      if (refreshUrl && refreshUrl.startsWith('http')) {
        requestBody.refresh_url = refreshUrl;
      }
      
      // Add test mode flag for development
      if (process.env.NODE_ENV === 'development' || __DEV__) {
        requestBody.test_mode = true;
      }
      
      console.log('📋 Request body:', requestBody);
      const response = await axiosInstance.post('/stripe_connect/setup', requestBody);
      
      console.log('🎉 Stripe Connect Setup API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Stripe Connect Setup API Error!');
      console.error('📄 Full API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to setup payment account. Please try again.');
      }
    }
  },

  /**
   * Check account status
   * Verifies if onboarding is complete and user can receive payments
   */
  getAccountStatus: async (): Promise<StripeConnectAccountStatusResponse> => {
    if (USE_MOCK_SERVICE) {
      console.log('Using mock service for Stripe Connect Account Status');
      return {
        success: true,
        data: {
          has_account: true,
          account_id: `acct_mock_${Math.random().toString(36).substring(2, 11)}`,
          onboarding_complete: true,
          details_submitted: true,
          charges_enabled: true,
          payouts_enabled: true,
          can_receive_payments: true,
          requirements: {
            currently_due: [],
            eventually_due: [],
            disabled_reason: null
          },
          message: 'Your payment account is fully set up!'
        }
      };
    }

    try {
      console.log('🚀 Making Stripe Connect Account Status API call to: /stripe_connect/account_status');
      const response = await axiosInstance.get('/stripe_connect/account_status');
      
      console.log('🎉 Stripe Connect Account Status API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Stripe Connect Account Status API Error!');
      console.error('📄 Full API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to check account status. Please try again.');
      }
    }
  },

  /**
   * View balance
   * Shows available and pending balance
   */
  getBalance: async (): Promise<StripeConnectBalanceResponse> => {
    if (USE_MOCK_SERVICE) {
      console.log('Using mock service for Stripe Connect Balance');
      return {
        success: true,
        data: {
          has_account: true,
          available: 125.50,
          pending: 75.00,
          currency: 'usd',
          details: {
            available_funds: [{ amount: 125.50, currency: 'usd' }],
            pending_funds: [{ amount: 75.00, currency: 'usd' }]
          }
        }
      };
    }

    try {
      console.log('🚀 Making Stripe Connect Balance API call to: /stripe_connect/balance');
      const response = await axiosInstance.get('/stripe_connect/balance');
      
      console.log('🎉 Stripe Connect Balance API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Stripe Connect Balance API Error!');
      console.error('📄 Full API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to get balance. Please try again.');
      }
    }
  },
};