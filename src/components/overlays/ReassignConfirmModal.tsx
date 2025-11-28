import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

interface ReassignConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentProviderName?: string;
  newProviderName?: string;
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

const WarningIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <Polygon
      points="12,2 22,20 2,20"
      fill="#FBB040"
      stroke="#FBB040"
      strokeWidth="0"
    />
    <Path
      d="M12 9V13M12 17H12.01"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function ReassignConfirmModal({ 
  visible, 
  onClose, 
  onConfirm, 
  currentProviderName,
  newProviderName 
}: ReassignConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-4">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm relative shadow-2xl border border-gray-100">
          
          {/* Header with better spacing */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Confirm Action
            </Text>
            
            {/* Enhanced Warning Icon with background */}
            <View className="bg-amber-50 rounded-full p-4 mb-2">
              <WarningIcon />
            </View>
          </View>

          {/* Title with better typography */}
          <Text className="text-xl font-bold text-gray-900 text-center mb-6">
            Reassign Favor Provider?
          </Text>

          {/* Enhanced Message with better formatting */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <Text className="text-gray-700 text-center mb-3 leading-6 text-base">
              Accepting this request will cancel the current provider{' '}
              <Text className="font-bold text-gray-900">
                Favor Provider's
              </Text>
              {' '}assignment and they will be notified of this change.
            </Text>
            
            <Text className="text-red-600 text-center font-medium text-sm">
              ⚠️ This action cannot be undone.
            </Text>
          </View>

          {/* Enhanced Buttons with better styling - stacked vertically */}
          <View className="gap-y-3">
            <TouchableOpacity
              className="w-full bg-[#44A27B] rounded-2xl py-4 px-6 shadow-lg active:bg-[#3a8f6a]"
              onPress={onConfirm}
              activeOpacity={0.9}
            >
              <Text className="text-white text-center text-lg font-bold">
                Reassign Provider
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-full border-2 border-gray-200 rounded-2xl py-4 px-6 active:bg-gray-50"
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 text-center text-lg font-bold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}