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
import { LockIcon } from '../../assets/icons';
import { SuccessModal } from '../../components/overlays/SuccessModal';
import { useResetPasswordMutation } from '../../services/mutations/AuthMutations';
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

  // Comprehensive password validation
  const validatePassword = (password: string) => {
    const errors = [];
    
    // Check length requirements
    if (password.length < 8) {
      errors.push('minimum 8 characters');
    }
    if (password.length > 50) {
      errors.push('maximum 50 characters');
    }
    
    // Check character requirements
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    
    if (!hasLowercase) {
      errors.push('one lowercase letter');
    }
    if (!hasUppercase) {
      errors.push('one uppercase letter');
    }
    if (!hasDigit) {
      errors.push('one digit');
    }
    if (!hasSpecialChar) {
      errors.push('one special character');
    }
    
    if (errors.length > 0) {
      return `Password must include at least ${errors.join(', ')}`;
    }
    
    return '';
  };

  const handleSubmit = async () => {
    const newErrors = { password: '', confirmPassword: '' };
    let isValid = true;

    // Password validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
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
           !validatePassword(password) && 
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
          <View className="mb-6 relative">
            <TextInput
             style={{ 
                    lineHeight: 20,
                  }}
              className="px-4 py-4 rounded-xl border border-gray-200 pr-12 text-base bg-transparent"
              placeholder="••••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                // Real-time validation
                const passwordError = validatePassword(text);
                setErrors(prev => ({ ...prev, password: passwordError }));
              }}
              secureTextEntry={!showPassword}
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              New Password *
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Must include: 8-50 characters, lowercase, uppercase, digit, special character
            </Text>
            <TouchableOpacity
              className="absolute right-3 top-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text className="text-gray-500">👁</Text>
            </TouchableOpacity>
            {errors.password ? (
              <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
            ) : null}
          </View>

          {/* Confirm Password Field */}
          <View className="mb-8 relative">
            <TextInput
             style={{ 
                    lineHeight: 20,
                  }}
              className="px-4 py-4 rounded-xl border border-gray-200 pr-12 text-base bg-transparent"
              placeholder="••••••••••"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                // Real-time password match validation
                let confirmError = '';
                if (text && text !== password) {
                  confirmError = 'Passwords do not match';
                }
                setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Confirm Password *
            </Text>
            <TouchableOpacity
              className="absolute right-3 top-4"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text className="text-gray-500">👁</Text>
            </TouchableOpacity>
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <View className="mb-8">
            <CarouselButton
              title={resetPasswordMutation.isPending ? "Resetting..." : "Submit"}
              onPress={handleSubmit}
              disabled={!isFormValid()}
            />
          </View>

        </View>

      </View>

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