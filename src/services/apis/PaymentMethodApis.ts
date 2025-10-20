import axiosInstance from './index';
import { PaymentMethodMockService } from '../mock/PaymentMethodMockService';

const USE_MOCK_SERVICE = process.env.EXPO_PUBLIC_USE_MOCK_PAYMENTS === 'true' || !process.env.EXPO_PUBLIC_API_BASE_URL;

// Types for Payment Method APIs
export interface PaymentMethodCard {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  funding: string;
  country: string;
}

export interface PaymentMethodBillingDetails {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: {
    city: string | null;
    country: string | null;
    line1: string | null;
    line2: string | null;
    postal_code: string | null;
    state: string | null;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  card: PaymentMethodCard;
  billing_details: PaymentMethodBillingDetails;
  is_default: boolean;
  created_at: string;
}

// Save Payment Method
export interface SavePaymentMethodRequest {
  setup_intent_id: string;
}

export interface SavePaymentMethodResponse {
  success: boolean;
  data: {
    payment_method: PaymentMethod;
    is_default: boolean;
  };
  message: string;
}

// List Payment Methods
export interface ListPaymentMethodsResponse {
  success: boolean;
  data: {
    payment_methods: PaymentMethod[];
    has_payment_method: boolean;
    default_payment_method_id?: string;
  };
  message: string | null;
}

// Delete Payment Method
export interface DeletePaymentMethodResponse {
  success: boolean;
  data: {
    deleted_payment_method_id: string;
  };
  message: string;
}

export const PaymentMethodApis = {
  /**
   * Save payment method after SetupIntent confirmation
   * Called after Stripe SDK successfully confirms the SetupIntent
   */
  savePaymentMethod: async (data: SavePaymentMethodRequest): Promise<SavePaymentMethodResponse> => {
    if (USE_MOCK_SERVICE) {
      console.log('Using mock service for save payment method');
      return PaymentMethodMockService.savePaymentMethod(data);
    }

    try {
      const response = await axiosInstance.post('/payment_methods', data);
      
      console.log('Payment method saved successfully:', {
        payment_method_id: response.data.data.payment_method.id,
        is_default: response.data.data.is_default,
        card_last4: response.data.data.payment_method.card.last4,
        card_brand: response.data.data.payment_method.card.brand,
      });

      return response.data;
    } catch (error: any) {
      console.error('Save Payment Method API Error:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Missing setup intent ID');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid token or setup intent doesn\'t belong to user');
      } else if (error.response?.status === 422) {
        const errorMessage = error.response?.data?.message || 'Setup intent not completed or Stripe error';
        throw new Error(errorMessage);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to save payment method. Please try again.');
      }
    }
  },

  /**
   * List all payment methods for the authenticated user
   */
  listPaymentMethods: async (): Promise<ListPaymentMethodsResponse> => {
    if (USE_MOCK_SERVICE) {
      console.log('Using mock service for list payment methods');
      return PaymentMethodMockService.listPaymentMethods();
    }

    try {
      const response = await axiosInstance.get('/payment_methods');
      
      console.log('Payment methods retrieved:', {
        count: response.data.data.payment_methods.length,
        has_payment_method: response.data.data.has_payment_method,
        default_payment_method_id: response.data.data.default_payment_method_id,
      });

      return response.data;
    } catch (error: any) {
      console.error('List Payment Methods API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 422) {
        // 422 often means no payment methods found - return empty response instead of error
        console.log('💡 422 error likely means no payment methods found - returning empty list');
        return {
          success: true,
          data: {
            payment_methods: []
          },
          message: 'No payment methods found'
        };
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to load payment methods. Please try again.');
      }
    }
  },

  /**
   * Delete a payment method
   */
  deletePaymentMethod: async (paymentMethodId: string): Promise<DeletePaymentMethodResponse> => {
    if (USE_MOCK_SERVICE) {
      console.log('Using mock service for delete payment method');
      return PaymentMethodMockService.deletePaymentMethod(paymentMethodId);
    }

    try {
      const response = await axiosInstance.delete(`/payment_methods/${paymentMethodId}`);
      
      console.log('Payment method deleted successfully:', {
        deleted_payment_method_id: response.data.data.deleted_payment_method_id,
      });

      return response.data;
    } catch (error: any) {
      console.error('Delete Payment Method API Error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Payment method doesn\'t belong to user or invalid token');
      } else if (error.response?.status === 404) {
        throw new Error('Payment method not found');
      } else if (error.response?.status === 422) {
        const errorMessage = error.response?.data?.message || 'Stripe error occurred';
        throw new Error(errorMessage);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to delete payment method. Please try again.');
      }
    }
  },
};