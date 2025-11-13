import React, { useState, useRef, useEffect } from 'react';
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
import { useVerifyOtpMutation, useResendOtpMutation } from '../../services/mutations/AuthMutations';
import useAuthStore from '../../store/useAuthStore';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SignupOtpScreenProps {
  onBack: () => void;
  onVerifySuccess: () => void;
  onBackToLogin: () => void;
  email: string;
  onClearDataAndNavigateToAuth?: () => void;
  userData?: any;
}

export function SignupOtpScreen({ onBack, onVerifySuccess, onBackToLogin, email, onClearDataAndNavigateToAuth, userData }: SignupOtpScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes = 300 seconds
  const [canResend, setCanResend] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Log received parameters for debugging
  useEffect(() => {
    console.log('📧 SignupOtpScreen initialized with email:', email);
    console.log('📦 SignupOtpScreen received userData:', userData);
  }, [email, userData]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<TextInput[]>([]);
  
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();
  const setUser = useAuthStore((state) => state.setUser);
  const registrationData = useAuthStore((state) => state.registrationData);
  const clearRegistrationData = useAuthStore((state) => state.clearRegistrationData);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      // If current field has content, clear it
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // If current field is empty, move to previous field and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      try {
        console.log('Verifying OTP:', { email, otp_code: otpCode });
        const response = await verifyOtpMutation.mutateAsync({
          email,
          otp_code: otpCode,
        });
        
        console.log('OTP verification response:', response);
        
        // Set user data if available from registration
        if (registrationData) {
          setUser({
            id: response.data?.user?.id || '1',
            firstName: response.data?.user?.first_name || 'User',
            email: email,
          });
          clearRegistrationData();
        }
        
        setShowSuccessModal(true);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'OTP verified successfully!'
        });
        
      } catch (error: any) {
        console.error('OTP verification error:', error);
        console.error('Error response:', error.response?.data);
        
        let errorMessage = 'Invalid OTP code. Please try again.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.userMessage) {
          errorMessage = error.userMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: errorMessage
        });
      }
    }
  };

  const handleResendCode = async () => {
    if (canResend && !resendOtpMutation.isPending) {
      try {
        console.log('Resending OTP to:', email);
        const response = await resendOtpMutation.mutateAsync({ email });
        console.log('Resend OTP response:', response);
        
        // Reset timer and form state
        setTimer(300); // Reset to 5 minutes
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        
        // Show success message
        Toast.show({
          type: 'success',
          text1: 'Code Resent',
          text2: response.message || 'OTP code has been\nresent successfully'
        });
        
        // Reset timer
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      } catch (error: any) {
        console.error('Resend OTP error:', error);
        console.error('Error response:', error.response?.data);
        
        let errorMessage = 'Failed to resend OTP. Please try again.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.userMessage) {
          errorMessage = error.userMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Toast.show({
          type: 'error',
          text1: 'Resend Failed',
          text2: errorMessage
        });
      }
    }
  };

  const isFormValid = otp.every(digit => digit !== '');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackWithDataClear = async () => {
    // Clear OTP state
    setOtp(['', '', '', '', '', '']);
    setTimer(300);
    setCanResend(false);
    setShowSuccessModal(false);
    setFocusedIndex(null);
    
    // Clear registration data from auth store
    clearRegistrationData();
    
    // Set flag to skip splash screen when navigating to auth
    await AsyncStorage.setItem('skip_splash_from_signup', 'true');
    
    // Navigate back to auth screen with data clearing
    if (onClearDataAndNavigateToAuth) {
      onClearDataAndNavigateToAuth();
    } else {
      onBack();
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1 px-6 pt-20">
        
        {/* Back Button */}
        <View className="mb-4">
          <TouchableOpacity 
            onPress={handleBackWithDataClear}
            className="flex-row items-center"
          >
            <Text className="text-lg mr-1">←</Text>
            <Text className="text-base text-gray-600">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Lock Icon */}
        <View className="items-center mb-8 mt-8">
          <LockIcon />
        </View>

        {/* Title and Description */}
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-gray-800 mb-4 text-center">
            OTP Verification
          </Text>
          <Text className="text-base text-gray-600 text-center px-4 leading-6">
            Enter the OTP Code sent to{'\n'}
            <Text className="font-semibold text-gray-800">{email}</Text>
          </Text>
        </View>

        {/* OTP Input Fields */}
        <View className="flex-row justify-center mb-8 gap-x-3">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              className={`w-12 h-12 border-2 rounded-lg text-center text-xl font-semibold bg-transparent ${
                focusedIndex === index ? 'border-green-500' : 'border-gray-300'
              }`}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>


        {/* Verify Button */}
        <View className="mb-8">
          <CarouselButton
            title={verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
            onPress={handleVerify}
            disabled={!isFormValid || verifyOtpMutation.isPending}
          />
        </View>

        {/* Timer and Resend */}
        <View className="items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {formatTime(timer)}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-gray-600">Didn't receive OTP code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={!canResend || resendOtpMutation.isPending}>
              <Text className={`font-medium ${canResend && !resendOtpMutation.isPending ? 'text-[#44A27B]' : 'text-black'}`}>
                {resendOtpMutation.isPending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Back to Login */}
        <View className="items-center">
          <View className="flex-row items-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={async () => {
              // Set flag to skip splash screen when navigating to auth
              await AsyncStorage.setItem('skip_splash_from_signup', 'true');
              onBackToLogin();
            }}>
              <Text className="font-medium text-[#44A27B]">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <SuccessModal
        visible={showSuccessModal}
        title="Success"
        message="Your email verification process is complete. You can now login with your credentials."
        onContinue={async () => {
          setShowSuccessModal(false);
          // Set flag to skip splash screen when navigating to auth
          await AsyncStorage.setItem('skip_splash_from_signup', 'true');
          onBackToLogin();
        }}
      />
    </ImageBackground>
  );
}