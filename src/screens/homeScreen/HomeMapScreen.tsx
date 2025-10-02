import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, { Path } from 'react-native-svg';
import { ProfileModal } from '../../components/overlays';

interface HomeMapScreenProps {
  onListView: () => void;
  onFilter: () => void;
  onNotifications: () => void;
}

const FilterIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7H21L15 13V19L9 16V13L3 7Z"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BellIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21A2 2 0 0 1 10.27 21"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function HomeMapScreen({ onListView, onFilter, onNotifications }: HomeMapScreenProps) {
  const [location, setLocation] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 35.1983,
    longitude: -106.5348,
    latitudeDelta: 1.0,
    longitudeDelta: 1.0,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your position on the map.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      
      setLocation(currentLocation.coords);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your location. Please try again.');
    }
  };

  const mockFavors = [
    {
      id: '1',
      latitude: 35.2084,
      longitude: -106.5448,
      title: 'Dog Walking',
      price: '$20',
      profile: {
        id: '1',
        name: 'Janet Brooks',
        email: 'janet.brooks@email.com',
        age: 74,
        phone: '(629) 555-0129',
        textNumber: '(406) 555-0120',
        since: 'March 2023',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b123?w=200&h=200&fit=crop&crop=face',
        askedHours: '0/0:0 Hours',
        providedHours: '0/0:0 Hours',
      }
    },
    {
      id: '2',
      latitude: 35.1884,
      longitude: -106.5248,
      title: 'Lawn Mowing',
      price: '$0',
      profile: {
        id: '2',
        name: 'Steven Miller',
        email: 'steven.miller@email.com',
        age: 68,
        phone: '(307) 555-0156',
        textNumber: '(307) 555-0157',
        since: 'January 2024',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        askedHours: '2/1:5 Hours',
        providedHours: '0/0:0 Hours',
      }
    }
  ];

  const handleMarkerPress = (favor: any) => {
    setSelectedProfile(favor.profile);
    setShowProfileModal(true);
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="absolute top-16 left-6 right-6 z-10 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-800">Home</Text>
          <Text className="text-sm text-gray-600">Mesa Verde National Park</Text>
        </View>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
            onPress={onFilter}
          >
            <FilterIcon />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
            onPress={onNotifications}
          >
            <BellIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map View / List View Toggle */}
      <View className="absolute top-32 left-6 z-10 flex-row bg-white rounded-full shadow-sm">
        <TouchableOpacity className="px-6 py-3 bg-green-500 rounded-full">
          <Text className="text-white font-semibold">Map View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="px-6 py-3"
          onPress={onListView}
        >
          <Text className="text-gray-600 font-semibold">List View</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        style={{ flex: 1 }}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={setMapRegion}
      >
        {/* User Location Circle */}
        {location && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={5000} // 5km radius
            fillColor="rgba(68, 162, 123, 0.2)"
            strokeColor="rgba(68, 162, 123, 0.8)"
            strokeWidth={2}
          />
        )}

        {/* Mock Favor Markers */}
        {mockFavors.map((favor) => (
          <Marker
            key={favor.id}
            coordinate={{
              latitude: favor.latitude,
              longitude: favor.longitude,
            }}
            title={favor.title}
            description={favor.price}
            onPress={() => handleMarkerPress(favor)}
          />
        ))}
      </MapView>

      {/* Location Search Bar */}
      <View className="absolute top-48 left-6 right-6 z-10">
        <View className="bg-white rounded-xl px-4 py-3 shadow-sm flex-row items-center">
          <View className="w-2 h-2 bg-red-500 rounded-full mr-3"></View>
          <Text className="text-gray-600 flex-1">VM8P+MQ Casper, WY, USA</Text>
          <TouchableOpacity>
            <Text className="text-gray-400">✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dollar Sign Button */}
      <View className="absolute bottom-32 left-6 z-10">
        <TouchableOpacity className="w-12 h-12 bg-black rounded-full items-center justify-center">
          <Text className="text-white text-xl font-bold">$</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          visible={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedProfile(null);
          }}
          user={selectedProfile}
        />
      )}
    </View>
  );
}