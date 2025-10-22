import { axiosInstance } from '../axiosConfig';

// Support API Types
export interface SupportRequest {
  full_name: string;
  email: string;
  subject: string;
  description: string;
}

export interface SupportResponse {
  success: boolean;
  data: {
    submitted: boolean;
    message_sent: boolean;
  };
  message: string;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

export interface SupportErrorResponse {
  success: false;
  errors: {
    full_name?: string[];
    email?: string[];
    subject?: string[];
    description?: string[];
  };
  message: string;
  meta: {
    api_version: string;
    error_code: string;
    timestamp: string;
  };
}

export const submitSupportRequest = async (data: SupportRequest): Promise<SupportResponse> => {
  try {
    console.log(`🚀 Making Submit Support Request API call to: /support/contact`);
    console.log('📤 Request Data:', JSON.stringify(data, null, 2));
    
    const response = await axiosInstance.post('/support/contact', data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('🎉 Submit Support Request API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Submit Support Request API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 422) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        // Format validation errors for display
        const errorMessages = [];
        if (errorData.errors.full_name) errorMessages.push(...errorData.errors.full_name);
        if (errorData.errors.email) errorMessages.push(...errorData.errors.email);
        if (errorData.errors.subject) errorMessages.push(...errorData.errors.subject);
        if (errorData.errors.description) errorMessages.push(...errorData.errors.description);
        
        throw new Error(errorMessages.join(', ') || 'Validation failed. Please check your input.');
      } else {
        throw new Error('Validation failed. Please check your input.');
      }
    } else if (error.response?.status === 503) {
      throw new Error('Email delivery failed. Please try again later.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to submit support request. Please check your connection and try again.');
    }
  }
};