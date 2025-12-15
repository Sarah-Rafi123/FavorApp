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
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';
import CancelSvg from '../../assets/icons/Cancel';
import UserSvg from '../../assets/icons/User';
import { useFavor, useFavorReviews } from '../../services/queries/FavorQueries';
import { usePublicUserProfileQuery, useUserReviewStatisticsQuery } from '../../services/queries/ProfileQueries';
import { useDeleteFavor, useCompleteFavor, useCreateUserReview, useCancelRequest } from '../../services/mutations/FavorMutations';
import { Favor } from '../../services/apis/FavorApis';
import { PublicUserProfile } from '../../services/apis/ProfileApis';
import { Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../store/useAuthStore';

interface ProvideFavorDetailsScreenProps {
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

export function ProvideFavorDetailsScreen({ navigation, route }: ProvideFavorDetailsScreenProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showTipOption, setShowTipOption] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Get favor ID from route params
  const favorId = route?.params?.favorId || route?.params?.favor?.id;
  const isHistoryView = route?.params?.isHistoryView || false; // Flag to indicate viewing from history tab
  
  // Debug token status on screen load
  React.useEffect(() => {
    const checkTokenOnLoad = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        console.log('🔥 DEBUGGING: ProvideFavorDetailsScreen loaded');
        console.log('🔑 Auth token status on screen load:', token ? `Present (${token.substring(0, 20)}...)` : 'MISSING');
        console.log('🎯 Favor ID from params:', favorId);
        
        if (!token) {
          console.error('🚨 NO AUTH TOKEN FOUND ON SCREEN LOAD!');
          console.error('🔐 This could be why APIs are failing');
        }
      } catch (error) {
        console.error('❌ Failed to check token on screen load:', error);
      }
    };
    
    checkTokenOnLoad();
  }, [favorId]);
  // Fetch favor data using the API
  const { data: favorResponse, isLoading, error, refetch: refetchFavor } = useFavor(favorId, {
    enabled: !!favorId
  });

  // Fetch favor reviews
  const { data: reviewsResponse, isLoading: reviewsLoading, refetch: refetchReviews } = useFavorReviews(favorId, {
    enabled: !!favorId
  });

  // Fetch user profile data for the requester
  const { data: userProfileResponse, isLoading: userProfileLoading, refetch: refetchUserProfile } = usePublicUserProfileQuery(
    favorResponse?.data.favor?.user?.id || null,
    { enabled: !!favorResponse?.data.favor?.user?.id }
  );

  // Fetch user review statistics for the requester
  const { data: reviewStatisticsResponse, isLoading: reviewStatisticsLoading, refetch: refetchReviewStatistics } = useUserReviewStatisticsQuery(
    favorResponse?.data.favor?.user?.id || null,
    { enabled: !!favorResponse?.data.favor?.user?.id }
  );

  // Mutations
  const deleteFavorMutation = useDeleteFavor();
  const completeFavorMutation = useCompleteFavor();
  const createUserReviewMutation = useCreateUserReview();
  const cancelRequestMutation = useCancelRequest();

  // Debug logging for reviews data
  React.useEffect(() => {
    if (reviewsResponse?.data?.reviews) {
      console.log('📊 ProvideFavorDetailsScreen Reviews Response:');
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

  // Debug logging for review statistics
  React.useEffect(() => {
    if (reviewStatisticsResponse?.data) {
      console.log('📈 ProvideFavorDetailsScreen Review Statistics Response:');
      console.log('  - User:', reviewStatisticsResponse.data.user);
      console.log('  - Reviews as provider:', reviewStatisticsResponse.data.reviews_as_provider);
      console.log('  - Reviews as requester:', reviewStatisticsResponse.data.reviews_as_requester);
      console.log('  - Total:', reviewStatisticsResponse.data.total);
      console.log('  - Total count displayed:', reviewStatisticsResponse.data.total.count);
      console.log('  - Average rating displayed:', reviewStatisticsResponse.data.total.average_rating?.toFixed(1));
    }
  }, [reviewStatisticsResponse]);

  const favor = favorResponse?.data.favor;
  const userProfile = userProfileResponse?.data.user;
  const currentUser = useAuthStore((state) => state.user);

  // Debug: Log contact details availability
  React.useEffect(() => {
    if (favor && userProfile) {
      console.log('🔍 ProvideFavorDetailsScreen Debug:');
      console.log('📞 User Profile ID:', userProfile.id);
      console.log('📞 User Profile Full Name:', userProfile.full_name);
      console.log('📞 Phone Call:', userProfile.phone_no_call);
      console.log('📞 Phone Text:', userProfile.phone_no_text);
      console.log('📊 Favor Status:', favor.status);
      console.log('🎯 Should Show Contact:', 
        !!(userProfile?.phone_no_call || userProfile?.phone_no_text) && favor.status === 'in-progress'
      );
      console.log('📋 All User Profile Fields:', Object.keys(userProfile));
    }
  }, [favor, userProfile]);

  // Check if current user has already reviewed this favor
  const userHasReviewed = React.useMemo(() => {
    if (!reviewsResponse?.data?.reviews || !currentUser?.id) return false;
    return reviewsResponse.data.reviews.some(review => 
      review.given_by?.id === currentUser.id
    );
  }, [reviewsResponse, currentUser]);

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

  const handleSubmitReview = async () => {
    if (!favor) return;

    console.log('🔥 DEBUGGING: Submit Review button clicked');
    console.log('📊 Favor status:', favor.status);
    console.log('👤 Current user role: Provider');
    console.log('👥 Favor requester:', favor.user.full_name, '(ID:', favor.user.id + ')');
    console.log('📚 Is history view:', isHistoryView);
    console.log('✅ User has already reviewed:', userHasReviewed);

    // Check if favor is already completed
    if (favor.status === 'completed') {
      console.log('✅ Favor is already completed, showing review modal directly');
      setShowReviewModal(true);
      return;
    }

    // If favor is not completed, try to complete it first
    try {
      console.log('🎯 Favor not yet completed, marking as completed first:', favor.id);
      
      // Check auth token before making the API call
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔑 Auth token status before completeFavor:', token ? `Present (${token.substring(0, 20)}...)` : 'MISSING');
      
      if (!token) {
        console.error('🚨 NO AUTH TOKEN FOUND BEFORE COMPLETE FAVOR API CALL!');
        console.error('🔐 This is the source of the session expiration');
        return;
      }
      
      console.log('🚀 About to call completeFavorMutation.mutateAsync...');
      
      const completionResult = await completeFavorMutation.mutateAsync(favor.id);
      
      console.log('🎉 completeFavorMutation completed successfully!');
      console.log('📄 Completion Result:', JSON.stringify(completionResult, null, 2));
      
      // Show review modal after successful completion
      setShowReviewModal(true);
      
      console.log('✅ Favor marked as completed successfully, review modal shown');
    } catch (error: any) {
      console.error('❌ Complete favor failed in handleSubmitReview');
      console.error('📄 Error details:', error);
      console.error('📊 Error message:', error.message);
      console.error('📋 Error name:', error.name);
      console.error('📚 Error stack:', error.stack);
      
      // Check if it's a session expiration (401 error)
      if (error.message && error.message.includes('Authentication required')) {
        console.error('🔐 SESSION EXPIRATION DETECTED!');
        console.error('🚨 Session expired during COMPLETE FAVOR step');
      }
      
      // Error handling is done by the mutation's onError callback
    }
  };

  const handleReviewSubmit = async () => {
    console.log('\n🔥🔥🔥 === USER REVIEW SUBMISSION DEBUG START ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🎯 Function: handleReviewSubmit()');
    console.log('📍 Location: ProvideFavorDetailsScreen.tsx');
    
    // Enhanced validation
    if (!favor || rating === 0 || !reviewText.trim() || isSubmittingReview) {
      console.log('❌ Validation failed:');
      console.log('  - Favor exists:', !!favor);
      console.log('  - Rating provided:', rating);
      console.log('  - Review text provided:', !!reviewText.trim());
      console.log('  - Review text length:', reviewText.trim().length);
      
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
      console.log('\n🔐 === AUTHENTICATION CHECK ===');
      
      // Check auth token before making the API call
      const token = await AsyncStorage.getItem('auth_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      console.log('🔑 Auth token status:', token ? `Present (length: ${token.length}, preview: ${token.substring(0, 20)}...)` : '❌ MISSING');
      console.log('🔄 Refresh token status:', refreshToken ? `Present (length: ${refreshToken.length})` : '❌ MISSING');
      
      if (!token) {
        console.error('\n🚨🚨🚨 CRITICAL ERROR: NO AUTH TOKEN FOUND!');
        console.error('🔐 This will cause 401 Unauthorized error');
        console.error('🚨 User needs to log in again');
        return;
      }
      
      console.log('\n📊 === FAVOR & USER DATA ===');
      console.log('🎯 Favor ID:', favor.id);
      console.log('📋 Favor Title:', favor.title || 'No title');
      console.log('📍 Favor Status:', favor.status);
      console.log('👤 Favor Requester (being reviewed):');
      console.log('  - ID:', favor.user.id);
      console.log('  - Name:', favor.user.full_name);
      console.log('  - Email:', favor.user.email);
      console.log('🏢 Current User Role: PROVIDER (giving review TO requester)');
      
      console.log('\n📝 === REVIEW DATA ===');
      console.log('⭐ Rating:', rating, '(out of 5)');
      console.log('📝 Description length:', reviewText.trim().length, 'characters');
      console.log('📝 Description preview:', `"${reviewText.trim().substring(0, 50)}${reviewText.trim().length > 50 ? '...' : ''}"`);
      console.log('👥 Given to ID (requester):', favor.user.id);
      
      const reviewData = {
        rating,
        description: reviewText.trim(),
        given_to_id: favor.user.id // Provider reviewing the requester
      };

      console.log('\n📦 === API REQUEST PAYLOAD ===');
      console.log('🌐 Full API URL: POST https://api.favorapp.net/api/v1/favors/' + favor.id + '/user_review');
      console.log('📍 Relative Endpoint: POST /favors/' + favor.id + '/user_review');
      console.log('🏗️ Base URL: https://api.favorapp.net/api/v1 (from axiosInstance)');
      console.log('📤 Request Headers will include Authorization: Bearer ' + (token ? token.substring(0, 20) + '...' : 'NO_TOKEN'));
      console.log('📤 Complete Request Body:');
      console.log(JSON.stringify({
        favorId: favor.id,
        data: reviewData
      }, null, 2));
      console.log('📋 Raw Request Data Object:');
      console.log('  - favorId (number):', favor.id, typeof favor.id);
      console.log('  - data.rating (number):', reviewData.rating, typeof reviewData.rating);
      console.log('  - data.description (string):', reviewData.description, typeof reviewData.description);
      console.log('  - data.given_to_id (number):', reviewData.given_to_id, typeof reviewData.given_to_id);
      console.log('📊 Data Validation:');
      console.log('  - Rating range valid:', reviewData.rating >= 1 && reviewData.rating <= 5);
      console.log('  - Description not empty:', reviewData.description.length > 0);
      console.log('  - given_to_id is valid number:', !isNaN(reviewData.given_to_id));
      
      console.log('\n🚀 === MAKING API CALL ===');
      console.log('⏰ API call started at:', new Date().toISOString());
      console.log('🔗 Function: createUserReviewMutation.mutateAsync()');
      console.log('📡 API Handler: FavorApis.createUserReview()');
      console.log('🎯 About to call:', 'POST /favors/' + favor.id + '/user_review');
      console.log('⚡ Pre-flight check - Token exists:', !!token);
      
      const result = await createUserReviewMutation.mutateAsync({
        favorId: favor.id,
        data: reviewData
      });
      
      console.log('🎊 API call returned successfully without throwing!');
      
      console.log('\n🎉🎉🎉 === API CALL SUCCESS ===');
      console.log('⏰ API call completed at:', new Date().toISOString());
      console.log('📄 Response Status: SUCCESS');
      console.log('📋 Full API Response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result?.data?.review) {
        console.log('\n📊 === REVIEW DETAILS ===');
        console.log('🆔 Review ID:', result.data.review.id);
        console.log('⭐ Rating recorded:', result.data.review.rating);
        console.log('📝 Description recorded:', result.data.review.description);
        console.log('👤 Given by:', result.data.review.given_by?.full_name);
        console.log('👥 Given to:', result.data.review.given_to?.full_name);
        console.log('📅 Created at:', result.data.review.created_at);
      }
      
      console.log('\n🧹 === CLEANUP & NAVIGATION ===');
      console.log('🔄 Resetting form state...');
      
      // Reset form and close modal
      setShowReviewModal(false);
      setRating(0);
      setReviewText('');
      setShowTipOption(false);
      setTipAmount('');
      
      console.log('🏠 Navigating back to previous screen...');
      // Navigate back after successful review
      navigation?.goBack();
      
      console.log('✅ === USER REVIEW SUBMISSION COMPLETED SUCCESSFULLY ===\n');
    } catch (error: any) {
      console.log('\n❌❌❌ === API CALL FAILED ===');
      console.error('⏰ Error occurred at:', new Date().toISOString());
      console.error('📍 Error location: handleReviewSubmit() catch block');
      console.error('📄 Error object type:', typeof error);
      console.error('📋 Error details:');
      console.error('  - Name:', error.name);
      console.error('  - Message:', error.message);
      console.error('  - Stack trace:', error.stack);
      
      if (error.response) {
        console.error('\n🌐 === HTTP ERROR RESPONSE ===');
        console.error('📊 Status Code:', error.response.status);
        console.error('📊 Status Text:', error.response.statusText);
        console.error('📋 Response Headers:', JSON.stringify(error.response.headers, null, 2));
        console.error('📄 Response Data:', JSON.stringify(error.response.data, null, 2));
      }
      
      if (error.request) {
        console.error('\n📡 === REQUEST ERROR ===');
        console.error('📤 Request that failed:', error.request);
      }
      
      if (error.config) {
        console.error('\n⚙️ === REQUEST CONFIG ===');
        console.error('🔗 URL:', error.config.url);
        console.error('📝 Method:', error.config.method);
        console.error('🔑 Headers:', JSON.stringify(error.config.headers, null, 2));
      }
      
      // Check if it's a session expiration (401 error)
      if (error.response?.status === 401 || error.message?.includes('Authentication required')) {
        console.error('\n🔐🔐🔐 === SESSION EXPIRATION DETECTED ===');
        console.error('🚨 401 Unauthorized - Session expired during review submission');
        console.error('💡 User will be logged out automatically');
        console.error('🔄 Token was cleared by axios interceptor');
        console.error('📱 App should redirect to login screen shortly');
        
        // Check if token was actually cleared
        const postErrorToken = await AsyncStorage.getItem('auth_token');
        console.error('🔍 Post-error token check:', postErrorToken ? 'Still present!' : 'Cleared as expected');
      }
      
      console.error('\n❌ === USER REVIEW SUBMISSION FAILED ===\n');
      // Error handling is done by the mutation's onError callback
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setRating(0);
    setReviewText('');
    setShowTipOption(false);
    setTipAmount('');
  };

  const handleCancelFavor = async () => {
    if (!favor) return;

    Alert.alert(
      'Cancel Favor',
      `Are you sure you want to cancel this favor request? This action cannot be undone.`,
      [
        { text: 'Keep Request', style: 'cancel' },
        { 
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚫 Canceling favor request:', favor.id);
              await cancelRequestMutation.mutateAsync(favor.id);
              console.log('✅ Favor request cancelled successfully');
              
              // Navigate back after successful cancellation
              navigation?.goBack();
            } catch (error: any) {
              console.error('❌ Cancel favor request failed:', error);
              // Error handling is done by the mutation's onError callback
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchFavor(),
        refetchReviews(),
        refetchUserProfile(),
        refetchReviewStatistics()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
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
            className="mr-4"
            onPress={handleGoBack}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#44A27B']}
            tintColor="#44A27B"
          />
        }
      >
        {/* Favor Details Card */}
        <View className="mx-4 mb-6 bg-transparent rounded-3xl p-6 border-4 border-[#71DFB1]">
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
                  <Text className="text-gray-700 text-base flex-1">Paid Favor</Text>
                </View>

                <View className="flex-row">
                  <Text className="text-gray-700 text-base w-20">Favor Amount</Text>
                  <Text className="text-gray-700 text-base mr-2">:</Text>
                  <Text className="text-gray-800 text-base flex-1">
                    ${parseFloat((favor.tip || 0).toString()).toFixed(2)}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="text-gray-700 text-base w-20">Total</Text>
                  <Text className="text-gray-700 text-base mr-2">:</Text>
                  <Text className="text-gray-700 text-base flex-1">
                    ${parseFloat((favor.tip || 0).toString()).toFixed(2)}
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

          {/* Cancel Favor Button - Show inside details card for pending or in-progress status */}
          {(favor.status === 'pending' || favor.status === 'in-progress') && (
            <TouchableOpacity 
              className="bg-green-500 rounded-full py-3 mt-4"
              onPress={handleCancelFavor}
            >
              <Text className="text-white text-center font-medium text-base">
                $0 | Cancel Favor
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Show requester information - "You helped" section */}
        {favor.user && (
          <View className="mx-4 mb-6">
            <Text className="text-lg font-semibold text-black mb-4">
              You are helping
            </Text>
            
            <View className="flex-row items-center bg-transparent border rounded-2xl border-gray-300 p-4 border-1 mb-4">
              <View className="relative">
                <View className="w-20 h-16 bg-[#44A27B] rounded-xl overflow-hidden items-center justify-center">
                  {userProfile?.image_url ? (
                    <Image
                      source={{ uri: userProfile.image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-white font-semibold text-lg">
                      {favor.user?.full_name 
                        ? favor.user.full_name
                          .split(' ')
                          .map(name => name.charAt(0).toUpperCase())
                          .join('')
                          .substring(0, 2)
                        : 'U'
                      }
                    </Text>
                  )}
                </View>
                {userProfile?.is_certified && (
                  <View className="absolute -top-1 -right-1">
                    <VerifiedIcon />
                  </View>
                )}
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-black">
                  {favor.user.full_name}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 text-sm">
                    ⭐ {reviewStatisticsResponse?.data?.total?.average_rating?.toFixed(1) || '0.0'} | {reviewStatisticsResponse?.data?.total?.count || 0} Reviews
                  </Text>
                </View>
                {userProfile?.years_of_experience && (
                  <Text className="text-gray-600 text-sm">{userProfile.years_of_experience} years experience</Text>
                )}
                
                <TouchableOpacity onPress={() => navigation?.navigate('UserProfileScreen', { userId: favor.user.id, favorStatus: favor.status })}>
                  <Text className="text-[#44A27B] text-sm font-medium">View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Details - Show for in_progress status */}
            {favor.status === 'in-progress' && userProfile && (
              <View className="mx-4 mb-4">
                <View className="flex-row">
                  {userProfile.phone_no_call && (
                    <TouchableOpacity 
                      className="flex-1 bg-transparent border border-gray-400 rounded-xl py-3 px-4 mr-2"
                      onPress={() => handleCallNumber(userProfile.phone_no_call)}
                    >
                      <Text className="text-gray-800 text-center font-medium text-sm">
                        Call: {userProfile.phone_no_call}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {userProfile.phone_no_text && (
                    <TouchableOpacity 
                      className="flex-1 bg-transparent border border-gray-400 rounded-xl py-3 px-4"
                      onPress={() => handleTextNumber(userProfile.phone_no_text)}
                    >
                      <Text className="text-gray-800 text-center font-medium text-sm">
                        Text: {userProfile.phone_no_text}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {(!userProfile.phone_no_call && !userProfile.phone_no_text) && (
                  <View className="mt-1">
                    <Text className="text-gray-500 text-sm italic text-center">
                      Contact details not available
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Submit Review Button */}
            {favor.status === 'completed' && !userHasReviewed && (
              <TouchableOpacity 
                className={`rounded-xl py-3 mb-4 ${isSubmittingReview ? 'bg-gray-400' : 'bg-[#44A27B]'}`}
                onPress={handleSubmitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <View className="flex-row justify-center items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white text-center font-medium text-base ml-2">Loading...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-medium text-base">Submit Review</Text>
                )}
              </TouchableOpacity>
            )}
            
            {/* Review Status Message */}
            {favor.status === 'completed' && userHasReviewed && (
              <View className="bg-gray-100 rounded-xl py-3 mb-4">
                <Text className="text-gray-600 text-center font-medium text-base">✓ You have already reviewed this favor</Text>
              </View>
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
              <View key={index} className="bg-transparent rounded-2xl p-4 mb-3 border border-gray-300">
                {/* Reviewer Info */}
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-[#44A27B] rounded-full overflow-hidden items-center justify-center">
                    {review.given_by?.image_url && 
                     review.given_by.image_url.trim() !== '' && 
                     !failedImages.has(review.given_by.image_url) ? (
                      <Image
                        source={{ 
                          uri: review.given_by.image_url
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
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={handleReviewModalClose}
      >
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="bg-[#FBFFF0] rounded-3xl p-6 w-screen max-w-[95%] border-4 border-[#71DFB1] relative m-4">
                <TouchableOpacity 
                  className="absolute top-4 right-4 w-6 h-6 bg-black rounded-full items-center justify-center z-10"
                  onPress={handleReviewModalClose}
                >
                  <Text className="text-white font-bold text-base">×</Text>
                </TouchableOpacity>
                <Text className="text-gray-800 text-lg font-semibold text-center mb-6 mt-4">
                  Give "{favor.user.full_name}" Feedback
                </Text>

                {/* Star Rating */}
                <View className="mb-4">
                
                  <View className="flex-row justify-center mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          if (rating === star) {
                            // If clicking on the same star, decrease by 1
                            setRating(star - 1);
                          } else {
                            // If clicking on a different star, set to that rating
                            setRating(star);
                          }
                        }}
                        className="mx-1"
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
                }`}
                placeholder="Share your experience..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={reviewText}
                onChangeText={setReviewText}
                maxLength={250}
              />
              {reviewText.length > 200 && (
                <Text className="text-red-500 text-sm mt-1">
                  Review exceeds 200 character limit
                </Text>
              )}
            </View>
                <TouchableOpacity 
                  className={`rounded-full py-4 mt-6 ${isSubmittingReview || rating === 0 || !reviewText.trim() || reviewText.length > 200 ? 'bg-gray-400' : 'bg-green-500'}`}
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}