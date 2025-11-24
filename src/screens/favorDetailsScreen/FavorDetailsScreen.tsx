import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  ImageBackground,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';
import CancelSvg from '../../assets/icons/Cancel';
import UserSvg from '../../assets/icons/User';
import { useFavor, useFavorReviews } from '../../services/queries/FavorQueries';
import { usePublicUserProfileQuery, useFavorProviderProfileQuery, useUserReviewsQuery, useUserReviewStatisticsQuery } from '../../services/queries/ProfileQueries';
import { useDeleteFavor, useReassignFavor, useCompleteFavor, useCancelAndRepost, useCreateReview } from '../../services/mutations/FavorMutations';
import { Favor } from '../../services/apis/FavorApis';
import { PublicUserProfile, ProviderProfile } from '../../services/apis/ProfileApis';
import { Linking } from 'react-native';
import Toast from 'react-native-toast-message';

interface FavorDetailsScreenProps {
  navigation?: any;
  route?: any;
}


const VerifiedIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 0L9.9 2.6L13.1 2.9L12.4 6.1L15 8L12.4 9.9L13.1 13.1L9.9 12.4L8 15L6.1 12.4L2.9 13.1L3.6 9.9L1 8L3.6 6.1L2.9 2.9L6.1 3.6L8 0Z"
      fill="#44A27B"
    />
    <Path
      d="M5.5 8L7 9.5L10.5 6"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function FavorDetailsScreen({ navigation, route }: FavorDetailsScreenProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showTipOption, setShowTipOption] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [isCompletingFavor, setIsCompletingFavor] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Get favor ID from route params
  const favorId = route?.params?.favorId || route?.params?.favor?.id;
  
  // Check if coming from CreateFavorScreen (request mode) or ProvideFavorScreen (provider mode)
  const isRequestMode = route?.params?.source === 'CreateFavorScreen' || route?.name === 'FavorDetailsScreen';
  
  // Fetch favor data using the API
  const { data: favorResponse, isLoading, error } = useFavor(favorId, {
    enabled: !!favorId
  });

  // Fetch favor reviews
  const { data: reviewsResponse, isLoading: reviewsLoading } = useFavorReviews(favorId, {
    enabled: !!favorId
  });

  // Fetch provider profile data when there's an accepted response
  const { data: providerProfileResponse, isLoading: providerProfileLoading } = useFavorProviderProfileQuery(
    favorResponse?.data.favor?.accepted_response ? favorId : null,
    { enabled: !!favorResponse?.data.favor?.accepted_response }
  );

  // Debug logging for provider profile response
  React.useEffect(() => {
    if (providerProfileResponse) {
      console.log('📊 PROVIDER PROFILE API RESPONSE:', {
        hasResponse: !!providerProfileResponse,
        responseStructure: Object.keys(providerProfileResponse),
        userData: providerProfileResponse?.data?.user,
        userImageUrl: providerProfileResponse?.data?.user?.image_url,
        userFullName: providerProfileResponse?.data?.user?.full_name
      });
    }
  }, [providerProfileResponse]);

  // Fetch user contact details immediately
  const { data: userContactResponse } = usePublicUserProfileQuery(
    favorResponse?.data.favor?.user?.id || null,
    { enabled: !!favorResponse?.data.favor?.user?.id }
  );

  // Fetch provider contact details
  const { data: providerContactResponse } = usePublicUserProfileQuery(
    favorResponse?.data.favor?.accepted_response?.user?.id || null,
    { enabled: !!favorResponse?.data.favor?.accepted_response?.user?.id }
  );

  // Debug logging for provider contact response
  React.useEffect(() => {
    if (providerContactResponse) {
      console.log('📊 PROVIDER CONTACT API RESPONSE:', {
        hasResponse: !!providerContactResponse,
        responseStructure: Object.keys(providerContactResponse),
        userData: providerContactResponse?.data?.user,
        userImageUrl: providerContactResponse?.data?.user?.image_url,
        userFullName: providerContactResponse?.data?.user?.full_name
      });
    }
  }, [providerContactResponse]);

  
  // Fetch user profile data when needed (for modal)
  const { data: userProfileResponse, isLoading: userProfileLoading } = usePublicUserProfileQuery(
    favorResponse?.data.favor?.user?.id || null,
    { enabled: !!favorResponse?.data.favor?.user?.id && showUserProfileModal }
  );

  // Fetch user reviews to get rating statistics
  const { data: userReviewsResponse, isLoading: userReviewsLoading, error: userReviewsError } = useUserReviewsQuery(
    favorResponse?.data.favor?.user?.id || null,
    { page: 1, per_page: 1 }, // We only need statistics, not the actual reviews
    { enabled: !!favorResponse?.data.favor?.user?.id && !isRequestMode }
  );

  // Fetch provider reviews to get rating statistics
  const { data: providerReviewsResponse, isLoading: providerReviewsLoading, error: providerReviewsError } = useUserReviewsQuery(
    favorResponse?.data.favor?.accepted_response?.user?.id || null,
    { page: 1, per_page: 1 }, // We only need statistics, not the actual reviews
    { enabled: !!favorResponse?.data.favor?.accepted_response?.user?.id && isRequestMode }
  );

  // NEW: Fetch user review statistics for the requester
  const { data: userReviewStatisticsResponse, isLoading: userReviewStatisticsLoading } = useUserReviewStatisticsQuery(
    favorResponse?.data.favor?.user?.id || null,
    { enabled: !!favorResponse?.data.favor?.user?.id && !isRequestMode }
  );

  // NEW: Fetch provider review statistics for the provider
  const { data: providerReviewStatisticsResponse, isLoading: providerReviewStatisticsLoading } = useUserReviewStatisticsQuery(
    favorResponse?.data.favor?.accepted_response?.user?.id || null,
    { enabled: !!favorResponse?.data.favor?.accepted_response?.user?.id && isRequestMode }
  );

  // Debug API calls
  React.useEffect(() => {
    console.log('\n🔍 API QUERY DEBUG:');
    console.log('📋 isRequestMode:', isRequestMode);
    console.log('🎯 Favor Data:', {
      favorId: favorResponse?.data.favor?.id,
      requesterUserId: favorResponse?.data.favor?.user?.id,
      requesterName: favorResponse?.data.favor?.user?.full_name,
      providerUserId: favorResponse?.data.favor?.accepted_response?.user?.id,
      providerName: favorResponse?.data.favor?.accepted_response?.user?.full_name,
      hasAcceptedResponse: !!favorResponse?.data.favor?.accepted_response
    });
    console.log('📞 API Queries Being Made:');
    console.log('  - userReviewStatisticsQuery (requester):', {
      userId: favorResponse?.data.favor?.user?.id || null,
      enabled: !!favorResponse?.data.favor?.user?.id && !isRequestMode,
      willExecute: !!favorResponse?.data.favor?.user?.id && !isRequestMode
    });
    console.log('  - providerReviewStatisticsQuery (provider):', {
      userId: favorResponse?.data.favor?.accepted_response?.user?.id || null,
      enabled: !!favorResponse?.data.favor?.accepted_response?.user?.id && isRequestMode,
      willExecute: !!favorResponse?.data.favor?.accepted_response?.user?.id && isRequestMode
    });
  }, [favorResponse, isRequestMode]);

  // Debug logging for review statistics
  React.useEffect(() => {
    const userId = isRequestMode 
      ? favorResponse?.data.favor?.accepted_response?.user?.id 
      : favorResponse?.data.favor?.user?.id;
    
    const userName = isRequestMode 
      ? favorResponse?.data.favor?.accepted_response?.user?.full_name 
      : favorResponse?.data.favor?.user?.full_name;

    const reviewsData = isRequestMode ? providerReviewsResponse : userReviewsResponse;
    const reviewStatisticsData = isRequestMode ? providerReviewStatisticsResponse : userReviewStatisticsResponse;
    const isLoading = isRequestMode ? providerReviewsLoading : userReviewsLoading;
    const error = isRequestMode ? providerReviewsError : userReviewsError;

    if (userId && userName) {
      console.log(`📊 FavorDetailsScreen Review Statistics for ${userName} (ID: ${userId}):`, {
        isRequestMode,
        isLoading,
        error: error?.message,
        hasOldResponse: !!reviewsData,
        oldStatistics: reviewsData?.data?.statistics,
        hasNewResponse: !!reviewStatisticsData,
        newStatistics: reviewStatisticsData?.data
      });
    }
  }, [userReviewsResponse, providerReviewsResponse, userReviewsLoading, providerReviewsLoading, userReviewsError, providerReviewsError, userReviewStatisticsResponse, providerReviewStatisticsResponse, isRequestMode, favorResponse]);

  // Delete favor mutation and Reassign favor mutation
  const deleteFavorMutation = useDeleteFavor();
  const reassignFavorMutation = useReassignFavor();
  const completeFavorMutation = useCompleteFavor();
  const cancelAndRepostMutation = useCancelAndRepost();
  const createReviewMutation = useCreateReview();

  const favor = favorResponse?.data.favor;
  const userProfile = userProfileResponse?.data.user;
  const userContact = userContactResponse?.data.user; // Contact details for the favor requester
  const providerProfile = providerProfileResponse?.data.user;
  const providerContact = providerContactResponse?.data.user; // Contact details for the provider

  // Debug logging for ALL provider review API responses (moved after variable declarations)
  React.useEffect(() => {
    console.log('\n🔍 COMPREHENSIVE PROVIDER REVIEW COUNT DEBUG:');
    console.log('📊 Provider Name:', favor?.accepted_response?.user?.full_name);
    console.log('📊 Provider ID:', favor?.accepted_response?.user?.id);
    console.log('📊 isRequestMode:', isRequestMode);
    
    console.log('\n📊 PROVIDER REVIEW STATISTICS API RESPONSE:');
    console.log('  - Response exists:', !!providerReviewStatisticsResponse);
    console.log('  - Response loading:', providerReviewStatisticsLoading);
    console.log('  - Full response:', JSON.stringify(providerReviewStatisticsResponse, null, 2));
    console.log('  - Review count from statistics API:', providerReviewStatisticsResponse?.data?.total?.count);
    
    console.log('\n📊 PROVIDER REVIEWS API RESPONSE (OLD):');
    console.log('  - Response exists:', !!providerReviewsResponse);
    console.log('  - Response loading:', providerReviewsLoading);
    console.log('  - Full response:', JSON.stringify(providerReviewsResponse, null, 2));
    console.log('  - Review count from old API:', providerReviewsResponse?.data?.statistics?.total_reviews);
    
    console.log('\n📊 PROVIDER PROFILE FALLBACK:');
    console.log('  - Profile exists:', !!providerProfile);
    console.log('  - Full profile:', JSON.stringify(providerProfile, null, 2));
    console.log('  - Review count from profile:', providerProfile?.total_reviews);
    
    const finalCount = providerReviewStatisticsResponse?.data?.total?.count || 
                      providerReviewsResponse?.data?.statistics?.total_reviews || 
                      providerProfile?.total_reviews || 0;
    
    console.log('\n🎯 FINAL COUNT CALCULATION:');
    console.log('  - New API count:', providerReviewStatisticsResponse?.data?.total?.count);
    console.log('  - Old API count:', providerReviewsResponse?.data?.statistics?.total_reviews);
    console.log('  - Fallback count:', providerProfile?.total_reviews);
    console.log('  - FINAL COUNT DISPLAYED:', finalCount);
    
    if (finalCount === 19) {
      console.log('🎯 SOURCE OF "19 REVIEWS": Found the source!');
      if (providerReviewStatisticsResponse?.data?.total?.count === 19) {
        console.log('   ✅ Coming from providerReviewStatisticsResponse.data.total.count');
      } else if (providerReviewsResponse?.data?.statistics?.total_reviews === 19) {
        console.log('   ✅ Coming from providerReviewsResponse.data.statistics.total_reviews');
      } else if (providerProfile?.total_reviews === 19) {
        console.log('   ✅ Coming from providerProfile.total_reviews');
      }
    }
    
  }, [favor, providerReviewStatisticsResponse, providerReviewsResponse, providerProfile, isRequestMode, providerReviewStatisticsLoading, providerReviewsLoading]);

  // Debug logging to check contact information
  React.useEffect(() => {
    if (userContact) {
      console.log('📞 User Contact Info:');
      console.log('  - Phone Call:', userContact.phone_no_call);
      console.log('  - Phone Text:', userContact.phone_no_text);
      console.log('  - Has Call Number:', !!userContact.phone_no_call);
      console.log('  - Has Text Number:', !!userContact.phone_no_text);
      console.log('  - Email:', userContact.email);
      console.log('  - Full Name:', userContact.full_name);
      console.log('  - Image URL:', userContact.image_url);
    }
    if (providerContact) {
      console.log('📞 Provider Contact Info:');
      console.log('  - Phone Call:', providerContact.phone_no_call);
      console.log('  - Phone Text:', providerContact.phone_no_text);
      console.log('  - Has Call Number:', !!providerContact.phone_no_call);
      console.log('  - Has Text Number:', !!providerContact.phone_no_text);
      console.log('  - Email:', providerContact.email);
      console.log('  - Full Name:', providerContact.full_name);
      console.log('  - Image URL:', providerContact.image_url);
    }
  }, [userContact, providerContact]);

  // Debug logging for provider profile vs contact data
  React.useEffect(() => {
    if (favor?.accepted_response) {
      console.log('🔍 PROVIDER PROFILE DEBUG:');
      console.log('  - Favor Provider Name:', favor.accepted_response.user.full_name);
      console.log('  - Provider Profile Response:', {
        exists: !!providerProfile,
        loading: providerProfileLoading,
        name: providerProfile?.full_name,
        image_url: providerProfile?.image_url
      });
      console.log('  - Provider Contact Response:', {
        exists: !!providerContact,
        name: providerContact?.full_name,
        image_url: providerContact?.image_url
      });
      console.log('  - Image URL Priority:');
      console.log('    1. providerProfile?.image_url:', providerProfile?.image_url);
      console.log('    2. providerContact?.image_url:', providerContact?.image_url);
      console.log('    3. favor.accepted_response.user (basic):', favor.accepted_response.user);
      
      // Check which image URL will be used
      const finalImageUrl = providerProfile?.image_url || providerContact?.image_url;
      console.log('  - FINAL IMAGE URL TO USE:', finalImageUrl);
    }
  }, [favor, providerProfile, providerContact, providerProfileLoading]);

  // Debug logging for reviews data
  React.useEffect(() => {
    if (reviewsResponse?.data?.reviews) {
      console.log('📊 Reviews Response:');
      console.log('  - Total reviews:', reviewsResponse.data.reviews.length);
      reviewsResponse.data.reviews.forEach((review, index) => {
        console.log(`  - Review ${index + 1}:`, {
          id: review.id,
          rating: review.rating,
          given_by_name: review.given_by?.full_name,
          given_by_image: review.given_by?.image_url,
          has_image: !!review.given_by?.image_url,
          image_url_length: review.given_by?.image_url?.length
        });
      });
    }
  }, [reviewsResponse]);

  // Function to get user initials from full name
  const getUserInitials = (fullName: string) => {
    if (!fullName) return 'U';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleGoBack = () => {
    navigation?.goBack();
  };

  // Loading state
  if (isLoading) {
    return (
      <ImageBackground
        source={require('../../assets/images/Wallpaper.png')}
        className="flex-1"
        resizeMode="cover"
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View className="pt-16 pb-6 px-6">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="mr-4"
              onPress={handleGoBack}
            >
              <BackSvg />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-black">Favor Details</Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#44A27B" />
          <Text className="text-gray-600 mt-4">Loading favor details...</Text>
        </View>
      </ImageBackground>
    );
  }

  // Error state
  if (error || !favor) {
    return (
      <ImageBackground
        source={require('../../assets/images/Wallpaper.png')}
        className="flex-1"
        resizeMode="cover"
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View className="pt-16 pb-6 px-6">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="mr-4"
              onPress={handleGoBack}
            >
              <BackSvg />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-black">Favor Details</Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
            {error ? 'Error Loading Favor' : 'Favor Not Found'}
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            {error ? 'Please try again later.' : 'This favor may have been removed or does not exist.'}
          </Text>
          <TouchableOpacity 
            className="bg-green-500 rounded-full py-3 px-8"
            onPress={handleGoBack}
          >
            <Text className="text-white font-semibold text-lg">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  const handleCancelFavor = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!favor) return;

    try {
      console.log('🗑️ Confirming cancel for favor:', favor.id);
      await deleteFavorMutation.mutateAsync({ 
        favorId: favor.id, 
        type: 'active' 
      });
      
      // Close modal and navigate back on success
      setShowCancelModal(false);
      navigation?.goBack();
      
      console.log('✅ Favor cancelled successfully');
    } catch (error: any) {
      console.error('❌ Cancel favor failed:', error.message);
      // Error handling is done by the mutation's onError callback
      // Keep modal open on error so user can try again
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  const handleCallNumber = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(err => {
      console.error('Error making call:', err);
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handleTextNumber = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    Linking.openURL(`sms:${cleanNumber}`).catch(err => {
      console.error('Error opening messages:', err);
      Alert.alert('Error', 'Unable to open messaging app');
    });
  };

  const handleViewProfile = () => {
    if (favor?.accepted_response?.user?.id) {
      console.log('🔄 Navigating to UserProfileScreen from FavorDetailsScreen:', {
        userId: favor.accepted_response.user.id,
        favorStatus: favor.status,
        userType: 'provider',
        userName: favor.accepted_response.user.full_name
      });
      navigation?.navigate('UserProfileScreen', { 
        userId: favor.accepted_response.user.id,
        favorStatus: favor.status
      });
    } else if (favor?.user?.id) {
      console.log('🔄 Navigating to UserProfileScreen from FavorDetailsScreen:', {
        userId: favor.user.id,
        favorStatus: favor.status,
        userType: 'requester',
        userName: favor.user.full_name
      });
      navigation?.navigate('UserProfileScreen', { 
        userId: favor.user.id,
        favorStatus: favor.status
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!favor || isCompletingFavor) return;

    try {
      setIsCompletingFavor(true);
      console.log('🎯 Marking favor as completed:', favor.id);
      await completeFavorMutation.mutateAsync(favor.id);
      
      // Show review modal after successful completion
      setShowReviewModal(true);
      
      console.log('✅ Favor marked as completed successfully');
    } catch (error: any) {
      console.error('❌ Complete favor failed:', error.message);
      // Error handling is done by the mutation's onError callback
    } finally {
      setIsCompletingFavor(false);
    }
  };

  const handleReviewSubmit = async () => {
    // Enhanced validation
    if (!favor || rating === 0 || !reviewText.trim() || isSubmittingReview) {
      let errorMessage = 'Please provide ';
      const missingFields = [];
      
      if (rating === 0) missingFields.push('a rating');
      if (!reviewText.trim()) missingFields.push('review text');
      
      if (missingFields.length === 2) {
        errorMessage += 'both a rating and review text.';
      } else if (missingFields.length === 1) {
        errorMessage += missingFields[0] + '.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Incomplete Review',
        text2: errorMessage,
        visibilityTime: 3000,
      });
      return;
    }
    
    // Check character limit
    if (reviewText.trim().length > 200) {
      Toast.show({
        type: 'error',
        text1: 'Review Too Long',
        text2: 'Review must be 200 characters or less.',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setIsSubmittingReview(true);
      const reviewData = {
        rating,
        description: reviewText.trim(),
        review_type: 'favor_review',
        add_tip: showTipOption && tipAmount.trim() !== '',
        ...(showTipOption && tipAmount.trim() !== '' && { tip_amount: parseFloat(tipAmount) })
      };

      console.log('🌟 Submitting review:', reviewData);
      await createReviewMutation.mutateAsync({
        favorId: favor.id,
        data: reviewData
      });
      
      // Reset form and close modal
      setShowReviewModal(false);
      setRating(0);
      setReviewText('');
      setShowTipOption(false);
      setTipAmount('');
      
      // Navigate back after successful review
      navigation?.goBack();
      
      console.log('✅ Review submitted successfully');
    } catch (error: any) {
      console.error('❌ Review submission failed:', error.message);
      // Error handling is done by the mutation's onError callback
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCancelAndRepost = async () => {
    if (!favor) return;

    Alert.alert(
      'Cancel & Repost Favor',
      'This will cancel the current favor and create a new identical posting. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Repost',
          onPress: async () => {
            try {
              console.log('🔄 Canceling and reposting favor:', favor.id);
              await cancelAndRepostMutation.mutateAsync(favor.id);
              
              // Navigate back on success
              navigation?.goBack();
              
              console.log('✅ Favor cancelled and reposted successfully');
            } catch (error: any) {
              console.error('❌ Cancel and repost failed:', error.message);
              // Error handling is done by the mutation's onError callback
            }
          }
        }
      ]
    );
  };

  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setRating(0);
    setReviewText('');
    setShowTipOption(false);
    setTipAmount('');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className={`mr-4 ${isCompletingFavor ? 'opacity-50' : ''}`}
            onPress={handleGoBack}
            disabled={isCompletingFavor}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Favor Details</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Favor Details Card - Matching the image */}
        <View className="mx-4 mb-6 bg-white rounded-3xl p-6 border-4 border-[#71DFB1]">
          {/* Favor Image */}
          <View className="items-center mb-6">
            <View className="w-32 h-24 rounded-2xl overflow-hidden items-center justify-center">
              {favor.image_url ? (
                <Image
                  source={{ uri: favor.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-[#44A27B] items-center justify-center">
                  <UserSvg focused={false} />
                </View>
              )}
            </View>
          </View>

          {/* Favor Details */}
          <View className="space-y-3 mb-6">
            <View className="flex-row">
              <Text className="text-gray-700 text-base w-20">Priority</Text>
              <Text className="text-gray-700 text-base mr-2">:</Text>
              <Text className="text-gray-800 text-base flex-1 capitalize">{favor.priority}</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-700 text-base w-20">Category</Text>
              <Text className="text-gray-700 text-base mr-2">:</Text>
              <Text className="text-gray-800 text-base flex-1">{favor.favor_subject.name}</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-700 text-base w-20">Duration</Text>
              <Text className="text-gray-700 text-base mr-2">:</Text>
              <Text className="text-gray-800 text-base flex-1">{favor.time_to_complete || '1 Hour'}</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-700 text-base w-20">Location</Text>
              <Text className="text-gray-700 text-base mr-2">:</Text>
              <Text className="text-gray-800 text-base flex-1">{favor.city}, {favor.state}</Text>
            </View>

            {/* Payment Details - Show when favor is paid */}
            {!favor.favor_pay && (
              <>
                <View className="flex-row">
                  <Text className="text-gray-700 text-base w-20">Type</Text>
                  <Text className="text-gray-700 text-base mr-2">:</Text>
                  <Text className="text-gray-700 text-base flex-1 font-semibold">Paid Favor</Text>
                </View>

                <View className="flex-row">
                  <Text className="text-gray-700 text-base w-20">Favor Amount</Text>
                  <Text className="text-gray-700 text-base mr-2">:</Text>
                  <Text className="text-gray-800 text-base flex-1">
                    ${parseFloat((favor.tip || 0).toString()).toFixed(2)}
                  </Text>
                </View>

                {favor.additional_tip && parseFloat((favor.additional_tip || 0).toString()) > 0 && (
                  <View className="flex-row">
                    <Text className="text-gray-700 text-base w-20">Tip</Text>
                    <Text className="text-gray-700 text-base mr-2">:</Text>
                    <Text className="text-gray-700 text-base flex-1">
                      +${parseFloat((favor.additional_tip || 0).toString()).toFixed(2)}
                    </Text>
                  </View>
                )}

                <View className="flex-row">
                  <Text className="text-gray-700 text-base w-20">Total</Text>
                  <Text className="text-gray-700 text-base mr-2">:</Text>
                  <Text className="text-gray-700 text-base flex-1">
                    ${(
                      parseFloat((favor.tip || 0).toString()) + 
                      parseFloat((favor.additional_tip || 0).toString())
                    ).toFixed(2)}
                  </Text>
                </View>
              </>
            )}

            {/* Free Favor Indicator */}
            {favor.favor_pay && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-20">Type</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <Text className="text-gray-700 text-base flex-1 font-semibold">Free Favor</Text>
              </View>
            )}

            <View className="flex-row items-start">
              <Text className="text-gray-700 text-base w-24">Description</Text>
              <Text className="text-gray-700 text-base mr-2">:</Text>
              <Text className="text-gray-800 text-base flex-1">{favor.description}</Text>
            </View>
          </View>
        </View>

        {/* Show requester information when viewing from ProvideFavorScreen */}
        {!isRequestMode && favor.user && (
          <View className="mx-4 mb-6">
            <Text className="text-lg font-semibold text-black mb-4">
              You are helping
            </Text>
            
            <View className="flex-row items-center bg-white border rounded-2xl border-gray-300 p-4 border-1 mb-4">
              <View className="relative">
                <View className="w-16 h-16 rounded-full overflow-hidden items-center justify-center">
                  {userProfile?.image_url ? (
                    <Image
                      source={{ uri: userProfile.image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-[#44A27B] items-center justify-center">
                      <Text className="text-white text-lg font-bold">
                        {getUserInitials(favor.user.full_name)}
                      </Text>
                    </View>
                  )}
                </View>
                {userProfile?.is_certified && (
                  <View className="absolute -top-1 -right-1">
                    <VerifiedIcon />
                  </View>
                )}
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold text-black mb-1">
                  {favor.user.full_name}
                </Text>
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-500 text-base font-medium">
                    ⭐ {(() => {
                      const newApiRating = userReviewStatisticsResponse?.data?.total?.average_rating;
                      const oldApiRating = userReviewsResponse?.data?.statistics?.average_rating;
                      
                      console.log('\n🌟 USER (REQUESTER) RATING DISPLAY DEBUG:');
                      console.log('📊 User Name:', favor.user.full_name);
                      console.log('📊 User ID:', favor.user.id);
                      console.log('🔄 API Responses:');
                      console.log('  - userReviewStatisticsResponse:', {
                        exists: !!userReviewStatisticsResponse,
                        loading: userReviewStatisticsLoading,
                        data: userReviewStatisticsResponse?.data,
                        rating: newApiRating,
                        count: userReviewStatisticsResponse?.data?.total?.count
                      });
                      console.log('  - userReviewsResponse (OLD API):', {
                        exists: !!userReviewsResponse,
                        loading: userReviewsLoading,
                        statistics: userReviewsResponse?.data?.statistics,
                        rating: oldApiRating,
                        count: userReviewsResponse?.data?.statistics?.total_reviews
                      });
                      console.log('🎯 FINAL USER RATING DISPLAYED:', newApiRating?.toFixed(1) || oldApiRating?.toFixed(1) || '0.0');
                      
                      return newApiRating?.toFixed(1) || oldApiRating?.toFixed(1) || '0.0';
                    })()}
                  </Text>
                  <Text className="text-gray-500 text-base ml-2">
                    | {(() => {
                      const newApiCount = userReviewStatisticsResponse?.data?.total?.count;
                      const oldApiCount = userReviewsResponse?.data?.statistics?.total_reviews;
                      
                      console.log('📊 USER (REQUESTER) COUNT DISPLAY DEBUG:');
                      console.log('  - New API count:', newApiCount);
                      console.log('  - Old API count:', oldApiCount);
                      console.log('🎯 FINAL USER COUNT DISPLAYED:', newApiCount || oldApiCount || 0);
                      
                      return newApiCount || oldApiCount || 0;
                    })()} Reviews
                  </Text>
                </View>
                <Text className="text-gray-500 text-base mb-2">2 Mins Away</Text>
                
                {/* Contact Information within profile card */}
                {userContact ? (
                  <View className="mt-2 mb-2">
                    {userContact.phone_no_call ? (
                      <Text className="text-gray-500 text-base">
                        📞 {userContact.phone_no_call}
                      </Text>
                    ) : (
                      <Text className="text-gray-400 text-sm">
                        📞 Call number not available
                      </Text>
                    )}
                    {userContact.phone_no_text ? (
                      <Text className="text-gray-500 text-base">
                        💬 {userContact.phone_no_text}
                      </Text>
                    ) : (
                      <Text className="text-gray-400 text-sm">
                        💬 Text number not available
                      </Text>
                    )}
                  </View>
                ) : (
                  <View className="mt-2 mb-2">
                    <Text className="text-gray-400 text-sm">
                      📞 Loading contact details...
                    </Text>
                  </View>
                )}

                <TouchableOpacity onPress={() => {
                  console.log('🔄 Navigating to UserProfileScreen from FavorDetailsScreen (inline):', {
                    userId: favor.user.id,
                    favorStatus: favor.status,
                    userType: 'requester',
                    userName: favor.user.full_name,
                    source: 'inline_view_profile'
                  });
                  navigation?.navigate('UserProfileScreen', { userId: favor.user.id, favorStatus: favor.status });
                }}>
                  <Text className="text-[#44A27B] text-base font-medium underline">View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Buttons - Only show if contact info is available */}
            {userContact && (userContact.phone_no_call || userContact.phone_no_text) && (
              <View className="flex-row space-x-3 mb-6">
                {userContact.phone_no_call && (
                  <TouchableOpacity 
                    className="flex-1 bg-transparent border border-black rounded-xl py-3"
                    onPress={() => handleCallNumber(userContact.phone_no_call!)}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Call: {userContact.phone_no_call}
                    </Text>
                  </TouchableOpacity>
                )}
                {userContact.phone_no_text && (
                  <TouchableOpacity 
                    className={`flex-1 bg-transparent border border-black rounded-xl py-3 ${userContact.phone_no_call ? 'ml-3' : ''}`}
                    onPress={() => handleTextNumber(userContact.phone_no_text!)}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Text: {userContact.phone_no_text}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Submit Review Button for provider mode */}
            {favor.status !== 'completed' && (
              <TouchableOpacity 
                className={`rounded-xl py-3 mb-4 ${isCompletingFavor ? 'bg-gray-400' : 'bg-[#44A27B]'}`}
                onPress={handleSubmitReview}
                disabled={isCompletingFavor}
              >
                {isCompletingFavor ? (
                  <View className="flex-row justify-center items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white text-center font-medium text-base ml-2">Completing...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-medium text-base">Submit Review</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Show accepted response details if available */}
        {favor.accepted_response && (
          <View className="mx-4 mb-6">
            <Text className="text-lg font-semibold text-black mb-4">
              Provided By
            </Text>
            
            <View className="flex-row items-center bg-white border rounded-2xl border-gray-300 p-4 border-1 mb-4">
              <View className="relative">
                <View className="w-16 h-16 rounded-full overflow-hidden items-center justify-center">
                  {(() => {
                    // Get the provider's image URL with priority: 
                    // 1. Use providerContact if name matches (more reliable for correct person)
                    // 2. Fall back to providerProfile if name matches
                    // 3. Use any available image as last resort
                    const expectedName = favor?.accepted_response?.user?.full_name;
                    
                    let providerImageUrl = null;
                    
                    // First, check if providerContact has the correct person
                    if (providerContact?.full_name === expectedName && providerContact?.image_url) {
                      providerImageUrl = providerContact.image_url;
                    }
                    // Then check if providerProfile has the correct person
                    else if (providerProfile?.full_name === expectedName && providerProfile?.image_url) {
                      providerImageUrl = providerProfile.image_url;
                    }
                    // Last resort: use any available image
                    else {
                      providerImageUrl = providerContact?.image_url || providerProfile?.image_url;
                    }
                    
                    const hasValidImage = providerImageUrl && providerImageUrl.trim() !== '' && !failedImages.has(providerImageUrl);
                    
                    console.log('🖼️ Provider Image Render Logic:', {
                      expectedProviderName: expectedName,
                      providerContactName: providerContact?.full_name,
                      providerProfileName: providerProfile?.full_name,
                      providerContactImageUrl: providerContact?.image_url,
                      providerProfileImageUrl: providerProfile?.image_url,
                      finalImageUrl: providerImageUrl,
                      hasValidImage,
                      isInFailedSet: providerImageUrl ? failedImages.has(providerImageUrl) : false
                    });

                    if (hasValidImage) {
                      return (
                        <Image
                          source={{ uri: providerImageUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                          onError={(error) => {
                            console.log('❌ Failed to load provider image:', providerImageUrl);
                            console.log('Error details:', error.nativeEvent?.error);
                            if (providerImageUrl) {
                              setFailedImages(prev => new Set(prev).add(providerImageUrl));
                            }
                          }}
                          onLoad={() => {
                            console.log('✅ Successfully loaded provider image for', expectedName, ':', providerImageUrl);
                          }}
                        />
                      );
                    } else {
                      return (
                        <View className="w-full h-full bg-[#44A27B] items-center justify-center">
                          <Text className="text-white text-lg font-bold">
                            {getUserInitials(expectedName || 'Provider')}
                          </Text>
                        </View>
                      );
                    }
                  })()}
                </View>
                {(providerProfile?.is_certified || providerContact?.is_certified) && (
                  <View className="absolute -top-1 -right-1">
                    <VerifiedIcon />
                  </View>
                )}
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold text-black mb-1">
                  {favor.accepted_response.user.full_name}
                </Text>
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-500 text-base font-medium">
                    ⭐ {(() => {
                      const newApiRating = providerReviewStatisticsResponse?.data?.total?.average_rating;
                      const oldApiRating = providerReviewsResponse?.data?.statistics?.average_rating;
                      const fallbackRating = providerProfile?.average_rating;
                      
                      console.log('\n🌟 PROVIDER RATING DISPLAY DEBUG:');
                      console.log('📊 Provider Name:', favor.accepted_response.user.full_name);
                      console.log('📊 Provider ID:', favor.accepted_response.user.id);
                      console.log('🔄 API Responses:');
                      console.log('  - providerReviewStatisticsResponse:', {
                        exists: !!providerReviewStatisticsResponse,
                        loading: providerReviewStatisticsLoading,
                        data: providerReviewStatisticsResponse?.data,
                        rating: newApiRating,
                        count: providerReviewStatisticsResponse?.data?.total?.count
                      });
                      console.log('  - providerReviewsResponse (OLD API):', {
                        exists: !!providerReviewsResponse,
                        loading: providerReviewsLoading,
                        statistics: providerReviewsResponse?.data?.statistics,
                        rating: oldApiRating,
                        count: providerReviewsResponse?.data?.statistics?.total_reviews
                      });
                      console.log('  - providerProfile fallback:', {
                        exists: !!providerProfile,
                        rating: fallbackRating,
                        count: providerProfile?.total_reviews
                      });
                      console.log('🎯 FINAL RATING DISPLAYED:', newApiRating?.toFixed(1) || oldApiRating?.toFixed(1) || fallbackRating?.toFixed(1) || '0.0');
                      
                      return newApiRating?.toFixed(1) || oldApiRating?.toFixed(1) || fallbackRating?.toFixed(1) || '0.0';
                    })()}
                  </Text>
                  <Text className="text-gray-500 text-base ml-2">
                    | {(() => {
                      const newApiCount = providerReviewStatisticsResponse?.data?.total?.count;
                      const oldApiCount = providerReviewsResponse?.data?.statistics?.total_reviews;
                      const fallbackCount = providerProfile?.total_reviews;
                      
                      console.log('📊 PROVIDER COUNT DISPLAY DEBUG:');
                      console.log('  - New API count:', newApiCount);
                      console.log('  - Old API count:', oldApiCount);
                      console.log('  - Fallback count:', fallbackCount);
                      console.log('🎯 FINAL COUNT DISPLAYED:', newApiCount || oldApiCount || fallbackCount || 0);
                      
                      return newApiCount || oldApiCount || fallbackCount || 0;
                    })()} Reviews
                  </Text>
                </View>
               
                
                {/* Contact Information within profile card */}
                {/* {providerContact ? (
                  <View className="mt-2 mb-2">
                    {providerContact.phone_no_call ? (
                      <Text className="text-gray-500 text-base">
                        📞 {providerContact.phone_no_call}
                      </Text>
                    ) : (
                      <Text className="text-gray-400 text-sm">
                        📞 Call number not available
                      </Text>
                    )}
                    {providerContact.phone_no_text ? (
                      <Text className="text-gray-500 text-base">
                        💬 {providerContact.phone_no_text}
                      </Text>
                    ) : (
                      <Text className="text-gray-400 text-sm">
                        💬 Text number not available
                      </Text>
                    )}
                  </View>
                ) : (
                  <View className="mt-2 mb-2">
                    <Text className="text-gray-400 text-sm">
                      📞 Loading contact details...
                    </Text>
                  </View>
                )} */}

                <TouchableOpacity onPress={() => {
                  console.log('🔄 Navigating to UserProfileScreen from FavorDetailsScreen (provider):', {
                    userId: favor.accepted_response?.user?.id || favor.user.id,
                    favorStatus: favor.status,
                    userType: favor.accepted_response?.user?.id ? 'provider' : 'requester',
                    userName: favor.accepted_response?.user?.full_name || favor.user.full_name,
                    source: 'provider_view_profile'
                  });
                  handleViewProfile();
                }}>
                  <Text className="text-[#44A27B] text-base font-medium underline">View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Buttons - Only show if contact info is available */}
            {providerContact && (providerContact.phone_no_call || providerContact.phone_no_text) && (
              <View className="flex-row space-x-3 mb-6">
                {providerContact.phone_no_call && (
                  <TouchableOpacity 
                    className={`flex-1 bg-transparent border border-black rounded-xl py-3 ${isCompletingFavor ? 'opacity-50' : ''}`}
                    onPress={() => handleCallNumber(providerContact.phone_no_call!)}
                    disabled={isCompletingFavor}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Call: {providerContact.phone_no_call}
                    </Text>
                  </TouchableOpacity>
                )}
                {providerContact.phone_no_text && (
                  <TouchableOpacity 
                    className={`flex-1 bg-transparent border border-black rounded-xl py-3 ${providerContact.phone_no_call ? 'ml-3' : ''} ${isCompletingFavor ? 'opacity-50' : ''}`}
                    onPress={() => handleTextNumber(providerContact.phone_no_text!)}
                    disabled={isCompletingFavor}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Text: {providerContact.phone_no_text}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Action buttons based on context - only show if favor is not completed */}
            {favor.status !== 'completed' && (
              <>
                {isRequestMode ? (
                  /* Buttons for request mode (CreateFavorScreen) */
                  <View className="flex-row space-x-2">
                    <TouchableOpacity 
                      className={`flex-1 bg-transparent border border-black rounded-xl py-3 mr-2 ${isCompletingFavor ? 'opacity-50' : ''}`}
                      onPress={handleCancelAndRepost}
                      disabled={isCompletingFavor}
                    >
                      <Text className="text-center text-gray-800 font-medium text-sm">Cancel & Repost</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className={`rounded-xl py-3 px-4 mr-2 ${isCompletingFavor ? 'bg-gray-400' : 'bg-[#44A27B]'}`}
                      onPress={handleSubmitReview}
                      disabled={isCompletingFavor}
                    >
                      {isCompletingFavor ? (
                        <View className="flex-row justify-center items-center">
                          <ActivityIndicator size="small" color="white" />
                          <Text className="text-white text-center font-medium text-sm ml-1">Completing...</Text>
                        </View>
                      ) : (
                        <Text className="text-white text-center font-medium text-sm">Mark as Completed</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className={`bg-transparent border border-black rounded-xl py-3 px-4 ${isCompletingFavor ? 'opacity-50' : ''}`}
                      onPress={handleCancelFavor}
                      disabled={isCompletingFavor}
                    >
                      <Text className="text-center text-gray-800 font-medium text-sm">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Button for provider mode (ProvideFavorScreen) */
                  <TouchableOpacity 
                    className={`rounded-xl py-3 mb-4 ${isCompletingFavor ? 'bg-gray-400' : 'bg-[#44A27B]'}`}
                    onPress={handleSubmitReview}
                    disabled={isCompletingFavor}
                  >
                    {isCompletingFavor ? (
                      <View className="flex-row justify-center items-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white text-center font-medium text-base ml-2">Completing...</Text>
                      </View>
                    ) : (
                      <Text className="text-white text-center font-medium text-base">Mark as Completed</Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Reviews Section */}
        {reviewsResponse?.data?.reviews && reviewsResponse.data.reviews.length > 0 && (
          <View className="mx-4 mb-6">
            <Text className="text-lg font-semibold text-black mb-4">
              Reviews ({reviewsResponse.data.reviews.length})
            </Text>
            
            {reviewsResponse.data.reviews.map((review, index) => (
              <View key={index} className="bg-white rounded-2xl p-4 mb-3 border border-gray-300">
                {/* Reviewer Info */}
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-[#44A27B] rounded-full overflow-hidden items-center justify-center">
                    {review.given_by?.image_url && 
                     review.given_by.image_url.trim() !== '' && 
                     !failedImages.has(review.given_by.image_url) ? (
                      <Image
                        source={{ 
                          uri: review.given_by.image_url,
                          cache: 'force-cache'
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                        onError={(error) => {
                          console.log('❌ Failed to load review image for', review.given_by?.full_name, ':', review.given_by.image_url);
                          console.log('Error details:', error.nativeEvent?.error);
                          if (review.given_by?.image_url) {
                            setFailedImages(prev => new Set(prev).add(review.given_by.image_url!));
                          }
                        }}
                        onLoad={() => {
                          console.log('✅ Successfully loaded review image for', review.given_by?.full_name);
                        }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Text className="text-white font-bold text-sm">
                        {review.given_by?.full_name 
                          ? review.given_by.full_name.split(' ').map(name => name[0]).join('').toUpperCase()
                          : 'A'
                        }
                      </Text>
                    )}
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold text-gray-800">
                      {review.given_by?.full_name || 'Anonymous'}
                    </Text>
                    <View className="flex-row items-center">
                      {/* Star Rating */}
                      <View className="flex-row mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Text key={star} className="text-yellow-400 text-sm">
                            {review.rating >= star ? '★' : '☆'}
                          </Text>
                        ))}
                      </View>
                      <Text className="text-gray-500 text-sm">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Review Text */}
                {review.description && (
                  <Text className="text-gray-700 text-base leading-5 mb-2">
                    {review.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
              Are you sure you want to cancel this Favor request to help {favor.user.full_name}?
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

      {/* Submit Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={handleReviewModalClose}
      >
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View className="flex-1 bg-black/50   justify-center items-center">
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="bg-[#FBFFF0] rounded-3xl  w-screen max-w-[95%] border-4 border-[#71DFB1] my-4">
                <View className="p-6 relative">
                {/* Close Button */}
                <TouchableOpacity 
                  className={`absolute top-4 right-4 w-6 h-6 bg-black rounded-full items-center justify-center z-10 ${isSubmittingReview ? 'opacity-50' : ''}`}
                  onPress={handleReviewModalClose}
                  disabled={isSubmittingReview}
                >
                  <Text className="text-white font-bold text-base">×</Text>
                </TouchableOpacity>

                {/* Modal Title */}
                <Text className="text-gray-800 text-lg font-semibold text-center mb-6 mt-4">
                  Give "{favor.accepted_response?.user?.full_name || 'Provider'}" Feedback
                </Text>

                {/* Star Rating */}
                <View className="mb-4">
                 
                  <View className="flex-row justify-center mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          if (isSubmittingReview) return;
                          if (rating === star) {
                            // If clicking on the same star, decrease by 1
                            setRating(star - 1);
                          } else {
                            // If clicking on a different star, set to that rating
                            setRating(star);
                          }
                        }}
                        className={`mx-1 ${isSubmittingReview ? 'opacity-50' : ''}`}
                        disabled={isSubmittingReview}
                      >
                        <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <Path
                            d="M14 2L17.09 8.26L24 9.27L19 14.14L20.18 21.02L14 17.77L7.82 21.02L9 14.14L4 9.27L10.91 8.26L14 2Z"
                            fill={rating >= star ? "#FCD34D" : "none"}
                            stroke="#D1D5DB"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Review Text Input */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-700 text-base font-medium">Write Review *</Text>
                    <Text className={`text-sm ${
                      reviewText.length > 200 ? 'text-red-500' : 
                      reviewText.length > 180 ? 'text-yellow-500' : 'text-gray-500'
                    }`}>
                      {reviewText.length}/200
                    </Text>
                  </View>
                  <TextInput
                    className={`border rounded-xl p-4 h-24 text-base ${
                      reviewText.length > 200 ? 'border-red-500' : 'border-gray-300'
                    } ${isSubmittingReview ? 'opacity-50 bg-gray-100' : ''}`}
                    placeholder="Share your experience..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    value={reviewText}
                    onChangeText={setReviewText}
                    editable={!isSubmittingReview}
                    maxLength={250} // Allow slight overage for better UX
                  />
                  {reviewText.length > 200 && (
                    <Text className="text-red-500 text-sm mt-1">
                      Review exceeds 200 character limit
                    </Text>
                  )}
                </View>

            {/* Tip Option */}
            <View className="mb-6">
              <TouchableOpacity 
                className={`flex-row items-center mb-3 ${isSubmittingReview ? 'opacity-50' : ''}`}
                onPress={() => !isSubmittingReview && setShowTipOption(!showTipOption)}
                disabled={isSubmittingReview}
              >
                <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${showTipOption ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                  {showTipOption && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </View>
                <Text className="text-gray-700 text-base">Add tip (optional)</Text>
              </TouchableOpacity>
              
              {showTipOption && (
                <View className="ml-8">
                  <Text className="text-gray-600 text-sm mb-2">Tip amount ($)</Text>
                  <TextInput
                    className={`border border-gray-300 rounded-xl p-3 text-base ${isSubmittingReview ? 'opacity-50 bg-gray-100' : ''}`}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={tipAmount}
                    onChangeText={setTipAmount}
                    keyboardType="decimal-pad"
                    editable={!isSubmittingReview}
                  />
                </View>
              )}
            </View>

                {/* Submit Button */}
                <TouchableOpacity 
                  className={`rounded-full py-4 ${isSubmittingReview || rating === 0 || !reviewText.trim() || reviewText.length > 200 ? 'bg-gray-400' : 'bg-green-500'}`}
                  onPress={handleReviewSubmit}
                  disabled={isSubmittingReview || rating === 0 || !reviewText.trim() || reviewText.length > 200}
                >
                  {isSubmittingReview ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white text-center font-semibold text-lg ml-2">Submitting...</Text>
                    </View>
                  ) : (
                    <Text className="text-white text-center font-semibold text-lg">Submit Review</Text>
                  )}
                </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* User Profile Modal */}
      <Modal
        visible={showUserProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserProfileModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-[#44A27B] relative">
            {/* Close Button */}
            <TouchableOpacity 
              className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full items-center justify-center z-10"
              onPress={() => setShowUserProfileModal(false)}
            >
              <Text className="text-white font-bold text-lg">×</Text>
            </TouchableOpacity>

            {userProfileLoading || providerProfileLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#44A27B" />
                <Text className="text-gray-600 mt-2">Loading profile...</Text>
              </View>
            ) : (favor.accepted_response && providerProfile) ? (
              <>
                {/* Profile Photo */}
                <View className="items-center mb-6 mt-4">
                  <View className="w-20 h-20 rounded-2xl overflow-hidden">
                    <Image
                      source={{ uri: providerProfile.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                </View>

                {/* Name */}
                <Text className="text-xl font-bold text-gray-800 text-center mb-6">
                  {providerProfile.full_name}
                </Text>

                {/* Provider Details */}
                <View className="mb-6">
                  {providerProfile.has_contact_info && providerProfile.email && (
                    <View className="mb-3">
                      <Text className="text-gray-700 text-base">
                        Email : <Text className="text-gray-500">{providerProfile.email}</Text>
                      </Text>
                    </View>
                  )}

                  {providerProfile.age && (
                    <View className="mb-3">
                      <Text className="text-gray-700 text-base">
                        Age : <Text className="font-semibold">{providerProfile.age}</Text>
                      </Text>
                    </View>
                  )}

                  {providerContact && providerContact.phone_no_call && (
                    <View className="mb-3">
                      <Text className="text-gray-700 text-base">
                        Call : <Text className="text-gray-500">{providerContact.phone_no_call}</Text>
                      </Text>
                    </View>
                  )}

                  {providerContact && providerContact.phone_no_text && (
                    <View className="mb-3">
                      <Text className="text-gray-700 text-base">
                        Text : <Text className="text-gray-500">{providerContact.phone_no_text}</Text>
                      </Text>
                    </View>
                  )}

                  {providerProfile.member_since && (
                    <View className="mb-3">
                      <Text className="text-gray-700 text-base">
                        Since : <Text className="text-gray-500">{providerProfile.member_since}</Text>
                      </Text>
                    </View>
                  )}

                  {providerProfile.years_of_experience && (
                    <View className="mb-3">
                      <Text className="text-gray-700 text-base">
                        Experience : <Text className="font-semibold">{providerProfile.years_of_experience} years</Text>
                      </Text>
                    </View>
                  )}

                  <View className="mb-3">
                    <Text className="text-gray-700 text-base">
                      Rating : <Text className="font-semibold">⭐ {(() => {
                        const newApiRating = providerReviewStatisticsResponse?.data?.total?.average_rating;
                        const newApiCount = providerReviewStatisticsResponse?.data?.total?.count;
                        const oldApiRating = providerReviewsResponse?.data?.statistics?.average_rating;
                        const oldApiCount = providerReviewsResponse?.data?.statistics?.total_reviews;
                        const fallbackRating = providerProfile.average_rating;
                        const fallbackCount = providerProfile.total_reviews;
                        
                        const finalRating = newApiRating || oldApiRating || fallbackRating;
                        const finalCount = newApiCount || oldApiCount || fallbackCount;
                        
                        console.log(`🔍 Provider Rating modal section - New API: ${newApiRating}/${newApiCount}, Old API: ${oldApiRating}/${oldApiCount}, Fallback: ${fallbackRating}/${fallbackCount}, Final: ${finalRating}/${finalCount}`);
                        
                        return `${finalRating} (${finalCount} reviews)`;
                      })()}</Text>
                    </Text>
                  </View>

                  <View className="mb-3">
                    <Text className="text-gray-700 text-base">
                      Completed : <Text className="font-semibold">{providerProfile.favor_history.completed_favors_count} favors ({providerProfile.favor_history.total_hours} hours)</Text>
                    </Text>
                  </View>

                  {providerProfile.about_me && (
                    <View className="mb-3">
                      <Text className="text-gray-700 text-base">
                        About : <Text className="text-gray-500">{providerProfile.about_me}</Text>
                      </Text>
                    </View>
                  )}
                </View>

                {/* Call and Text Buttons - Only show if contact info is available */}
                {providerContact && (providerContact.phone_no_call || providerContact.phone_no_text) && (
                  <View className="flex-row space-x-4">
                    {providerContact.phone_no_call && (
                      <TouchableOpacity 
                        className="flex-1 bg-[#44A27B] rounded-xl py-3"
                        onPress={() => {
                          handleCallNumber(providerContact.phone_no_call!);
                          setShowUserProfileModal(false);
                        }}
                      >
                        <Text className="text-white text-center font-semibold">Call</Text>
                      </TouchableOpacity>
                    )}
                    {providerContact.phone_no_text && (
                      <TouchableOpacity 
                        className="flex-1 border-2 border-[#44A27B] rounded-xl py-3"
                        onPress={() => {
                          handleTextNumber(providerContact.phone_no_text!);
                          setShowUserProfileModal(false);
                        }}
                      >
                        <Text className="text-[#44A27B] text-center font-semibold">Text</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            ) : (
              <View className="items-center py-8">
                <Text className="text-gray-600 text-center">Failed to load user profile</Text>
                <TouchableOpacity 
                  className="bg-[#44A27B] rounded-xl py-2 px-4 mt-4"
                  onPress={() => setShowUserProfileModal(false)}
                >
                  <Text className="text-white font-medium">Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}