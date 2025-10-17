
import { useMutation } from '@tanstack/react-query';
import { PaymentApis, CreatePaymentIntentRequest, PaymentIntentResponse } from '../apis/PaymentApis';
import Toast from 'react-native-toast-message';

export const useCreatePaymentIntent = () => {
  return useMutation<PaymentIntentResponse, Error, CreatePaymentIntentRequest>({
    mutationFn: (data: CreatePaymentIntentRequest) => PaymentApis.createPaymentIntent(data),
    onError: (error) => {
      console.error('Payment intent creation failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Payment Error',
        text2: 'Failed to initialize payment. Please try again.',
      })
    },
  });
};

export const useConfirmPayment = () => {
  return useMutation<PaymentIntentResponse, Error, string>({
    mutationFn: (paymentIntentId: string) => PaymentApis.confirmPayment(paymentIntentId),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Payment Successful',
        text2: 'Your payment has been processed successfully.',
      });
    },
    onError: (error) => {
      console.error('Payment confirmation failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: 'Payment could not be processed. Please try again.',
      });
    },
  });
};