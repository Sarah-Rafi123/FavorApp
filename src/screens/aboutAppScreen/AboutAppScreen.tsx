import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface AboutAppScreenProps {
  navigation?: any;
}

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FavorAppIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <Circle
      cx="40"
      cy="40"
      r="35"
      stroke="#44A27B"
      strokeWidth="3"
      strokeDasharray="5,5"
      fill="none"
    />
    <Svg x="25" y="20" width="30" height="30" viewBox="0 0 30 30">
      <Text
        x="15"
        y="22"
        textAnchor="middle"
        fontSize="20"
        fontWeight="bold"
        fill="#44A27B"
      >
        F
      </Text>
    </Svg>
  </Svg>
);

export function AboutAppScreen({ navigation }: AboutAppScreenProps) {
  return (
    <View className="flex-1 bg-green-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-green-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4 p-2"
            onPress={() => navigation?.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">About App</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-6">
          
          {/* App Icon and Name */}
          <View className="items-center mb-8">
            <FavorAppIcon />
            <Text className="text-3xl font-bold text-gray-800 mt-4 mb-2">FavorApp</Text>
            <Text className="text-lg text-gray-600">Version 1.2.0</Text>
          </View>

          {/* Description */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">About FavorApp</Text>
            <Text className="text-base text-gray-700 leading-6 mb-4">
              FavorApp is a community-driven platform that connects neighbors and community members to share favors and build lasting relationships. Our mission is to create stronger, more supportive communities where people can help each other with everyday tasks.
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              Whether you need help with groceries, pet sitting, or home repairs, or you want to offer your skills to help others, FavorApp makes it easy to connect with trusted community members in your area.
            </Text>
          </View>

          {/* Features */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Key Features</Text>
            <View className="space-y-3">
              <Text className="text-base text-gray-700">• Request or offer favors in your community</Text>
              <Text className="text-base text-gray-700">• Verified user profiles for trusted connections</Text>
              <Text className="text-base text-gray-700">• Track your community service hours</Text>
              <Text className="text-base text-gray-700">• Real-time messaging with community members</Text>
              <Text className="text-base text-gray-700">• Location-based favor matching</Text>
              <Text className="text-base text-gray-700">• Rating and review system</Text>
            </View>
          </View>

          {/* Company Info */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Company Information</Text>
            <View className="space-y-2">
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">Developer:</Text> FavorApp Inc.
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">Founded:</Text> 2023
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">Location:</Text> San Francisco, CA
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">Contact:</Text> hello@favorapp.com
              </Text>
            </View>
          </View>

          {/* Copyright */}
          <View className="items-center">
            <Text className="text-sm text-gray-500 text-center">
              © 2024 FavorApp Inc. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}