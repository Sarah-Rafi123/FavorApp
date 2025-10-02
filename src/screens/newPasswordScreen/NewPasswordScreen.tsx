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
import { SuccessModal } from '../../components/overlays/SuccessModal';

interface NewPasswordScreenProps {
  onPasswordReset: () => void;
}

export function NewPasswordScreen({ onPasswordReset }: NewPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  // Password validation
  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleSubmit = () => {
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
      // Handle password reset
      setShowSuccessModal(true);
    }
  };

  const isFormValid = password && confirmPassword && password === confirmPassword && password.length >= 6;

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
        </View>

        {/* Form */}
        <View className="flex-1">
          
          {/* Password Field */}
          <View className="mb-6 relative">
            <TextInput
              className="px-4 py-4 rounded-xl border border-gray-200 pr-12 text-base bg-transparent"
              placeholder="••••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: '' }));
                }
              }}
              secureTextEntry={!showPassword}
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Password
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
              className="px-4 py-4 rounded-xl border border-gray-200 pr-12 text-base bg-transparent"
              placeholder="••••••••••"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Confirm Password
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
              title="Submit"
              onPress={handleSubmit}
              disabled={!isFormValid}
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