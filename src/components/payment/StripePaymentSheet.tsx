import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useCreatePaymentIntent } from '../../services/mutations/PaymentMutations';

interface StripePaymentSheetProps {
  amount: number; // Amount in cents
  currency?: string;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onPaymentError?: (error: string) => void;
  onCancel?: () => void;
}

export const useStripePaymentSheet = ({
  amount,
  currency = 'usd',
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}: StripePaymentSheetProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const [isLoading, setIsLoading] = useState(false);

  const initializePaymentSheet = async () => {
    try {
      setIsLoading(true);
      
      // Step 1: Create payment intent
      const paymentIntent = await createPaymentIntentMutation.mutateAsync({
        amount,
        currency,
      });

      // Step 2: Initialize the payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'FavorApp',
        paymentIntentClientSecret: paymentIntent.clientSecret,
        // You can customize the appearance here
        appearance: {
          primaryButton: {
            colors: {
              background: '#44A27B', // Your app's primary color
            },
          },
        },
        allowsDelayedPaymentMethods: true,
        returnURL: 'favorapp://payment-result',
      });

      setIsLoading(false);

      if (!error) {
        return true;
      } else {
        console.error('Payment sheet initialization error:', error);
        onPaymentError?.(error.message);
        Alert.alert('Error', error.message);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Payment initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      onPaymentError?.(errorMessage);
      Alert.alert('Payment Error', errorMessage);
      return false;
    }
  };

  const openPaymentSheet = async () => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          console.log('Payment was canceled');
          onCancel?.();
        } else {
          console.error('Payment sheet error:', error);
          onPaymentError?.(error.message);
          Alert.alert('Payment Failed', error.message);
        }
      } else {
        // Payment succeeded
        console.log('Payment succeeded!');
        onPaymentSuccess?.('payment_success'); // In real implementation, you'd get the actual payment intent ID
        Alert.alert(
          'Payment Successful!', 
          'Your payment has been processed successfully.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentError?.(errorMessage);
      Alert.alert('Payment Error', errorMessage);
    }
  };

  const presentPaymentSheetFlow = async () => {
    // Initialize and present the payment sheet in one flow
    const initialized = await initializePaymentSheet();
    if (initialized) {
      await openPaymentSheet();
    }
  };

  return {
    presentPaymentSheetFlow,
    initializePaymentSheet,
    openPaymentSheet,
    isLoading,
  };
};