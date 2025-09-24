import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import useAuthStore from '../../store/useAuthStore';

interface AuthScreenProps {
  onLogin: () => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
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
      // Mock authentication
      setUser({
        id: '1',
        firstName: 'John',
        email: formData.email,
      });
      onLogin();
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
      source={require('../../assets/images/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-16">
        {/* Logo */}
        <View className="items-center mb-8">
          <Image 
            source={require('../../assets/images/logo.png')} 
            className="w-32 h-16"
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to FavorApp
          </Text>
          <Text className="text-base text-gray-600 text-center px-4">
            Create an account or login to explore about our app.
          </Text>
        </View>

        {/* Tabs */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-l-full ${
              activeTab === 'signin' ? 'bg-green-500' : 'bg-white'
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
            className={`flex-1 py-3 rounded-r-full ${
              activeTab === 'signup' ? 'bg-green-500' : 'bg-white'
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
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <TextInput
              className="bg-white px-4 py-3 rounded-lg border border-gray-200"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            ) : null}
          </View>

          {/* Password Field */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <View className="relative">
              <TextInput
                className="bg-white px-4 py-3 rounded-lg border border-gray-200 pr-12"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className="text-gray-500">👁</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
            ) : null}
          </View>

          {/* Confirm Password Field (Sign Up only) */}
          {activeTab === 'signup' && (
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
              <View className="relative">
                <TextInput
                  className="bg-white px-4 py-3 rounded-lg border border-gray-200 pr-12"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text className="text-gray-500">👁</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
              ) : null}
            </View>
          )}

          {/* Remember Me / Terms (Sign In) */}
          {activeTab === 'signin' && (
            <View className="flex-row justify-between items-center mb-6">
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
                <Text className="text-gray-700">Remember Me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-green-500 font-medium">Forgot Password</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Terms Agreement (Sign Up) */}
          {activeTab === 'signup' && (
            <View className="mb-6">
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
                  <Text className="text-green-500 underline">Terms & Condition</Text>
                  {' '}and the{' '}
                  <Text className="text-green-500 underline">Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <View className="mb-8">
            <CarouselButton
              title={activeTab === 'signin' ? 'Login' : 'Create Account'}
              onPress={handleSubmit}
              disabled={!isFormComplete()}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}