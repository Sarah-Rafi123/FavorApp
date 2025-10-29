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
        text2: 'Please provide a rating and review text.',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const reviewData = {
        rating,
        description: reviewText.trim(),
        given_to_id: favor.user.id // Provider reviewing the requester
      };

      console.log('🌟 Submitting user review:', reviewData);
      await createUserReviewMutation.mutateAsync({
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
      
      console.log('✅ User review submitted successfully');
    } catch (error: any) {
      console.error('❌ User review submission failed:', error.message);
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
            <View className="w-32 h-24 bg-gray-200 rounded-2xl overflow-hidden">
              <Image
                source={{ 
                  uri: favor.image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop' 
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
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
              You helped
            </Text>
            
            <View className="flex-row items-center bg-white border rounded-2xl border-gray-300 p-4 border-1 mb-4">
              <View className="relative">
                <View className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden items-center justify-center">
                  {userProfile?.image_url ? (
                    <Image
                      source={{ uri: userProfile.image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <UserSvg focused={false} />
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
                  <Text className="text-gray-600 text-sm">⭐ 4.5 | </Text>
                  <Text className="text-gray-600 text-sm">456 Reviews</Text>
                </View>
                {userProfile?.years_of_experience && (
                  <Text className="text-gray-600 text-sm">{userProfile.years_of_experience} years experience</Text>
                )}
                <Text className="text-gray-600 text-sm">2 Mins Away</Text>
                <TouchableOpacity onPress={() => navigation?.navigate('UserProfileScreen', { userId: favor.user.id })}>
                  <Text className="text-[#44A27B] text-sm font-medium">View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Buttons */}
            <View className="flex-row mb-4">
              <TouchableOpacity 
                className="flex-1 bg-transparent border border-black rounded-xl mr-2 py-3 px-2"
                onPress={() => handleCallNumber(userProfile?.phone_no_call || '917-582-3220')}
              >
                <Text className="text-center text-gray-800 font-medium text-sm">
                  Call: {userProfile?.phone_no_call || '917-582-3220'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-transparent border border-black rounded-xl ml-2 py-3 px-2"
                onPress={() => handleTextNumber(userProfile?.phone_no_text || '908-245-4242')}
              >
                <Text className="text-center text-gray-800 font-medium text-sm">
                  Text: {userProfile?.phone_no_text || '908-245-4242'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Review Button */}
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