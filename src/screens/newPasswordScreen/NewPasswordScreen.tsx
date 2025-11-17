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
import { SuccessModal } from '../../components/overlays/SuccessModal';
import { useResetPasswordMutation } from '../../services/mutations/AuthMutations';
import EyeSvg from '../../assets/icons/Eye';
import Toast from 'react-native-toast-message';

interface NewPasswordScreenProps {
  onPasswordReset: () => void;
  email: string;
  resetToken: string;
}

export function NewPasswordScreen({ onPasswordReset, email, resetToken }: NewPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const resetPasswordMutation = useResetPasswordMutation();

  // Password validation - matches AuthScreen.tsx pattern
  const validatePassword = (password: string) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasLowercase && hasUppercase && hasDigit && hasSpecialChar;
  };

  // Real-time form validation
  const updateFormData = (field: string, value: string) => {
    if (field === 'password') {
      setPassword(value);
      
      // Real-time validation
      const newErrors = { ...errors };
      
      if (!value) {
        newErrors.password = 'Password is required';
      } else if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!validatePassword(value)) {
        newErrors.password = 'Password must include at least one lowercase, one uppercase, one digit, and one special character';
      } else {
        newErrors.password = '';
      }
      
      setErrors(newErrors);
    }
    
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
      
      // Real-time password match validation
      const newErrors = { ...errors };
      
      if (!value) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== value) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        newErrors.confirmPassword = '';
      }
      
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    const newErrors = { password: '', confirmPassword: '' };
    let isValid = true;

    // Password validation - matches AuthScreen.tsx pattern
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must include at least one lowercase, one uppercase, one digit, and one special character';
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        console.log('Resetting password:', { email, reset_token: resetToken });
        const response = await resetPasswordMutation.mutateAsync({
          email,
          reset_token: resetToken,
          password,
          password_confirmation: confirmPassword,
        });
        
        console.log('Reset password response:', response);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password reset successfully!'
        });
        
        setShowSuccessModal(true);
      
      } catch (error: any) {
        console.error('Reset password error:', error);
        console.error('Error response:', error.response?.data);
        
        let errorMessage = 'Failed to reset password. Please try again.';
        
        // Handle specific error cases
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          // If errors is an array, join them
          errorMessage = error.response.data.errors.join('. ');
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.userMessage) {
          errorMessage = error.userMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Special handling for token-related errors
        if (errorMessage.toLowerCase().includes('invalid') && errorMessage.toLowerCase().includes('token')) {
          errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
        }
        
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: errorMessage
        });
      }
    }
  };

  const isFormValid = () => {
    return password && 
           confirmPassword && 
           password === confirmPassword && 
           validatePassword(password) && 
           !resetPasswordMutation.isPending && 
           resetToken;
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/Wallpaper.png')} 
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

        {/* Title */}
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-gray-800 mb-4 text-center">
            New Password
          </Text>
          {!resetToken && (
            <Text className="text-red-500 text-sm text-center px-4">
              No valid reset token found. Please request a new password reset.
            </Text>
          )}
        </View>

        {/* Form */}
        <View className="flex-1">
          
          {/* Password Field */}
          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              New Password *
            </Text>
            <View className="relative">
              <TextInput
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
                value={password}
                onChangeText={(text) => updateFormData('password', text)}
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

          {/* Confirm Password Field */}
          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </Text>
            <View className="relative">
              <TextInput
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
                value={confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
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

          {/* Submit Button */}
          <View className="mb-6 mt-8">
            <CarouselButton
              title={resetPasswordMutation.isPending ? "Resetting..." : "Submit"}
              onPress={handleSubmit}
              disabled={!isFormValid()}
            />
          </View>
        </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccessModal}
        title="Success"
        message="Your password has been reset successfully."
        onContinue={() => {
          setShowSuccessModal(false);
          onPasswordReset();
        }}
      />
    </ImageBackground>
  );
}