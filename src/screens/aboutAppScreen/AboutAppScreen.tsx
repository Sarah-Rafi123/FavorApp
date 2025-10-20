import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
  Image,
} from 'react-native';
// Removed unused SVG imports
import BackSvg from '../../assets/icons/Back';

interface AboutAppScreenProps {
  navigation?: any;
}


export function AboutAppScreen({ navigation }: AboutAppScreenProps) {
  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation?.goBack()}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">About App</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-6">
          {/* App Logo */}
          <View className="items-center mb-8">
            <Image 
              source={require('../../../assets/logo.png')} 
              className="w-40 h-20"
              resizeMode="contain"
            />
          </View>

          <View className="px-6">
            <Text className="text-base text-gray-700 leading-6 mb-6">
              Favor was created to bring a safe, open marketplace, to request and do favors needed throughout our communities.
            </Text>

            <Text className="text-base text-gray-700 leading-6 mb-6">
              We recognize that not every person needs a contractor to do a large job, but there are many smaller jobs that can be completed by our neighbors and people in the community.
            </Text>

            <Text className="text-lg font-bold text-gray-800 mb-3">Our Mission</Text>
            <Text className="text-base text-gray-700 leading-6 mb-6">
              Our goal is to strengthen our neighborhoods, improve societal restrictions, and help those that could benefit greatly from the smallest Favor.
            </Text>

            <Text className="text-base text-gray-700 leading-6 mb-6">
              We also hope to employ more free favors to those less fortunate and without the means to pay while offering community service hours for favors done. Not everything has a price, and sometimes a free favor is worth more to both parties than a paid experience.
            </Text>

            <Text className="text-lg font-bold text-gray-800 mb-3">Join Our Community</Text>
            <Text className="text-base text-gray-700 leading-6 mb-6">
              Lets all come together, help our communities, provide a helping hand and do a Favor for those in need!
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-500 text-center">
              © 2024 FavorApp Inc. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}