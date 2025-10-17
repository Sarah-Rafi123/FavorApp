import { useQuery } from '@tanstack/react-query';
import { PaymentMethodApis, ListPaymentMethodsResponse } from '../apis/PaymentMethodApis';
import useAuthStore from '../../store/useAuthStore';

/**
 * Hook for fetching payment methods list
 * Only fetches when user is authenticated
 */
export const usePaymentMethods = () => {
  const { user } = useAuthStore();

  return useQuery<ListPaymentMethodsResponse, Error>({
    queryKey: ['paymentMethods'],
    queryFn: () => PaymentMethodApis.listPaymentMethods(),
    enabled: !!user, // Only fetch when user is logged in
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error.message.includes('Authentication required')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};