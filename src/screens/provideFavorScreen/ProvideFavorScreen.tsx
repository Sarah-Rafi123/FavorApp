import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
  Image,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';
import ProvideFavorSvg from '../../assets/icons/ProvideFavor';
import PersonwithHeartSvg from '../../assets/icons/PersonwithHeart';
import { TimerSvg } from '../../assets/icons/Timer';
import DollarSvg from '../../assets/icons/Dollar';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';

interface ProvideFavorScreenProps {
  navigation?: any;
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

const LocationHeartIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <Path
      d="M40 70L25 55C15 45.7 10 38.3 10 30C10 21.7 16.7 15 25 15C29.3 15 33.3 17 36 20.2C38.7 17 42.7 15 47 15C55.3 15 62 21.7 62 30C62 38.3 57 45.7 47 55L40 70Z"
      stroke="#44A27B"
      strokeWidth="3"
      fill="none"
    />
    <Path
      d="M40 35C42.7614 35 45 32.7614 45 30C45 27.2386 42.7614 25 40 25C37.2386 25 35 27.2386 35 30C35 32.7614 37.2386 35 40 35Z"
      fill="#44A27B"
    />
    <Path
      d="M40 70L32 62"
      stroke="#44A27B"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
);

const HistoryClockIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <Path
      d="M40 70C56.5685 70 70 56.5685 70 40C70 23.4315 56.5685 10 40 10C23.4315 10 10 23.4315 10 40C10 56.5685 23.4315 70 40 70Z"
      stroke="#44A27B"
      strokeWidth="3"
      fill="none"
    />
    <Path
      d="M40 20V40L55 55"
      stroke="#44A27B"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PersonHeartIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <Path
      d="M40 20C45.5228 20 50 15.5228 50 10C50 4.47715 45.5228 0 40 0C34.4772 0 30 4.47715 30 10C30 15.5228 34.4772 20 40 20Z"
      stroke="#44A27B"
      strokeWidth="3"
      fill="none"
    />
    <Path
      d="M20 70V60C20 48.9543 28.9543 40 40 40C51.0457 40 60 48.9543 60 60V70"
      stroke="#44A27B"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M65 35L60 30C55 25 50 25 45 30C45 25 45 20 50 15C55 10 65 10 70 15C75 20 75 30 70 35L65 40L60 35"
      stroke="#44A27B"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function ProvideFavorScreen({ navigation }: ProvideFavorScreenProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'History'>('All');

  // Mock data for different states
  const mockFavors = {
    All: [
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
        status: 'new'
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
        status: 'new'
      },
      {
        id: '3',
        name: 'Steven',
        priority: 'Immediate',
        category: 'Gardening',
        duration: '30 Min',
        location: 'Mills | Wyoming',
        description: "I'm Blind And Need Assistance Cutting My Lawn. Lot Number A3",
        price: '$0',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        status: 'new'
      }
    ],
    Active: [
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
        status: 'active'
      }
    ],
    History: [
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
        status: 'completed'
      }
    ]
  };

  const currentFavors = mockFavors[activeTab];

  const handleAskFavor = () => {
    navigation?.navigate('AskFavorScreen');
  };

  const handleProvideFavor = (favor: any) => {
    console.log('Provide favor for:', favor.name);
  };

  const handleCancelFavor = (favor: any) => {
    console.log('Cancel favor for:', favor.name);
  };

  const handleFavorCardPress = (favor: any) => {
    navigation?.navigate('FavorDetailsScreen', { favor });
  };

  const FavorCard = ({ favor }: { favor: any }) => (
    <TouchableOpacity 
      onPress={() => handleFavorCardPress(favor)}
      activeOpacity={0.7}
    >
      <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66] ">
        <View className="flex-row mb-3">
          <Image
            source={{ uri: favor.image }}
            className="w-20 h-20 rounded-2xl mr-4"
            style={{ backgroundColor: '#f3f4f6' }}
          />
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View className="mr-2">
                <DollarSvg />
              </View>
              <Text className="text-lg font-semibold text-gray-800">{favor.name}</Text>
              <View className="ml-2 px-2 py-1 rounded">
                <Text className="text-[#D12E34] text-sm font-medium">{favor.priority}</Text>
              </View>
            </View>
            <Text className="text-sm text-gray-600 mb-1">
              {favor.category} | {favor.duration}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">{favor.location}</Text>
            <Text className="text-gray-700 text-sm leading-4">
              {favor.description}
            </Text>
          </View>
        </View>
      
      {favor.status !== 'completed' && (
        <TouchableOpacity 
          className="bg-green-500 rounded-full py-3"
          onPress={() => {
            if (favor.status === 'active') {
              handleCancelFavor(favor);
            } else {
              handleProvideFavor(favor);
            }
          }}
        >
          <Text className="text-white text-center font-semibold text-base">
            {favor.status === 'active' ? 'Cancel Favor' : `${favor.price} | Provide a Favor`}
          </Text>
        </TouchableOpacity>
      )}
      </View>
    </TouchableOpacity>
  );

  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      className={`flex-1 py-3 rounded-full ${isActive ? 'bg-green-500' : ''}`}
      onPress={onPress}
    >
      <Text className={`font-semibold text-center ${isActive ? 'text-white' : 'text-gray-600'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-black">Provide Favor</Text>
          <View className="flex-row gap-x-2">
            <TouchableOpacity className="w-10 h-10  rounded-full items-center justify-center">
              <FilterSvg />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
              <BellSvg />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Bar */}
        <View className="flex-row bg-gray-100 rounded-full p-1 mx-4">
          <TabButton
            title="All"
            isActive={activeTab === 'All'}
            onPress={() => setActiveTab('All')}
          />
          <TabButton
            title="Active"
            isActive={activeTab === 'Active'}
            onPress={() => setActiveTab('Active')}
          />
          <TabButton
            title="History"
            isActive={activeTab === 'History'}
            onPress={() => setActiveTab('History')}
          />
        </View>
      </View>

      {/* Content Area */}
      {currentFavors.length > 0 ? (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
        >
          {currentFavors.map((favor) => (
            <FavorCard key={favor.id} favor={favor} />
          ))}
        </ScrollView>
      ) : (
        /* Empty State */
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center mb-8">
            {activeTab === 'All' && (
              <View style={{ transform: [{ scale: 2 }] }}>
                <ProvideFavorSvg focused={true} />
              </View>
            )}
            {activeTab === 'Active' && <PersonwithHeartSvg />}
            {activeTab === 'History' && <TimerSvg />}
          </View>
          
          <Text className="text-2xl font-bold text-[#000000B8] mb-4 text-center">
            {activeTab === 'All' && 'No New Favors Yet'}
            {activeTab === 'Active' && 'No Active Favors'}
            {activeTab === 'History' && 'No History Yet'}
          </Text>
          
          <Text className="text-[#000000B] text-center mb-12 leading-6">
            {activeTab === 'All' && 'Check back soon or post a favor to get\nhelp from your community.'}
            {activeTab === 'Active' && "You don't have any ongoing favors right\nnow. Start helping or request a hand to see\nthem here."}
            {activeTab === 'History' && 'Once you help someone, your favor history\nwill appear here.'}
          </Text>
          
          <View className="w-full max-w-sm">
            <CarouselButton
              title={activeTab === 'All' ? 'Ask Favor' : 'Explore Favors'}
              onPress={handleAskFavor}
            />
          </View>
        </View>
      )}
    </ImageBackground>
  );
}