import { axiosInstance } from '../axiosConfig';

// KYC Start Verification Types
export interface KYCStartData {
  redirect_url: string;
  reference: string;
}

export interface KYCStartResponse {
  success: boolean;
  data: KYCStartData;
  message: string;
}

// KYC Status Types
export interface KYCStatusData {
  is_kyc_verified: 'not-verified' | 'pending' | 'verified' | 'failed';
  verification_reference?: string;
}

export interface KYCStatusResponse {
  success: boolean;
  data: KYCStatusData;
  message: string;
}

// Certification Status Types
export interface CertificationStatusData {
  is_certified: boolean;
  is_kyc_verified: 'not-verified' | 'pending' | 'verified' | 'failed';
  certification_level?: string;
  verified_at?: string;
  subscription_source?: 'stripe' | 'revenue_cat';
  can_subscribe_on_web?: boolean;
  can_subscribe_on_mobile?: boolean;
  can_cancel_on_web?: boolean;
  can_cancel_on_mobile?: boolean;
  active_subscription?: {
    plan: {
      id: number;
      name: string;
      interval: 'month' | 'year';
      price_cents: number;
      stripe_price_id?: string;
    };
    status: 'paid' | 'unpaid' | 'cancelled';
    transaction_id: string;
    invoice?: string;
    active: boolean;
    source: 'stripe' | 'revenue_cat';
    manageable_on_web?: boolean;
  };
  has_payment_method?: boolean;
  stripe_customer_id?: string;
}

export interface CertificationStatusResponse {
  success: boolean;
  data: CertificationStatusData;
  message: string;
}

export const startKYCVerification = async (): Promise<KYCStartResponse> => {
  try {
    console.log(`🚀 Making Start KYC Verification API call to: /certifications/kyc/start`);
    
    const response = await axiosInstance.post('/certifications/kyc/start');
    
    console.log('🎉 Start KYC Verification API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Start KYC Verification API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 422) {
      const errorData = error.response?.data;
      if (errorData?.errors?.length > 0) {
        throw new Error(errorData.errors.join(', '));
      } else if (errorData?.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error('Failed to start KYC verification');
      }
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to start KYC verification. Please check your connection and try again.');
    }
  }
};

export const getKYCStatus = async (): Promise<KYCStatusResponse> => {
  try {
    console.log(`🚀 Making Get KYC Status API call to: /certifications/kyc/status`);
    
    const response = await axiosInstance.get('/certifications/kyc/status');
    
    console.log('🎉 Get KYC Status API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get KYC Status API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to get KYC status. Please check your connection and try again.');
    }
  }
};

export const getCertificationStatus = async (): Promise<CertificationStatusResponse> => {
  try {
    console.log(`🚀 Making Get Certification Status API call to: /certifications/status`);
    
    const response = await axiosInstance.get('/certifications/status');
    
    console.log('🎉 Get Certification Status API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Certification Status API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to get certification status. Please check your connection and try again.');
    }
  }
};