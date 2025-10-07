import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import useAuthStore from '../../store/useAuthStore';
import EyeSvg from '../../assets/icons/Eye';

interface AuthScreenProps {
  onLogin: () => void;
  onForgotPassword?: () => void;
  onSignup?: (email: string) => void;
}

export function AuthScreen({ onLogin, onForgotPassword, onSignup }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = { email: '', password: '', confirmPassword: '' };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter correct email';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation (only for signup)
    if (activeTab === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Check if form is complete
  const isFormComplete = () => {
    if (activeTab === 'signin') {
      return formData.email && formData.password;
    } else {
      return formData.email && formData.password && formData.confirmPassword && formData.agreeTerms;
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (activeTab === 'signin') {
        // Mock authentication
        setUser({
          id: '1',
          firstName: 'John',
          email: formData.email,
        });
        onLogin();
      } else {
        // Sign up flow - navigate to OTP verification
        onSignup?.(formData.email);
      }
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (typeof value === 'string' && value && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
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
            <View className="items-center mb-8">
              <Image 
                source={require('../../../assets/logo.png')} 
                className="w-36 h-20"
                resizeMode="contain"
              />
            </View>

            {/* Welcome Text */}
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to FavorApp
              </Text>
              <Text className="text-lg text-gray-600 text-center px-4">
                Create an account or login to explore about our app.
              </Text>
            </View>

            {/* Tabs */}
            <View className="flex-row mb-10 bg-gray-100 rounded-full p-1">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-full ${
                  activeTab === 'signin' ? 'bg-green-500' : ''
                }`}
                onPress={() => setActiveTab('signin')}
              >
                <Text className={`text-center font-semibold ${
                  activeTab === 'signin' ? 'text-white' : 'text-gray-600'
                }`}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-full ${
                  activeTab === 'signup' ? 'bg-green-500' : ''
                }`}
                onPress={() => setActiveTab('signup')}
              >
                <Text className={`text-center font-semibold ${
                  activeTab === 'signup' ? 'text-white' : 'text-gray-600'
                }`}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View className="flex-1">
              {/* Email Field */}
              <View className="mb-6 relative">
                <TextInput
                  className="px-4 py-3 rounded-xl border border-gray-200 text-base bg-transparent"
                  style={{ 
                    backgroundColor: 'transparent',
                    fontSize: 16,
                    lineHeight: 22,
                    height: 56
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700">
                  Email
                </Text>
                {errors.email ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
                ) : null}
              </View>
              
              {/* Password Field */}
              <View className="mb-6 relative">
                <TextInput
                  className="px-4 py-3 rounded-xl border border-gray-200 pr-12 text-base bg-transparent"
                  style={{ 
                    backgroundColor: 'transparent',
                    fontSize: 16,
                    lineHeight: 22,
                    height: 56
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry={!showPassword}
                />
                <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700">
                  Password
                </Text>
                <TouchableOpacity
                  className="absolute right-3 top-0 bottom-0 justify-center"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <EyeSvg />
                </TouchableOpacity>
                {errors.password ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
                ) : null}
              </View>

              {/* Confirm Password Field (Sign Up only) */}
              {activeTab === 'signup' && (
                <View className="mb-8 relative">
                  <TextInput
                    className="px-4 py-3 rounded-xl border border-gray-200 pr-12 text-base bg-transparent"
                    style={{ 
                      backgroundColor: 'transparent',
                      fontSize: 16,
                      lineHeight: 22,
                      height: 56
                    }}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700">
                    Confirm Password
                  </Text>
                  <TouchableOpacity
                    className="absolute right-3 top-0 bottom-0 justify-center"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <EyeSvg />
                  </TouchableOpacity>
                  {errors.confirmPassword ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
                  ) : null}
                </View>
              )}

              {/* Remember Me / Terms (Sign In) */}
              {activeTab === 'signin' && (
                <View className="flex-row justify-between items-center mb-10">
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => updateFormData('rememberMe', !formData.rememberMe)}
                  >
                    <View className={`w-5 h-5 rounded border-2 mr-2 ${
                      formData.rememberMe ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {formData.rememberMe && (
                        <Text className="text-white text-xs text-center">✓</Text>
                      )}
                    </View>
                    <Text className="text-black">Remember Me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onForgotPassword}>
                    <Text className="text-black">Forgot Password</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Submit Button */}
              <View className="mb-6">
                <CarouselButton
                  title={activeTab === 'signin' ? 'Login' : 'Create Account'}
                  onPress={handleSubmit}
                  disabled={!isFormComplete()}
                />
              </View>

              {/* Terms Agreement (Sign Up) - moved below button */}
              {activeTab === 'signup' && (
                <View className="mb-8">
                  <TouchableOpacity
                    className="flex-row items-start"
                    onPress={() => updateFormData('agreeTerms', !formData.agreeTerms)}
                  >
                    <View className={`w-5 h-5 rounded border-2 mr-2 mt-0.5 ${
                      formData.agreeTerms ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {formData.agreeTerms && (
                        <Text className="text-white text-xs text-center">✓</Text>
                      )}
                    </View>
                    <Text className="text-gray-700 flex-1">
                      I have read and agree to the{' '}
                      <Text className="underline text-black">Terms & Condition</Text>
                      {' '}and the{' '}
                      <Text className="underline text-black">Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}