import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  Dimensions,
  Modal,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import CreateFavorSvg from '../../assets/icons/ProvideFavor';
import PersonwithHeartSvg from '../../assets/icons/PersonwithHeart';
import { TimerSvg } from '../../assets/icons/Timer';
import FilterSvg from '../../assets/icons/Filter';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import CancelSvg from '../../assets/icons/Cancel';
import UserSvg from '../../assets/icons/User';
import EditSvg from '../../assets/icons/Edit';
import { useMyFavors, useFavorApplicants } from '../../services/queries/FavorQueries';
import { useDeleteFavor, useAcceptApplicant, useReassignFavor } from '../../services/mutations/FavorMutations';
import { Favor, FavorApplicant } from '../../services/apis/FavorApis';
import { useUserReviewsQuery } from '../../services/queries/ProfileQueries';
import useAuthStore from '../../store/useAuthStore';

interface CreateFavorScreenProps {
  navigation?: any;
}

export function CreateFavorScreen({ navigation }: CreateFavorScreenProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'History'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const per_page = 10;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [favorToCancel, setFavorToCancel] = useState<Favor | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to reset carousel states
  const [loadingApplicants, setLoadingApplicants] = useState<Set<string>>(new Set());

  // Get auth store state
  const { user, accessToken } = useAuthStore();

  // Delete favor mutation for canceling favors
  const deleteFavorMutation = useDeleteFavor();
  
  // Accept applicant mutation
  const acceptApplicantMutation = useAcceptApplicant({
    onSuccess: (data, variables) => {
      // Remove from loading state
      setLoadingApplicants(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${variables.favorId}-${variables.applicantId}`);
        return newSet;
      });
      // Refresh all tabs after successful accept
      handleRefreshAllTabs();
    },
    onError: (error, variables) => {
      // Remove from loading state on error too
      setLoadingApplicants(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${variables.favorId}-${variables.applicantId}`);
        return newSet;
      });
    }
  });
  
  // Reassign favor mutation
  const reassignFavorMutation = useReassignFavor({
    onSuccess: (data, variables) => {
      // Remove from loading state
      setLoadingApplicants(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${variables.favorId}-${variables.newProviderId}`);
        return newSet;
      });
      // Refresh all tabs after successful reassign
      handleRefreshAllTabs();
    },
    onError: (error, variables) => {
      // Remove from loading state on error too
      setLoadingApplicants(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${variables.favorId}-${variables.newProviderId}`);
        return newSet;
      });
    }
  });

  // API calls for different tabs
  // All tab: active favors (shows requests)
  const {
    data: allFavorsResponse,
    isLoading: allFavorsLoading,
    error: allFavorsError,
    refetch: refetchAllFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'active', page, per_page, sort_by: 'updated_at', sort_order: 'asc' },
    { enabled: activeTab === 'All' && !!user && !!accessToken }
  );

  // Active tab: combination of active and in-progress favors
  const {
    data: activeFavorsResponse,
    isLoading: activeFavorsLoading,
    error: activeFavorsError,
    refetch: refetchActiveFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'active', page, per_page, sort_by: 'updated_at', sort_order: 'asc' },
    { enabled: activeTab === 'Active' && !!user && !!accessToken }
  );

  const {
    data: inProgressFavorsResponse,
    isLoading: inProgressFavorsLoading,
    error: inProgressFavorsError,
    refetch: refetchInProgressFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'in-progress', page, per_page, sort_by: 'updated_at', sort_order: 'asc' },
    { enabled: activeTab === 'Active' && !!user && !!accessToken }
  );

  // History tab: combination of completed and cancelled favors
  const {
    data: completedFavorsResponse,
    isLoading: completedFavorsLoading,
    error: completedFavorsError,
    refetch: refetchCompletedFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'completed', page, per_page, sort_by: 'updated_at', sort_order: 'asc' },
    { enabled: activeTab === 'History' && !!user && !!accessToken }
  );

  const {
    data: cancelledFavorsResponse,
    isLoading: cancelledFavorsLoading,
    error: cancelledFavorsError,
    refetch: refetchCancelledFavors,
  } = useMyFavors(
    { type: 'requested', tab: 'cancelled', page, per_page, sort_by: 'updated_at', sort_order: 'asc' },
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
    console.log('🔄 Starting comprehensive refresh of all tabs...');
    setRefreshing(true);
    
    try {
      // Reset all local state variables
      setPage(1);
      setFavorToCancel(null);
      setShowCancelModal(false);
      setRefreshTrigger(prev => prev + 1); // Force carousel components to reset
      
      // Refresh all tabs simultaneously regardless of which tab is active
      console.log('🔄 Refreshing all API data...');
      await Promise.all([
        refetchAllFavors(),
        refetchActiveFavors(), 
        refetchInProgressFavors(),
        refetchCompletedFavors(), 
        refetchCancelledFavors()
      ]);
      
      console.log('✅ All tabs refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing all tabs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh all tabs - used when accepting/reassigning providers
  const handleRefreshAllTabs = async () => {
    console.log('🔄 Starting mutation-triggered comprehensive refresh...');
    setRefreshing(true);
    
    try {
      // Reset all local state variables
      setPage(1);
      setFavorToCancel(null);
      setShowCancelModal(false);
      setRefreshTrigger(prev => prev + 1); // Force carousel components to reset
      setLoadingApplicants(new Set()); // Clear all loading states
      
      // Refresh all tabs simultaneously
      console.log('🔄 Refreshing all API data after mutation...');
      await Promise.all([
        refetchAllFavors(),
        refetchActiveFavors(), 
        refetchInProgressFavors(),
        refetchCompletedFavors(), 
        refetchCancelledFavors()
      ]);
      
      console.log('✅ All tabs refreshed successfully after mutation');
    } catch (error) {
      console.error('❌ Error refreshing all tabs after mutation:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh all tabs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 CreateFavorScreen focused - triggering comprehensive refresh');
      if (user && accessToken) {
        // Small delay to avoid overlapping with initial render
        setTimeout(() => {
          handleRefreshAllTabs();
        }, 100);
      }
    }, [user, accessToken])
  );

  const handleCancelFavor = async (favor: Favor) => {
    console.log('Cancel favor:', favor.user.full_name);
    
    // Show custom confirmation modal
    setFavorToCancel(favor);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!favorToCancel) return;

    try {
      console.log('🗑️ Canceling favor:', favorToCancel.id);
      await deleteFavorMutation.mutateAsync({ 
        favorId: favorToCancel.id, 
        type: 'active' 
      });
      
      // Close modal and reset state
      setShowCancelModal(false);
      setFavorToCancel(null);
      
      // Immediately refresh the current data after successful deletion
      console.log('✅ Favor cancelled successfully, refreshing data...');
      await handleRefresh();
      
    } catch (error: any) {
      console.error('❌ Cancel favor failed:', error.message);
      // Error handling is done by the mutation's onError callback
      // Keep modal open on error so user can try again
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setFavorToCancel(null);
  };



  // Component for individual request cards showing applicant details
  const ApplicantReviewInfo = ({ applicant }: { applicant: FavorApplicant }) => {
    const { data: reviewsResponse, isLoading, error } = useUserReviewsQuery(
      applicant.user.id,
      { page: 1, per_page: 1 }, // We only need statistics
      { enabled: !!applicant.user.id }
    );

    // Debug logging
    React.useEffect(() => {
      if (applicant.user.id) {
        console.log(`📊 Review data for ${applicant.user.full_name} (ID: ${applicant.user.id}):`, {
          isLoading,
          error: error?.message,
          hasResponse: !!reviewsResponse,
          statistics: reviewsResponse?.data?.statistics,
          fallbackRating: applicant.user.rating
        });
      }
    }, [reviewsResponse, isLoading, error, applicant.user.id, applicant.user.full_name, applicant.user.rating]);

    const rating = reviewsResponse?.data?.statistics?.average_rating || applicant.user.rating || 0;
    const reviewCount = reviewsResponse?.data?.statistics?.total_reviews || 0;

    return (
      <View className="flex-row items-center mb-2">
        <Text className="text-gray-600 text-sm mr-2">⭐ {rating.toFixed(1)}</Text>
        <Text className="text-gray-600 text-sm">| {reviewCount} Review{reviewCount !== 1 ? 's' : ''}</Text>
      </View>
    );
  };

  const IndividualRequestCard = ({ favor, applicant }: { favor: Favor; applicant: FavorApplicant }) => {
    return (
      <TouchableOpacity 
        onPress={() => navigation?.navigate('FavorDetailsScreen', { favorId: favor.id, source: 'CreateFavorScreen' })}
        activeOpacity={0.7}
      >
        <View className="bg-white rounded-2xl p-4 mb-4 mx-4 border-2 border-[#44A27B]">
          <View className="flex-row mb-4">
            {/* Applicant's profile image or initials */}
            <View className="w-16 h-16 rounded-xl mr-4 bg-[#44A27B] items-center justify-center">
              <Text className="text-white text-lg font-bold">
                {applicant.user.first_name?.[0]?.toUpperCase() || 'U'}
                {applicant.user.last_name?.[0]?.toUpperCase() || ''}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[#44A27B] text-base font-semibold mb-1">
                {applicant.user.full_name || `${applicant.user.first_name} ${applicant.user.last_name}`}
              </Text>
              <Text className="text-gray-600 text-sm mb-1">
                Applied {new Date(applicant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              {applicant.user.is_certified && (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2"></View>
                  <Text className="text-green-600 text-xs font-medium">Verified</Text>
                </View>
              )}
              {applicant.user.years_of_experience && (
                <Text className="text-gray-500 text-xs mt-1">
                  {applicant.user.years_of_experience} years experience
                </Text>
              )}
            </View>
          </View>
          
          {/* Favor details */}
          <View className="bg-gray-50 rounded-xl p-3 mb-3">
            <Text className="text-gray-700 text-sm font-medium mb-1">
              {favor.favor_subject.name} • {favor.city}, {favor.state}
            </Text>
            <Text className="text-gray-600 text-xs">
              {favor.description.length > 80 ? `${favor.description.substring(0, 80)}...` : favor.description}
            </Text>
          </View>

          {/* Status indicator */}
          <View className={`px-3 py-2 rounded-lg ${
            applicant.status === 'pending' ? 'bg-orange-50' : 
            applicant.status === 'accepted' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <Text className={`text-sm font-medium capitalize ${
              applicant.status === 'pending' ? 'text-orange-700' : 
              applicant.status === 'accepted' ? 'text-green-700' : 'text-red-700'
            }`}>
              Status: {applicant.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Component for showing a single favor with multiple applicants in a carousel
  const ActiveRequestCardWithCarousel = ({ favor, applicants, navigation }: { favor: Favor; applicants: FavorApplicant[]; navigation: any }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = screenWidth - 32; // Account for margins

    // Reset carousel when refreshTrigger changes
    React.useEffect(() => {
      setCurrentIndex(0);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, animated: false });
      }
    }, [refreshTrigger]);

    const handleScroll = (event: any) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / cardWidth);
      setCurrentIndex(index);
    };

    const scrollToIndex = (index: number) => {
      scrollViewRef.current?.scrollTo({ x: index * cardWidth, animated: true });
      setCurrentIndex(index);
    };

    return (
      <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
        {/* Edit Icon - Top Right - Hide when status is in_progress or has accepted provider */}
        {favor.status !== 'in_progress' && !favor.accepted_response && (
          <View className="absolute top-4 right-4 z-10">
            <TouchableOpacity 
              onPress={() => navigation?.navigate('EditFavorScreen', { favorId: favor.id })}
              className="bg-transparent p-2 "
              activeOpacity={0.7}
            >
              <EditSvg />
            </TouchableOpacity>
          </View>
        )}

        {/* Header with favor details */}
        <TouchableOpacity 
          onPress={() => navigation?.navigate('FavorDetailsScreen', { favorId: favor.id, source: 'CreateFavorScreen' })}
          activeOpacity={0.7}
        >
          <View className="flex-row mb-4">
            {/* Favor image on the left */}
            {favor.image_url ? (
              <Image
                source={{ uri: favor.image_url }}
                className="w-20 h-20 rounded-xl mr-4"
                style={{ backgroundColor: '#f3f4f6' }}
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 bg-[#44A27B] rounded-xl mr-4 items-center justify-center border border-gray-300" >
                <UserSvg focused={false} width={40} height={40} />
              </View>
            )}
            
            {/* Favor details on the right */}
            <View className="flex-1">
              <Text className="text-[#D12E34] text-sm font-medium mb-1 capitalize">{favor.priority}</Text>
              <Text className="text-sm text-gray-600 mb-1">
                {favor.favor_subject.name} | {favor.time_to_complete || '1 Hour'} | {new Date(favor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              
              {/* User who posted the favor */}
              <View className="flex-row items-center mb-1">
                <Text className="text-sm text-gray-600">
                  {favor.user?.full_name || 'Unknown'} | {favor.city}, {favor.state}
                </Text>
              </View>
              
              <Text className="text-gray-700 text-sm leading-4" numberOfLines={2}>
                {favor.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Request counter */}
        <View className="mb-4">
          <Text className="text-gray-800 font-semibold text-base">
            Request ({applicants.length})
          </Text>
        </View>

        {/* Horizontal scrollable user details cards */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={{ marginHorizontal: -16 }} // Offset the parent padding
        >
          {applicants.map((applicant, index) => (
            <View key={`${favor.id}-${applicant.id}`} style={{ width: cardWidth, paddingHorizontal: 16 }}>
              <View className="bg-white rounded-2xl p-4 border border-gray-300 shadow-sm">
                <View className="flex-row items-center">
                  {/* Large square profile image */}
                  {applicant.user.image_url ? (
                    <Image
                      source={{ uri: applicant.user.image_url }}
                      className="w-16 h-16 rounded-xl mr-4"
                      style={{ backgroundColor: '#f3f4f6' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-xl mr-4 items-center justify-center bg-[#44A27B]">
                      <Text className="text-white text-lg font-bold">
                        {applicant.user.first_name?.[0]?.toUpperCase() || 'U'}
                        {applicant.user.last_name?.[0]?.toUpperCase() || ''}
                      </Text>
                    </View>
                  )}
                  
                  <View className="flex-1">
                    <Text className="text-gray-800 font-bold text-xl mb-1">
                      {applicant.user.full_name || `${applicant.user.first_name} ${applicant.user.last_name}`}
                    </Text>
                    <ApplicantReviewInfo applicant={applicant} />
                    <TouchableOpacity onPress={() => navigation?.navigate('UserProfileScreen', { userId: applicant.user.id, favorStatus: favor.status })}>
                      <Text className="text-[#44A27B] text-base font-medium">View Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Accept/Reassign button */}
                <TouchableOpacity 
                  className="bg-[#44A27B] rounded-full py-4 mt-4"
                  onPress={() => {
                    const key = `${favor.id}-${applicant.user.id}`;
                    setLoadingApplicants(prev => new Set(prev).add(key));
                    
                    if (favor.accepted_response && favor.status === 'in_progress') {
                      // Favor already has accepted provider, call reassign API
                      reassignFavorMutation.mutate({
                        favorId: favor.id,
                        newProviderId: applicant.user.id
                      });
                    } else {
                      // No accepted provider yet, call accept API
                      acceptApplicantMutation.mutate({
                        favorId: favor.id,
                        applicantId: applicant.user.id
                      });
                    }
                  }}
                  disabled={loadingApplicants.has(`${favor.id}-${applicant.user.id}`)}
                >
                  <Text className="text-white font-bold text-lg text-center">
                    {loadingApplicants.has(`${favor.id}-${applicant.user.id}`)
                      ? (favor.accepted_response && favor.status === 'in_progress' ? 'Reassigning...' : 'Accepting...') 
                      : (favor.accepted_response && favor.status === 'in_progress' ? 'Reassign' : 'Accept')
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination dots */}
        {applicants.length > 1 && (
          <View className="flex-row justify-center mt-4 space-x-2">
            {applicants.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentIndex ? 'bg-[#44A27B]' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Component for Active tab request cards that match the image style - shows favor details with applicant info and Accept button
  const ActiveRequestCard = ({ favor, applicant, navigation }: { favor: Favor; applicant: FavorApplicant; navigation: any }) => {
    return (
      <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
        {/* Header with favor details like the image */}
        <TouchableOpacity 
          onPress={() => navigation?.navigate('FavorDetailsScreen', { favorId: favor.id, source: 'CreateFavorScreen' })}
          activeOpacity={0.7}
        >
          <View className="flex-row mb-4">
            {/* Favor image on the left */}
            {favor.image_url ? (
              <Image
                source={{ uri: favor.image_url }}
                className="w-20 h-20 rounded-xl mr-4"
                style={{ backgroundColor: '#f3f4f6' }}
                resizeMode="cover"
              />
            ) : (
              <View className="w-20 h-20 rounded-xl mr-4 items-center justify-center border bg-[#44A27B] border-gray-300" >
                <UserSvg focused={false} width={40} height={40} />
              </View>
            )}
            
            {/* Favor details on the right */}
            <View className="flex-1">
              <Text className="text-[#D12E34] text-sm font-medium mb-1 capitalize">{favor.priority}</Text>
              <Text className="text-sm text-gray-600 mb-1">
                {favor.favor_subject.name} | {favor.time_to_complete || '1 Hour'} | {new Date(favor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              
              {/* User who posted the favor */}
              <View className="flex-row items-center mb-1">
                <Text className="text-sm text-gray-600">
                  {favor.user?.full_name || 'Unknown'} | {favor.city}, {favor.state}
                </Text>
              </View>
              
              <Text className="text-gray-700 text-sm leading-4" numberOfLines={2}>
                {favor.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Request counter like in the image */}
        <View className="mb-4">
          <Text className="text-gray-800 font-semibold text-base">
            Request ({favor.pending_responses_count || 1})
          </Text>
        </View>

        {/* User details card with border like in the image */}
        <View className="bg-white rounded-2xl p-4 border border-gray-300 shadow-sm">
          <View className="flex-row items-center">
            {/* Large square profile image */}
            {applicant.user.image_url ? (
              <Image
                source={{ uri: applicant.user.image_url }}
                className="w-16 h-16 rounded-xl mr-4"
                style={{ backgroundColor: '#f3f4f6' }}
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-xl mr-4 items-center justify-center bg-[#44A27B]">
                <Text className="text-white text-lg font-bold">
                  {applicant.user.first_name?.[0]?.toUpperCase() || 'U'}
                  {applicant.user.last_name?.[0]?.toUpperCase() || ''}
                </Text>
              </View>
            )}
            
            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-xl mb-1">
                {applicant.user.full_name || `${applicant.user.first_name} ${applicant.user.last_name}`}
              </Text>
              <ApplicantReviewInfo applicant={applicant} />
              <TouchableOpacity onPress={() => navigation?.navigate('UserProfileScreen', { userId: applicant.user.id, favorStatus: favor.status })}>
                <Text className="text-[#44A27B] text-base font-medium">View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Accept/Reassign button with full width */}
          <TouchableOpacity 
            className="bg-[#44A27B] rounded-full py-4 mt-4"
            onPress={() => {
              const key = `${favor.id}-${applicant.user.id}`;
              setLoadingApplicants(prev => new Set(prev).add(key));
              
              if (favor.accepted_response && favor.status === 'in_progress') {
                // Favor already has accepted provider, call reassign API
                reassignFavorMutation.mutate({
                  favorId: favor.id,
                  newProviderId: applicant.user.id
                });
              } else {
                // No accepted provider yet, call accept API
                acceptApplicantMutation.mutate({
                  favorId: favor.id,
                  applicantId: applicant.user.id
                });
              }
            }}
            disabled={loadingApplicants.has(`${favor.id}-${applicant.user.id}`)}
          >
            <Text className="text-white font-bold text-lg text-center">
              {loadingApplicants.has(`${favor.id}-${applicant.user.id}`)
                ? (favor.accepted_response && favor.status === 'in_progress' ? 'Reassigning...' : 'Accepting...') 
                : (favor.accepted_response && favor.status === 'in_progress' ? 'Reassign' : 'Accept')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Original favor card for when no applicants exist
  const FavorSummaryCard = ({ favor }: { favor: Favor }) => {
    return (
      <TouchableOpacity 
        onPress={() => navigation?.navigate('FavorDetailsScreen', { favorId: favor.id, source: 'CreateFavorScreen' })}
        activeOpacity={0.7}
      >
        <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
          <View className="flex-row mb-4">
            {favor.image_url ? (
              <Image
                source={{ uri: favor.image_url }}
                className="w-16 h-16 rounded-xl mr-4"
                style={{ backgroundColor: '#f3f4f6' }}
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-xl mr-4 items-center justify-center border bg-[#44A27B] border-gray-300" >
                <UserSvg focused={false} width={32} height={32} />
              </View>
            )}
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
          
          {/* No requests indicator */}
          <View className="bg-transparent  p-3">
            <Text className="text-sm text-gray-600 text-center">
              No Requests Found
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Component that handles the All tab content - shows individual request cards for each applicant
  const AllTabContent = ({ favors, navigation }: { favors: Favor[]; navigation: any }) => {
    return (
      <>
        {favors.map((favor) => {
          return <FavorWithApplicants key={favor.id} favor={favor} navigation={navigation} />;
        })}
      </>
    );
  };

  // Component that fetches applicants for a favor and renders individual cards
  const FavorWithApplicants = ({ favor, navigation }: { favor: Favor; navigation: any }) => {
    const { data: applicantsData } = useFavorApplicants(favor.id);
    
    // Filter to only show pending applicants (hide accepted ones for All tab too)
    const pendingApplicants = applicantsData?.data?.applicants?.filter(
      applicant => applicant.status === 'pending'
    ) || [];
    
    // If there are pending applicants, show carousel with pending applicants
    if (pendingApplicants.length > 0) {
      return (
        <ActiveRequestCardWithCarousel 
          favor={favor} 
          applicants={pendingApplicants} 
          navigation={navigation}
        />
      );
    }
    
    // If no pending applicants, show the summary card
    return <FavorSummaryCard favor={favor} />;
  };

  // Component for Active tab that fetches applicants for favors with pending reviews
  const ActiveFavorWithApplicants = ({ favor, navigation }: { favor: Favor; navigation: any }) => {
    const { data: applicantsData } = useFavorApplicants(favor.id);
    
    // Filter to only show pending applicants (hide accepted ones)
    const pendingApplicants = applicantsData?.data?.applicants?.filter(
      applicant => applicant.status === 'pending'
    ) || [];

    console.log(`🔍 Active favor ${favor.id} applicants:`, {
      total: applicantsData?.data?.applicants?.length || 0,
      pending: pendingApplicants.length,
      allStatuses: applicantsData?.data?.applicants?.map(a => ({ id: a.user.id, name: a.user.full_name, status: a.status })) || []
    });
    
    // If there are pending applicants, show carousel
    if (pendingApplicants.length > 0) {
      return (
        <ActiveRequestCardWithCarousel 
          favor={favor} 
          applicants={pendingApplicants} 
          navigation={navigation}
        />
      );
    }
    
    // If no pending applicants, return null (will show regular active card)
    return null;
  };

  const ActiveCard = ({ favor }: { favor: Favor }) => {
    // If favor has pending reviews, show individual request cards for each applicant
    if (favor.pending_responses_count > 0) {
      return <ActiveFavorWithApplicants favor={favor} navigation={navigation} />;
    }
    
    // If no pending reviews, show regular active card
    return (
      <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
        {/* Edit Icon - Top Right - Hide when status is in_progress or has accepted provider */}
        {favor.status !== 'in_progress' && !favor.accepted_response && (
          <View className="absolute top-4 right-4 z-10">
            <TouchableOpacity 
              onPress={() => navigation?.navigate('EditFavorScreen', { favorId: favor.id })}
              className="bg-transparent p-2"
              activeOpacity={0.7}
            >
              <EditSvg />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          onPress={() => navigation?.navigate('FavorDetailsScreen', { favorId: favor.id, source: 'CreateFavorScreen' })}
          activeOpacity={0.7}
        >
          <View className="flex-row mb-3">
            {favor.image_url ? (
              <Image
                source={{ uri: favor.image_url }}
                className="w-16 h-16 rounded-xl mr-4"
                style={{ backgroundColor: '#f3f4f6' }}
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-xl mr-4 items-center justify-center border border-gray-300 bg-[#44A27B]">
                <UserSvg focused={false} width={32} height={32} />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-[#D12E34] text-sm font-medium mb-1 capitalize">{favor.priority}</Text>
              <Text className="text-sm text-gray-600 mb-1">
                {favor.favor_subject.name} | {favor.time_to_complete || '1 Hour'} | {new Date(favor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <Text className="text-sm text-gray-600 mb-1">{favor.city}, {favor.state}</Text>
              {/* Status Badge */}
              <View className="flex-row mb-1">
                <View className={`px-3 py-1 rounded-xl ${
                  favor.status === 'completed' ? 'bg-green-100' :
                  favor.status === 'in-progress' ? 'bg-blue-100' :
                  favor.status === 'pending' ? 'bg-orange-100' :
                  favor.status === 'cancelled' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  <Text className={`text-sm font-medium ${
                    favor.status === 'completed' ? 'text-green-700' :
                    favor.status === 'in-progress' ? 'text-blue-700' :
                    favor.status === 'pending' ? 'text-orange-700' :
                    favor.status === 'cancelled' ? 'text-red-700' :
                    'text-gray-700'
                  }`}>
                    {favor.status === 'in-progress' 
                      ? 'In Progress' 
                      : favor.status === 'completed'
                      ? 'Completed'
                      : favor.status?.charAt(0).toUpperCase() + favor.status?.slice(1).replace('_', ' ') || 'Unknown'
                    }
                  </Text>
                </View>
              </View>
              <Text className="text-gray-700 text-sm leading-4">
                {favor.description}
              </Text>
            </View>
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
  };

  const HistoryCard = ({ favor }: { favor: Favor }) => (
    <TouchableOpacity 
      onPress={() => navigation?.navigate('FavorDetailsScreen', { favorId: favor.id, source: 'CreateFavorScreen' })}
      activeOpacity={0.7}
    >
      <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
        <View className="flex-row">
          {favor.image_url ? (
            <Image
              source={{ uri: favor.image_url }}
              className="w-16 h-16 rounded-xl mr-4"
              style={{ backgroundColor: '#f3f4f6' }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl mr-4 items-center justify-center border border-gray-300 bg-[#44A27B]">
              <UserSvg focused={false} width={32} height={32} />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-[#D12E34] text-sm font-medium mb-1 capitalize">{favor.priority}</Text>
            <Text className="text-sm text-gray-600 mb-1">
              {favor.favor_subject.name} | {favor.time_to_complete || '1 Hour'} | {new Date(favor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">{favor.city}, {favor.state}</Text>
            {/* Status Badge */}
            <View className="flex-row mb-1">
              <View className={`px-3 py-1 rounded-xl ${
                favor.status === 'completed' ? 'bg-green-100' :
                favor.status === 'in-progress' ? 'bg-blue-100' :
                favor.status === 'pending' ? 'bg-orange-100' :
                favor.status === 'cancelled' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                <Text className={`text-sm font-medium ${
                  favor.status === 'completed' ? 'text-green-700' :
                  favor.status === 'in-progress' ? 'text-blue-700' :
                  favor.status === 'pending' ? 'text-orange-700' :
                  favor.status === 'cancelled' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  {favor.status === 'in-progress' 
                    ? 'In Progress' 
                    : favor.status === 'completed'
                    ? 'Completed'
                    : favor.status?.charAt(0).toUpperCase() + favor.status?.slice(1).replace('_', ' ') || 'Unknown'
                  }
                </Text>
              </View>
            </View>
            <Text className="text-gray-700 text-sm leading-4">
              {favor.description}
            </Text>
          </View>
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
            {/* <TouchableOpacity 
              className="items-center justify-center"
              onPress={() => navigation?.navigate('FilterScreen')}
            >
              <FilterSvg />
            </TouchableOpacity> */}
            <NotificationBell />
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


        {/* Ask Favor Button - only show when there are favors in the list */}
        {currentFavors.length > 0 && (
          <View className="px-4">
            <CarouselButton
              title="Ask Favor"
              onPress={handleAskFavor}
            />
          </View>
        )}
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
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#44A27B']}
              tintColor="#44A27B"
            />
          }
        >
          {activeTab === 'All' 
            ? <AllTabContent favors={currentFavors} navigation={navigation} />
            : currentFavors.map((favor) => {
                if (activeTab === 'Active') {
                  return <ActiveCard key={favor.id} favor={favor} />;
                } else {
                  return <HistoryCard key={favor.id} favor={favor} />;
                }
              })
          }
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

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelModalClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F7FBF5] rounded-3xl p-6 max-w-sm w-full border-4 border-[#71DFB1] relative">
            {/* Close Button */}
            <TouchableOpacity 
              className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full items-center justify-center"
              onPress={handleCancelModalClose}
            >
              <Text className="text-white font-bold text-lg">×</Text>
            </TouchableOpacity>

            {/* Cancel Icon */}
            <View className="items-center mb-6 mt-4">
              <View className="w-20 h-20 items-center justify-center">
                <View style={{ transform: [{ scale: 0.8 }] }}>
                  <CancelSvg />
                </View>
              </View>
            </View>

            {/* Modal Text */}
            <Text className="text-gray-700 text-lg text-center mb-8 leading-6">
              Are you sure you want to cancel this favor request? This action cannot be undone.
            </Text>

            {/* Buttons */}
            <View className="flex-row gap-x-4">
              <TouchableOpacity 
                className="flex-1 bg-[#44A27B] rounded-full py-4"
                onPress={handleCancelModalClose}
              >
                <Text className="text-white text-center font-semibold text-lg">No</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 border-2 border-[#44A27B] rounded-full py-4"
                onPress={handleConfirmCancel}
              >
                <Text className="text-[#44A27B] text-center font-semibold text-lg">Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}