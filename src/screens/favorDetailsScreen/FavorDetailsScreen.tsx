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
import { usePublicUserProfileQuery, useFavorProviderProfileQuery } from '../../services/queries/ProfileQueries';
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

  // Fetch user profile data when needed (for modal)
  const { data: userProfileResponse, isLoading: userProfileLoading } = usePublicUserProfileQuery(
    favorResponse?.data.favor?.user?.id || null,
    { enabled: !!favorResponse?.data.favor?.user?.id && showUserProfileModal }
  );

  // Delete favor mutation and Reassign favor mutation
  const deleteFavorMutation = useDeleteFavor();
  const reassignFavorMutation = useReassignFavor();
  const completeFavorMutation = useCompleteFavor();
  const cancelAndRepostMutation = useCancelAndRepost();
  const createReviewMutation = useCreateReview();

  const favor = favorResponse?.data.favor;
  const userProfile = userProfileResponse?.data.user;
  const providerProfile = providerProfileResponse?.data.user;

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
      navigation?.navigate('UserProfileScreen', { 
        userId: favor.accepted_response.user.id 
      });
    } else if (favor?.user?.id) {
      navigation?.navigate('UserProfileScreen', { 
        userId: favor.user.id 
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!favor) return;

    try {
      console.log('🎯 Marking favor as completed:', favor.id);
      await completeFavorMutation.mutateAsync(favor.id);
      
      // Show review modal after successful completion
      setShowReviewModal(true);
      
      console.log('✅ Favor marked as completed successfully');
    } catch (error: any) {
      console.error('❌ Complete favor failed:', error.message);
      // Error handling is done by the mutation's onError callback
    }
  };

  const handleReviewSubmit = async () => {
    if (!favor || rating === 0 || !reviewText.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Review',
        text2: 'Please provide a\nrating and review text.',
        visibilityTime: 3000,
      });
      return;
    }

    try {
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
                  <Text className="text-green-600 text-base flex-1 font-semibold">Paid Favor</Text>
                </View>

                <View className="flex-row">
                  <Text className="text-gray-700 text-base w-20">Tip</Text>
                  <Text className="text-gray-700 text-base mr-2">:</Text>
                  <Text className="text-gray-800 text-base flex-1 font-semibold">
                    ${parseFloat((favor.tip || 0).toString()).toFixed(2)}
                  </Text>
                </View>

                {favor.additional_tip && parseFloat((favor.additional_tip || 0).toString()) > 0 && (
                  <View className="flex-row">
                    <Text className="text-gray-700 text-base w-20">Bonus</Text>
                    <Text className="text-gray-700 text-base mr-2">:</Text>
                    <Text className="text-green-600 text-base flex-1 font-semibold">
                      +${parseFloat((favor.additional_tip || 0).toString()).toFixed(2)}
                    </Text>
                  </View>
                )}

                <View className="flex-row">
                  <Text className="text-gray-700 text-base w-20">Total</Text>
                  <Text className="text-gray-700 text-base mr-2">:</Text>
                  <Text className="text-green-700 text-base flex-1 font-bold">
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
                <Text className="text-blue-600 text-base flex-1 font-semibold">Free Favor</Text>
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
                <Text className="text-lg font-semibold text-black">
                  {favor.user.full_name}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 text-sm">⭐ {userProfile?.average_rating || '4.5'} | </Text>
                  <Text className="text-gray-600 text-sm">{userProfile?.total_reviews || '0'} Reviews</Text>
                </View>
                {userProfile?.years_of_experience && (
                  <Text className="text-gray-600 text-sm">{userProfile.years_of_experience} years experience</Text>
                )}
                {userProfile?.has_contact_info && userProfile?.email && (
                  <Text className="text-gray-600 text-sm">📧 {userProfile.email}</Text>
                )}
                <TouchableOpacity onPress={() => navigation?.navigate('UserProfileScreen', { userId: favor.user.id })}>
                  <Text className="text-[#44A27B] text-sm font-medium">View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Buttons - Only show if contact info is available */}
            {userProfile?.has_contact_info ? (
              <View className="flex-row mb-4">
                {userProfile.phone_no_call && (
                  <TouchableOpacity 
                    className="flex-1 bg-transparent border border-black rounded-xl mr-2 py-3 px-2"
                    onPress={() => handleCallNumber(userProfile.phone_no_call)}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Call: {userProfile.phone_no_call}
                    </Text>
                  </TouchableOpacity>
                )}
                {userProfile.phone_no_text && (
                  <TouchableOpacity 
                    className="flex-1 bg-transparent border border-black rounded-xl ml-2 py-3 px-2"
                    onPress={() => handleTextNumber(userProfile.phone_no_text)}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Text: {userProfile.phone_no_text}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View></View>
              // <View className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              //   <Text className="text-center text-yellow-800 font-medium text-sm">
              //     Contact information not available for this user
              //   </Text>
              // </View>
            )}

            {/* Submit Review Button for provider mode */}
            {favor.status !== 'completed' && (
              <TouchableOpacity 
                className="bg-[#44A27B] rounded-xl py-3 mb-4"
                onPress={handleSubmitReview}
              >
                <Text className="text-white text-center font-medium text-base">Submit Review</Text>
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
                  {providerProfile?.image_url ? (
                    <Image
                      source={{ uri: providerProfile.image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-[#44A27B] items-center justify-center">
                      <Text className="text-white text-lg font-bold">
                        {getUserInitials(favor.accepted_response.user.full_name)}
                      </Text>
                    </View>
                  )}
                </View>
                {providerProfile?.is_certified && (
                  <View className="absolute -top-1 -right-1">
                    <VerifiedIcon />
                  </View>
                )}
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-black">
                  {favor.accepted_response.user.full_name}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 text-sm">⭐ {providerProfile?.average_rating || '4.5'} | </Text>
                  <Text className="text-gray-600 text-sm">{providerProfile?.total_reviews || '0'} Reviews</Text>
                </View>
                {providerProfile?.years_of_experience && (
                  <Text className="text-gray-600 text-sm">{providerProfile.years_of_experience} years experience</Text>
                )}
                {providerProfile?.has_contact_info && providerProfile?.email && (
                  <Text className="text-gray-600 text-sm">📧 {providerProfile.email}</Text>
                )}
                <TouchableOpacity onPress={handleViewProfile}>
                  <Text className="text-[#44A27B] text-sm font-medium">View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Buttons - Only show if contact info is available */}
            {providerProfile?.has_contact_info ? (
              <View className="flex-row mb-4">
                {providerProfile.phone_no_call && (
                  <TouchableOpacity 
                    className="flex-1 bg-transparent border border-black rounded-xl mr-2 py-3 px-2"
                    onPress={() => handleCallNumber(providerProfile.phone_no_call)}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Call: {providerProfile.phone_no_call}
                    </Text>
                  </TouchableOpacity>
                )}
                {providerProfile.phone_no_text && (
                  <TouchableOpacity 
                    className="flex-1 bg-transparent border border-black rounded-xl ml-2 py-3 px-2"
                    onPress={() => handleTextNumber(providerProfile.phone_no_text)}
                  >
                    <Text className="text-center text-gray-800 font-medium text-sm">
                      Text: {providerProfile.phone_no_text}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View></View>
              /* <View className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <Text className="text-center text-yellow-800 font-medium text-sm">
                  Contact information not available for this provider
                </Text>
              </View> */
            )}

            {/* Action buttons based on context - only show if favor is not completed */}
            {favor.status !== 'completed' && (
              <>
                {isRequestMode ? (
                  /* Buttons for request mode (CreateFavorScreen) */
                  <View className="flex-row space-x-2">
                    <TouchableOpacity 
                      className="flex-1 bg-transparent border border-black rounded-xl py-3 mr-2"
                      onPress={handleCancelAndRepost}
                    >
                      <Text className="text-center text-gray-800 font-medium text-sm">Cancel & Repost</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="bg-[#44A27B] rounded-xl py-3 px-4 mr-2"
                      onPress={handleSubmitReview}
                    >
                      <Text className="text-white text-center font-medium text-sm">Mark as Completed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="bg-transparent border border-black rounded-xl py-3 px-4"
                      onPress={() => {
                        // Cancel functionality
                        console.log('Cancel');
                      }}
                    >
                      <Text className="text-center text-gray-800 font-medium text-sm">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Button for provider mode (ProvideFavorScreen) */
                  <TouchableOpacity 
                    className="bg-[#44A27B] rounded-xl py-3 mb-4"
                    onPress={handleSubmitReview}
                  >
                    <Text className="text-white text-center font-medium text-base">Mark as Completed</Text>
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
              <View key={index} className="bg-white rounded-2xl p-4 mb-3 border border-gray-200">
                {/* Reviewer Info */}
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                    <Image
                      source={{ 
                        uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' 
                      }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
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

            {/* Tip Option */}
            <View className="mb-6">
              <TouchableOpacity 
                className="flex-row items-center mb-3"
                onPress={() => setShowTipOption(!showTipOption)}
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
                    className="border border-gray-300 rounded-xl p-3 text-base"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={tipAmount}
                    onChangeText={setTipAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              className="bg-green-500 rounded-full py-4"
              onPress={handleReviewSubmit}
            >
              <Text className="text-white text-center font-semibold text-lg">Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
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

                  {providerProfile.has_contact_info && providerProfile.phone_no_call && (
                    <View className="mb-3">
                      <Text className="text-gray-700 text-base">
                        Call : <Text className="text-gray-500">{providerProfile.phone_no_call}</Text>
                      </Text>
                    </View>
                  )}

                  {providerProfile.has_contact_info && providerProfile.phone_no_text && (
                    <View className="mb-3">
                      <Text className="text-gray-700 text-base">
                        Text : <Text className="text-gray-500">{providerProfile.phone_no_text}</Text>
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
                      Rating : <Text className="font-semibold">⭐ {providerProfile.average_rating} ({providerProfile.total_reviews} reviews)</Text>
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
                {providerProfile.has_contact_info && (
                  <View className="flex-row space-x-4">
                    {providerProfile.phone_no_call && (
                      <TouchableOpacity 
                        className="flex-1 bg-[#44A27B] rounded-xl py-3"
                        onPress={() => {
                          handleCallNumber(providerProfile.phone_no_call!);
                          setShowUserProfileModal(false);
                        }}
                      >
                        <Text className="text-white text-center font-semibold">Call</Text>
                      </TouchableOpacity>
                    )}
                    {providerProfile.phone_no_text && (
                      <TouchableOpacity 
                        className="flex-1 border-2 border-[#44A27B] rounded-xl py-3"
                        onPress={() => {
                          handleTextNumber(providerProfile.phone_no_text!);
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