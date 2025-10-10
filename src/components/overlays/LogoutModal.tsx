import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LogoutSvg } from '../../assets/icons/Logout';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CloseIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="white"
      strokeWidth="1.5"
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
        <View className="border-[#71DFB1] border border-3 bg-[#FBFFF0] rounded-3xl p-6 w-full max-w-sm relative">
          
          {/* Close Button */}
          <TouchableOpacity
            className="absolute top-4 right-4 w-6 h-6 bg-black rounded-full items-center justify-center z-10"
            onPress={onClose}
          >
            <CloseIcon />
          </TouchableOpacity>

          {/* Content */}
          <View className="items-center pt-4">
            
            {/* Logout Icon */}
            <View className="mb-6">
              <LogoutSvg />
            </View>

            {/* Message */}
            <Text className="text-lg font-semibold text-gray-800 text-center mb-8 leading-6">
              Are you sure you want to logout{'\n'}from the app?
            </Text>

            {/* Logout Button */}
            <TouchableOpacity
              className="bg-green-500 rounded-full py-4 w-full"
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