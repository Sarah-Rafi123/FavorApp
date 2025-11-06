import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  Keyboard,
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
  clearDataOnMount?: boolean;
}

export function AuthScreen({ onLogin, onForgotPassword, onSignup, onCreateProfile, clearDataOnMount }: AuthScreenProps) {
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCompleteAccountModal, setShowCompleteAccountModal] = useState(false);
  const [showInvalidCredentialsModal, setShowInvalidCredentialsModal] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<Array<{email: string, password: string}>>([]);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  
  // Refs for handling keyboard and scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const setUser = useAuthStore((state) => state.setUser);
  const setUserAndTokens = useAuthStore((state) => state.setUserAndTokens);
  const setRegistrationData = useAuthStore((state) => state.setRegistrationData);
  const clearRegistrationData = useAuthStore((state) => state.clearRegistrationData);
  const loginMutation = useLoginMutation();

  // Load saved credentials on component mount and auto-populate if available
  useEffect(() => {
    loadSavedCredentials();
    
    // Add keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Clear all data when navigating back from other screens
  useEffect(() => {
    if (clearDataOnMount) {
      // Clear form data
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        agreeTerms: false,
      });
      
      // Clear errors
      setErrors({
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // Clear modal states
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowTermsModal(false);
      setShowPrivacyModal(false);
      setShowCompleteAccountModal(false);
      setShowInvalidCredentialsModal(false);
      setShowEmailDropdown(false);
      
      // Clear registration data from auth store
      clearRegistrationData();
      
      // Reset to signin tab
      setActiveTab('signin');
      
      console.log('🧹 Cleared all AuthScreen data due to backward navigation');
    }
  }, [clearDataOnMount, clearRegistrationData]);

  // Auto-populate with most recent credentials when they're loaded (only on component mount)
  useEffect(() => {
    if (savedCredentials.length > 0 && activeTab === 'signin' && !formData.email && !formData.password) {
      const mostRecent = savedCredentials[0]; // First item is most recent
      setFormData(prev => ({
        ...prev,
        email: mostRecent.email,
        password: mostRecent.password,
        rememberMe: true
      }));
      console.log('🔄 Auto-populated credentials for:', mostRecent.email);
    }
  }, [savedCredentials]); // Removed activeTab dependency to prevent auto-fill when switching tabs

  // Utility functions for credential management
  const loadSavedCredentials = async () => {
    try {
      const saved = await AsyncStorage.getItem('saved_credentials');
      if (saved) {
        const credentials = JSON.parse(saved);
        setSavedCredentials(credentials);
        console.log('📋 Loaded saved credentials:', credentials.length, 'accounts');
      }
    } catch (error) {
      console.error('❌ Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async (email: string, password: string) => {
    try {
      const existing = savedCredentials.filter(cred => cred.email !== email);
      const newCredentials = [{ email, password }, ...existing].slice(0, 5); // Keep max 5 accounts
      
      await AsyncStorage.setItem('saved_credentials', JSON.stringify(newCredentials));
      setSavedCredentials(newCredentials);
      console.log('💾 Saved credentials for:', email);
    } catch (error) {
      console.error('❌ Error saving credentials:', error);
    }
  };

  const removeCredentials = async (email: string) => {
    try {
      const filtered = savedCredentials.filter(cred => cred.email !== email);
      await AsyncStorage.setItem('saved_credentials', JSON.stringify(filtered));
      setSavedCredentials(filtered);
      console.log('🗑️ Removed credentials for:', email);
    } catch (error) {
      console.error('❌ Error removing credentials:', error);
    }
  };

  const selectSavedCredential = (credential: {email: string, password: string}) => {
    setFormData(prev => ({
      ...prev,
      email: credential.email,
      password: credential.password,
      rememberMe: true
    }));
    setShowEmailDropdown(false);
    setErrors({
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

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
          
          // Store tokens and user data atomically (API returns 'token' not 'access_token')
          if (response.data?.token) {
            console.log('🔑 Storing user and tokens atomically...');
            await setUserAndTokens(
              {
                id: response.data?.user?.id?.toString() || '1',
                firstName: response.data?.user?.first_name || 'User',
                email: formData.email,
              },
              response.data.token,
              response.data?.refresh_token
            );
            console.log('✅ User and tokens stored successfully');
            
            // Double check storage worked
            const verifyToken = await AsyncStorage.getItem('auth_token');
            console.log('🔍 Verification: Token in AsyncStorage:', !!verifyToken);
          } else {
            console.warn('⚠️ No token in login response');
            console.warn('⚠️ Available response keys:', Object.keys(response.data || {}));
          }
          
          // Setup Intent creation is now handled on-demand when user adds payment method
          
          // Save credentials if Remember Me is checked
          if (formData.rememberMe) {
            await saveCredentials(formData.email, formData.password);
          }
          
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Login successful!'
          });
          
          // Clear form data after successful login
          clearFormData();
          
          onLogin();
        } catch (error: any) {
          console.error('Login error:', error);
          console.error('Error response:', error.response?.data);
          
          // Show invalid credentials popup for all login errors
          setShowInvalidCredentialsModal(true);
        }
      } else {
        // Sign up flow - save email, password and terms acceptance, navigate to profile creation
        setRegistrationData({
          email: formData.email,
          password: formData.password,
          termsAccepted: formData.agreeTerms,
        });
        
        // Clear form data after successful signup initiation
        clearFormData();
        
        onCreateProfile?.();
      }
    }
  };

  const clearFormData = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      agreeTerms: false,
    });
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
    });
    // Reset password visibility to hidden state
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Function to scroll to input when focused
  const scrollToInput = (inputRef: React.RefObject<TextInput>) => {
    setTimeout(() => {
      if (inputRef.current && scrollViewRef.current) {
        inputRef.current.measureInWindow((x, y, width, height) => {
          const { Dimensions } = require('react-native');
          const screenHeight = Dimensions.get('window').height;
          const effectiveKeyboardHeight = keyboardHeight || (Platform.OS === 'ios' ? 320 : 280);
          const inputBottom = y + height;
          const visibleAreaHeight = screenHeight - effectiveKeyboardHeight;
          
          if (inputBottom > visibleAreaHeight - 20) { // 20px buffer
            // Calculate how much to scroll
            const scrollOffset = inputBottom - visibleAreaHeight + 80; // Extra padding for visibility
            scrollViewRef.current?.scrollTo({
              y: scrollOffset,
              animated: true,
            });
          }
        });
      }
    }, 200); // Increased delay for better measurement
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (typeof value === 'string') {
      const newErrors = { ...errors };
      
      if (field === 'email') {
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Please enter correct email';
        } else {
          newErrors.email = '';
        }
      }
      
      if (field === 'password') {
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (activeTab === 'signup' && !validatePassword(value)) {
          newErrors.password = 'Password must include at least one lowercase, one uppercase, one digit, and one special character';
        } else {
          newErrors.password = '';
        }
      }
      
      if (field === 'confirmPassword') {
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== value) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          newErrors.confirmPassword = '';
        }
      }
      
      setErrors(newErrors);
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={true}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          keyboardDismissMode="interactive"
        >
          <View className="flex-1 px-6 pt-20">
            <View className="items-center mb-8">
              <Image 
                source={require('../../assets/images/FavorAppLogo.png')} 
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
                onPress={() => {
                  setActiveTab('signin');
                  clearFormData();
                }}
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
                onPress={() => {
                  setActiveTab('signup');
                  clearFormData();
                }}
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
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>
                <View className="relative">
                  <TextInput
                    ref={emailInputRef}
                    className={`px-4 py-3 rounded-xl border text-base bg-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                    onFocus={() => {
                      // Show dropdown only for signin tab and if there are saved credentials
                      if (activeTab === 'signin' && savedCredentials.length > 0) {
                        setShowEmailDropdown(true);
                      }
                      // Scroll to input when focused
                      scrollToInput(emailInputRef);
                    }}
                    onBlur={() => {
                      // Hide dropdown after a short delay to allow selection
                      setTimeout(() => setShowEmailDropdown(false), 150);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                
                {/* Credential Dropdown */}
                {showEmailDropdown && activeTab === 'signin' && savedCredentials.length > 0 && (
                  <View className="absolute top-14 left-0 right-0 bg-white border border-gray-300 rounded-xl shadow-lg z-10 max-h-48">
                    <View className="p-2">
                      <Text className="text-xs font-medium text-gray-500 px-2 py-1">Saved Accounts</Text>
                      {savedCredentials.map((credential, index) => (
                        <TouchableOpacity
                          key={index}
                          className="flex-row items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50"
                          onPress={() => selectSavedCredential(credential)}
                        >
                          <View className="flex-1">
                            <Text className="text-sm font-medium text-gray-800">
                              {credential.email}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              Password saved
                            </Text>
                          </View>
                          <TouchableOpacity
                            className="ml-2 p-1"
                            onPress={(e) => {
                              e.stopPropagation();
                              removeCredentials(credential.email);
                            }}
                          >
                            <Text className="text-red-500 text-xs">✕</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                
                  {/* Error message */}
                  {errors.email ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
                  ) : null}
                </View>
              </View>
              
              {/* Password Field */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    ref={passwordInputRef}
                    className={`px-4 py-3 rounded-xl border pr-12 text-base bg-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                    onFocus={() => scrollToInput(passwordInputRef)}
                    secureTextEntry={!showPassword}
                  />
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
                    <EyeSvg isVisible={showPassword} />
                  </TouchableOpacity>
                  {/* Error message */}
                  {errors.password ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
                  ) : null}
                </View>
              </View>

              {/* Confirm Password Field (Sign Up only) */}
              {activeTab === 'signup' && (
                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      ref={confirmPasswordInputRef}
                      className={`px-4 py-3 rounded-xl border pr-12 text-base bg-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      onFocus={() => scrollToInput(confirmPasswordInputRef)}
                      secureTextEntry={!showConfirmPassword}
                    />
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
                      <EyeSvg isVisible={showConfirmPassword} />
                    </TouchableOpacity>
                    {/* Error message */}
                    {errors.confirmPassword ? (
                      <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
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
              <View className="mb-6 mt-8">
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
                      <Text 
                        className="underline text-black hover:text-green-500 transition-colors duration-200"
                        onPress={() => setShowTermsModal(true)}
                        style={{ cursor: 'pointer' }}
                      >
                        Terms & Condition
                      </Text>
                      {' '}and the{' '}
                      <Text 
                        className="underline text-black hover:text-green-500 transition-colors duration-200"
                        onPress={() => setShowPrivacyModal(true)}
                        style={{ cursor: 'pointer' }}
                      >
                        Privacy Policy
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-3xl w-full max-w-sm mx-4 max-h-[80vh] border-4 border-[#71DFB1]">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-black">Terms & Conditions</Text>
                <TouchableOpacity 
                  onPress={() => setShowTermsModal(false)}
                  className="w-6 h-6 bg-black rounded-full items-center justify-center"
                >
                  <Text className="text-white text-sm">×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView className="max-h-[60vh]" showsVerticalScrollIndicator={false}>
                <Text className="text-xl font-bold text-gray-800 mb-2">FavorApp Terms of Use Agreement</Text>
                <Text className="text-sm text-gray-500 mb-6">Updated February 18, 2025</Text>
                
                <Text className="text-base text-gray-700 leading-6 mb-6">
                  The services offered by FavorApp LLC ("we," "us" or "our") include the www.favorapp.net website (the "Website"), the www.favorapp.net Internet messaging service, and any other features, content, or application offered from time to time by www.favorapp.net in connection with the FavorApp LLC Website (collectively, "FavorApp"). FavorApp is privately owned and hosted in the United States. FavorApp is a social networking service that allows Members to create unique personal profiles online in order to find and communicate with other users on the FavorApp website to provide services.
                </Text>

                <Text className="text-base text-gray-700 leading-6 mb-6">
                  This Terms of Use Agreement ("Agreement") sets forth the legally binding terms for your use of FavorApp. By using FavorApp, you agree to be bound by this Agreement, whether you are a "Visitor" (which means that you simply browse the Website) or you are a "Member" (which means that you have registered with www.favorapp.net). The term "User" refers to a Visitor or a Member. You are only authorized to use FavorApp (regardless of whether your access or use is intended) if you agree to abide by all applicable laws and to this Agreement.
                </Text>

                <Text className="text-lg font-bold text-gray-800 mb-3">Content Guidelines</Text>
                <Text className="text-base text-gray-700 leading-6 mb-6">
                  Please choose carefully the information you post on FavorApp and that you provide to other Users. Your FavorApp profile may not include any photographs containing nudity, or obscene, lewd, excessively violent, harassing, sexually explicit or otherwise objectionable subject matter.
                </Text>

                <Text className="text-lg font-bold text-gray-800 mb-3">Eligibility</Text>
                <Text className="text-base text-gray-700 leading-6 mb-6">
                  Use of and Membership in FavorApp is void where prohibited. By using FavorApp, you represent and warrant that (a) all registration information you submit is truthful and accurate; (b) you will maintain the accuracy of such information; (c) you are 18 years of age or older; and (d) your use of FavorApp does not violate any applicable law or regulation.
                </Text>

                <Text className="text-lg font-bold text-gray-800 mb-3">Fees</Text>
                <Text className="text-base text-gray-700 leading-6 mb-6">
                  A fifteen percent (15%) fee is charged to any user who creates a paid favor. FavorApp may offer enhancements and features which can be added to personal accounts for a fee when selecting such upgrade option. As security is our top priority, there is a $5.00 monthly maintenance fee for identification verification for use on the FavorApp LLC website.
                </Text>

                <Text className="text-lg font-bold text-gray-800 mb-3">Prohibited Content and Activity</Text>
                <Text className="text-base text-gray-700 leading-6 mb-4">
                  The following types of content and activities are prohibited on FavorApp:
                </Text>
                <Text className="text-sm text-gray-700 leading-6 mb-6">
                  • Content that is patently offensive, promotes racism, bigotry, hatred or physical harm{'\n'}
                  • Harassment or advocacy of harassment{'\n'}
                  • Nudity, violence, or offensive subject matter{'\n'}
                  • False or misleading information{'\n'}
                  • Illegal activities{'\n'}
                  • Commercial activities without prior written consent{'\n'}
                  • Automated use of the system{'\n'}
                  • Impersonating another person{'\n'}
                  • Selling or transferring your profile
                </Text>

                <Text className="text-base text-gray-700 leading-6 mb-6 font-semibold">
                  YOUR USE OF THE WEBSITE OR REGISTRATION ON THE WEBSITE AFFIRMS THAT YOU HAVE READ THIS AGREEMENT AND AGREE TO ALL OF THE PROVISIONS CONTAINED ABOVE.
                </Text>
              </ScrollView>
              
              <View className="mt-4">
                <TouchableOpacity
                  className="bg-green-500 rounded-full py-3"
                  onPress={() => {
                    updateFormData('agreeTerms', true);
                    setShowTermsModal(false);
                  }}
                >
                  <Text className="text-white text-center font-semibold text-lg">I Agree</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-3xl w-full max-w-sm mx-4 max-h-[80vh] border-4 border-[#71DFB1]">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-black">Privacy Policy</Text>
                <TouchableOpacity 
                  onPress={() => setShowPrivacyModal(false)}
                  className="w-6 h-6 bg-black rounded-full items-center justify-center"
                >
                  <Text className="text-white text-sm">×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView className="max-h-[60vh]" showsVerticalScrollIndicator={false}>
                <Text className="text-sm text-gray-500 mb-4">Effective date: February 14, 2025</Text>
                
                <Text className="text-base text-gray-700 leading-6 mb-6">
                  Thank you for visiting the www.favorapp.net web site. This privacy policy describes you how we use personal information collected at this site. Please read this privacy policy before using the site or submitting any personal information. By using the site, you are accepting the practices described in this privacy policy.
                </Text>

                <Text className="text-base text-gray-700 leading-6 mb-6">
                  Note: the privacy practices set forth in this privacy policy are for the www.favorapp.net web site only. If you link to other web sites, please review the privacy policies posted at those sites.
                </Text>

                <Text className="text-lg font-bold text-gray-800 mb-3">Collection of Information</Text>
                <Text className="text-base text-gray-700 leading-6 mb-6">
                  We collect personally identifiable information limited to only your email address, and general location (county and postal code), when voluntarily submitted by our visitors upon registration for a personal profile account on the www.favorapp.net website. The email you provide is used to verify that the account registration is from an actual person with verifiable contact, and also used to send activity notifications.
                </Text>

                <Text className="text-lg font-bold text-gray-800 mb-3">Publicly Posted Information</Text>
                <Text className="text-base text-gray-700 leading-6 mb-6">
                  As www.favorapp.net is a social network, we provide many areas for users to voluntarily post information visible to other users of the website, including but not limited to your profile page, blogs, forums, photo albums, etc. We STRONGLY encourage you to never post any personal identifiable information in these areas such as your full name, phone number, address, etc.
                </Text>

                <Text className="text-lg font-bold text-gray-800 mb-3">Distribution of Information</Text>
                <Text className="text-base text-gray-700 leading-6 mb-6">
                  Your confidential personal information will NEVER be sold, shared, or given to any third party without your permission, and will NEVER be made publicly visible or available on the FavorApp website. We may share information with governmental agencies or other companies assisting us in fraud prevention or investigation.
                </Text>

                <Text className="text-lg font-bold text-gray-800 mb-3">Commitment to Data Security</Text>
                <Text className="text-base text-gray-700 leading-6 mb-6">
                  Your personally identifiable information is kept secure. Only authorized employees, agents and contractors (who have agreed to keep information secure and confidential) have access to this information.
                </Text>

                <Text className="text-base text-gray-700 leading-6 mb-6">
                  We reserve the right to make changes to this policy without notice to you. Any changes to this policy will be posted.
                </Text>
              </ScrollView>
              
              <View className="mt-4">
                <TouchableOpacity
                  className="bg-green-500 rounded-full py-3"
                  onPress={() => {
                    updateFormData('agreeTerms', true);
                    setShowPrivacyModal(false);
                  }}
                >
                  <Text className="text-white text-center font-semibold text-lg">I Agree</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Complete Account Modal */}
      <Modal
        visible={showCompleteAccountModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompleteAccountModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-3xl w-full max-w-sm mx-4 border-4 border-[#71DFB1]">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-black">Complete Your Account</Text>
                <TouchableOpacity 
                  onPress={() => setShowCompleteAccountModal(false)}
                  className="w-6 h-6 bg-black rounded-full items-center justify-center"
                >
                  <Text className="text-white text-sm">×</Text>
                </TouchableOpacity>
              </View>
              
              {/* Icon */}
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
                  <Text className="text-3xl">⚠️</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-800 text-center mb-3">
                  Account Setup Incomplete
                </Text>
                <Text className="text-sm text-gray-600 text-center leading-5">
                  It looks like your account registration wasn't completed. To access FavorApp, please complete the signup process by creating your profile.
                </Text>
              </View>

              {/* Pre-fill email hint */}
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <Text className="text-sm text-blue-800 font-medium mb-1">
                  💡 Quick Setup
                </Text>
                <Text className="text-xs text-blue-700">
                  We'll use your email "{formData.email}" to continue where you left off.
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="gap-y-3">
                <TouchableOpacity
                  className="bg-[#44A27B] rounded-full py-4"
                  onPress={() => {
                    setShowCompleteAccountModal(false);
                    // Pre-fill the signup form with current email
                    setActiveTab('signup');
                    // Navigate to signup flow
                    onSignup?.(formData.email);
                  }}
                >
                  <Text className="text-white text-center font-semibold text-base">
                    Complete Signup
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="bg-gray-100 rounded-full py-4 border border-gray-300"
                  onPress={() => {
                    setShowCompleteAccountModal(false);
                    // Switch to signup tab
                    setActiveTab('signup');
                  }}
                >
                  <Text className="text-gray-700 text-center font-semibold text-base">
                    Create New Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Invalid Credentials Modal */}
      <Modal
        visible={showInvalidCredentialsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInvalidCredentialsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-3xl w-full max-w-sm mx-4 border-4 border-[#71DFB1]">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-black">Invalid Credentials</Text>
                <TouchableOpacity 
                  onPress={() => setShowInvalidCredentialsModal(false)}
                  className="w-6 h-6 bg-black rounded-full items-center justify-center"
                >
                  <Text className="text-white text-sm">×</Text>
                </TouchableOpacity>
              </View>
              
              {/* Icon */}
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                  <Text className="text-3xl">❌</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-800 text-center mb-3">
                  Login Failed
                </Text>
                <Text className="text-sm text-gray-600 text-center leading-5">
                  The email or password you entered is incorrect. Please check your credentials and try again.
                </Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                className="bg-[#44A27B] rounded-full py-4"
                onPress={() => setShowInvalidCredentialsModal(false)}
              >
                <Text className="text-white text-center font-semibold text-base">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}