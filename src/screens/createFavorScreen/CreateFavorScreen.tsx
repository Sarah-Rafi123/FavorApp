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
import CreateFavorSvg from '../../assets/icons/ProvideFavor';
import PersonwithHeartSvg from '../../assets/icons/PersonwithHeart';
import { TimerSvg } from '../../assets/icons/Timer';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';
import { useMyFavors } from '../../services/queries/FavorQueries';
import { useDeleteFavor } from '../../services/mutations/FavorMutations';
import { Favor } from '../../services/apis/FavorApis';
import useAuthStore from '../../store/useAuthStore';

interface CreateFavorScreenProps {
  navigation?: any;
}

export function CreateFavorScreen({ navigation }: CreateFavorScreenProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'History'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const per_page = 10;

  // Get auth store state
  const { user, accessToken } = useAuthStore();

  // Delete favor mutation for canceling favors
  const deleteFavorMutation = useDeleteFavor();

  // API calls for different tabs
  // All tab: active favors (shows requests)
  const {
    data: allFavorsResponse,
    isLoading: allFavorsLoading,
    error: allFavorsError,
    refetch: refetchAllFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'active', page, per_page },
    { enabled: activeTab === 'All' && !!user && !!accessToken }
  );

  // Active tab: combination of active and in-progress favors
  const {
    data: activeFavorsResponse,
    isLoading: activeFavorsLoading,
    error: activeFavorsError,
    refetch: refetchActiveFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'active', page, per_page },
    { enabled: activeTab === 'Active' && !!user && !!accessToken }
  );

  const {
    data: inProgressFavorsResponse,
    isLoading: inProgressFavorsLoading,
    error: inProgressFavorsError,
    refetch: refetchInProgressFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'in-progress', page, per_page },
    { enabled: activeTab === 'Active' && !!user && !!accessToken }
  );

  // History tab: combination of completed and cancelled favors
  const {
    data: completedFavorsResponse,
    isLoading: completedFavorsLoading,
    error: completedFavorsError,
    refetch: refetchCompletedFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'completed', page, per_page },
    { enabled: activeTab === 'History' && !!user && !!accessToken }
  );

  const {
    data: cancelledFavorsResponse,
    isLoading: cancelledFavorsLoading,
    error: cancelledFavorsError,
    refetch: refetchCancelledFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'cancelled', page, per_page },
    { enabled: activeTab === 'History' && !!user && !!accessToken }
  );

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'All':
        return allFavorsResponse?.data.favors || [];
      case 'Active':
        // Combine active and in-progress favors
        const activeFavors = activeFavorsResponse?.data.favors || [];
        const inProgressFavors = inProgressFavorsResponse?.data.favors || [];
        return [...activeFavors, ...inProgressFavors];
      case 'History':
        // Combine completed and cancelled favors
        const completedFavors = completedFavorsResponse?.data.favors || [];
        const cancelledFavors = cancelledFavorsResponse?.data.favors || [];
        return [...completedFavors, ...cancelledFavors];
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'All':
        return allFavorsLoading;
      case 'Active':
        return activeFavorsLoading || inProgressFavorsLoading;
      case 'History':
        return completedFavorsLoading || cancelledFavorsLoading;
      default:
        return false;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case 'All':
        return allFavorsError;
      case 'Active':
        return activeFavorsError || inProgressFavorsError;
      case 'History':
        return completedFavorsError || cancelledFavorsError;
      default:
        return null;
    }
  };

  const currentFavors = getCurrentData();
  const isLoading = getCurrentLoading();
  const error = getCurrentError();

  const handleAskFavor = () => {
    navigation?.navigate('AskFavorScreen');
  };

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 CreateFavorScreen Debug:');
    console.log('Active Tab:', activeTab);
    console.log('Current Favors Count:', currentFavors.length);
    console.log('Is Loading:', isLoading);
    console.log('Error:', error?.message || 'No error');
    console.log('User:', !!user, user?.firstName);
    console.log('Access Token:', !!accessToken);
  }, [activeTab, currentFavors, isLoading, error, user, accessToken]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      switch (activeTab) {
        case 'All':
          await refetchAllFavors();
          break;
        case 'Active':
          await Promise.all([refetchActiveFavors(), refetchInProgressFavors()]);
          break;
        case 'History':
          await Promise.all([refetchCompletedFavors(), refetchCancelledFavors()]);
          break;
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelFavor = async (favor: Favor) => {
    console.log('Cancel favor:', favor.user.full_name);
    
    // Show confirmation alert before canceling favor
    Alert.alert(
      'Cancel Favor',
      `Are you sure you want to cancel this favor request? This action cannot be undone.`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Canceling favor:', favor.id);
              await deleteFavorMutation.mutateAsync({ 
                favorId: favor.id, 
                type: 'active' 
              });
              
              // Immediately refresh the current data after successful deletion
              console.log('✅ Favor cancelled successfully, refreshing data...');
              await handleRefresh();
              
            } catch (error: any) {
              console.error('❌ Cancel favor failed:', error.message);
              // Error handling is done by the mutation's onError callback
            }
          }
        }
      ]
    );
  };



  const RequestCard = ({ favor }: { favor: Favor }) => {
    return (
      <TouchableOpacity 
        onPress={() => navigation?.navigate('FavorDetailsScreen', { favorId: favor.id })}
        activeOpacity={0.7}
      >
        <View className="bg-white rounded-2xl p-4 mb-4 mx-4 border-2 border-[#44A27B]">
          <View className="flex-row mb-4">
            <Image
              source={{ 
                uri: favor.image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop'
              }}
              className="w-16 h-16 rounded-xl mr-4"
              style={{ backgroundColor: '#f3f4f6' }}
            />
            <View className="flex-1">
              <Text className="text-[#D12E34] text-sm font-medium mb-1 capitalize">{favor.priority}</Text>
              <Text className="text-sm text-gray-600 mb-1">
                {favor.favor_subject.name} | {favor.time_to_complete || '1 Hour'} | {new Date(favor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <Text className="text-sm text-gray-600">{favor.city}, {favor.state}</Text>
              <Text className="text-gray-700 text-sm mt-2 leading-4">
                {favor.description}
              </Text>
            </View>
          </View>
          
          <Text className="text-lg font-bold text-black mb-3">
            Requests ({favor.responses_count || 0})
          </Text>

          {/* Show request count and pending status */}
          <View className="bg-gray-50 rounded-xl p-3">
            <Text className="text-sm text-gray-600 text-center">
              {favor.pending_responses_count > 0 
                ? `${favor.pending_responses_count} pending request${favor.pending_responses_count > 1 ? 's' : ''}`
                : 'No requests yet'
              }
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ActiveCard = ({ favor }: { favor: Favor }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 mx-4 border-2 border-[#44A27B]">
      <TouchableOpacity 
        onPress={() => navigation?.navigate('FavorDetailsScreen', { favorId: favor.id })}
        activeOpacity={0.7}
      >
        <View className="flex-row mb-3">
          <Image
            source={{ 
              uri: favor.image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop'
            }}
            className="w-16 h-16 rounded-xl mr-4"
            style={{ backgroundColor: '#f3f4f6' }}
          />
          <View className="flex-1">
            <Text className="text-[#D12E34] text-sm font-medium mb-1 capitalize">{favor.priority}</Text>
            <Text className="text-sm text-gray-600 mb-1">
              {favor.favor_subject.name} | {favor.time_to_complete || '1 Hour'} | {new Date(favor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">{favor.city}, {favor.state}</Text>
            <Text className="text-gray-700 text-sm leading-4">
              {favor.description}
            </Text>
          </View>
        </View>
        
        {/* Status indicator */}
        <View className="px-3 py-2 bg-green-50 rounded-lg mb-3">
          <Text className="text-sm text-green-700 font-medium capitalize">
            Status: {favor.status.replace('_', ' ')}
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Cancel Favor Button */}
      <TouchableOpacity 
        className="bg-green-500 rounded-full py-3"
        onPress={() => handleCancelFavor(favor)}
      >
        <Text className="text-white text-center font-semibold text-base">
          Cancel Favor
        </Text>
      </TouchableOpacity>
    </View>
  );

  const HistoryCard = ({ favor }: { favor: Favor }) => (
    <TouchableOpacity 
      onPress={() => navigation?.navigate('FavorDetailsScreen', { favorId: favor.id })}
      activeOpacity={0.7}
    >
      <View className="bg-white rounded-2xl p-4 mb-4 mx-4 border-2 border-gray-200">
        <View className="flex-row">
          <Image
            source={{ 
              uri: favor.image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop'
            }}
            className="w-16 h-16 rounded-xl mr-4"
            style={{ backgroundColor: '#f3f4f6' }}
          />
          <View className="flex-1">
            <Text className="text-[#D12E34] text-sm font-medium mb-1 capitalize">{favor.priority}</Text>
            <Text className="text-sm text-gray-600 mb-1">
              {favor.favor_subject.name} | {favor.time_to_complete || '1 Hour'} | {new Date(favor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">{favor.city}, {favor.state}</Text>
            <Text className="text-gray-700 text-sm leading-4">
              {favor.description}
            </Text>
          </View>
        </View>
        
        {/* Status indicator */}
        <View className={`mt-3 px-3 py-2 rounded-lg ${
          favor.status === 'completed' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <Text className={`text-sm font-medium capitalize ${
            favor.status === 'completed' ? 'text-green-700' : 'text-red-700'
          }`}>
            Status: {favor.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
            <TouchableOpacity 
              className="items-center justify-center"
              onPress={() => navigation?.navigate('FilterScreen')}
            >
              <FilterSvg />
            </TouchableOpacity>
            <TouchableOpacity 
              className="items-center justify-center"
              onPress={() => navigation?.navigate('NotificationsScreen')}
            >
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
          <TouchableOpacity 
            className="bg-[#44A27B] rounded-full py-3 px-8"
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