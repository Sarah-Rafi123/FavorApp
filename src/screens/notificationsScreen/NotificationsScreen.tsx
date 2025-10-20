import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BigBellSvg from '../../assets/icons/BigBell';
import BackSvg from '../../assets/icons/Back';

export function NotificationsScreen() {
  const navigation = useNavigation();

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
            onPress={() => navigation.goBack()}
            className="mr-4 w-8 h-8 items-center justify-center"
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Notifications</Text>
        </View>
      </View>

      {/* Empty State */}
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center">
          {/* Bell Icon */}
          <View className="w-24 h-24 items-center justify-center mb-8">
              <BigBellSvg  />
          
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-black mb-4">No Notifications Yet</Text>
          
          {/* Description */}
          <Text className="text-gray-600 text-center leading-6 px-4">
            Your notification will appear here once{'\n'}you've received them.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}