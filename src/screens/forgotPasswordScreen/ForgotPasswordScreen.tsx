import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import { LockIcon } from '../../components/icons';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
  onContinue?: (email: string) => void;
}

export function ForgotPasswordScreen({ onBackToLogin, onContinue }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    // Handle forgot password logic here
    console.log('Password reset requested for:', email);
    if (onContinue) {
      onContinue(email);
    }
  };

  const isFormValid = email && validateEmail(email);

  return (
    <ImageBackground 
      source={require('../../assets/images/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1 px-6 pt-20">
        
        {/* Lock Icon */}
        <View className="items-center mb-8 mt-16">
            <LockIcon />
        </View>
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Forgot Password
          </Text>
          <Text className="text-base text-gray-600 text-center px-4 leading-6">
            Enter phone number on which we can share you OTP to reset your password
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-8">
          <View className="mb-6 relative">
            <TextInput
              className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
              placeholder="deanna.curtis@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Email
            </Text>
            {error ? (
              <Text className="text-red-500 text-sm mt-1">{error}</Text>
            ) : null}
          </View>
        </View>

        {/* Continue Button */}
        <View className="mb-6">
          <CarouselButton
            title="Continue"
            onPress={handleContinue}
            disabled={!isFormValid}
          />
        </View>

        {/* Back to Login */}
        <View className="items-center">
          <TouchableOpacity onPress={onBackToLogin}>
            <Text className="text-gray-800 text-base font-medium">
              Back to login
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
  );
}