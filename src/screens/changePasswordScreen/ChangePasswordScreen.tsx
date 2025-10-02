import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChangePasswordScreenProps {
  navigation?: any;
}

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M1 10S4 4 10 4S19 10 19 10S16 16 10 16S1 10 1 10Z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeOffIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M14.12 14.12C13.0802 15.0556 11.5752 15.5929 10.0108 15.5929C8.4464 15.5929 6.94138 15.0556 5.90156 14.12M9.9 5.9C11.1148 5.87463 12.2812 6.34334 13.12 7.2M2.45 2.45L17.55 17.55M1 10S4 4 10 4C11.7 4 13.1 4.6 14.2 5.4"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LockIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
      stroke="#44A27B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
      stroke="#44A27B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!passwordValidation.isValid) {
      Alert.alert('Error', 'Please ensure your new password meets all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success', 
        'Your password has been changed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation?.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordInput = ({ 
    label, 
    value, 
    onChangeText, 
    show, 
    onToggleShow, 
    placeholder 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    show: boolean;
    onToggleShow: () => void;
    placeholder: string;
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <View className="relative">
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 pr-12 text-base text-gray-800"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity
          className="absolute right-4 top-3"
          onPress={onToggleShow}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </TouchableOpacity>
      </View>
    </View>
  );

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <View className="flex-row items-center mb-1">
      <View className={`w-2 h-2 rounded-full mr-3 ${met ? 'bg-green-500' : 'bg-gray-300'}`} />
      <Text className={`text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>{text}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4 p-2"
            onPress={() => navigation?.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Change Password</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-6">
          
          {/* Icon */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
              <LockIcon />
            </View>
          </View>

          {/* Form */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">
              Create New Password
            </Text>

            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              show={showCurrentPassword}
              onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
              placeholder="Enter current password"
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              show={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
              placeholder="Enter new password"
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              show={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              placeholder="Confirm new password"
            />

            {/* Password Requirements */}
            {newPassword.length > 0 && (
              <View className="mt-4 mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</Text>
                <PasswordRequirement 
                  met={passwordValidation.hasMinLength} 
                  text="At least 8 characters" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasUpperCase} 
                  text="One uppercase letter" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasLowerCase} 
                  text="One lowercase letter" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasNumbers} 
                  text="One number" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasSpecialChar} 
                  text="One special character" 
                />
              </View>
            )}

            {/* Change Password Button */}
            <TouchableOpacity 
              className={`rounded-xl py-4 ${
                isLoading 
                  ? 'bg-gray-400' 
                  : 'bg-green-500'
              }`}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Security Tips */}
          <View className="bg-blue-50 rounded-2xl p-6 mt-6">
            <Text className="text-lg font-semibold text-blue-800 mb-3">Security Tips</Text>
            <Text className="text-sm text-blue-700 mb-2">• Use a unique password you don't use elsewhere</Text>
            <Text className="text-sm text-blue-700 mb-2">• Avoid using personal information in your password</Text>
            <Text className="text-sm text-blue-700">• Consider using a password manager</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}