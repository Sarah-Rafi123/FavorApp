import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { ProfileModal } from '../../components/overlays';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';

interface HomeListScreenProps {
  onMapView: () => void;
  onFilter: () => void;
  onNotifications: () => void;
}


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
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      profile: {
        id: '1',
        name: 'Janet Brooks',
        email: 'janet.brooks@email.com',
        age: 74,
        phone: '(629) 555-0129',
        textNumber: '(406) 555-0120',
        since: 'March 2023',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
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
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
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
    <View className="bg-white rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-green-500">
      <TouchableOpacity 
        onPress={() => handleProfileClick(favor)}
        activeOpacity={0.7}
      >
        <View className="flex-row mb-3">
          <Image
            source={{ uri: favor.image }}
            className="w-28 h-28 rounded-2xl mr-4"
            style={{ backgroundColor: '#f3f4f6' }}
          />
          <View className="flex-1 justify-start">
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
             <Text className="text-gray-700 text-sm mb-4 leading-5">
          {favor.description}
        </Text>
          </View>
        </View>
        
       
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-green-500 rounded-full py-3"
        onPress={() => {
          console.log('Provide favor for:', favor.name);
        }}
      >
        <Text className="text-white text-center font-semibold text-base">
          {favor.price} | Provide a Favor
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-4 px-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-black">Home</Text>
          <View className="flex-row gap-x-4">
            <TouchableOpacity
              className="items-center justify-center"
              onPress={onFilter}
            >
              <FilterSvg />
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center justify-center"
              onPress={onNotifications}
            >
              <BellSvg />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map View / List View Toggle */}
        <View className="flex-row bg-white rounded-full shadow-lg">
          <TouchableOpacity 
            className="flex-1 py-2.5 items-center"
            onPress={onMapView}
          >
            <Text className="text-gray-600 font-semibold text-sm">Map View</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-2.5 bg-green-500 rounded-full items-center">
            <Text className="text-white font-semibold text-sm">List View</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Favor List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
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
    </ImageBackground>
  );
}