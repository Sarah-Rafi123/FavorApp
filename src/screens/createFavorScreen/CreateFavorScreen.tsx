import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import CreateFavorSvg from '../../assets/icons/ProvideFavor';
import PersonwithHeartSvg from '../../assets/icons/PersonwithHeart';
import { TimerSvg } from '../../assets/icons/Timer';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';

interface CreateFavorScreenProps {
  navigation?: any;
}

export function CreateFavorScreen({ navigation }: CreateFavorScreenProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'History'>('All');

  // Mock data for different states
  const mockFavors = {
    All: [
      {
        id: '1',
        priority: 'Immediate',
        category: 'Maintenance',
        duration: '1 Hour',
        date: 'May 19,2025',
        location: 'Casper | Wyoming',
        description: 'Need Help With Small Household Maintenance Tasks',
        status: 'request',
        requestCount: 5,
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
        requests: [
          {
            id: '1',
            name: 'Janet',
            reviews: '0 | 0 Reviews',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
          },
          {
            id: '2',
            name: 'Michael',
            reviews: '5 | 12 Reviews',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
          },
          {
            id: '3',
            name: 'Sarah',
            reviews: '8 | 25 Reviews',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
          },
          {
            id: '4',
            name: 'David',
            reviews: '3 | 7 Reviews',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
          },
          {
            id: '5',
            name: 'Emma',
            reviews: '12 | 45 Reviews',
            image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face'
          }
        ]
      }
    ],
    Active: [
      {
        id: '1',
        priority: 'Immediate',
        category: 'Maintenance',
        duration: '1 Hour',
        date: 'May 19,2025',
        location: 'Casper | Wyoming',
        description: 'Need Help With Small Household Maintenance Tasks',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
      }
    ],
    History: [
      {
        id: '1',
        priority: 'Immediate',
        category: 'Maintenance',
        duration: '1 Hour',
        date: 'May 19,2025',
        location: 'Casper | Wyoming',
        description: 'Need Help With Small Household Maintenance Tasks',
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
      }
    ]
  };

  const currentFavors = mockFavors[activeTab];

  const handleAskFavor = () => {
    navigation?.navigate('AskFavorScreen');
  };

  const handleAcceptRequest = (favor: any) => {
    console.log('Accept request for:', favor.name);
  };



  const RequestCard = ({ favor }: { favor: any }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const renderRequestItem = ({ item, index }: { item: any; index: number }) => (
      <View className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-between mx-4" style={{ width: 300 }}>
        <View className="flex-row items-center flex-1">
          <View className="bg-green-100 w-2 h-2 rounded-full mr-2" />
          <Image
            source={{ uri: item.image }}
            className="w-12 h-12 rounded-full mr-3"
            style={{ backgroundColor: '#f3f4f6' }}
          />
          <View className="flex-1">
            <Text className="text-base font-semibold text-black">{item.name}</Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500">⭐</Text>
              <Text className="text-xs text-gray-600 ml-1">{item.reviews}</Text>
            </View>
            <Text className="text-xs text-[#44A27B] underline">View Profile</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="bg-[#44A27B] rounded-full px-6 py-2"
          onPress={() => handleAcceptRequest(item)}
        >
          <Text className="text-white font-semibold text-sm">Accept</Text>
        </TouchableOpacity>
      </View>
    );

    const onScroll = (event: any) => {
      const contentOffset = event.nativeEvent.contentOffset;
      const viewSize = event.nativeEvent.layoutMeasurement;
      const pageNum = Math.floor(contentOffset.x / viewSize.width);
      setCurrentIndex(pageNum);
    };


    return (
      <View className="bg-white rounded-2xl p-4 mb-4 mx-4 border-2 border-[#44A27B]">
        <View className="flex-row mb-4">
          <Image
            source={{ uri: favor.image }}
            className="w-16 h-16 rounded-xl mr-4"
            style={{ backgroundColor: '#f3f4f6' }}
          />
          <View className="flex-1">
            <Text className="text-[#D12E34] text-sm font-medium mb-1">{favor.priority}</Text>
            <Text className="text-sm text-gray-600 mb-1">
              {favor.category} | {favor.duration} | {favor.date}
            </Text>
            <Text className="text-sm text-gray-600">{favor.location}</Text>
            <Text className="text-gray-700 text-sm mt-2 leading-4">
              {favor.description}
            </Text>
          </View>
        </View>
        
        <Text className="text-lg font-bold text-black mb-3">
          Request ({favor.requestCount})
        </Text>

        {/* Horizontal Carousel of Request Cards */}
        <FlatList
          data={favor.requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={{ marginBottom: 12 }}
        />

        {/* Dots indicator */}
        <View className="flex-row justify-center">
          {favor.requests.map((_: any, index: number) => (
            <View 
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-[#44A27B]' : 'bg-gray-300'
              }`} 
            />
          ))}
        </View>
      </View>
    );
  };

  const ActiveCard = ({ favor }: { favor: any }) => (
    <TouchableOpacity 
      onPress={() => navigation?.navigate('FavorDetailsScreen', { favor })}
      activeOpacity={0.7}
    >
      <View className="bg-white rounded-2xl p-4 mb-4 mx-4 border-2 border-[#44A27B]">
        <View className="flex-row">
          <Image
            source={{ uri: favor.image }}
            className="w-16 h-16 rounded-xl mr-4"
            style={{ backgroundColor: '#f3f4f6' }}
          />
          <View className="flex-1">
            <Text className="text-[#D12E34] text-sm font-medium mb-1">{favor.priority}</Text>
            <Text className="text-sm text-gray-600 mb-1">
              {favor.category} | {favor.duration} | {favor.date}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">{favor.location}</Text>
            <Text className="text-gray-700 text-sm leading-4">
              {favor.description}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const HistoryCard = ({ favor }: { favor: any }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 mx-4 border-2 border-[#44A27B]">
      <View className="flex-row">
        <Image
          source={{ uri: favor.image }}
          className="w-16 h-16 rounded-xl mr-4"
          style={{ backgroundColor: '#f3f4f6' }}
        />
        <View className="flex-1">
          <Text className="text-[#D12E34] text-sm font-medium mb-1">{favor.priority}</Text>
          <Text className="text-sm text-gray-600 mb-1">
            {favor.category} | {favor.duration} | {favor.date}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">{favor.location}</Text>
          <Text className="text-gray-700 text-sm leading-4">
            {favor.description}
          </Text>
        </View>
      </View>
    </View>
  );

  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      className={`flex-1 py-3 rounded-full ${isActive ? 'bg-[#44A27B]' : ''}`}
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
          <Text className="text-2xl font-bold text-black">Create Favor</Text>
          <View className="flex-row gap-x-2">
            <TouchableOpacity className="items-center justify-center">
              <FilterSvg />
            </TouchableOpacity>
            <TouchableOpacity className="items-center justify-center">
              <BellSvg />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Bar */}
        <View className="flex-row bg-white rounded-full p-2 shadow-lg mb-4">
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

        {/* Ask Favor Button */}
        <View className="px-4">
          <CarouselButton
            title="Ask Favor"
            onPress={handleAskFavor}
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
          {currentFavors.map((favor) => {
            if (activeTab === 'All') {
              return <RequestCard key={favor.id} favor={favor} />;
            } else if (activeTab === 'Active') {
              return <ActiveCard key={favor.id} favor={favor} />;
            } else {
              return <HistoryCard key={favor.id} favor={favor} />;
            }
          })}
        </ScrollView>
      ) : (
        /* Empty State */
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center mb-8">
            {activeTab === 'All' && (
              <View style={{ transform: [{ scale: 2 }] }}>
                <CreateFavorSvg focused={true} />
              </View>
            )}
            {activeTab === 'Active' && <PersonwithHeartSvg />}
            {activeTab === 'History' && <TimerSvg />}
          </View>
          
          <Text className="text-2xl font-bold text-[#000000B8] mb-4 text-center">
            {activeTab === 'All' && 'No Favor Requests Yet'}
            {activeTab === 'Active' && 'No Active Favors'}
            {activeTab === 'History' && 'No History Yet'}
          </Text>
          
          <Text className="text-[#000000B] text-center mb-12 leading-6">
            {activeTab === 'All' && 'Start by posting your first favor request\nto get help from your community.'}
            {activeTab === 'Active' && "You don't have any ongoing favors right\nnow. Create a favor request to see\nthem here."}
            {activeTab === 'History' && 'Once you create and complete a favor,\nyour history will appear here.'}
          </Text>
          
          <View className="w-full max-w-sm">
            <CarouselButton
              title={activeTab === 'All' ? 'Ask Favor' : 'Create Favor'}
              onPress={handleAskFavor}
            />
          </View>
        </View>
      )}
    </ImageBackground>
  );
}