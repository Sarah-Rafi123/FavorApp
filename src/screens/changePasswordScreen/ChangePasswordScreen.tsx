import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  ImageBackground,
} from 'react-native';
import BackSvg from '../../assets/icons/Back';
import EyeSvg from '../../assets/icons/Eye';
import { useUpdatePasswordMutation } from '../../services/mutations/ProfileMutations';

interface ChangePasswordScreenProps {
  navigation?: any;
}



export function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const updatePasswordMutation = useUpdatePasswordMutation();

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8 && password.length <= 50;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    
    // Full regex validation as specified
    const fullRegexValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W]).{8,}$/.test(password) && password.length <= 50;
    
    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && fullRegexValid
    };
  };

  const passwordValidation = useMemo(() => validatePassword(formData.newPassword), [formData.newPassword]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleChangePassword = async () => {
    // Reset errors
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    // Validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordValidation.isValid) {
      newErrors.newPassword = 'Password must include at least one lowercase letter, one uppercase letter, one digit, and one special character';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);

    // If there are errors, don't proceed
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    const passwordData = {
      profile: {
        current_password: formData.currentPassword,
        password: formData.newPassword,
        password_confirmation: formData.confirmPassword,
      },
    };

    updatePasswordMutation.mutate(passwordData, {
      onSuccess: () => {
        navigation?.goBack();
      },
    });
  };



  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation?.goBack()}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Change Password</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View className="px-6 pt-6">

          {/* Current Password Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Current Password
            </Text>
            <View className="relative">
              <TextInput
                className={`px-4 py-3 rounded-xl border pr-12 text-base bg-transparent ${
                  errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: 'transparent',
                  fontSize: 16,
                  lineHeight: 22,
                  height: 56
                }}
                placeholder="Enter your current password"
                placeholderTextColor="#9CA3AF"
                value={formData.currentPassword}
                onChangeText={(text) => updateFormData('currentPassword', text)}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                className="absolute right-3"
                style={{
                  top: 56 / 2 - 12,
                  height: 24,
                  width: 24,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <EyeSvg isVisible={showCurrentPassword} />
              </TouchableOpacity>
            </View>
            {errors.currentPassword ? (
              <Text className="text-red-500 text-sm mt-1">{errors.currentPassword}</Text>
            ) : null}
          </View>

          {/* New Password Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              New Password
            </Text>
            <View className="relative">
              <TextInput
                className={`px-4 py-3 rounded-xl border pr-12 text-base bg-transparent ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: 'transparent',
                  fontSize: 16,
                  lineHeight: 22,
                  height: 56
                }}
                placeholder="Enter your new password"
                placeholderTextColor="#9CA3AF"
                value={formData.newPassword}
                onChangeText={(text) => updateFormData('newPassword', text)}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                className="absolute right-3"
                style={{
                  top: 56 / 2 - 12,
                  height: 24,
                  width: 24,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <EyeSvg isVisible={showNewPassword} />
              </TouchableOpacity>
            </View>
            {errors.newPassword ? (
              <Text className="text-red-500 text-sm mt-1">{errors.newPassword}</Text>
            ) : null}
          </View>

          {/* Confirm Password Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirm Password
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
                placeholder="Confirm your new password"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                className="absolute right-3"
                style={{
                  top: 56 / 2 - 12,
                  height: 24,
                  width: 24,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <EyeSvg isVisible={showConfirmPassword} />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Password Validation Errors */}
          {formData.newPassword.length > 0 && !passwordValidation.isValid && (
            <View className="mt-3 ">
              {!passwordValidation.hasMinLength && (
                <Text className="text-red-500 text-sm mb-1">• Password must be 8-50 characters</Text>
              )}
              {!passwordValidation.hasLowerCase && (
                <Text className="text-red-500 text-sm mb-1">• Password must include at least one lowercase letter</Text>
              )}
              {!passwordValidation.hasUpperCase && (
                <Text className="text-red-500 text-sm mb-1">• Password must include at least one uppercase letter</Text>
              )}
              {!passwordValidation.hasNumbers && (
                <Text className="text-red-500 text-sm mb-1">• Password must include at least one digit</Text>
              )}
              {!passwordValidation.hasSpecialChar && (
                <Text className="text-red-500 text-sm mb-1">• Password must include at least one special character</Text>
              )}
            </View>
          )}

          {/* Change Password Button */}
          <View className="mt-12">
            <TouchableOpacity 
              className={`rounded-full py-4 ${
                updatePasswordMutation.isPending 
                  ? 'bg-gray-400' 
                  : 'bg-green-500'
              }`}
              onPress={handleChangePassword}
              disabled={updatePasswordMutation.isPending}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
