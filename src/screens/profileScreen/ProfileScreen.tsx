import React from 'react';
import { View, Text } from 'react-native';

export function ProfileScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-gray-800">Profile</Text>
      <Text className="text-gray-600 mt-2">Manage your account</Text>
    </View>
  );
}