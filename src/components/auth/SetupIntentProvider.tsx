import React, { useEffect, useRef } from 'react';
import { useCreatePaymentIntent } from '../../services/mutations/PaymentMutations';
import { usePaymentIntentStore } from '../../store/usePaymentIntentStore';
import useAuthStore from '../../store/useAuthStore';

interface SetupIntentProviderProps {
  children: React.ReactNode;
}

/**
 * SetupIntentProvider automatically creates a Payment Intent when user logs in
 * This creates a $1.00 payment intent that gets logged and stored locally
 */
export const SetupIntentProvider: React.FC<SetupIntentProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { 
    paymentIntentData, 
    setPaymentIntentData, 
    setLoading, 
    setError,
    loadPaymentIntentFromStorage 
  } = usePaymentIntentStore();

  const createPaymentIntentMutation = useCreatePaymentIntent();
  const hasCreatedPaymentIntent = useRef(false);
  const currentUserId = useRef<string | null>(null);

  // Load existing payment intent data on component mount
  useEffect(() => {
    loadPaymentIntentFromStorage();
  }, [loadPaymentIntentFromStorage]);

  // Create payment intent when user logs in (only once per user session)
  useEffect(() => {
    // Check if this is a new user login
    const isNewUserLogin = user && (currentUserId.current !== user.id);
    
    if (isNewUserLogin && !createPaymentIntentMutation.isPending && !hasCreatedPaymentIntent.current) {
      console.log('🚀 User logged in, creating Payment Intent...');
      
      // Mark that we're creating a payment intent for this user
      hasCreatedPaymentIntent.current = true;
      currentUserId.current = user.id;
      
      setLoading(true);
      setError(null);

      // Create a $1.00 payment intent once per login session
      createPaymentIntentMutation.mutate(
        { 
          amount: 100, // $1.00 in cents
          currency: 'usd' 
        }, 
        {
          onSuccess: (data) => {
            console.log('✅ Payment Intent created successfully on login');
            console.log('📄 Payment Intent Response:', JSON.stringify(data, null, 2));
            setPaymentIntentData({
              id: data.id,
              client_secret: data.clientSecret,
              amount: data.amount,
              currency: data.currency,
              status: data.status,
              created_at: new Date().toISOString(),
            });
            setLoading(false);
          },
          onError: (error) => {
            console.error('❌ Failed to create Payment Intent on login:', error);
            setError(error.message);
            setLoading(false);
            // Reset the flag on error so they can try again
            hasCreatedPaymentIntent.current = false;
          },
        }
      );
    }
  }, [user]); // Only depend on user, not on isPending

  // Clear payment intent data when user logs out
  useEffect(() => {
    if (!user && paymentIntentData) {
      console.log('👋 User logged out, clearing Payment Intent data');
      usePaymentIntentStore.getState().clearPaymentIntentData();
      
      // Reset flags for next login
      hasCreatedPaymentIntent.current = false;
      currentUserId.current = null;
    }
  }, [user, paymentIntentData]);

  return <>{children}</>;
};