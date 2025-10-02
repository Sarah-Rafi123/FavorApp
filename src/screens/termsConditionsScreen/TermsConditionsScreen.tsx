import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TermsConditionsScreenProps {
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

export function TermsConditionsScreen({ navigation }: TermsConditionsScreenProps) {
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
          <Text className="text-2xl font-bold text-gray-800">Terms and Conditions</Text>
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
            <Text className="text-lg font-bold text-gray-800 mb-4">Agreement to Terms</Text>
            <Text className="text-base text-gray-700 leading-6">
              By accessing and using FavorApp, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </Text>
          </View>

          {/* Use License */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Use License</Text>
            <Text className="text-base text-gray-700 leading-6 mb-4">
              Permission is granted to temporarily download one copy of FavorApp for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </Text>
            <View className="space-y-2">
              <Text className="text-base text-gray-700">• Modify or copy the app materials</Text>
              <Text className="text-base text-gray-700">• Use the materials for commercial purposes</Text>
              <Text className="text-base text-gray-700">• Attempt to reverse engineer any software</Text>
              <Text className="text-base text-gray-700">• Remove any copyright or proprietary notations</Text>
            </View>
          </View>

          {/* User Responsibilities */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">User Responsibilities</Text>
            <Text className="text-base text-gray-700 leading-6 mb-4">
              As a user of FavorApp, you agree to:
            </Text>
            <View className="space-y-2">
              <Text className="text-base text-gray-700">• Provide accurate and truthful information</Text>
              <Text className="text-base text-gray-700">• Treat other community members with respect</Text>
              <Text className="text-base text-gray-700">• Use the app only for lawful purposes</Text>
              <Text className="text-base text-gray-700">• Not engage in fraudulent or harmful activities</Text>
              <Text className="text-base text-gray-700">• Maintain the confidentiality of your account</Text>
              <Text className="text-base text-gray-700">• Report any suspicious or inappropriate behavior</Text>
            </View>
          </View>

          {/* Prohibited Uses */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Prohibited Uses</Text>
            <Text className="text-base text-gray-700 leading-6 mb-4">
              You may not use FavorApp:
            </Text>
            <View className="space-y-2">
              <Text className="text-base text-gray-700">• For any unlawful purpose or to solicit unlawful acts</Text>
              <Text className="text-base text-gray-700">• To violate any international, federal, provincial, or state laws</Text>
              <Text className="text-base text-gray-700">• To transmit harmful or offensive content</Text>
              <Text className="text-base text-gray-700">• To harass, abuse, or harm other users</Text>
              <Text className="text-base text-gray-700">• To spam or send unsolicited messages</Text>
            </View>
          </View>

          {/* Limitation of Liability */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Limitation of Liability</Text>
            <Text className="text-base text-gray-700 leading-6">
              FavorApp Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </Text>
          </View>

          {/* Service Availability */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Service Availability</Text>
            <Text className="text-base text-gray-700 leading-6">
              We reserve the right to withdraw or amend our service, and any service or material we provide, in our sole discretion without notice. We will not be liable if for any reason all or any part of the service is unavailable at any time or for any period.
            </Text>
          </View>

          {/* Termination */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Termination</Text>
            <Text className="text-base text-gray-700 leading-6">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
            </Text>
          </View>

          {/* Changes to Terms */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Changes to Terms</Text>
            <Text className="text-base text-gray-700 leading-6">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </Text>
          </View>

          {/* Contact Information */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Contact Information</Text>
            <Text className="text-base text-gray-700 leading-6">
              If you have any questions about these Terms and Conditions, please contact us at:
            </Text>
            <Text className="text-base text-gray-700 mt-2">
              Email: legal@favorapp.com{'\n'}
              Address: 123 Legal St, San Francisco, CA 94105
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}