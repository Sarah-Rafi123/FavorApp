import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ImageBackground,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';

interface ChangePasswordScreenProps {
  navigation?: any;
}


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
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: '500', color: 'black', marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={{ 
            backgroundColor: '#FBFFF0',
            borderWidth: 1,
            borderColor: '#D0D5DD',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingRight: 48,
            paddingVertical: 16,
            fontSize: 16,
            color: 'black'
          }}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          textContentType="password"
        />
        <TouchableOpacity
          style={{ 
            position: 'absolute', 
            right: 16, 
            top: 0, 
            bottom: 0, 
            justifyContent: 'center',
            alignItems: 'center',
            width: 24,
            height: 24,
            marginTop: 16
          }}
          onPress={onToggleShow}
          activeOpacity={0.7}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </TouchableOpacity>
      </View>
    </View>
  );


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
      >
        <View className="px-6 pt-6">

          <PasswordInput
            label="Old Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            show={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            placeholder="••••••••••"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            show={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
            placeholder="••••••••••"
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            placeholder="••••••••••"
          />

          {/* Change Password Button */}
          <View className="mt-12">
            <TouchableOpacity 
              className={`rounded-full py-4 ${
                isLoading 
                  ? 'bg-gray-400' 
                  : 'bg-green-500'
              }`}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}