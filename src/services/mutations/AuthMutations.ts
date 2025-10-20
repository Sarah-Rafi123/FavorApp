import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser, verifyOtp, loginUser, resendOtp, forgotPassword, verifyResetOtp, resetPassword, deleteAccount, DeleteAccountData } from "../apis/AuthApis";
import { RegistrationData, OtpVerificationData, LoginData, ResendOtpData, ForgotPasswordData, VerifyResetOtpData, ResetPasswordData } from "../../types";
import Toast from 'react-native-toast-message';
import useAuthStore from '../../store/useAuthStore';

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (payload: RegistrationData) => registerUser(payload),
  });
};

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: (payload: OtpVerificationData) => verifyOtp(payload),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginData) => loginUser(payload),
  });
};

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: (payload: ResendOtpData) => resendOtp(payload),
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordData) => forgotPassword(payload),
  });
};

export const useVerifyResetOtpMutation = () => {
  return useMutation({
    mutationFn: (payload: VerifyResetOtpData) => verifyResetOtp(payload),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordData) => resetPassword(payload),
  });
};

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  const { removeUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: DeleteAccountData) => deleteAccount(data),
    onSuccess: async (response) => {
      console.log('🎉 Delete Account Success:', response);
      
      // Clear all cached data
      queryClient.clear();
      
      // Clear user data and logout
      await removeUser();
      
      Toast.show({
        type: 'success',
        text1: 'Account Deleted',
        text2: 'Your account has been successfully deleted.',
        position: 'top',
      });
    },
    onError: (error: any) => {
      console.error('❌ Delete Account Error:', error);
      
      const errorMessage = error.message || 'Failed to delete account. Please try again.';
      
      Toast.show({
        type: 'error',
        text1: 'Delete Account Failed',
        text2: errorMessage,
        position: 'top',
      });
    },
  });
};