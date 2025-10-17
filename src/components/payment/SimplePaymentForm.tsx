import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { CustomButton } from '../buttons';
import useThemeStore from '../../store/useThemeStore';
import { useCreatePaymentIntent } from '../../services/mutations/PaymentMutations';

interface SimplePaymentFormProps {
  amount: number; // Amount in cents
  currency?: string;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
}

export const SimplePaymentForm: React.FC<SimplePaymentFormProps> = ({
  amount,
  currency = 'usd',
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}) => {
  const { themeTag } = useThemeStore();
  const isDarkMode = themeTag === 'dark';
  const createPaymentIntentMutation = useCreatePaymentIntent();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatAmount = (amountInCents: number) => {
    return (amountInCents / 100).toFixed(2);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const validateForm = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }
    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Error', 'Please enter a valid expiry date');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }

    // Validate test cards
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    const validTestCards = [
      '4242424242424242', // Visa (succeeds)
      '4000000000009995', // Visa (insufficient funds)
      '4000000000000002', // Visa (card declined)
    ];

    if (!validTestCards.includes(cleanCardNumber)) {
      Alert.alert('Invalid Card', 'Please use one of the provided test cards:\n• 4242 4242 4242 4242 (succeeds)\n• 4000 0000 0000 9995 (insufficient funds)\n• 4000 0000 0000 0002 (card declined)');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Simulate different card behaviors
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      if (cleanCardNumber === '4000000000009995') {
        throw new Error('Your card has insufficient funds.');
      }
      
      if (cleanCardNumber === '4000000000000002') {
        throw new Error('Your card was declined.');
      }

      // Since we're using the mock service, we just need to create a payment intent
      const paymentIntent = await createPaymentIntentMutation.mutateAsync({
        amount,
        currency,
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Mock payment successful:', paymentIntent);
      onPaymentSuccess?.(paymentIntent.id);
      Alert.alert('Payment Successful', 'Your payment has been processed successfully!');
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
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000',
      fontSize: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#ffffff' : '#000000',
      marginTop: 16,
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    flex1: {
      flex: 1,
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
      
      <Text style={styles.label}>Card Number</Text>
      <TextInput
        style={styles.input}
        value={cardNumber}
        onChangeText={handleCardNumberChange}
        placeholder="4242 4242 4242 4242"
        placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
        keyboardType="numeric"
        maxLength={19}
      />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            style={styles.input}
            value={expiryDate}
            onChangeText={handleExpiryChange}
            placeholder="MM/YY"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={styles.input}
            value={cvv}
            onChangeText={setCvv}
            placeholder="123"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      <CustomButton
        title={isProcessing ? 'Processing...' : `Pay $${formatAmount(amount)}`}
        onPress={handlePayment}
        disabled={disabled || isProcessing}
        className="mt-5"
        loading={isProcessing}
      />

      {isProcessing && (
        <Text style={styles.processingText}>
          Processing your payment securely...
        </Text>
      )}

      {/* Test Card Info */}
      <View style={{
        marginTop: 20,
        padding: 16,
        backgroundColor: isDarkMode ? '#2d4a3d' : '#f0fdf4',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? '#4ade80' : '#059669',
      }}>
        <Text style={{
          fontSize: 12,
          fontWeight: '600',
          color: isDarkMode ? '#4ade80' : '#059669',
          marginBottom: 8,
        }}>
          Stripe Test Cards:
        </Text>
        <Text style={{ fontSize: 11, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          • 4242 4242 4242 4242 - Visa (succeeds)
        </Text>
        <Text style={{ fontSize: 11, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          • 4000 0000 0000 9995 - Visa (insufficient funds)
        </Text>
        <Text style={{ fontSize: 11, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          • 4000 0000 0000 0002 - Visa (card declined)
        </Text>
        <Text style={{ fontSize: 11, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          • Use any future expiry date and any 3-digit CVV
        </Text>
      </View>
    </View>
  );
};