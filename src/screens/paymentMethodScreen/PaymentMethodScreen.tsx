import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PaymentMethodScreenProps {
  navigation?: any;
  route?: any;
}

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CreditCardIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 10H22"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function PaymentMethodScreen({ navigation, route }: PaymentMethodScreenProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const { plan } = route?.params || { plan: '1 Year' };
  const price = plan === '1 Year' ? '$55' : '$4.9';

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return cleaned;
    }
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{2})(\d{2})/, '$1/$2');
    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      setCvv(cleaned);
    }
  };

  const handlePayNow = () => {
    navigation?.navigate('PaymentSuccessScreen', { plan, price });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4 p-2"
            onPress={() => navigation?.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Payment Method</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-6">
          
          {/* Order Summary */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">Order Summary</Text>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-gray-600">Get Certified - {plan}</Text>
              <Text className="text-lg font-semibold text-gray-800">{price}</Text>
            </View>
            <View className="h-px bg-gray-200 my-4" />
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">Total</Text>
              <Text className="text-xl font-bold text-green-600">{price}</Text>
            </View>
          </View>

          {/* Payment Form */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="flex-row items-center mb-6">
              <CreditCardIcon />
              <Text className="text-xl font-bold text-gray-800 ml-3">Card Details</Text>
            </View>

            {/* Card Number */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Card Number</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            {/* Expiry and CVV */}
            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Expiry Date</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">CVV</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                  placeholder="123"
                  value={cvv}
                  onChangeText={handleCvvChange}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Cardholder Name */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Cardholder Name</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="John Doe"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
              />
            </View>

            {/* Security Notice */}
            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text className="text-sm text-gray-600 text-center">
                Your payment information is encrypted and secure. We do not store your card details.
              </Text>
            </View>

            {/* Pay Now Button */}
            <TouchableOpacity 
              className="bg-green-500 rounded-xl py-4"
              onPress={handlePayNow}
            >
              <Text className="text-white text-center text-lg font-semibold">
                Pay Now - {price}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}