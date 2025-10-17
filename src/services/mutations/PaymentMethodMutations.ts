import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PaymentMethodApis, 
  SavePaymentMethodRequest, 
  SavePaymentMethodResponse,
  DeletePaymentMethodResponse 
} from '../apis/PaymentMethodApis';
import Toast from 'react-native-toast-message';

/**
 * Hook for saving a payment method after SetupIntent confirmation
 */
export const useSavePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation<SavePaymentMethodResponse, Error, SavePaymentMethodRequest>({
    mutationFn: (data: SavePaymentMethodRequest) => PaymentMethodApis.savePaymentMethod(data),
    onSuccess: (data) => {
      console.log('Payment method saved successfully:', data.data.payment_method.id);
      
      // Invalidate and refetch payment methods list
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      
      Toast.show({
        type: 'success',
        text1: 'Payment Method Added',
        text2: `${data.data.payment_method.card.brand.toUpperCase()} ending in ${data.data.payment_method.card.last4} added successfully`,
        visibilityTime: 4000,
      });
    },
    onError: (error) => {
      console.error('Save payment method failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Save Payment Method',
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};

/**
 * Hook for deleting a payment method
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation<DeletePaymentMethodResponse, Error, string>({
    mutationFn: (paymentMethodId: string) => PaymentMethodApis.deletePaymentMethod(paymentMethodId),
    onSuccess: (data) => {
      console.log('Payment method deleted successfully:', data.data.deleted_payment_method_id);
      
      // Invalidate and refetch payment methods list
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      
      Toast.show({
        type: 'success',
        text1: 'Payment Method Removed',
        text2: 'Payment method has been removed successfully',
        visibilityTime: 3000,
      });
    },
    onError: (error) => {
      console.error('Delete payment method failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Remove Payment Method',
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};