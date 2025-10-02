import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';

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

export function ProvideFavorScreen({ navigation }: ProvideFavorScreenProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'History'>('All');

  const handleAskFavor = () => {
    navigation?.navigate('AskFavorScreen');
  };

  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      className={`px-6 py-3 rounded-full ${isActive ? 'bg-green-500' : ''}`}
      onPress={onPress}
    >
      <Text className={`font-semibold ${isActive ? 'text-white' : 'text-gray-600'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-4 px-6 bg-white">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-800">Provide Favor</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <FilterIcon />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <BellIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Bar */}
        <View className="flex-row bg-gray-100 rounded-full p-1">
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

      {/* Empty State */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center mb-8">
          <LocationHeartIcon />
        </View>
        
        <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
          No New Favors Yet
        </Text>
        
        <Text className="text-gray-600 text-center mb-12 leading-6">
          Check back soon or post a favor to get{'\n'}help from your community.
        </Text>
        
        <View className="w-full max-w-sm">
          <CarouselButton
            title="Ask Favor"
            onPress={handleAskFavor}
          />
        </View>
      </View>
    </View>
  );
}