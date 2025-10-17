import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CardField, CardFieldInput, useStripe } from '@stripe/stripe-react-native';
import { CustomButton } from '../buttons';
import useThemeStore from '../../store/useThemeStore';
import { useCreatePaymentIntent } from '../../services/mutations/PaymentMutations';

interface PaymentFormProps {
  amount: number; // Amount in cents
  currency?: string;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'usd',
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}) => {
  const { themeTag } = useThemeStore();
  const isDarkMode = themeTag === 'dark';
  const createPaymentIntentMutation = useCreatePaymentIntent();
  
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Safely get Stripe hooks with error handling
  let confirmPayment: any = null;
  try {
    const stripe = useStripe();
    confirmPayment = stripe.confirmPayment;
  } catch (error) {
    console.error('Stripe hook error:', error);
    setStripeError('Stripe is not available');
  }

  const formatAmount = (amountInCents: number) => {
    return (amountInCents / 100).toFixed(2);
  };

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    if (!confirmPayment) {
      Alert.alert('Error', 'Stripe is not initialized');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create payment intent
      const paymentIntent = await createPaymentIntentMutation.mutateAsync({
        amount,
        currency,
      });

      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent: confirmedPayment } = await confirmPayment(
        paymentIntent.clientSecret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (error) {
        console.error('Payment confirmation error:', error);
        onPaymentError?.(error.message);
        Alert.alert('Payment Failed', error.message);
      } else if (confirmedPayment) {
        console.log('Payment succeeded:', confirmedPayment);
        onPaymentSuccess?.(confirmedPayment.id);
        Alert.alert('Payment Successful', 'Your payment has been processed successfully!');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      onPaymentError?.(errorMessage);
      Alert.alert('Payment Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      marginVertical: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#ffffff' : '#000000',
      marginBottom: 8,
    },
    amountText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#4ade80' : '#059669',
      marginBottom: 20,
      textAlign: 'center',
    },
    cardField: {
      height: 50,
      marginVertical: 20,
    },
    processingText: {
      textAlign: 'center',
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      marginTop: 10,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>
      <Text style={styles.amountText}>${formatAmount(amount)} {currency.toUpperCase()}</Text>
      
      <CardField
        postalCodeEnabled={true}
        placeholders={{
          number: '4242 4242 4242 4242',
          expiration: 'MM/YY',
          cvc: 'CVC',
          postalCode: 'ZIP',
        }}
        cardStyle={{
          backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
          textColor: isDarkMode ? '#ffffff' : '#000000',
          borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
          borderWidth: 1,
          borderRadius: 8,
        }}
        style={styles.cardField}
        onCardChange={(cardDetails) => {
          setCardDetails(cardDetails);
        }}
      />

      <CustomButton
        title={isProcessing ? 'Processing...' : `Pay $${formatAmount(amount)}`}
        onPress={handlePayment}
        disabled={disabled || isProcessing || !cardDetails?.complete}
        className="mt-5"
      />

      {isProcessing && (
        <Text style={styles.processingText}>
          Processing your payment securely...
        </Text>
      )}
    </View>
  );
};