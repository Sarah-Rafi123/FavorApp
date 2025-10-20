import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';
import ProvideFavorSvg from '../../assets/icons/ProvideFavor';
import PersonwithHeartSvg from '../../assets/icons/PersonwithHeart';
import { TimerSvg } from '../../assets/icons/Timer';
import DollarSvg from '../../assets/icons/Dollar';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';
import { useMyFavors } from '../../services/queries/FavorQueries';
import { Favor } from '../../services/apis/FavorApis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../store/useAuthStore';

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
  const [refreshing, setRefreshing] = useState(false);
  
  // Get auth store state for debugging
  const { user, accessToken, setTokens } = useAuthStore();

  // Fetch data using my_favors API: /api/v1/favors/my_favors?type=providing&tab=active&page=1&per_page=10
  const {
    data: allMyFavorsResponse,
    isLoading: allMyFavorsLoading,
    error: allMyFavorsError,
    refetch: refetchAllMyFavors,
  } = useMyFavors(
    { type: 'providing', page: 1, per_page: 10 },
    { enabled: activeTab === 'All' }
  );

  const {
    data: activeMyFavorsResponse,
    isLoading: activeMyFavorsLoading,
    error: activeMyFavorsError,
    refetch: refetchActiveMyFavors,
  } = useMyFavors(
    { type: 'providing', tab: 'active', page: 1, per_page: 10 },
    { enabled: activeTab === 'Active' }
  );

  const {
    data: inProgressMyFavorsResponse,
    isLoading: inProgressMyFavorsLoading,
    error: inProgressMyFavorsError,
    refetch: refetchInProgressMyFavors,
  } = useMyFavors(
    { type: 'providing', tab: 'in-progress', page: 1, per_page: 10 },
    { enabled: activeTab === 'Active' }
  );

  const {
    data: completedMyFavorsResponse,
    isLoading: completedMyFavorsLoading,
    error: completedMyFavorsError,
    refetch: refetchCompletedMyFavors,
  } = useMyFavors(
    { type: 'providing', tab: 'completed', page: 1, per_page: 10 },
    { enabled: activeTab === 'History' }
  );

  const {
    data: cancelledMyFavorsResponse,
    isLoading: cancelledMyFavorsLoading,
    error: cancelledMyFavorsError,
    refetch: refetchCancelledMyFavors,
  } = useMyFavors(
    { type: 'providing', tab: 'cancelled', page: 1, per_page: 10 },
    { enabled: activeTab === 'History' }
  );

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'All':
        // Show all categories (no tab filter)
        return allMyFavorsResponse?.data.favors || [];
      case 'Active':
        // Combine active and in-progress favors
        const activeFavors = activeMyFavorsResponse?.data.favors || [];
        const inProgressFavors = inProgressMyFavorsResponse?.data.favors || [];
        return [...activeFavors, ...inProgressFavors];
      case 'History':
        // Combine completed and cancelled favors
        const completedFavors = completedMyFavorsResponse?.data.favors || [];
        const cancelledFavors = cancelledMyFavorsResponse?.data.favors || [];
        return [...completedFavors, ...cancelledFavors];
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'All':
        return allMyFavorsLoading;
      case 'Active':
        return activeMyFavorsLoading || inProgressMyFavorsLoading;
      case 'History':
        return completedMyFavorsLoading || cancelledMyFavorsLoading;
      default:
        return false;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case 'All':
        return allMyFavorsError;
      case 'Active':
        return activeMyFavorsError || inProgressMyFavorsError;
      case 'History':
        return completedMyFavorsError || cancelledMyFavorsError;
      default:
        return null;
    }
  };

  const currentFavors = getCurrentData();
  const isLoading = getCurrentLoading();
  const error = getCurrentError();

  // Debug logging
  React.useEffect(() => {
    const debugAuth = async () => {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔍 ProvideFavorScreen Debug:');
      console.log('Active Tab:', activeTab);
      console.log('Current Favors Count:', currentFavors.length);
      console.log('Is Loading:', isLoading);
      console.log('Error:', error?.message || 'No error');
      console.log('AsyncStorage Token:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('Auth Store User:', !!user, user?.firstName);
      console.log('Auth Store Token:', !!accessToken, accessToken ? `${accessToken.substring(0, 20)}...` : 'null');
      
      if (activeTab === 'All') {
        console.log('All Favors Response:', allMyFavorsResponse);
        console.log('All Favors Error:', allMyFavorsError);
      }
    };
    
    debugAuth();
  }, [activeTab, currentFavors, isLoading, error, allMyFavorsResponse, allMyFavorsError, user, accessToken]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      switch (activeTab) {
        case 'All':
          await refetchAllMyFavors();
          break;
        case 'Active':
          await Promise.all([refetchActiveMyFavors(), refetchInProgressMyFavors()]);
          break;
        case 'History':
          await Promise.all([refetchCompletedMyFavors(), refetchCancelledMyFavors()]);
          break;
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAskFavor = () => {
    navigation?.navigate('AskFavorScreen');
  };

  // Temporary debug function to test token storage
  const handleDebugToken = async () => {

 
    
    // Verify it was stored
    
    // Trigger a refetch
    await refetchAllMyFavors();
  };

  // Check if user needs to re-authenticate
  React.useEffect(() => {
    if (user && !accessToken) {
      console.log('⚠️ User exists but no access token - authentication issue detected');
      // The user somehow got past the login screen without proper token storage
    }
  }, [user, accessToken]);

  const handleProvideFavor = (favor: Favor) => {
    console.log('Provide favor for:', favor.user.full_name);
    // TODO: Implement apply for favor API call
  };

  const handleCancelFavor = (favor: Favor) => {
    console.log('Cancel favor for:', favor.user.full_name);
    // TODO: Implement cancel favor API call
  };

  const handleFavorCardPress = (favor: Favor) => {
    navigation?.navigate('FavorDetailsScreen', { favorId: favor.id });
  };

  const FavorCard = ({ favor }: { favor: Favor }) => {
    const isActiveFavor = favor.status === 'in_progress' || favor.status === 'active';
    
    return (
      <TouchableOpacity 
        onPress={() => handleFavorCardPress(favor)}
        activeOpacity={0.7}
      >
        <View className="bg-white rounded-2xl p-4 mb-4 mx-4 shadow-sm border border-gray-100">
          {/* Header with user name and priority */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-2">
                <Text className="text-white text-sm font-bold">
                  {favor.user.full_name.charAt(0)}
                </Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">{favor.user.full_name}</Text>
            </View>
            <Text className="text-red-500 text-sm font-medium capitalize">{favor.priority}</Text>
          </View>

          <View className="flex-row mb-4">
            <Image
              source={{ 
                uri: favor.image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop'
              }}
              className="w-16 h-16 rounded-xl mr-3"
              style={{ backgroundColor: '#f3f4f6' }}
            />
            <View className="flex-1">
              {/* Category and Time */}
              <Text className="text-base font-medium text-gray-900 mb-1">
                {favor.favor_subject.name} | {favor.time_to_complete || '1 Hour'}
              </Text>
              
              {/* Location */}
              <Text className="text-sm text-gray-600 mb-2">
                {favor.city}, {favor.state}
              </Text>
              
              {/* Description */}
              <Text className="text-sm text-gray-700 leading-4">
                {favor.description}
              </Text>
            </View>
          </View>

          {/* Show Cancel Favor button for active favors, Provide Favor button for others */}
          {favor.status !== 'completed' && favor.status !== 'cancelled' && (
            <TouchableOpacity 
              className="bg-green-500 rounded-full py-3"
              onPress={() => {
                if (isActiveFavor) {
                  handleCancelFavor(favor);
                } else {
                  handleProvideFavor(favor);
                }
              }}
            >
              <Text className="text-white text-center font-semibold text-base">
                {isActiveFavor ? 'Cancel Favor' : 
                 `$${favor.tip} | Provide a Favor`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
            <TouchableOpacity 
              className="w-10 h-10 rounded-full items-center justify-center"
              onPress={() => navigation?.navigate('NotificationsScreen')}
            >
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
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#44A27B" />
          <Text className="text-gray-600 mt-4">Loading favors...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
            Error Loading Favors
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            {error.message || 'Please check your connection and try again.'}
          </Text>
          <Text className="text-gray-500 text-center mb-8 text-sm">
            Tap the button below to retry or check the console for more details.
          </Text>
          <TouchableOpacity 
            className="bg-green-500 rounded-full py-3 px-8"
            onPress={handleRefresh}
          >
            <Text className="text-white font-semibold text-lg">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : currentFavors.length > 0 ? (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#44A27B']}
              tintColor="#44A27B"
            />
          }
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
