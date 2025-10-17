import React from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { SimplePaymentForm } from '../../components/payment/SimplePaymentForm';
import { useMockPaymentSheet } from '../../components/payment/MockPaymentSheet';
import useThemeStore from '../../store/useThemeStore';
import BackSvg from '../../assets/icons/Back';

interface StripePaymentScreenProps {
  navigation?: any;
  route?: any;
}

export function StripePaymentScreen({ navigation, route }: StripePaymentScreenProps) {
  const { themeTag } = useThemeStore();
  const isDarkMode = themeTag === 'dark';
  
  // Get payment details from route params
  const { 
    amount = 1000, // Default $10.00 in cents
    currency = 'usd',
    title = 'Payment',
    description = 'Complete your payment',
  } = route?.params || {};

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);
    
    // Navigate to success screen or back to previous screen
    Alert.alert(
      'Payment Successful!',
      'Your payment has been processed successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            // You can navigate to a success screen or go back
            navigation?.goBack();
            // Or navigate to a specific screen:
            // navigation?.navigate('PaymentSuccessScreen', { paymentIntentId, amount });
          }
        }
      ]
    );
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    Alert.alert(
      'Payment Failed',
      error,
      [{ text: 'OK' }]
    );
  };

  // Initialize payment sheet with payment method saving enabled
  const { presentPaymentSheetFlow, PaymentSheetModal } = useMockPaymentSheet({
    amount,
    currency,
    onPaymentSuccess: handlePaymentSuccess,
    onPaymentError: handlePaymentError,
    onCancel: () => console.log('Payment cancelled'),
    savePaymentMethod: true, // Enable saving payment method for future use
  });

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation?.goBack()}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">{title}</Text>
        </View>
        
        {description && (
          <Text className="text-base text-gray-600 mt-2 ml-10">
            {description}
          </Text>
        )}
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingBottom: 40,
          flexGrow: 1,
        }}
      >
        {/* Payment Options */}
        <View className="flex-1 justify-center">
          {/* Payment Amount Display */}
          <View className={`p-6 rounded-xl mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-center text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Total Amount
            </Text>
            <Text className="text-center text-4xl font-bold text-green-600 mb-4">
              ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
            </Text>
            
            {/* Payment Sheet Button */}
            <TouchableOpacity
              className="bg-green-500 py-4 px-6 rounded-full mb-4"
              onPress={presentPaymentSheetFlow}
            >
              <Text className="text-white text-center text-lg font-semibold">
                💳 Pay with Stripe Sheet
              </Text>
              <Text className="text-white text-center text-sm opacity-80 mt-1">
                Native slide-up payment experience
              </Text>
            </TouchableOpacity>

            {/* Full Form Button */}
            <TouchableOpacity
              className="border-2 border-green-500 py-4 px-6 rounded-full"
              onPress={() => {
                // Navigate to the full form version
                navigation?.navigate('StripePaymentScreen', {
                  ...route?.params,
                  showFullForm: true,
                });
              }}
            >
              <Text className="text-green-500 text-center text-lg font-semibold">
                📝 Pay with Full Form
              </Text>
              <Text className="text-green-500 text-center text-sm opacity-80 mt-1">
                Complete form on this screen
              </Text>
            </TouchableOpacity>
          </View>

          {/* Show full form if requested */}
          {route?.params?.showFullForm && (
            <SimplePaymentForm
              amount={amount}
              currency={currency}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}
        </View>

        {/* Security Notice */}
        <View className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-sm text-blue-800 text-center">
            🔒 Your payment is secured. We never store your card details.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Sheet Modal */}
      <PaymentSheetModal />
    </ImageBackground>
  );
}