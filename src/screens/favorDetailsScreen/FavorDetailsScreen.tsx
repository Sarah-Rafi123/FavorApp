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
import { useFavor } from '../../services/queries/FavorQueries';
import { useDeleteFavor, useReassignFavor } from '../../services/mutations/FavorMutations';
import { Favor } from '../../services/apis/FavorApis';

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
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Get favor ID from route params
  const favorId = route?.params?.favorId || route?.params?.favor?.id;
  
  // Fetch favor data using the API
  const { data: favorResponse, isLoading, error } = useFavor(favorId, {
    enabled: !!favorId
  });

  // Delete favor mutation and Reassign favor mutation
  const deleteFavorMutation = useDeleteFavor();
  const reassignFavorMutation = useReassignFavor();

  const favor = favorResponse?.data.favor;

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

  const handleCallNumber = () => {
    console.log('Call number pressed');
  };

  const handleTextNumber = () => {
    console.log('Text number pressed');
  };

  const handleSubmitReview = () => {
    setShowReviewModal(true);
  };

  const handleReviewSubmit = () => {
    console.log('Review submitted:', { rating, reviewText });
    setShowReviewModal(false);
    setRating(0);
    setReviewText('');
  };

  const handleCancelAndRepost = () => {
    if (!favor) return;

    // For now, we'll need the new provider ID to be input manually
    // In a real app, this would show a list of applicants to choose from
    Alert.alert(
      'Cancel & Repost Favor',
      'This will cancel the current provider and reassign to another provider. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue',
          onPress: () => {
            // For demo purposes, we'll prompt for provider ID
            // In a real implementation, this would show a list of applicants
            Alert.prompt(
              'Enter New Provider ID',
              'Enter the ID of the new provider to assign this favor to:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reassign',
                  onPress: async (newProviderId) => {
                    if (!newProviderId || isNaN(Number(newProviderId))) {
                      Alert.alert('Error', 'Please enter a valid provider ID');
                      return;
                    }

                    try {
                      console.log('🔄 Reassigning favor to provider:', newProviderId);
                      await reassignFavorMutation.mutateAsync({
                        favorId: favor.id,
                        newProviderId: Number(newProviderId)
                      });
                      console.log('✅ Favor reassigned successfully');
                      navigation?.goBack();
                    } catch (error: any) {
                      console.error('❌ Reassign favor failed:', error.message);
                      // Error handling is done by the mutation's onError callback
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        }
      ]
    );
  };

  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setRating(0);
    setReviewText('');
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
        <View className="mx-4 mb-6 bg-[#FBFFF0] rounded-3xl p-6 border-4 border-[#71DFB1]">
          {/* Favor Image */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-gray-200 rounded-2xl overflow-hidden">
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
          <View className="space-y-4 mb-6">
            <View className="flex-row">
              <Text className="text-gray-700 text-lg w-24">Priority</Text>
              <Text className="text-gray-700 text-lg mr-2">:</Text>
              <Text className="text-gray-800 text-lg flex-1 capitalize">{favor.priority}</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-700 text-lg w-24">Category</Text>
              <Text className="text-gray-700 text-lg mr-2">:</Text>
              <Text className="text-gray-800 text-lg flex-1">{favor.favor_subject.name}</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-700 text-lg w-24">Duration</Text>
              <Text className="text-gray-700 text-lg mr-2">:</Text>
              <Text className="text-gray-800 text-lg flex-1">{favor.time_to_complete || 'Not specified'}</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-700 text-lg w-24">Location</Text>
              <Text className="text-gray-700 text-lg mr-2">:</Text>
              <Text className="text-gray-800 text-lg flex-1">{favor.city}, {favor.state}</Text>
            </View>

            <View className="flex-row">
              <Text className="text-gray-700 text-lg w-24">Tip</Text>
              <Text className="text-gray-700 text-lg mr-2">:</Text>
              <Text className="text-gray-800 text-lg flex-1">
                {favor.favor_pay ? `$${favor.tip}` : 'Free'}
              </Text>
            </View>

            <View className="flex-row items-start">
              <Text className="text-gray-700 text-lg w-24">Description</Text>
              <Text className="text-gray-700 text-lg mr-2">:</Text>
              <Text className="text-gray-800 text-lg flex-1">{favor.description}</Text>
            </View>
          </View>

        </View>

        {/* You are helping section */}
        <View className="mx-4 mb-6">
          <Text className="text-xl font-semibold text-black mb-4">You are helping</Text>
          
          <View className="flex-row items-center border rounded-3xl border-gray-300 p-5 border-1 mb-4">
            <View className="relative">
              <View className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                <Image
                  source={{ 
                    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' 
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              {favor.user.is_certified && (
                <View className="absolute -top-1 -right-1">
                  <VerifiedIcon />
                </View>
              )}
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-black">{favor.user.full_name}</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-600 text-sm">⭐ {favor.user.rating || '0'} | </Text>
                <Text className="text-gray-600 text-sm">Member since {favor.user.member_since || 'N/A'}</Text>
              </View>
              {favor.user.years_of_experience && (
                <Text className="text-gray-600 text-sm">{favor.user.years_of_experience} years experience</Text>
              )}
              <TouchableOpacity>
                <Text className="text-green-600 text-sm font-medium underline">View Profile</Text>
              </TouchableOpacity>
            </View>
            
          </View>

          {/* Contact Buttons */}
          <View className="flex-row mb-4">
            <TouchableOpacity 
              className="flex-1 bg-transparent border border-black rounded-xl mr-3 py-3 px-2"
              onPress={handleCallNumber}
            >
              <Text className="text-center text-gray-800 font-medium text-sm">Call: 917-582-3220</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-transparent border border-black rounded-xl mr-3 py-3 px-2"
              onPress={handleTextNumber}
            >
              <Text className="text-center text-gray-800 font-medium text-sm">Text: 908-245-4242</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row ">
            <TouchableOpacity 
              className="flex-1 bg-transparent border border-black justify-center mr-3 rounded-xl py-1 px-1"
              onPress={handleCancelAndRepost}
            >
              <Text className="text-center text-gray-800 font-medium text-base">Cancel & Repost</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-green-500 py-1 px-1 mr-3 justify-center rounded-xl"
              onPress={handleSubmitReview}
            >
              <Text className="text-white text-center font-medium text-base">Submit Review</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-transparent justify-center border mr-3 border-black rounded-xl py-1 px-1"
              onPress={handleCancelFavor}
            >
              <Text className="text-center text-gray-800 font-medium text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
         
        </View>
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelModalClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-blue-400 relative">
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
            <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="flex-1 bg-green-500 rounded-full py-4"
                onPress={handleCancelModalClose}
              >
                <Text className="text-white text-center font-semibold text-lg">No</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 border-2 border-green-500 rounded-full py-4"
                onPress={handleConfirmCancel}
              >
                <Text className="text-green-500 text-center font-semibold text-lg">Yes</Text>
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
            <View className="mb-6">
              <Text className="text-gray-700 text-base font-medium mb-2">Write Review</Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 h-24 text-base"
                placeholder="Enter"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={reviewText}
                onChangeText={setReviewText}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              className="bg-green-500 rounded-full py-4"
              onPress={handleReviewSubmit}
            >
              <Text className="text-white text-center font-semibold text-lg">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}