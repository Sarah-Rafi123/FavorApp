import { useMutation } from "@tanstack/react-query";
import { registerUser, verifyOtp, loginUser, resendOtp, forgotPassword, verifyResetOtp, resetPassword } from "../apis/AuthApis";
import { RegistrationData, OtpVerificationData, LoginData, ResendOtpData, ForgotPasswordData, VerifyResetOtpData, ResetPasswordData } from "../../types";

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