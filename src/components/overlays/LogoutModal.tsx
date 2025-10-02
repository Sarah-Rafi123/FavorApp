import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CloseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <Circle
      cx="30"
      cy="30"
      r="28"
      fill="#44A27B"
      stroke="#44A27B"
      strokeWidth="2"
    />
    <Path
      d="M22 42H18C17.4696 42 16.9609 41.7893 16.5858 41.4142C16.2107 41.0391 16 40.5304 16 40V20C16 19.4696 16.2107 18.9609 16.5858 18.5858C16.9609 18.2107 17.4696 18 18 18H22"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M32 38L44 26L32 14"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M44 26H22"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function LogoutModal({ visible, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm relative">
          
          {/* Close Button */}
          <TouchableOpacity
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full items-center justify-center z-10"
            onPress={onClose}
          >
            <CloseIcon />
          </TouchableOpacity>

          {/* Content */}
          <View className="items-center pt-4">
            
            {/* Logout Icon */}
            <View className="mb-6">
              <LogoutIcon />
            </View>

            {/* Message */}
            <Text className="text-lg font-semibold text-gray-800 text-center mb-8 leading-6">
              Are you sure you want to logout{'\n'}from the app?
            </Text>

            {/* Logout Button */}
            <TouchableOpacity
              className="bg-green-500 rounded-2xl py-4 w-full"
              onPress={onConfirm}
            >
              <Text className="text-white text-center text-lg font-semibold">
                Yes, logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}