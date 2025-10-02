import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path, Circle } from 'react-native-svg';

interface LocationPermissionScreenProps {
  onLocationGranted: () => void;
  onSkip: () => void;
}

const LocationIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <Circle cx="40" cy="35" r="12" stroke="#44A27B" strokeWidth="3" fill="none" />
    <Circle cx="40" cy="35" r="4" fill="#44A27B" />
    <Path
      d="M40 50L30 65H50L40 50Z"
      stroke="#44A27B"
      strokeWidth="3"
      fill="#44A27B"
    />
    <Path
      d="M25 60L20 70H25H55H60L55 60"
      stroke="#44A27B"
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

export function LocationPermissionScreen({ onLocationGranted, onSkip }: LocationPermissionScreenProps) {
  const [showSystemModal, setShowSystemModal] = useState(false);

  const handleAllowLocation = async () => {
    try {
      // Request foreground permissions first
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        // Get current location to verify permissions work
        const location = await Location.getCurrentPositionAsync({});
        console.log('Location granted:', location);
        onLocationGranted();
      } else {
        // Show native system modal for permission
        setShowSystemModal(true);
      }
    } catch (error) {
      console.error('Error requesting location:', error);
      // Fallback to system modal
      setShowSystemModal(true);
    }
  };

  const handleSystemPermission = async (granted: boolean) => {
    setShowSystemModal(false);
    if (granted) {
      try {
        // Try to request permissions again
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          onLocationGranted();
        } else {
          onSkip();
        }
      } catch (error) {
        console.error('Error in system permission:', error);
        onSkip();
      }
    } else {
      // Handle permission denied
      Alert.alert(
        'Location Access Denied',
        'You can enable location access later in settings.',
        [{ text: 'OK', onPress: onSkip }]
      );
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1 px-6 pt-20">
        
        {/* Location Icon */}
        <View className="items-center mb-12 mt-20">
          <LocationIcon />
        </View>

        {/* Title and Description */}
        <View className="items-center mb-16">
          <Text className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Location
          </Text>
          <Text className="text-base text-gray-600 text-center px-4 leading-6">
            To connect you with nearby favors and helpers, we need access to your location.
          </Text>
        </View>

        {/* Buttons */}
        <View className="flex-1 justify-end mb-16">
          <View className="mb-4">
            <CarouselButton
              title="Allow Location Access"
              onPress={handleAllowLocation}
            />
          </View>

          <View className="items-center">
            <TouchableOpacity onPress={onSkip}>
              <Text className="text-gray-800 text-base font-medium">
                Not now
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* System Location Permission Modal */}
      <Modal
        visible={showSystemModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            
            {/* Title */}
            <Text className="text-xl font-semibold text-gray-800 text-center mb-2">
              Allow "App" To Use Your Location?
            </Text>

            {/* Description */}
            <Text className="text-sm text-gray-600 text-center mb-4 leading-5">
              Your precise location is used to show your position on the map, get directions, estimate travel times and improve search results
            </Text>

            {/* Map Preview */}
            <View className="bg-gray-100 rounded-lg h-32 mb-6 items-center justify-center">
              <Text className="text-gray-500">📍 Map Preview</Text>
            </View>

            {/* Precise Location Toggle */}
            <View className="flex-row items-center mb-6">
              <Text className="text-blue-500 text-sm">✓ Precise: On</Text>
            </View>

            {/* Permission Options */}
            <View className="space-y-3">
              <TouchableOpacity 
                className="py-3 border-t border-gray-200"
                onPress={() => handleSystemPermission(true)}
              >
                <Text className="text-blue-500 text-center font-medium">Allow Once</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="py-3 border-t border-gray-200"
                onPress={() => handleSystemPermission(true)}
              >
                <Text className="text-blue-500 text-center font-medium">Allow While Using The App</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="py-3 border-t border-gray-200"
                onPress={() => handleSystemPermission(false)}
              >
                <Text className="text-blue-500 text-center font-medium">Don't Allow</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}