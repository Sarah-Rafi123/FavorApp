import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import { LockIcon } from '../../assets/icons';
import { useForgotPasswordMutation } from '../../services/mutations/AuthMutations';
import Toast from 'react-native-toast-message';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
  onContinue?: (email: string) => void;
}

export function ForgotPasswordScreen({ onBackToLogin, onContinue }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const forgotPasswordMutation = useForgotPasswordMutation();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    
    try {
      console.log('Forgot password request for:', email);
      const response = await forgotPasswordMutation.mutateAsync({
        email: email,
      });
      
      console.log('Forgot password response:', response);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password reset email\nsent successfully!'
      });
      
      // Navigate to OTP verification screen
      if (onContinue) {
        onContinue(email);
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.userMessage) {
        errorMessage = error.userMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: errorMessage
      });
    }
  };

  const isFormValid = email && validateEmail(email) && !forgotPasswordMutation.isPending;

  return (
    <ImageBackground 
      source={require('../../../assets/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
                Enter email on which we can share you OTP to reset your password
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-8">
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>
                <TextInput
                 style={{ 
                    lineHeight: 18,
                  }}
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {error ? (
                  <Text className="text-red-500 text-sm mt-1">{error}</Text>
                ) : null}
              </View>
            </View>

            {/* Continue Button */}
            <View className="mb-6">
              <CarouselButton
                title={forgotPasswordMutation.isPending ? "Sending..." : "Continue"}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}