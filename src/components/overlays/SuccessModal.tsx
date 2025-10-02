import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { CarouselButton } from '../buttons';
import Svg, { Path, Circle } from 'react-native-svg';

interface SuccessModalProps {
  visible: boolean;
  onContinue: () => void;
  title?: string;
  message?: string;
}

const CheckIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <Circle cx="40" cy="40" r="35" fill="#44A27B" />
    <Path
      d="M25 40L35 50L55 30"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function SuccessModal({ 
  visible, 
  onContinue, 
  title = "Success",
  message = "Your OTP Verified successfully. Press continue to set your new password."
}: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-8 w-full max-w-sm relative border-4" style={{borderColor: '#71DFB1'}}>
          
          {/* Close Button */}
          <TouchableOpacity 
            className="absolute top-4 right-4 w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
            onPress={onContinue}
          >
            <Text className="text-gray-600 font-bold">×</Text>
          </TouchableOpacity>

          {/* Success Icon */}
          <View className="items-center mb-6 mt-4">
            <CheckIcon />
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-base text-gray-600 text-center mb-8 leading-6">
            {message}
          </Text>

          {/* Continue Button */}
          <CarouselButton
            title="Continue"
            onPress={onContinue}
          />

        </View>
      </View>
    </Modal>
  );
}