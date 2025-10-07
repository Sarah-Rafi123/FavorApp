import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';

interface FavorDetailsScreenProps {
  navigation?: any;
  route?: any;
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

const VerifiedIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 0L9.9 2.6L13.1 2.9L12.4 6.1L15 8L12.4 9.9L13.1 13.1L9.9 12.4L8 15L6.1 12.4L2.9 13.1L3.6 9.9L1 8L3.6 6.1L2.9 2.9L6.1 3.6L8 0Z"
      fill="#44A27B"
    />
    <Path
      d="M5.5 8L7 9.5L10.5 6"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function FavorDetailsScreen({ navigation, route }: FavorDetailsScreenProps) {
  const handleGoBack = () => {
    navigation?.goBack();
  };

  const handleProvideFavor = () => {
    // Handle provide favor action
    console.log('Provide favor pressed');
  };

  const handleViewProfile = () => {
    // Handle view profile action
    console.log('View profile pressed');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-4 px-6 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center"
            onPress={handleGoBack}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800 ml-4">Favor Details</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Favor Details Card */}
        <View className="bg-white rounded-3xl p-6 mb-6 border-2 border-green-400">
          {/* Favor Image */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-gray-200 rounded-2xl overflow-hidden">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop&crop=face' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Favor Details */}
          <View className="space-y-4">
            <View className="flex-row">
              <Text className="text-gray-600 w-24">Priority</Text>
              <Text className="text-gray-600 mr-2">:</Text>
              <Text className="text-gray-800 font-medium flex-1">Immediate</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-600 w-24">Category</Text>
              <Text className="text-gray-600 mr-2">:</Text>
              <Text className="text-gray-800 font-medium flex-1">Maintenance</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-600 w-24">Duration</Text>
              <Text className="text-gray-600 mr-2">:</Text>
              <Text className="text-gray-800 font-medium flex-1">1 Hour</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-600 w-24">Location</Text>
              <Text className="text-gray-600 mr-2">:</Text>
              <Text className="text-gray-800 font-medium flex-1">Casper, Wyoming</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-600 w-24">Description</Text>
              <Text className="text-gray-600 mr-2">:</Text>
              <Text className="text-gray-800 font-medium flex-1">Clean dog poop and take out trash.</Text>
            </View>
          </View>

          {/* Provide Favor Button */}
          <View className="mt-8">
            <CarouselButton
              title="$0 | Provide a Favor"
              onPress={handleProvideFavor}
            />
          </View>
        </View>

        {/* You are helping section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">You are helping</Text>
          
          <View className="flex-row items-center">
            <View className="relative">
              <View className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="absolute -top-1 -right-1">
                <VerifiedIcon />
              </View>
            </View>
            
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-gray-800">Janet</Text>
              <View className="flex-row items-center">
                <Text className="text-yellow-500 text-sm">⭐ 0 | </Text>
                <Text className="text-gray-600 text-sm">0 Reviews</Text>
              </View>
              <TouchableOpacity onPress={handleViewProfile}>
                <Text className="text-green-600 text-sm font-medium">View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}