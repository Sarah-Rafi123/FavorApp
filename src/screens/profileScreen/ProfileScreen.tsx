import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { CustomButton } from '../../components/buttons/CustomButton';
import { UpdateProfileModal } from '../../components/overlays/UpdateProfileModal';

interface ProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phoneCall: string;
  phoneText: string;
}

export function ProfileScreen() {
  const [activeReviewTab, setActiveReviewTab] = useState<'asked' | 'provided'>('asked');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'Kathryn',
    lastName: 'Murphy',
    dateOfBirth: '8/2/2001',
    address: '4140 Parker Rd, Allentown, New Mexico 31134',
    phoneCall: '(303) 555-0105',
    phoneText: '(209) 555-0104',
  });

  const handleUpdateProfile = (newProfileData: ProfileData) => {
    setProfileData(newProfileData);
  };

  return (
    <SafeAreaView className="flex-1 bg-green-100">
      <ScrollView className="flex-1 px-4">
        <View className="pt-12 pb-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-black">Profile</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Text className="text-gray-600">⚡</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 bg-green-500 rounded-full items-center justify-center">
                <Text className="text-white">🔔</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-white rounded-3xl p-6 mx-2 mb-6 shadow-sm border border-green-300">
            <TouchableOpacity 
              onPress={() => setShowUpdateModal(true)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <Text className="text-gray-600">✏️</Text>
            </TouchableOpacity>

            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <Text className="text-xl font-bold text-black">{profileData.firstName} {profileData.lastName}</Text>
            </View>

            <View className="space-y-3 mb-6">
              <View className="flex-row">
                <Text className="text-gray-600 w-16">Email :</Text>
                <Text className="text-black ml-2">kathrynmurphy@gmail.com</Text>
              </View>
              <View className="flex-row">
                <Text className="text-gray-600 w-16">Age :</Text>
                <Text className="text-black ml-2 font-semibold">26</Text>
              </View>
              <View className="flex-row">
                <Text className="text-gray-600 w-16">Call :</Text>
                <Text className="text-black ml-2">{profileData.phoneCall}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-gray-600 w-16">Text :</Text>
                <Text className="text-black ml-2">{profileData.phoneText}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-gray-600 w-16">Since :</Text>
                <Text className="text-black ml-2">March 2025</Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-black mb-3">Favor Details</Text>
              <View className="space-y-2">
                <View className="flex-row">
                  <Text className="text-gray-600 w-20">Asked :</Text>
                  <Text className="text-black ml-2 font-semibold">0/0:0 Hours</Text>
                </View>
                <View className="flex-row">
                  <Text className="text-gray-600 w-20">Provided :</Text>
                  <Text className="text-black ml-2 font-semibold">0/0:0 Hours</Text>
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-black mb-3">Fund Details</Text>
              <View className="space-y-2">
                <View className="flex-row">
                  <Text className="text-gray-600 w-20">Available :</Text>
                  <Text className="text-black ml-2 font-semibold">$0.00</Text>
                </View>
                <View className="flex-row">
                  <Text className="text-gray-600 w-20">Pending :</Text>
                  <Text className="text-black ml-2 font-semibold">$0.00</Text>
                </View>
              </View>
            </View>

            <CustomButton
              title="Add Payment Method"
              className="mb-4"
              onPress={() => {}}
            />

            <View className="bg-green-100 rounded-2xl p-4 mb-4">
              <Text className="text-center text-green-700 text-sm mb-3">
                Export your free community service hours as a PDF
              </Text>
              <TouchableOpacity className="bg-white border border-green-500 rounded-2xl py-3">
                <Text className="text-center text-green-600 font-medium">Export PDF</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-white rounded-t-3xl p-6 mx-2">
            <Text className="text-xl font-bold text-black mb-4">Review</Text>
            
            <View className="flex-row mb-4">
              <TouchableOpacity
                onPress={() => setActiveReviewTab('asked')}
                className={`flex-1 py-3 rounded-full mr-2 ${
                  activeReviewTab === 'asked' ? 'bg-green-500' : 'bg-gray-100'
                }`}
              >
                <Text className={`text-center font-medium ${
                  activeReviewTab === 'asked' ? 'text-white' : 'text-gray-600'
                }`}>
                  Favor Asked
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveReviewTab('provided')}
                className={`flex-1 py-3 rounded-full ml-2 ${
                  activeReviewTab === 'provided' ? 'bg-green-500' : 'bg-gray-100'
                }`}
              >
                <Text className={`text-center font-medium ${
                  activeReviewTab === 'provided' ? 'text-white' : 'text-gray-600'
                }`}>
                  Favor Provided
                </Text>
              </TouchableOpacity>
            </View>

            <View className="items-center py-8">
              <Text className="text-gray-500">No reviews Found</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <UpdateProfileModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdateProfile}
        initialData={profileData}
      />
    </SafeAreaView>
  );
}