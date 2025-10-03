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

interface SignupOtpScreenProps {
  onBack: () => void;
  onVerifySuccess: () => void;
  email: string;
}

export function SignupOtpScreen({ onBack, onVerifySuccess, email }: SignupOtpScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<TextInput[]>([]);

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
    // Move to previous input on backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // Simulate OTP verification
      setShowSuccessModal(true);
    }
  };

  const handleResendCode = () => {
    if (canResend) {
      setTimer(30);
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

        {/* Verify Button */}
        <View className="mb-8">
          <CarouselButton
            title="Verify"
            onPress={handleVerify}
            disabled={!isFormValid}
          />
        </View>

        {/* Timer and Resend */}
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {formatTime(timer)}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-gray-600">Didn't receive OTP code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={!canResend}>
              <Text className={`font-medium ${canResend ? 'text-gray-800' : 'text-gray-400'}`}>
                Resend Code
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <SuccessModal
        visible={showSuccessModal}
        title="Success"
        message="Your email verification process is complete."
        onContinue={() => {
          setShowSuccessModal(false);
          onVerifySuccess();
        }}
      />
    </ImageBackground>
  );
}