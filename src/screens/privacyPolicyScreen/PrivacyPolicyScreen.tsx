import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PrivacyPolicyScreenProps {
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

export function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
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
          <Text className="text-2xl font-bold text-gray-800">Privacy Policy</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-6">
          
          {/* Last Updated */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-6">
            <Text className="text-sm text-blue-700 text-center">
              Last updated: January 1, 2024
            </Text>
          </View>

          {/* Introduction */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Introduction</Text>
            <Text className="text-base text-gray-700 leading-6">
              FavorApp Inc. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </Text>
          </View>

          {/* Information We Collect */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Information We Collect</Text>
            
            <Text className="text-base font-semibold text-gray-800 mb-2">Personal Information</Text>
            <Text className="text-base text-gray-700 leading-6 mb-4">
              We collect information you provide directly, such as your name, email address, phone number, profile photo, and location when you create an account or use our services.
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">Usage Information</Text>
            <Text className="text-base text-gray-700 leading-6 mb-4">
              We collect information about how you use the app, including your interactions with other users, favors requested or offered, and app features used.
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">Location Information</Text>
            <Text className="text-base text-gray-700 leading-6">
              With your permission, we collect and process information about your location to help connect you with nearby community members and relevant favors.
            </Text>
          </View>

          {/* How We Use Your Information */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">How We Use Your Information</Text>
            <View className="space-y-2">
              <Text className="text-base text-gray-700">• Provide and maintain our services</Text>
              <Text className="text-base text-gray-700">• Connect you with community members for favors</Text>
              <Text className="text-base text-gray-700">• Send you notifications and updates</Text>
              <Text className="text-base text-gray-700">• Improve our app and user experience</Text>
              <Text className="text-base text-gray-700">• Ensure safety and prevent fraud</Text>
              <Text className="text-base text-gray-700">• Comply with legal obligations</Text>
            </View>
          </View>

          {/* Information Sharing */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Information Sharing</Text>
            <Text className="text-base text-gray-700 leading-6 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </Text>
            <View className="space-y-2">
              <Text className="text-base text-gray-700">• With other users as part of the favor-sharing functionality</Text>
              <Text className="text-base text-gray-700">• With service providers who assist in operating our app</Text>
              <Text className="text-base text-gray-700">• When required by law or to protect our rights</Text>
              <Text className="text-base text-gray-700">• In connection with a business transfer or merger</Text>
            </View>
          </View>

          {/* Data Security */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Data Security</Text>
            <Text className="text-base text-gray-700 leading-6">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </Text>
          </View>

          {/* Your Rights */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Your Rights</Text>
            <Text className="text-base text-gray-700 leading-6 mb-4">
              You have the right to:
            </Text>
            <View className="space-y-2">
              <Text className="text-base text-gray-700">• Access and update your personal information</Text>
              <Text className="text-base text-gray-700">• Delete your account and personal data</Text>
              <Text className="text-base text-gray-700">• Opt out of certain communications</Text>
              <Text className="text-base text-gray-700">• Request a copy of your data</Text>
            </View>
          </View>

          {/* Contact Information */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Contact Us</Text>
            <Text className="text-base text-gray-700 leading-6">
              If you have any questions about this Privacy Policy, please contact us at:
            </Text>
            <Text className="text-base text-gray-700 mt-2">
              Email: privacy@favorapp.com{'\n'}
              Address: 123 Privacy St, San Francisco, CA 94105
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}