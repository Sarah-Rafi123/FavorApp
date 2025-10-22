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
  Alert,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';
import ProvideFavorSvg from '../../assets/icons/ProvideFavor';
import PersonwithHeartSvg from '../../assets/icons/PersonwithHeart';
import { TimerSvg } from '../../assets/icons/Timer';
import DollarSvg from '../../assets/icons/Dollar';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';
import { useMyFavors, useFavorSubjects, useBrowseFavors, useFavors } from '../../services/queries/FavorQueries';
import { useApplyToFavor, useCancelRequest } from '../../services/mutations/FavorMutations';
import { StripeConnectManager } from '../../services/StripeConnectManager';
import { Favor } from '../../services/apis/FavorApis';
import { FavorSubject } from '../../services/apis/FavorSubjectApis';
import { FavorDetailsModal } from '../../components/overlays';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../store/useAuthStore';
import useFilterStore from '../../store/useFilterStore';

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedFavorId, setSelectedFavorId] = useState<number | null>(null);
  const [showFavorDetailsModal, setShowFavorDetailsModal] = useState(false);
  
  // Get auth store state for debugging
  const { user, accessToken } = useAuthStore();

  // Get filter store state
  const { hasActiveFilters, toBrowseParams, getFilterCount } = useFilterStore();

  // Apply to Favor mutation, Cancel Request mutation, and Stripe Connect Manager
  const applyToFavorMutation = useApplyToFavor();
  const cancelRequestMutation = useCancelRequest();
  const stripeConnectManager = StripeConnectManager.getInstance();

  // Fetch favor subjects/categories
  const { data: favorSubjectsResponse, isLoading: categoriesLoading } = useFavorSubjects();

  // Use browseFavors when filters are active, useFavors when not (for All tab only)
  const useFilteredData = activeTab === 'All' && hasActiveFilters();
  
  // Browse favors with filters when filters are active
  const {
    data: browseFavorsResponse,
    isLoading: browseFavorsLoading,
    error: browseFavorsError,
    refetch: refetchBrowseFavors,
  } = useBrowseFavors(
    toBrowseParams(1, 12),
    { enabled: useFilteredData }
  );

  // Fetch data using regular favors API: /api/v1/favors?page=1&per_page=12
  const {
    data: allFavorsResponse,
    isLoading: allFavorsLoading,
    error: allFavorsError,
    refetch: refetchAllFavors,
  } = useFavors(
    1, // page
    12, // per_page 
    { enabled: activeTab === 'All' && !useFilteredData }
  );

  const {
    data: activeMyFavorsResponse,
    isLoading: activeMyFavorsLoading,
    error: activeMyFavorsError,
    refetch: refetchActiveMyFavors,
  } = useMyFavors(
    { 
      type: 'providing', 
      tab: 'active', 
      page: 1, 
      per_page: 10,
      category: selectedCategories.length > 0 ? selectedCategories : undefined
    },
    { enabled: activeTab === 'Active' }
  );

  const {
    data: inProgressMyFavorsResponse,
    isLoading: inProgressMyFavorsLoading,
    error: inProgressMyFavorsError,
    refetch: refetchInProgressMyFavors,
  } = useMyFavors(
    { 
      type: 'providing', 
      tab: 'in-progress', 
      page: 1, 
      per_page: 10,
      category: selectedCategories.length > 0 ? selectedCategories : undefined
    },
    { enabled: activeTab === 'Active' }
  );

  const {
    data: completedMyFavorsResponse,
    isLoading: completedMyFavorsLoading,
    error: completedMyFavorsError,
    refetch: refetchCompletedMyFavors,
  } = useMyFavors(
    { 
      type: 'providing', 
      tab: 'completed', 
      page: 1, 
      per_page: 10,
      category: selectedCategories.length > 0 ? selectedCategories : undefined
    },
    { enabled: activeTab === 'History' }
  );

  const {
    data: cancelledMyFavorsResponse,
    isLoading: cancelledMyFavorsLoading,
    error: cancelledMyFavorsError,
    refetch: refetchCancelledMyFavors,
  } = useMyFavors(
    { 
      type: 'providing', 
      tab: 'cancelled', 
      page: 1, 
      per_page: 10,
      category: selectedCategories.length > 0 ? selectedCategories : undefined
    },
    { enabled: activeTab === 'History' }
  );

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'All':
        // Use filtered data when filters are active, otherwise use regular favors
        if (useFilteredData) {
          return browseFavorsResponse?.data.favors || [];
        }
        return allFavorsResponse?.data.favors || [];
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
        if (useFilteredData) {
          return browseFavorsLoading;
        }
        return allFavorsLoading;
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
        if (useFilteredData) {
          return browseFavorsError;
        }
        return allFavorsError;
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
        console.log('All Favors Response:', allFavorsResponse);
        console.log('All Favors Error:', allFavorsError);
      }
    };
    
    debugAuth();
  }, [activeTab, currentFavors, isLoading, error, allFavorsResponse, allFavorsError, user, accessToken]);

  // Reset and refetch data when switching between filtered and unfiltered
  React.useEffect(() => {
    if (activeTab === 'All') {
      // Trigger refetch when filter state changes
      if (useFilteredData) {
        refetchBrowseFavors();
      } else {
        refetchAllFavors();
      }
    }
  }, [useFilteredData, activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      switch (activeTab) {
        case 'All':
          if (useFilteredData) {
            await refetchBrowseFavors();
          } else {
            await refetchAllFavors();
          }
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

  const handleExploreFavors = () => {
    // Navigate to the Home tab
    navigation?.navigate('Home');
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(c => c !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  const categories = favorSubjectsResponse?.data.favor_subjects || [];

  // Temporary debug function to test token storage
  const handleDebugToken = async () => {

 
    
    // Verify it was stored
    
    // Trigger a refetch
    await refetchAllFavors();
  };

  // Check if user needs to re-authenticate
  React.useEffect(() => {
    if (user && !accessToken) {
      console.log('⚠️ User exists but no access token - authentication issue detected');
      // The user somehow got past the login screen without proper token storage
    }
  }, [user, accessToken]);

  // Refetch data when categories change
  React.useEffect(() => {
    const refetchData = async () => {
      try {
        switch (activeTab) {
          case 'All':
            await refetchAllFavors();
            break;
          case 'Active':
            await Promise.all([refetchActiveMyFavors(), refetchInProgressMyFavors()]);
            break;
          case 'History':
            await Promise.all([refetchCompletedMyFavors(), refetchCancelledMyFavors()]);
            break;
        }
      } catch (error) {
        console.error('Error refetching after category change:', error);
      }
    };

    if (selectedCategories.length >= 0) { // Refetch even when clearing filters
      refetchData();
    }
  }, [selectedCategories, activeTab]); // Dependencies

  // Helper function to format priority text
  const formatPriority = (priority: string) => {
    switch (priority) {
      case 'no_rush':
        return 'No Rush';
      case 'immediate':
        return 'Immediate';
      case 'delayed':
        return 'Delayed';
      default:
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
  };

  const handleProvideFavor = async (favor: Favor) => {
    console.log('🎯 Provide favor clicked for:', favor.user.full_name);
    console.log('💰 Favor tip amount:', favor.tip);
    
    try {
      // Check if this is a paid favor and validate Stripe Connect status
      const tipAmount = typeof favor.tip === 'string' ? parseFloat(favor.tip) : (favor.tip || 0);
      
      // Create callback that will apply to favor after payment setup is complete
      const onSetupComplete = async () => {
        console.log('🎉 Payment setup complete, now applying to favor automatically');
        try {
          await applyToFavorMutation.mutateAsync(favor.id);
          console.log('✅ Auto-application after payment setup successful');
        } catch (error: any) {
          console.error('❌ Auto-application after payment setup failed:', error.message);
          // The mutation's onError callback will handle the toast
        }
      };
      
      const canProceed = await stripeConnectManager.validateBeforeApplying(tipAmount, onSetupComplete);
      
      if (canProceed) {
        console.log('✅ User can apply to this favor');
        
        // Show confirmation dialog and apply to favor
        Alert.alert(
          'Apply to Favor',
          `Apply to provide favor for ${favor.user.full_name}?${tipAmount > 0 ? ` You'll receive $${tipAmount.toFixed(2)}.` : ' This is a volunteer favor.'}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Apply',
              onPress: async () => {
                try {
                  console.log('📝 Applying to favor:', favor.id);
                  
                  // Call the Apply to Favor API
                  await applyToFavorMutation.mutateAsync(favor.id);
                  
                  // Success is handled by the mutation's onSuccess callback
                  console.log('✅ Application submitted successfully');
                  
                } catch (error: any) {
                  // Error is handled by the mutation's onError callback
                  console.error('❌ Application failed:', error.message);
                }
              }
            }
          ]
        );
      } else {
        console.log('⚠️ User cannot apply - payment account setup required');
        // stripeConnectManager.validateBeforeApplying already shows the setup dialog
        // If user proceeds with setup, the onSetupComplete callback will automatically apply to the favor
      }
    } catch (error) {
      console.error('❌ Error handling provide favor:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelFavor = async (favor: Favor) => {
    console.log('Cancel favor request for:', favor.user.full_name);
    
    // Show confirmation alert before canceling request
    Alert.alert(
      'Cancel Request',
      `Are you sure you want to cancel your request to provide favor for ${favor.user.full_name}?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Canceling favor request:', favor.id);
              await cancelRequestMutation.mutateAsync(favor.id);
              
              // Immediately refresh the Active tab data after successful cancellation
              console.log('✅ Favor request cancelled successfully, refreshing Active tab data...');
              await Promise.all([refetchActiveMyFavors(), refetchInProgressMyFavors()]);
              
            } catch (error: any) {
              console.error('❌ Cancel request failed:', error.message);
              // Error handling is done by the mutation's onError callback
            }
          }
        }
      ]
    );
  };

  const handleFavorCardPress = (favor: Favor) => {
    if (activeTab === 'All') {
      // For "All" tab, show modal like HomeListScreen
      setSelectedFavorId(favor.id);
      setShowFavorDetailsModal(true);
    } else {
      // For other tabs, navigate to details screen
      navigation?.navigate('FavorDetailsScreen', { favorId: favor.id });
    }
  };

  const FavorCard = ({ favor }: { favor: Favor }) => {
    const isActiveFavor = favor.status === 'in_progress' || favor.status === 'pending';
    
    if (activeTab === 'All') {
      // For "All" tab, use the exact same UI as HomeListScreen
      return (
        <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
          <TouchableOpacity 
            onPress={() => handleFavorCardPress(favor)}
            activeOpacity={0.7}
          >
            <View className="flex-row mb-3">
              {favor.image_url ? (
                <Image
                  source={{ uri: favor.image_url }}
                  className="w-28 h-28 rounded-2xl mr-4"
                  style={{ backgroundColor: '#f3f4f6' }}
                />
              ) : (
                <View className="w-28 h-28 rounded-2xl mr-4 bg-gray-200 items-center justify-center border border-gray-300">
                  <View className="items-center">
                    <Text className="text-4xl text-gray-400 mb-1">📋</Text>
                  </View>
                </View>
              )}
              <View className="flex-1 justify-start">
                <View className="flex-row items-center mb-1">
                  {!favor.favor_pay && (
                    <View className="mr-2">
                      <DollarSvg />
                    </View>
                  )}
                  <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
                    {favor.user.full_name.length > 10 
                      ? `${favor.user.full_name.substring(0, 10)}...` 
                      : favor.user.full_name}
                  </Text>
                  <View className="ml-2 px-2 py-1 rounded">
                    <Text className="text-[#D12E34] text-sm font-medium">{formatPriority(favor.priority)}</Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
                  {favor.title || favor.favor_subject.name} | {favor.time_to_complete || 'Time not specified'}
                </Text>
                <Text className="text-sm text-gray-600" numberOfLines={1}>
                  {favor.city && favor.city !== 'undefined' ? favor.city : ''}{favor.city && favor.city !== 'undefined' && favor.state && favor.state !== 'undefined' ? ', ' : ''}{favor.state && favor.state !== 'undefined' ? favor.state : favor.address}
                </Text>
                <Text className="text-gray-700 text-sm mb-4 leading-5" numberOfLines={2}>
                  {favor.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-green-500 rounded-full py-3"
            onPress={() => handleProvideFavor(favor)}
          >
            <Text className="text-white text-center font-semibold text-base">
              ${parseFloat((favor.tip || 0).toString()).toFixed(2)} | Provide a Favor
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // For Active/History tabs, keep the original layout
    return (
      <TouchableOpacity 
        onPress={() => handleFavorCardPress(favor)}
        activeOpacity={0.7}
      >
        <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
          {/* Header with user name and priority */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              {!favor.favor_pay && (
                <View className="mr-2">
                  <DollarSvg />
                </View>
              )}
              <Text className="text-lg font-semibold text-gray-800">
                {favor.user.full_name.length > 15 
                  ? `${favor.user.full_name.substring(0, 15)}...` 
                  : favor.user.full_name}
              </Text>
              <View className="ml-2 px-2 py-1 rounded">
                <Text className="text-[#D12E34] text-sm font-medium">{formatPriority(favor.priority)}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row mb-4">
            {favor.image_url ? (
              <Image
                source={{ uri: favor.image_url }}
                className="w-28 h-28 rounded-2xl mr-4"
                style={{ backgroundColor: '#f3f4f6' }}
              />
            ) : (
              <View className="w-28 h-28 rounded-2xl mr-4 bg-gray-200 items-center justify-center border border-gray-300">
                <View className="items-center">
                  <Text className="text-4xl text-gray-400 mb-1">📋</Text>
                </View>
              </View>
            )}
            <View className="flex-1">
              {/* Category and Time */}
              <Text className="text-sm text-gray-600 mb-1">
                {favor.title || favor.favor_subject.name} | {favor.time_to_complete || 'Time not specified'}
              </Text>
              
              {/* Location */}
              <Text className="text-sm text-gray-600">
                {favor.city && favor.city !== 'undefined' ? favor.city : ''}{favor.city && favor.city !== 'undefined' && favor.state && favor.state !== 'undefined' ? ', ' : ''}{favor.state && favor.state !== 'undefined' ? favor.state : favor.address}
              </Text>
              
              {/* Description */}
              <Text className="text-gray-700 text-sm mb-4 leading-5">
                {favor.description}
              </Text>
            </View>
          </View>

          {/* Show contextual buttons for Active/History tabs */}
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
                 `$${parseFloat((favor.tip || 0).toString()).toFixed(2)} | Provide a Favor`}
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
            <TouchableOpacity 
              className="w-10 h-10 rounded-full items-center justify-center"
              onPress={() => navigation?.navigate('FilterScreen')}
            >
              <FilterSvg />
              {(selectedCategories.length > 0 || getFilterCount() > 0) && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {selectedCategories.length + getFilterCount()}
                  </Text>
                </View>
              )}
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
              onPress={activeTab === 'All' ? handleAskFavor : handleExploreFavors}
            />
          </View>
        </View>
      )}

      {/* Category Filter Modal */}
      {showCategoryFilter && (
        <View 
          className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-50"
          style={{ zIndex: 1000 }}
        >
          <View className="bg-white rounded-2xl m-6 max-h-96">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-900">Filter by Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryFilter(false)}>
                <Text className="text-gray-500 text-xl">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category List */}
            <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
              <View className="p-4">
                {categories.map((category: FavorSubject) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`flex-row items-center justify-between py-3 px-4 mb-2 rounded-xl ${
                      selectedCategories.includes(category.name) 
                        ? 'bg-green-100 border border-green-300' 
                        : 'bg-gray-50'
                    }`}
                    onPress={() => handleCategoryToggle(category.name)}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{category.icon || '📋'}</Text>
                      <Text className={`text-base font-medium ${
                        selectedCategories.includes(category.name) ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {category.name}
                      </Text>
                    </View>
                    {selectedCategories.includes(category.name) && (
                      <Text className="text-green-600 text-lg">✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer */}
            <View className="flex-row p-4 border-t border-gray-200">
              <TouchableOpacity
                className="flex-1 py-3 px-4 bg-gray-100 rounded-xl mr-2"
                onPress={handleClearFilters}
              >
                <Text className="text-gray-700 text-center font-medium">Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 px-4 bg-green-500 rounded-xl ml-2"
                onPress={() => setShowCategoryFilter(false)}
              >
                <Text className="text-white text-center font-medium">
                  Apply {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Favor Details Modal (for All tab only) */}
      <FavorDetailsModal
        visible={showFavorDetailsModal}
        onClose={() => {
          setShowFavorDetailsModal(false);
          setSelectedFavorId(null);
        }}
        favorId={selectedFavorId}
      />

    </ImageBackground>
  );
}
