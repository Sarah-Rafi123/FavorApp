import React, { useState, useRef, useEffect } from 'react';
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
import { useResendOtpMutation, useVerifyResetOtpMutation } from '../../services/mutations/AuthMutations';
import Toast from 'react-native-toast-message';
import BackSvg from '../../assets/icons/Back';

interface OtpVerificationScreenProps {
  onBack: () => void;
  onVerifySuccess: (resetToken?: string) => void;
  email: string;
}

export function OtpVerificationScreen({ onBack, onVerifySuccess, email }: OtpVerificationScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes = 300 seconds
  const [canResend, setCanResend] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [resetToken, setResetToken] = useState<string>('');
  const inputRefs = useRef<TextInput[]>([]);
  const resendOtpMutation = useResendOtpMutation();
  const verifyResetOtpMutation = useVerifyResetOtpMutation();

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

  const handleContinue = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      try {
        console.log('Verifying reset OTP:', { email, otp_code: otpCode });
        const response = await verifyResetOtpMutation.mutateAsync({
          email,
          otp_code: otpCode,
        });
        
        console.log('Verify reset OTP response:', response);
        
        // Extract reset token from response
        const token = response.data?.reset_token;
        if (token) {
          setResetToken(token);
          console.log('Reset token received:', token);
        }
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'OTP verified successfully!'
        });
        
        setShowSuccessModal(true);
        
      } catch (error: any) {
        console.error('Verify reset OTP error:', error);
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
        const response = await resendOtpMutation.mutateAsync({
          email: email,
        });
        
        console.log('Resend OTP response:', response);
        
        // Reset timer and form on successful resend
        setTimer(300); // Reset to 5 minutes
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        
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
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'OTP code sent successfully!'
        });
        
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

  return (
    <ImageBackground 
      source={require('../../../assets/Wallpaper.png')} 
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
            {/* Back Button */}
            <TouchableOpacity 
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mb-8"
        >
         <BackSvg />
        </TouchableOpacity>

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
                focusedIndex === index ? 'border-green-500' : 'border-gray-200'
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

        {/* Continue Button */}
        <View className="mb-8">
          <CarouselButton
            title={verifyResetOtpMutation.isPending ? "Verifying..." : "Continue"}
            onPress={handleContinue}
            disabled={!isFormValid || verifyResetOtpMutation.isPending}
          />
        </View>

        {/* Timer and Resend */}
        <View className="items-center">
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccessModal}
        title="Success"
        message="OTP verified. You can now reset your password."
        onContinue={() => {
          setShowSuccessModal(false);
          onVerifySuccess(resetToken);
        }}
      />
    </ImageBackground>
  );
}