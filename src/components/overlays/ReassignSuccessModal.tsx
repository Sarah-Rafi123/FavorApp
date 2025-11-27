import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface ReassignSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  newProviderName?: string;
}

const CheckIcon = () => (
  <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#10B981" />
    <Path
      d="M9 12L11 14L15 10"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function ReassignSuccessModal({ 
  visible, 
  onClose, 
  newProviderName 
}: ReassignSuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-4">
        <View className="bg-white rounded-3xl p-8 w-full max-w-sm relative shadow-2xl">
          
          {/* Success Icon */}
          <View className="items-center mb-6">
            <View className="bg-green-50 rounded-full p-4 mb-4">
              <CheckIcon />
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              Success! 🎉
            </Text>
            
            <Text className="text-lg font-semibold text-green-600 text-center">
              Favor Reassigned
            </Text>
          </View>

          {/* Message */}
          <View className="bg-green-50 rounded-2xl p-4 mb-6">
            <Text className="text-gray-700 text-center leading-6">
              Your favor has been successfully reassigned to{' '}
              <Text className="font-bold text-gray-900">
                {newProviderName || 'the new provider'}
              </Text>.
            </Text>
            
            <Text className="text-gray-600 text-center mt-2 text-sm">
              They will be notified and can start working on your favor.
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            className="bg-green-500 rounded-2xl py-4 px-6 shadow-lg"
            onPress={onClose}
            activeOpacity={0.9}
          >
            <Text className="text-white text-center text-lg font-bold">
              Great!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}