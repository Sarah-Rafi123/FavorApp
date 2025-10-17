import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { PaymentMethodsList } from '../../components/payment/PaymentMethodsList';
import { useMockPaymentSheet } from '../../components/payment/MockPaymentSheet';
import useThemeStore from '../../store/useThemeStore';
import BackSvg from '../../assets/icons/Back';

interface PaymentMethodsScreenProps {
  navigation?: any;
  route?: any;
}

export function PaymentMethodsScreen({ navigation, route }: PaymentMethodsScreenProps) {
  const { themeTag } = useThemeStore();
  const isDarkMode = themeTag === 'dark';

  const [showTestPayment, setShowTestPayment] = useState(false);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);
    setShowTestPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setShowTestPayment(false);
  };

  // Initialize payment sheet for adding new payment methods
  const { presentPaymentSheetFlow, PaymentSheetModal } = useMockPaymentSheet({
    amount: 100, // $1.00 for setup only
    currency: 'usd',
    onPaymentSuccess: handlePaymentSuccess,
    onPaymentError: handlePaymentError,
    onCancel: () => setShowTestPayment(false),
    savePaymentMethod: true, // Always save when adding a new payment method
  });

  const handleAddPaymentMethod = () => {
    setShowTestPayment(true);
    presentPaymentSheetFlow();
  };

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
          <Text className="text-2xl font-bold text-black">Payment Methods</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 0, 
          paddingBottom: 40,
          flexGrow: 1,
        }}
      >
        {/* Payment Methods List */}
        <PaymentMethodsList onAddPaymentMethod={handleAddPaymentMethod} />

        {/* Test Payment Section (Development Only) */}
        {__DEV__ && (
          <View className="mx-4 mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Text className="text-sm text-yellow-800 font-medium mb-2">
              Development Testing
            </Text>
            <Text className="text-xs text-yellow-700 mb-3">
              Test the payment flow with a small charge to verify payment method saving
            </Text>
            <TouchableOpacity
              className="bg-yellow-600 py-2 px-4 rounded-lg"
              onPress={() => {
                setShowTestPayment(true);
                presentPaymentSheetFlow();
              }}
            >
              <Text className="text-white text-center text-sm font-medium">
                Test $1.00 Payment + Save Method
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Section */}
        <View className="mx-4 mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-sm text-blue-800 text-center">
            🔒 All payment methods are secured by Stripe
          </Text>
          <Text className="text-xs text-blue-700 text-center mt-2">
            Your card details are encrypted and never stored on our servers
          </Text>
        </View>

        {/* How it Works */}
        <View className="mx-4 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <Text className="text-sm text-green-800 font-medium mb-2">
            How Payment Methods Work
          </Text>
          <Text className="text-xs text-green-700 mb-1">
            • Add your card once for fast future payments
          </Text>
          <Text className="text-xs text-green-700 mb-1">
            • Your first card becomes the default payment method
          </Text>
          <Text className="text-xs text-green-700 mb-1">
            • Remove cards anytime from this screen
          </Text>
          <Text className="text-xs text-green-700">
            • All transactions are processed securely by Stripe
          </Text>
        </View>
      </ScrollView>

      {/* Payment Sheet Modal */}
      {showTestPayment && <PaymentSheetModal />}
    </ImageBackground>
  );
}