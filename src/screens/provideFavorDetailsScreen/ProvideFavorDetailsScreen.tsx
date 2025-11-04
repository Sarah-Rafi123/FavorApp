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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';
import CancelSvg from '../../assets/icons/Cancel';
import UserSvg from '../../assets/icons/User';
import { useFavor, useFavorReviews } from '../../services/queries/FavorQueries';
import { usePublicUserProfileQuery } from '../../services/queries/ProfileQueries';
import { useDeleteFavor, useCompleteFavor, useCreateUserReview } from '../../services/mutations/FavorMutations';
import { Favor } from '../../services/apis/FavorApis';
import { PublicUserProfile } from '../../services/apis/ProfileApis';
import { Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Get favor ID from route params
  const favorId = route?.params?.favorId || route?.params?.favor?.id;
  
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
  const { data: favorResponse, isLoading, error } = useFavor(favorId, {
    enabled: !!favorId
  });

  // Fetch favor reviews
  const { data: reviewsResponse, isLoading: reviewsLoading } = useFavorReviews(favorId, {
    enabled: !!favorId
  });

  // Fetch user profile data for the requester
  const { data: userProfileResponse, isLoading: userProfileLoading } = usePublicUserProfileQuery(
    favorResponse?.data.favor?.user?.id || null,
    { enabled: !!favorResponse?.data.favor?.user?.id }
  );

  // Mutations
  const deleteFavorMutation = useDeleteFavor();
  const completeFavorMutation = useCompleteFavor();
  const createUserReviewMutation = useCreateUserReview();

  const favor = favorResponse?.data.favor;
  const userProfile = userProfileResponse?.data.user;

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

    try {
      console.log('🔥 DEBUGGING: Starting complete favor process');
      
      // Check auth token before making the API call
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔑 Auth token status before completeFavor:', token ? `Present (${token.substring(0, 20)}...)` : 'MISSING');
      
      if (!token) {
        console.error('🚨 NO AUTH TOKEN FOUND BEFORE COMPLETE FAVOR API CALL!');
        console.error('🔐 This is the source of the session expiration');
        return;
      }
      
      console.log('🎯 Marking favor as completed:', favor.id);
      console.log('📊 Favor status before completion:', favor.status);
      console.log('👤 Current user role: Provider');
      console.log('👥 Favor requester:', favor.user.full_name, '(ID:', favor.user.id + ')');
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
    
    if (!favor || rating === 0 || !reviewText.trim()) {
      console.log('❌ Validation failed:');
      console.log('  - Favor exists:', !!favor);
      console.log('  - Rating provided:', rating);
      console.log('  - Review text provided:', !!reviewText.trim());
      
      Toast.show({
        type: 'error',
        text1: 'Incomplete Review',
        text2: 'Please provide a rating and review text.',
        visibilityTime: 3000,
      });

      return;
    }

    try {
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
      console.log('📍 Endpoint: POST /favors/' + favor.id + '/user_review');
      console.log('📤 Complete Request Data:');
      console.log(JSON.stringify({
        favorId: favor.id,
        data: reviewData
      }, null, 2));
      
      console.log('\n🚀 === MAKING API CALL ===');
      console.log('⏰ API call started at:', new Date().toISOString());
      console.log('🔗 Calling: createUserReviewMutation.mutateAsync()');
      
      const result = await createUserReviewMutation.mutateAsync({
        favorId: favor.id,
        data: reviewData
      });
      
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
        console.error('💡 User needs to log in again');
        console.error('🔄 Token was cleared by axios interceptor');
      }
      
      console.error('\n❌ === USER REVIEW SUBMISSION FAILED ===\n');
      // Error handling is done by the mutation's onError callback
    }
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
      >
        {/* Favor Details Card */}
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

            <View className="flex-row items-start">
              <Text className="text-gray-700 text-base w-24">Description</Text>
              <Text className="text-gray-700 text-base mr-2">:</Text>
              <Text className="text-gray-800 text-base flex-1">{favor.description}</Text>
            </View>
          </View>
        </View>

        {/* Show requester information - "You helped" section */}
        {favor.user && (
          <View className="mx-4 mb-6">
            <Text className="text-lg font-semibold text-black mb-4">
              You are helping
            </Text>
            
            <View className="flex-row items-center bg-white border rounded-2xl border-gray-300 p-4 border-1 mb-4">
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
                {favor.user.rating && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 text-sm">⭐ {favor.user.rating.toFixed(1)} | </Text>
                    <Text className="text-gray-600 text-sm">
                      {reviewsResponse?.data?.reviews?.length || 0} Reviews
                    </Text>
                  </View>
                )}
                {userProfile?.years_of_experience && (
                  <Text className="text-gray-600 text-sm">{userProfile.years_of_experience} years experience</Text>
                )}
             
                <TouchableOpacity onPress={() => navigation?.navigate('UserProfileScreen', { userId: favor.user.id })}>
                  <Text className="text-[#44A27B] text-sm font-medium">View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Buttons */}
            {/* {(userProfile?.phone_no_call || userProfile?.phone_no_text) && (
              <View className="flex-row mb-4">
                {userProfile?.phone_no_call && (
                  <TouchableOpacity 
                    className={`flex-1 bg-transparent border border-black rounded-xl py-3 px-2 ${
                      userProfile?.phone_no_text ? 'mr-2' : ''
                    }`}
                    onPress={() => handleCallNumber(userProfile.phone_no_call)}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Call: {userProfile.phone_no_call}
                    </Text>
                  </TouchableOpacity>
                )}
                {userProfile?.phone_no_text && (
                  <TouchableOpacity 
                    className={`flex-1 bg-transparent border border-black rounded-xl py-3 px-2 ${
                      userProfile?.phone_no_call ? 'ml-2' : ''
                    }`}
                    onPress={() => handleTextNumber(userProfile.phone_no_text)}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Text: {userProfile.phone_no_text}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )} */}

            {/* Submit Review Button */}
            {favor.status === 'completed' && (
              <TouchableOpacity 
                className="bg-[#44A27B] rounded-xl py-3 mb-4"
                onPress={handleSubmitReview}
              >
                <Text className="text-white text-center font-medium text-base">Submit Review</Text>
              </TouchableOpacity>
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
              <View key={index} className="bg-white rounded-2xl p-4 mb-3 border border-gray-200">
                {/* Reviewer Info */}
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-[#44A27B] rounded-full overflow-hidden items-center justify-center">
                    <UserSvg focused={false} />
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

      {/* Submit Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={handleReviewModalClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-green-400 relative">
            {/* Close Button */}
            <TouchableOpacity 
              className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full items-center justify-center"
              onPress={handleReviewModalClose}
            >
              <Text className="text-white font-bold text-lg">×</Text>
            </TouchableOpacity>

            {/* Modal Title */}
            <Text className="text-gray-800 text-lg font-semibold text-center mb-6 mt-4">
              Give "{favor.user.full_name}" Feedback
            </Text>

            {/* Star Rating */}
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

            {/* Review Text Input */}
            <View className="mb-4">
              <Text className="text-gray-700 text-base font-medium mb-2">Write Review</Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 h-24 text-base"
                placeholder="Share your experience..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={reviewText}
                onChangeText={setReviewText}
              />
            </View>


            {/* Submit Button */}
            <TouchableOpacity 
              className="bg-green-500 rounded-full py-4 mt-6"
              onPress={handleReviewSubmit}
            >
              <Text className="text-white text-center font-semibold text-lg">Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}