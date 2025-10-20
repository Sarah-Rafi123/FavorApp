import { axiosInstance } from '../axiosConfig';
import { RegistrationData, SkillsResponse, OtpVerificationData, OtpVerificationResponse, LoginData, LoginResponse, ResendOtpData, ResendOtpResponse, ForgotPasswordData, ForgotPasswordResponse, VerifyResetOtpData, VerifyResetOtpResponse, ResetPasswordData, ResetPasswordResponse } from '../../types';

// Delete Account Types
export interface DeleteAccountData {
  password: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  data: {
    deleted: boolean;
    email: string;
    deleted_at: string;
  };
  message: string;
}

export const registerUser = async (data: RegistrationData) => {
  console.log(`[INIT] => /auth/register`);
  const response = await axiosInstance.post('/auth/register', data);
  console.log(`[OK] => /auth/register`);
  return response.data;
};

export const verifyOtp = async (data: OtpVerificationData): Promise<OtpVerificationResponse> => {
  console.log(`[INIT] => /auth/verify_otp`);
  const response = await axiosInstance.post('/auth/verify_otp', data);
  console.log(`[OK] => /auth/verify_otp`);
  return response.data;
};

export const getAvailableSkills = async (): Promise<SkillsResponse> => {
  console.log(`[INIT] => /skills/available`);
  const response = await axiosInstance.get('/skills/available');
  console.log(`[OK] => /skills/available`);
  return response.data;
};

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  console.log(`[INIT] => /auth/login`);
  const response = await axiosInstance.post('/auth/login', data);
  console.log(`[OK] => /auth/login`);
  return response.data;
};

export const resendOtp = async (data: ResendOtpData): Promise<ResendOtpResponse> => {
  console.log(`[INIT] => /auth/resend_otp`);
  const response = await axiosInstance.post('/auth/resend_otp', data);
  console.log(`[OK] => /auth/resend_otp`);
  return response.data;
};

export const forgotPassword = async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
  console.log(`[INIT] => /auth/forgot_password`);
  const response = await axiosInstance.post('/auth/forgot_password', data);
  console.log(`[OK] => /auth/forgot_password`);
  return response.data;
};

export const verifyResetOtp = async (data: VerifyResetOtpData): Promise<VerifyResetOtpResponse> => {
  console.log(`[INIT] => /auth/verify_reset_otp`);
  const response = await axiosInstance.post('/auth/verify_reset_otp', data);
  console.log(`[OK] => /auth/verify_reset_otp`);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
  console.log(`[INIT] => /auth/reset_password`);
  const response = await axiosInstance.post('/auth/reset_password', data);
  console.log(`[OK] => /auth/reset_password`);
  return response.data;
};

export const getCurrentUser = async () => {
  console.log(`[INIT] => /auth/me`);
  const response = await axiosInstance.get('/auth/me');
  console.log(`[OK] => /auth/me`);
  return response.data;
};

export const deleteAccount = async (data: DeleteAccountData): Promise<DeleteAccountResponse> => {
  try {
    console.log(`🚀 Making Delete Account API call to: /auth/account`);
    const response = await axiosInstance.delete('/auth/account', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: data
    });
    
    console.log('🎉 Delete Account API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete Account API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      if (errorData?.errors?.includes('Password is required to delete account')) {
        throw new Error('Password is required to delete account');
      } else if (errorData?.errors?.includes('Incorrect password')) {
        throw new Error('Incorrect password. Please enter your current password.');
      } else if (errorData?.errors?.includes('Unauthorized')) {
        throw new Error('Session expired. Please log in again.');
      } else {
        throw new Error('Authentication failed. Please try again.');
      }
    } else if (error.response?.status === 500) {
      const errorData = error.response?.data;
      if (errorData?.errors?.includes('Failed to delete account')) {
        throw new Error('Failed to delete account. Please try again later.');
      } else {
        throw new Error('Server error occurred. Please try again later.');
      }
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to delete account. Please check your connection and try again.');
    }
  }
};