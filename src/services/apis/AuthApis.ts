import axiosInstance from './index';
import { RegistrationData, SkillsResponse, OtpVerificationData, OtpVerificationResponse, LoginData, LoginResponse, ResendOtpData, ResendOtpResponse, ForgotPasswordData, ForgotPasswordResponse, VerifyResetOtpData, VerifyResetOtpResponse, ResetPasswordData, ResetPasswordResponse } from '../../types';

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