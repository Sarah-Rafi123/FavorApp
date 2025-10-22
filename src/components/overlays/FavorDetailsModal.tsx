import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useFavor } from '../../services/queries/FavorQueries';
import { useApplyToFavor } from '../../services/mutations/FavorMutations';
import { usePublicUserProfileQuery } from '../../services/queries/ProfileQueries';
import { StripeConnectManager } from '../../services/StripeConnectManager';

interface FavorDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  favorId: number | null;
}

const BlurredText = ({ children }: { children: string }) => (
  <View style={{
    position: 'relative',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  }}>
    <Text style={{ 
      fontSize: 16,
      color: '#374151',
    }}>
      {children}
    </Text>
    <BlurView
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      blurType="light"
      blurAmount={30}
    />
  </View>
);

export function FavorDetailsModal({ visible, onClose, favorId }: FavorDetailsModalProps) {
  const { data: favorData, isLoading, error } = useFavor(favorId || 0, {
    enabled: !!favorId && visible,
  });

  const favor = favorData?.data?.favor;
  
  // Get public user profile for additional details
  const { data: userProfileData } = usePublicUserProfileQuery(
    favor?.user?.id || null, 
    { enabled: !!favor?.user?.id && visible }
  );
  
  const userProfile = userProfileData?.data?.user;

  // Apply to Favor mutation and Stripe Connect Manager
  const applyToFavorMutation = useApplyToFavor();
  const stripeConnectManager = StripeConnectManager.getInstance();

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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle applying to favor - same logic as HomeListScreen
  const handleApplyToFavor = async () => {
    if (!favor) return;

    console.log('🎯 Apply to favor clicked from modal for:', favor.user.full_name);
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
          onClose(); // Close modal after successful application
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
                  console.log('📝 Applying to favor from modal:', favor.id);
                  
                  // Call the Apply to Favor API
                  await applyToFavorMutation.mutateAsync(favor.id);
                  
                  // Success is handled by the mutation's onSuccess callback
                  console.log('✅ Application submitted successfully from modal');
                  onClose(); // Close modal after successful application
                  
                } catch (error: any) {
                  // Error is handled by the mutation's onError callback
                  console.error('❌ Application failed from modal:', error.message);
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
      console.error('❌ Error handling apply to favor from modal:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!visible || !favorId) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-[#FBFFF0] rounded-2xl w-full max-w-sm mx-4 shadow-lg border-2 border-[#44A27B] max-h-[90vh] flex" style={{ height: '90%' }}>
          {/* Close Button */}
          <TouchableOpacity 
            onPress={onClose}
            className="absolute top-4 right-4 z-10 bg-black rounded-full w-8 h-8 items-center justify-center"
          >
            <Text className="text-white text-lg font-bold">×</Text>
          </TouchableOpacity>

          {/* Scrollable Content */}
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4 pb-2" contentContainerStyle={{ flexGrow: 1 }}>
            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#44A27B" />
                <Text className="text-gray-600 mt-2">Loading favor details...</Text>
              </View>
            ) : error ? (
              <View className="items-center py-8">
                <Text className="text-red-600 text-center">Failed to load favor details</Text>
                <TouchableOpacity 
                  className="bg-[#44A27B] px-4 py-2 rounded-lg mt-2"
                  onPress={onClose}
                >
                  <Text className="text-white font-medium">Close</Text>
                </TouchableOpacity>
              </View>
            ) : favor ? (
              <>
                {/* Header - Favor Title and User */}
                <View className="mb-4">
                  <Text className="text-xl font-bold text-gray-800 mb-2">
                    {favor.title || favor.favor_subject.name}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Posted by {favor.user.full_name}
                  </Text>
                </View>

                {/* Favor Details Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-800 mb-4">Favor Details</Text>
                  
                  {/* Grid Layout for Details */}
                  <View className="space-y-4">
                    {/* Row 1 */}
                    <View className="flex-row justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-600 text-sm mb-1">Priority</Text>
                        <Text className="text-red-600 font-medium">
                          {formatPriority(favor.priority)}
                        </Text>
                      </View>
                      <View className="flex-1 ml-2">
                        <Text className="text-gray-600 text-sm mb-1">Time to Complete</Text>
                        <Text className="text-gray-800">
                          {favor.time_to_complete || 'Not specified'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Row 2 */}
                    <View className="flex-row justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-600 text-sm mb-1">Payment</Text>
                        <Text className="text-gray-800 font-bold">
                          {parseFloat((favor.tip || 0).toString()) > 0 
                            ? `$${parseFloat((favor.tip || 0).toString()).toFixed(2)}`
                            : 'Unpaid'}
                        </Text>
                      </View>
                      <View className="flex-1 ml-2">
                        <Text className="text-gray-600 text-sm mb-1">Location</Text>
                        <Text className="text-gray-800">
                          {favor.city && favor.city !== 'undefined' ? favor.city : 'undefined'}, {favor.state && favor.state !== 'undefined' ? favor.state : 'Ohio'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Row 3 */}
                    <View className="flex-row justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-600 text-sm mb-1">Date Posted</Text>
                        <Text className="text-gray-800">
                          {new Date(favor.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                      <View className="flex-1 ml-2">
                        <Text className="text-gray-600 text-sm mb-1">Category</Text>
                        <Text className="text-gray-800">
                          {favor.favor_subject.name}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Description Section */}
                  {favor.description && (
                    <View className="mt-6">
                      <Text className="text-gray-600 text-sm mb-2">Description</Text>
                      <Text className="text-gray-800 leading-5">
                        {favor.description}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Divider */}
                <View className="border-t border-gray-200 my-6"></View>

                {/* About User Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-800 mb-4">
                    About {favor.user.first_name}
                  </Text>

                  {/* User Avatar and Basic Info */}
                  <View className="flex-row mb-4">
                    <View className="w-12 h-12 bg-gray-200 rounded-full mr-4 items-center justify-center">
                      {userProfile?.image_url ? (
                        <Image 
                          source={{ uri: userProfile.image_url }}
                          className="w-full h-full rounded-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-white text-lg font-bold">
                          {favor.user.first_name?.[0]?.toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm">Email</Text>
                      <BlurredText>
                        {userProfile?.email || favor.user.email}
                      </BlurredText>
                    </View>
                  </View>

                  {/* User Details Grid */}
                  <View className="space-y-4">
                    {/* Row 1 */}
                    <View className="flex-row justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-600 text-sm mb-1">Member Since</Text>
                        <Text className="text-gray-800">
                          {userProfile?.member_since || 'July 2025'}
                        </Text>
                      </View>
                      <View className="flex-1 ml-2">
                        <Text className="text-gray-600 text-sm mb-1">Phone number (call)</Text>
                        <BlurredText>
                          {userProfile?.phone_no_call || '** *** ****'}
                        </BlurredText>
                      </View>
                    </View>
                    
                    {/* Row 2 */}
                    <View className="flex-row justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-600 text-sm mb-1">Age</Text>
                        <Text className="text-gray-800">
                          {userProfile?.age || 'Not specified'}
                        </Text>
                      </View>
                      <View className="flex-1 ml-2">
                        <Text className="text-gray-600 text-sm mb-1">Phone number (text)</Text>
                        <BlurredText>
                          {userProfile?.phone_no_text || '** *** ****'}
                        </BlurredText>
                      </View>
                    </View>
                    
                    {/* Row 3 */}
                    <View className="flex-row justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-600 text-sm mb-1">Experience</Text>
                        <Text className="text-gray-800">
                          {userProfile?.years_of_experience 
                            ? `${userProfile.years_of_experience} Years`
                            : favor.user.years_of_experience 
                            ? `${favor.user.years_of_experience} Years`
                            : '0 Years'}
                        </Text>
                      </View>
                      <View className="flex-1 ml-2">
                        {/* Empty space for alignment */}
                      </View>
                    </View>
                  </View>
                </View>
              </>
            ) : null}
          </ScrollView>

          {/* Fixed Action Button at Bottom - Compact */}
          {favor && favor.can_apply && (
            <View className="p-4 pt-2 bg-[#FBFFF0]">
              <TouchableOpacity 
                className="bg-[#44A27B] rounded-full py-3"
                onPress={handleApplyToFavor}
              >
                <Text className="text-white text-center font-semibold text-base">
                  ${parseFloat((favor.tip || 0).toString()).toFixed(2)} | Provide a Favor
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}