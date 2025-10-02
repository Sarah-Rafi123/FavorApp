import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ProfileModal } from '../../components/overlays';

interface HomeListScreenProps {
  onMapView: () => void;
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

export function HomeListScreen({ onMapView, onFilter, onNotifications }: HomeListScreenProps) {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const mockFavors = [
    {
      id: '1',
      name: 'Janet',
      priority: 'Immediate',
      category: 'Maintenance',
      duration: '1 Hour',
      location: 'Casper | Wyoming',
      description: 'Clean Dog Poop And Take Out Trash.',
      price: '$20',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b123?w=100&h=100&fit=crop&crop=face',
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
      name: 'Steven',
      priority: 'Immediate',
      category: 'Gardening',
      duration: '30 Min',
      location: 'Mills | Wyoming',
      description: "I'm Blind And Need Assistance Cutting My Lawn. Lot Number A3",
      price: '$0',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
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

  const handleProfileClick = (favor: any) => {
    setSelectedProfile(favor.profile);
    setShowProfileModal(true);
  };

  const FavorCard = ({ favor }: { favor: any }) => (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-4 mb-4 mx-6 shadow-sm border border-gray-100"
      onPress={() => handleProfileClick(favor)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start mb-4">
        <Image
          source={{ uri: favor.image }}
          className="w-16 h-16 rounded-full mr-4"
        />
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 bg-black rounded-full mr-2"></View>
            <Text className="text-lg font-semibold text-gray-800">{favor.name}</Text>
            <View className="ml-2 px-2 py-1 bg-red-100 rounded">
              <Text className="text-red-600 text-xs font-medium">{favor.priority}</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600 mb-1">
            {favor.category} | {favor.duration}
          </Text>
          <Text className="text-sm text-gray-600">{favor.location}</Text>
        </View>
      </View>
      
      <Text className="text-gray-700 text-sm mb-4 leading-5">
        {favor.description}
      </Text>
      
      <TouchableOpacity 
        className="bg-green-500 rounded-xl py-4"
        onPress={(e) => {
          e.stopPropagation();
          // Handle provide favor action separately
          console.log('Provide favor for:', favor.name);
        }}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {favor.price} | Provide a Favor
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-4 px-6 bg-white">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800">Home</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              onPress={onFilter}
            >
              <FilterIcon />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              onPress={onNotifications}
            >
              <BellIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map View / List View Toggle */}
        <View className="flex-row bg-gray-100 rounded-full p-1">
          <TouchableOpacity 
            className="flex-1 py-3"
            onPress={onMapView}
          >
            <Text className="text-gray-600 font-semibold text-center">Map View</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-3 bg-green-500 rounded-full">
            <Text className="text-white font-semibold text-center">List View</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Favor List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      >
        {mockFavors.map((favor) => (
          <FavorCard key={favor.id} favor={favor} />
        ))}
      </ScrollView>

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