import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    age: number;
    phone: string;
    textNumber: string;
    since: string;
    image: string;
    askedHours: string;
    providedHours: string;
  };
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

export function ProfileModal({ visible, onClose, user }: ProfileModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm relative border-4" style={{borderColor: '#71DFB1'}}>
          
          {/* Close Button */}
          <TouchableOpacity 
            className="absolute top-4 right-4 w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
            onPress={onClose}
          >
            <CloseIcon />
          </TouchableOpacity>

          {/* Profile Photo */}
          <View className="items-center mb-6 mt-4">
            <View className="w-20 h-20 rounded-2xl overflow-hidden">
              <Image
                source={{ uri: user.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Name */}
          <Text className="text-xl font-bold text-gray-800 text-center mb-6">
            {user.name}
          </Text>

          {/* User Details */}
          <View className="mb-6">
            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                Email : <Text className="text-gray-500">●●●●●●●●●●●●●●●●●</Text>
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                Age : <Text className="font-semibold">{user.age}</Text>
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                Call : <Text className="text-gray-500">●●●●●●●●●●●●</Text>
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                Text : <Text className="text-gray-500">●●●●●●●●●●●●</Text>
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                Since : <Text className="text-gray-500">●●●●●●●●●●</Text>
              </Text>
            </View>
          </View>

          {/* Favor Details */}
          <View>
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Favor Details
            </Text>
            
            <View className="mb-2">
              <Text className="text-gray-700 text-base">
                Asked : <Text className="font-semibold">{user.askedHours}</Text>
              </Text>
            </View>

            <View>
              <Text className="text-gray-700 text-base">
                Provided : <Text className="font-semibold">{user.providedHours}</Text>
              </Text>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}