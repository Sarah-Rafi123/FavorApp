import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import BackSvg from '../../assets/icons/Back';
import UserSvg from '../../assets/icons/User';
import { usePublicUserProfileQuery, useUserReviewsQuery } from '../../services/queries/ProfileQueries';
import { PublicUserProfile } from '../../services/apis/ProfileApis';

interface UserProfileScreenProps {
  navigation?: any;
  route?: any;
}

const VerifiedIcon = () => (
  <View className="w-4 h-4 bg-green-500 rounded-full items-center justify-center">
    <Text className="text-white text-xs font-bold">✓</Text>
  </View>
);

export function UserProfileScreen({ navigation, route }: UserProfileScreenProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get user ID and favor status from route params
  const userId = route?.params?.userId;
  const favorStatus = route?.params?.favorStatus;
  
  // Fetch user profile data
  const { data: userProfileResponse, isLoading: profileLoading, error: profileError } = usePublicUserProfileQuery(
    userId,
    { enabled: !!userId }
  );

  // Fetch user reviews with pagination
  const { data: reviewsResponse, isLoading: reviewsLoading, error: reviewsError } = useUserReviewsQuery(
    userId,
    { page: currentPage, per_page: 10 },
    { enabled: !!userId && userId !== 49 } // Temporarily disable reviews for user 49
  );

  const userProfile = userProfileResponse?.data.user;
  const reviews = reviewsResponse?.data.reviews || [];
  const statistics = reviewsResponse?.data.statistics;
  const meta = reviewsResponse?.data.meta;

  // Debug: Log all user profile data to see what's available
  React.useEffect(() => {
    if (userProfile) {
      console.log('📊 Complete User Profile Data:', JSON.stringify(userProfile, null, 2));
      console.log('🔍 Available fields:', Object.keys(userProfile));
    }
  }, [userProfile]);

  // Debug: Log favor status to track contact info visibility
  React.useEffect(() => {
    const shouldShowContact = favorStatus === 'in_progress' || favorStatus === 'in-progress';
    console.log('🎯 UserProfileScreen navigation params:', {
      userId,
      favorStatus,
      shouldShowContact
    });
  }, [userId, favorStatus]);

  const handleGoBack = () => {
    navigation?.goBack();
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

  const handleLoadMore = () => {
    if (meta?.next_page) {
      setCurrentPage(meta.next_page);
    }
  };

  // Loading state
  if (profileLoading && !userProfile) {
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
            <Text className="text-2xl font-bold text-black">User Profile</Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#44A27B" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </View>
      </ImageBackground>
    );
  }

  // Error state
  if (profileError || !userProfile) {
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
            <Text className="text-2xl font-bold text-black">User Profile</Text>
          </View>ct
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
            Error Loading Profile
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Please try again later.
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
          <Text className="text-2xl font-bold text-black">User Profile</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Profile Header */}
        <View className="mx-4 mb-6 bg-[#FBFFF0] rounded-3xl p-6 border-4 border-[#71DFB1]">
          {/* Profile Photo */}
          <View className="items-center mb-6">
            <View className="relative">
              <View className="w-24 h-24 rounded-2xl overflow-hidden items-center justify-center">
                {userProfile.image_url ? (
                  <Image
                    source={{ uri: userProfile.image_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-[#44A27B] items-center justify-center">
                    <UserSvg focused={false} />
                  </View>
                )}
              </View>
              {userProfile.is_certified && (
                <View className="absolute -top-1 -right-1">
                  <VerifiedIcon />
                </View>
              )}
            </View>
          </View>

          {/* Name and Rating */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {userProfile.full_name}
            </Text>
            {statistics && (
              <View className="flex-row items-center">
                <Text className="text-gray-600 text-base">⭐ {statistics.average_rating || '0.0'} | </Text>
                <Text className="text-gray-600 text-base">{statistics.total_reviews || '0'} Reviews</Text>
              </View>
            )}
          </View>

          {/* User Details */}
          <View className="space-y-3 mb-6">
            {userProfile.years_of_experience && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">Experience</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base" numberOfLines={1} ellipsizeMode="tail">
                    {userProfile.years_of_experience} years
                  </Text>
                </View>
              </View>
            )}

            {(userProfile.address?.city || userProfile.address?.state) && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">Location</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base" numberOfLines={2} ellipsizeMode="tail">
                    {[userProfile.address?.city, userProfile.address?.state].filter(Boolean).join(', ')}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row">
              <Text className="text-gray-700 text-base w-32">Member Since</Text>
              <Text className="text-gray-700 text-base mr-2">:</Text>
              <View className="flex-1">
                <Text className="text-gray-800 text-base" numberOfLines={1} ellipsizeMode="tail">
                  {userProfile.member_since}
                </Text>
              </View>
            </View>

            {userProfile.age && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">Age</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base" numberOfLines={1} ellipsizeMode="tail">
                    {userProfile.age} years
                  </Text>
                </View>
              </View>
            )}

            {userProfile.about_me && (
              <View className="flex-row items-start">
                <Text className="text-gray-700 text-base w-32">About</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base leading-5" style={{ flexWrap: 'wrap' }}>
                    {userProfile.about_me}
                  </Text>
                </View>
              </View>
            )}

            {userProfile.skills && userProfile.skills.length > 0 && (
              <View className="flex-row items-start">
                <Text className="text-gray-700 text-base w-32">Skills</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <View className="flex-row flex-wrap" style={{ gap: 4 }}>
                    {userProfile.skills.map((skill, index) => (
                      <View key={index} className="bg-[#DCFBCC] rounded-full px-3 py-1 mb-2" style={{ marginRight: 4 }}>
                        <Text className="text-green-500 text-sm" numberOfLines={1} ellipsizeMode="tail">
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {userProfile.other_skills && (
              <View className="flex-row items-start">
                <Text className="text-gray-700 text-base w-32">Other Skills</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base leading-5" style={{ flexWrap: 'wrap' }}>
                    {userProfile.other_skills}
                  </Text>
                </View>
              </View>
            )}

            {/* Only show contact info if favor is in_progress */}
            {(favorStatus === 'in_progress' || favorStatus === 'in-progress') && userProfile.email && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">Email</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base" numberOfLines={1} ellipsizeMode="tail">
                    {userProfile.email}
                  </Text>
                </View>
              </View>
            )}

            {(favorStatus === 'in_progress' || favorStatus === 'in-progress') && userProfile.phone_no_call && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">Call Phone</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <TouchableOpacity onPress={() => handleCallNumber(userProfile.phone_no_call)}>
                    <Text className="text-gray-700 text-base underline" numberOfLines={1} ellipsizeMode="tail">
                      {userProfile.phone_no_call}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {(favorStatus === 'in_progress' || favorStatus === 'in-progress') && userProfile.phone_no_text && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">Text Phone</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <TouchableOpacity onPress={() => handleTextNumber(userProfile.phone_no_text)}>
                    <Text className="text-gray-700 text-base underline" numberOfLines={1} ellipsizeMode="tail">
                      {userProfile.phone_no_text}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {userProfile.first_name && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">First Name</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base" numberOfLines={1} ellipsizeMode="tail">
                    {userProfile.first_name}
                  </Text>
                </View>
              </View>
            )}

            {userProfile.last_name && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">Last Name</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base" numberOfLines={1} ellipsizeMode="tail">
                    {userProfile.last_name}
                  </Text>
                </View>
              </View>
            )}

            {userProfile.middle_name && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">Middle Name</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base" numberOfLines={1} ellipsizeMode="tail">
                    {userProfile.middle_name}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row">
              <Text className="text-gray-700 text-base w-32">Status</Text>
              <Text className="text-gray-700 text-base mr-2">:</Text>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <View className={`w-3 h-3 rounded-full mr-2 ${userProfile.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <Text className="text-gray-800 text-base">
                    {userProfile.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>

            {userProfile.created_at && (
              <View className="flex-row">
                <Text className="text-gray-700 text-base w-32">Account Created</Text>
                <Text className="text-gray-700 text-base mr-2">:</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 text-base" numberOfLines={1} ellipsizeMode="tail">
                    {new Date(userProfile.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Contact Buttons */}
          {/* <View className="flex-row">
            <TouchableOpacity 
              className="flex-1 bg-transparent border border-black rounded-xl mr-2 py-3 px-2"
              onPress={() => handleCallNumber(userProfile.phone_no_call || '917-582-3220')}
            >
              <Text className="text-center text-gray-800 font-medium text-sm">
                Call: {userProfile.phone_no_call || '917-582-3220'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-transparent border border-black rounded-xl ml-2 py-3 px-2"
              onPress={() => handleTextNumber(userProfile.phone_no_text || '908-245-4242')}
            >
              <Text className="text-center text-gray-800 font-medium text-sm">
                Text: {userProfile.phone_no_text || '908-245-4242'}
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View className="mx-4 mb-6">
            <Text className="text-lg font-semibold text-black mb-4">
              Reviews ({statistics?.total_reviews || reviews.length})
            </Text>
            
            {reviews.map((review, index) => (
              <View key={index} className="bg-white rounded-2xl p-4 mb-3 border border-gray-300">
                {/* Reviewer Info */}
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-[#44A27B] rounded-full overflow-hidden items-center justify-center">
                    {review.given_by?.image_url ? (
                      <Image
                        source={{ uri: review.given_by.image_url }}
                        className="w-full h-full"
                        resizeMode="cover"
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
                
                {/* Favor Info */}
                {review.favor && (
                  <View className="bg-gray-50 rounded-lg p-2 mt-2">
                    <Text className="text-gray-600 text-sm">
                      Favor: {review.favor.title}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {/* Load More Button */}
            {meta?.next_page && (
              <TouchableOpacity 
                className="bg-[#44A27B] rounded-xl py-3 mt-4"
                onPress={handleLoadMore}
                disabled={reviewsLoading}
              >
                <Text className="text-white text-center font-medium text-base">
                  {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* No Reviews State */}
        {!reviewsLoading && reviews.length === 0 && (
          <View className="mx-4 mb-6 bg-transparent rounded-2xl p-6">
            <Text className="text-center text-gray-600 text-base">
              No reviews found
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Contact Buttons - Only show if favor is in-progress and contact info is available */}
      {(favorStatus === 'in_progress' || favorStatus === 'in-progress') && userProfile && (userProfile.phone_no_call || userProfile.phone_no_text) && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-8">
          <View className="flex-row space-x-3">
            {userProfile.phone_no_call && (
              <TouchableOpacity 
                className="flex-1 bg-[#44A27B] rounded-xl py-4"
                onPress={() => handleCallNumber(userProfile.phone_no_call)}
              >
                <Text className="text-white text-center font-semibold text-base">
                  Call {userProfile.phone_no_call}
                </Text>
              </TouchableOpacity>
            )}
            {userProfile.phone_no_text && (
              <TouchableOpacity 
                className="flex-1 border-2 border-[#44A27B] rounded-xl py-4"
                onPress={() => handleTextNumber(userProfile.phone_no_text)}
              >
                <Text className="text-[#44A27B] text-center font-semibold text-base">
                  Text {userProfile.phone_no_text}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ImageBackground>
  );
}