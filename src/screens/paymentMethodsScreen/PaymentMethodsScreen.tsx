import React from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { PaymentMethodsList } from '../../components/payment/PaymentMethodsList';
import useThemeStore from '../../store/useThemeStore';
import BackSvg from '../../assets/icons/Back';

interface PaymentMethodsScreenProps {
  navigation?: any;
}

export function PaymentMethodsScreen({ navigation }: PaymentMethodsScreenProps) {
  const { themeTag } = useThemeStore();
  const isDarkMode = themeTag === 'dark';

  const handleAddPaymentMethod = () => {
    // Navigate to the PaymentMethodScreen for adding a new payment method
    console.log('🚀 Navigating to PaymentMethodScreen...');
    navigation?.navigate('PaymentMethodScreen');
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

    </ImageBackground>
  );
}