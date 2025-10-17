import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions,
  TextInput,
  Alert 
} from 'react-native';
import { CustomButton } from '../buttons';
import useThemeStore from '../../store/useThemeStore';
import { useCreatePaymentIntent } from '../../services/mutations/PaymentMutations';
import { useSavePaymentMethod } from '../../services/mutations/PaymentMethodMutations';
import { useSetupIntentStore } from '../../store/useSetupIntentStore';

interface MockPaymentSheetProps {
  amount: number;
  currency?: string;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onPaymentError?: (error: string) => void;
  onCancel?: () => void;
  savePaymentMethod?: boolean; // Whether to save the payment method for future use
}

export const useMockPaymentSheet = ({
  amount,
  currency = 'usd',
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  savePaymentMethod = false,
}: MockPaymentSheetProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const savePaymentMethodMutation = useSavePaymentMethod();
  const { setupIntentData } = useSetupIntentStore();

  const presentPaymentSheetFlow = () => {
    setIsVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const closePaymentSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const PaymentSheetModal = () => {
    const { themeTag } = useThemeStore();
    const isDarkMode = themeTag === 'dark';
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

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

    const handlePayment = async () => {
      if (!cardNumber || !expiryDate || !cvv) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
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
        return;
      }

      setIsLoading(true);

      try {
        // Simulate different card behaviors
        if (cleanCardNumber === '4000000000009995') {
          throw new Error('Your card has insufficient funds.');
        }
        
        if (cleanCardNumber === '4000000000000002') {
          throw new Error('Your card was declined.');
        }

        const paymentIntent = await createPaymentIntentMutation.mutateAsync({
          amount,
          currency,
        });

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Save payment method if requested and we have setup intent data
        if (savePaymentMethod && setupIntentData?.setup_intent_id) {
          try {
            await savePaymentMethodMutation.mutateAsync({
              setup_intent_id: setupIntentData.setup_intent_id,
            });
            console.log('Payment method saved after successful payment');
          } catch (saveError) {
            console.error('Failed to save payment method after payment:', saveError);
            // Don't fail the payment for this, just log it
          }
        }

        setIsLoading(false);
        closePaymentSheet();
        onPaymentSuccess?.(paymentIntent.id);
        
        setTimeout(() => {
          Alert.alert(
            'Payment Successful!',
            savePaymentMethod && setupIntentData?.setup_intent_id 
              ? 'Your payment has been processed and payment method saved for future use!'
              : 'Your payment has been processed successfully.',
            [{ text: 'OK' }]
          );
        }, 300);
      } catch (error) {
        setIsLoading(false);
        const errorMessage = error instanceof Error ? error.message : 'Payment failed';
        onPaymentError?.(errorMessage);
        Alert.alert('Payment Error', errorMessage);
      }
    };

    const handleCancel = () => {
      closePaymentSheet();
      onCancel?.();
    };

    const styles = StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      },
      container: {
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 24,
        maxHeight: Dimensions.get('window').height * 0.8,
      },
      handle: {
        width: 40,
        height: 4,
        backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: isDarkMode ? '#ffffff' : '#000000',
      },
      cancelButton: {
        padding: 8,
      },
      cancelText: {
        fontSize: 16,
        color: '#6b7280',
      },
      amountContainer: {
        alignItems: 'center',
        marginBottom: 32,
        paddingVertical: 20,
        backgroundColor: isDarkMode ? '#2d2d2d' : '#f9fafb',
        borderRadius: 12,
      },
      amountLabel: {
        fontSize: 14,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        marginBottom: 4,
      },
      amountText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: isDarkMode ? '#4ade80' : '#059669',
      },
      inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? '#ffffff' : '#000000',
        marginBottom: 8,
        marginTop: 16,
      },
      input: {
        borderWidth: 1,
        borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
        borderRadius: 8,
        padding: 16,
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        fontSize: 16,
      },
      row: {
        flexDirection: 'row',
        gap: 12,
      },
      flex1: {
        flex: 1,
      },
      testCardInfo: {
        marginTop: 20,
        padding: 12,
        backgroundColor: isDarkMode ? '#1e3a2e' : '#f0fdf4',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? '#4ade80' : '#059669',
      },
      testCardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: isDarkMode ? '#4ade80' : '#059669',
        marginBottom: 6,
      },
      testCardText: {
        fontSize: 10,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        lineHeight: 14,
      },
    });

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={handleCancel}
        >
          <Animated.View
            style={[
              styles.container,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [500, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.handle} />
              
              <View style={styles.header}>
                <Text style={styles.title}>Complete Payment</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={styles.amountText}>
                  ${formatAmount(amount)} {currency.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Card Number</Text>
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
                  <Text style={styles.inputLabel}>Expiry</Text>
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
                  <Text style={styles.inputLabel}>CVC</Text>
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
                title={isLoading ? 'Processing...' : `Pay $${formatAmount(amount)}`}
                onPress={handlePayment}
                disabled={isLoading}
                loading={isLoading}
                className="mt-6"
              />

              <View style={styles.testCardInfo}>
                <Text style={styles.testCardTitle}>Stripe Test Cards:</Text>
                <Text style={styles.testCardText}>
                  • 4242 4242 4242 4242 - Visa (succeeds){'\n'}
                  • 4000 0000 0000 9995 - Visa (insufficient funds){'\n'}
                  • 4000 0000 0000 0002 - Visa (card declined){'\n'}
                  • Use any future expiration date and any 3-digit CVC
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return {
    presentPaymentSheetFlow,
    PaymentSheetModal,
    isLoading,
  };
};