import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CarouselButton } from '../../components/buttons';
import { UpdateProfileModal } from '../../components/overlays/UpdateProfileModal';
import { useProfileQuery } from '../../services/queries/ProfileQueries';
import EditSvg from '../../assets/icons/Edit';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';

interface ProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phoneCall: string;
  phoneText: string;
}

export function ProfileScreen() {
  const navigation = useNavigation();
  const [activeReviewTab, setActiveReviewTab] = useState<'asked' | 'provided'>('asked');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { data: profileResponse, isLoading, error } = useProfileQuery();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'Kathryn',
    lastName: 'Murphy',
    dateOfBirth: '8/2/2001',
    address: '4140 Parker Rd, Allentown, New Mexico 31134',
    phoneCall: '(303) 555-0105',
    phoneText: '(209) 555-0104',
  });
  
  const profile = profileResponse?.data?.profile;

  const handleUpdateProfile = (newProfileData: ProfileData) => {
    setProfileData(newProfileData);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#44A27B" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-500 text-center mb-4">Failed to load profile</Text>
        <Text className="text-gray-600 text-center">Please check your connection and try again.</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-black">Profile</Text>
          <View className="flex-row gap-x-2">
            <TouchableOpacity 
              className="w-10 h-10  rounded-full items-center justify-center"
              onPress={() => navigation.navigate('FilterScreen' as never)}
            >
              <FilterSvg />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-10 h-10  rounded-full items-center justify-center"
              onPress={() => navigation.navigate('NotificationsScreen' as never)}
            >
              <BellSvg />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Main Profile Card */}
        <View className="mx-6 mb-6 bg-[#FBFFF0] rounded-3xl p-6 border-4 border-[#71DFB1]">
          <TouchableOpacity 
            onPress={() => setShowUpdateModal(true)}
            className="absolute top-6 right-6 w-8 h-8 items-center justify-center"
          >
            <EditSvg />
          </TouchableOpacity>

          {/* Profile Image and Name */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
              {profile?.image_url ? (
                <Image 
                  source={{ uri: profile.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-[#44A27B] items-center justify-center">
                  <Text className="text-white text-2xl font-bold">
                    {profile?.first_name?.[0]?.toUpperCase() || profileData.firstName[0]?.toUpperCase()}
                    {profile?.last_name?.[0]?.toUpperCase() || profileData.lastName[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-xl font-bold text-black mb-1">{profile?.full_name || `${profileData.firstName} ${profileData.lastName}`}</Text>
          </View>

          {/* Personal Details */}
          <View className="mb-6">
            <View className="space-y-2">
              <Text className="text-gray-600 text-sm">Email: <Text className="text-black font-medium">{profile?.email || 'kathrynmurphy@gmail.com'}</Text></Text>
              <Text className="text-gray-600 text-sm">Age: <Text className="text-black font-medium">{profile?.age || '26'}</Text></Text>
              <Text className="text-gray-600 text-sm">Call: <Text className="text-black font-medium">{profile?.phone_no_call || profileData.phoneCall}</Text></Text>
              <Text className="text-gray-600 text-sm">Text: <Text className="text-black font-medium">{profile?.phone_no_text || profileData.phoneText}</Text></Text>
              <Text className="text-gray-600 text-sm">Experience: <Text className="text-black font-medium">{profile?.years_of_experience ? `${profile.years_of_experience} year${profile.years_of_experience !== 1 ? 's' : ''}` : 'Not specified'}</Text></Text>
              <Text className="text-gray-600 text-sm">Since: <Text className="text-black font-medium">{profile?.member_since || 'March 2025'}</Text></Text>
              {profile?.address && (
                <Text className="text-gray-600 text-sm">Location: <Text className="text-black font-medium">{profile.address.city}, {profile.address.state}</Text></Text>
              )}
              {profile?.is_certified !== null && (
                <Text className="text-gray-600 text-sm">Certified: <Text className={`font-medium ${profile?.is_certified ? 'text-green-600' : 'text-gray-500'}`}>{profile?.is_certified ? 'Yes' : 'No'}</Text></Text>
              )}
            </View>
          </View>

          {/* About Me Section */}
          {profile?.about_me && (
            <View className="mb-6">
              <Text className="text-base font-bold text-black mb-3">About Me</Text>
              <Text className="text-gray-700 text-sm leading-5">{profile.about_me}</Text>
            </View>
          )}

          {/* Skills Section */}
          {profile?.skills && profile.skills.length > 0 && (
            <View className="mb-6">
              <Text className="text-base font-bold text-black mb-3">Skills</Text>
              <View className="flex-row flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <View key={index} className="bg-[#E8F5E8] px-3 py-1.5 rounded-full">
                    <Text className="text-[#44A27B] text-xs font-medium">{skill}</Text>
                  </View>
                ))}
              </View>
              {profile.other_skills && (
                <View className="mt-2">
                  <Text className="text-gray-600 text-sm">Other: <Text className="text-black font-medium">{profile.other_skills}</Text></Text>
                </View>
              )}
            </View>
          )}

          {/* Favor Details */}
          <View className="mb-6">
            <Text className="text-base font-bold text-black mb-3">Favor Details</Text>
            <View className="space-y-2">
              <Text className="text-gray-600 text-sm">Asked: <Text className="text-black font-bold">0/0:0 Hours</Text></Text>
              <Text className="text-gray-600 text-sm">Provided: <Text className="text-black font-bold">0/0:0 Hours</Text></Text>
            </View>
          </View>

          {/* Fund Details */}
          <View className="mb-6">
            <Text className="text-base font-bold text-black mb-3">Fund Details</Text>
            <View className="space-y-2">
              <Text className="text-gray-600 text-sm">Available: <Text className="text-black font-bold">$0.00</Text></Text>
              <Text className="text-gray-600 text-sm">Pending: <Text className="text-black font-bold">$0.00</Text></Text>
            </View>
          </View>

          {/* Add Payment Method Button */}
          {!profile?.has_payment_method && (
            <View className="mb-4">
              <CarouselButton
                title="Add Payment Method"
                onPress={() => {}}
              />
            </View>
          )}

          {/* Export PDF Section */}
          <View className="bg-[#DCFBCC] rounded-2xl p-4">
            <Text className="text-center text-gray-700 text-sm mb-3">
              Export your free community service hours as a PDF
            </Text>
            <TouchableOpacity className="bg-transparent border-2 border-[#44A27B] rounded-full py-3">
              <Text className="text-center text-[#44A27B] font-semibold">Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Review Section */}
        <View className="mx-4">
          <Text className="text-xl font-bold text-black mb-4">Review</Text>
          
          <View className="flex-row p-2 bg-white rounded-full shadow-lg mb-4">
            <TouchableOpacity 
              className={`flex-1 py-2.5 items-center ${
                activeReviewTab === 'asked' ? 'bg-[#44A27B] rounded-full' : ''
              }`}
              onPress={() => setActiveReviewTab('asked')}
            >
              <Text className={`font-semibold text-sm ${
                activeReviewTab === 'asked' ? 'text-white' : 'text-gray-600'
              }`}>
                Favor Asked
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-2.5 items-center ${
                activeReviewTab === 'provided' ? 'bg-[#44A27B] rounded-full' : ''
              }`}
              onPress={() => setActiveReviewTab('provided')}
            >
              <Text className={`font-semibold text-sm ${
                activeReviewTab === 'provided' ? 'text-white' : 'text-gray-600'
              }`}>
                Favor Provided
              </Text>
            </TouchableOpacity>
          </View>

          <View className="items-center py-8">
            <Text className="text-gray-500 text-sm">No reviews Found</Text>
          </View>
        </View>
      </ScrollView>

      <UpdateProfileModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdateProfile}
        initialData={profileData}
      />
    </ImageBackground>
  );
}