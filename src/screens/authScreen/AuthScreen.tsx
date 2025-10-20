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
import { useLoginMutation } from '../../services/mutations/AuthMutations';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthScreenProps {
  onLogin: () => void;
  onForgotPassword?: () => void;
  onSignup?: (email: string) => void;
  onCreateProfile?: () => void;
}

export function AuthScreen({ onLogin, onForgotPassword, onSignup, onCreateProfile }: AuthScreenProps) {
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
  const setTokens = useAuthStore((state) => state.setTokens);
  const setRegistrationData = useAuthStore((state) => state.setRegistrationData);
  const loginMutation = useLoginMutation();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasLowercase && hasUppercase && hasDigit && hasSpecialChar;
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (activeTab === 'signup' && !validatePassword(formData.password)) {
      newErrors.password = 'Password must include at least one lowercase, one uppercase, one digit, and one special character';
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

  const handleSubmit = async () => {
    if (validateForm()) {
      if (activeTab === 'signin') {
        try {
          console.log('Login request:', { email: formData.email, password: formData.password });
          const response = await loginMutation.mutateAsync({
            email: formData.email,
            password: formData.password,
          });
          
          console.log('🔍 Full Login response:', JSON.stringify(response, null, 2));
          console.log('🔍 Response.data:', JSON.stringify(response.data, null, 2));
          console.log('🔍 Token from response:', response.data?.token);
          console.log('🔍 Refresh token from response:', response.data?.refresh_token);
          console.log('🔍 User from response:', response.data?.user);
          
          // Store tokens if available (API returns 'token' not 'access_token')
          if (response.data?.token) {
            console.log('🔑 Storing tokens...');
            await setTokens(response.data.token, response.data?.refresh_token);
            console.log('✅ Tokens stored successfully');
            
            // Double check storage worked
            const verifyToken = await AsyncStorage.getItem('auth_token');
            console.log('🔍 Verification: Token in AsyncStorage:', !!verifyToken);
          } else {
            console.warn('⚠️ No token in login response');
            console.warn('⚠️ Available response keys:', Object.keys(response.data || {}));
          }
          
          // Set user data
          setUser({
            id: response.data?.user?.id?.toString() || '1',
            firstName: response.data?.user?.first_name || 'User',
            email: formData.email,
          });
          
          // Setup Intent creation is now handled on-demand when user adds payment method
          
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Login successful!'
          });
          
          onLogin();
        } catch (error: any) {
          console.error('Login error:', error);
          console.error('Error response:', error.response?.data);
          
          let errorMessage = 'Invalid credentials. Please try again.';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.userMessage) {
            errorMessage = error.userMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: errorMessage
          });
        }
      } else {
        // Sign up flow - save email, password and terms acceptance, navigate to profile creation
        setRegistrationData({
          email: formData.email,
          password: formData.password,
          termsAccepted: formData.agreeTerms,
        });
        onCreateProfile?.();
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
              <View className="relative">
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
                {/* Fixed height container for error message to prevent layout shift */}
                <View className="min-h-[30px] mt-1">
                  {errors.email ? (
                    <Text className="text-red-500 text-sm leading-4">{errors.email}</Text>
                  ) : null}
                </View>
              </View>
              
              {/* Password Field */}
              <View className="relative">
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
                  className="absolute right-3"
                  style={{
                    top: 56 / 2 - 12, // Center of 56px height minus half icon height
                    height: 24,
                    width: 24,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <EyeSvg />
                </TouchableOpacity>
                {/* Fixed height container for error message to prevent layout shift */}
                <View className="min-h-[35px] mt-1">
                  {errors.password ? (
                    <Text className="text-red-500 text-xs leading-4">{errors.password}</Text>
                  ) : null}
                </View>
              </View>

              {/* Confirm Password Field (Sign Up only) */}
              {activeTab === 'signup' && (
                <View className=" relative">
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
                    className="absolute right-3"
                    style={{
                      top: 56 / 2 - 12, // Center of 56px height minus half icon height
                      height: 24,
                      width: 24,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <EyeSvg />
                  </TouchableOpacity>
                  {/* Fixed height container for error message to prevent layout shift */}
                  <View className="min-h-[40px] mt-1">
                    {errors.confirmPassword ? (
                      <Text className="text-red-500 text-sm leading-4">{errors.confirmPassword}</Text>
                    ) : null}
                  </View>
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
                  title={activeTab === 'signin' ? (loginMutation.isPending ? 'Logging in...' : 'Login') : 'Create Account'}
                  onPress={handleSubmit}
                  disabled={!isFormComplete() || (activeTab === 'signin' && loginMutation.isPending)}
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