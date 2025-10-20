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
import { useFavor } from '../../services/queries/FavorQueries';
import { useApplyToFavor } from '../../services/mutations/FavorMutations';
import { StripeConnectManager } from '../../services/StripeConnectManager';

interface FavorDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  favorId: number | null;
}

export function FavorDetailsModal({ visible, onClose, favorId }: FavorDetailsModalProps) {
  const { data: favorData, isLoading, error } = useFavor(favorId || 0, {
    enabled: !!favorId && visible,
  });

  const favor = favorData?.data?.favor;

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
        <View className="bg-[#FBFFF0] rounded-2xl w-full max-w-sm mx-4 shadow-lg border-2 border-[#44A27B] flex-1 max-h-[85vh] flex">
          {/* Close Button */}
          <TouchableOpacity 
            onPress={onClose}
            className="absolute top-4 right-4 z-10 bg-black rounded-full w-8 h-8 items-center justify-center"
          >
            <Text className="text-white text-lg font-bold">×</Text>
          </TouchableOpacity>

          {/* Scrollable Content */}
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-6 pb-2">
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
                {/* User Profile Section */}
                <View className="items-center mb-6">
                  <Image
                    source={{ 
                      uri: favor.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(favor.user.full_name) + '&background=44A27B&color=fff&size=120'
                    }}
                    className="w-20 h-20 rounded-2xl mb-3"
                    style={{ backgroundColor: '#f3f4f6' }}
                  />
                  <Text className="text-xl font-bold text-gray-800 text-center">
                    {favor.user.full_name}
                  </Text>
                </View>

                {/* User Details */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-800 mb-3">User Information</Text>
                  
                  <View className="flex-row mb-2">
                    <Text className="text-gray-600 font-medium w-20">Email:</Text>
                    <Text className="text-gray-800 flex-1" numberOfLines={1}>
                      {favor.user.email}
                    </Text>
                  </View>
                  
                  <View className="flex-row mb-2">
                    <Text className="text-gray-600 font-medium w-20">Name:</Text>
                    <Text className="text-gray-800 flex-1">
                      {favor.user.first_name} {favor.user.last_name}
                    </Text>
                  </View>
                  
                  <View className="flex-row mb-2">
                    <Text className="text-gray-600 font-medium w-20">Certified:</Text>
                    <Text className="text-gray-800 flex-1">
                      {favor.user.is_certified ? '✅ Verified' : '❌ Not Verified'}
                    </Text>
                  </View>
                  
                  {favor.user.years_of_experience && (
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Experience:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.user.years_of_experience} years
                      </Text>
                    </View>
                  )}
                  
                  {favor.user.rating && (
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Rating:</Text>
                      <Text className="text-gray-800 flex-1">
                        ⭐ {favor.user.rating}/5
                      </Text>
                    </View>
                  )}
                  
                  {favor.user.skills && favor.user.skills.length > 0 && (
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Skills:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.user.skills.join(', ')}
                      </Text>
                    </View>
                  )}
                  
                  <View className="flex-row">
                    <Text className="text-gray-600 font-medium w-20">Member Since:</Text>
                    <Text className="text-gray-800 flex-1">
                      {favor.user.member_since ? formatDate(favor.user.member_since) : 
                       new Date(favor.created_at).toLocaleDateString('en-US', { 
                         month: 'long', 
                         year: 'numeric' 
                       })}
                    </Text>
                  </View>
                  
                  {favor.user.about_me && (
                    <View className="mt-2">
                      <Text className="text-gray-600 font-medium mb-1">About:</Text>
                      <Text className="text-gray-800 leading-5">
                        {favor.user.about_me}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Favor Details Section */}
                <View className="border-t border-gray-200 pt-4">
                  <Text className="text-lg font-bold text-gray-800 mb-3">Favor Details</Text>
                  
                  <View>
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">ID:</Text>
                      <Text className="text-gray-800 flex-1">
                        #{favor.id}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Title:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.title || favor.favor_subject.name}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Category:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.favor_subject.name}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Priority:</Text>
                      <Text className="text-red-600 flex-1">
                        {formatPriority(favor.priority)}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Status:</Text>
                      <Text className="text-gray-800 flex-1 capitalize">
                        {favor.status}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Active:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.is_active ? '✅ Yes' : '❌ No'}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Time:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.time_to_complete || 'Not specified'}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Payment:</Text>
                      <Text className="text-gray-800 flex-1">
                        ${parseFloat((favor.tip || 0).toString()).toFixed(2)}
                      </Text>
                    </View>
                    
                    {favor.additional_tip && parseFloat(favor.additional_tip.toString()) > 0 && (
                      <View className="flex-row mb-2">
                        <Text className="text-gray-600 font-medium w-20">Bonus Tip:</Text>
                        <Text className="text-green-600 flex-1">
                          +${parseFloat(favor.additional_tip.toString()).toFixed(2)}
                        </Text>
                      </View>
                    )}
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Address:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.address}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Location:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.city && favor.city !== 'undefined' ? favor.city : ''}{favor.city && favor.city !== 'undefined' && favor.state && favor.state !== 'undefined' ? ', ' : ''}{favor.state && favor.state !== 'undefined' ? favor.state : ''}
                      </Text>
                    </View>
                    
                    {/* {favor.lat_lng && (
                      <View className="flex-row mb-2">
                        <Text className="text-gray-600 font-medium w-20">Coordinates:</Text>
                        <Text className="text-gray-800 flex-1">
                          {favor.lat_lng}
                        </Text>
                      </View>
                    )}
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Responses:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.responses_count} total, {favor.pending_responses_count} pending
                      </Text>
                    </View> */}
                    
                    {/* <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Can Edit:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.can_edit ? '✅ Yes' : '❌ No'}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Can Apply:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.can_apply ? '✅ Yes' : '❌ No'}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Applied:</Text>
                      <Text className="text-gray-800 flex-1">
                        {favor.has_applied ? '✅ Yes' : '❌ No'}
                      </Text>
                    </View> */}
                    
                    {/* <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Created:</Text>
                      <Text className="text-gray-800 flex-1">
                        {formatDate(favor.created_at)}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium w-20">Updated:</Text>
                      <Text className="text-gray-800 flex-1">
                        {formatDate(favor.updated_at)}
                      </Text>
                    </View>
                     */}
                    {favor.accepted_response && (
                      <View className="flex-row mb-2">
                        <Text className="text-gray-600 font-medium w-20">Accepted:</Text>
                        <Text className="text-green-600 flex-1">
                          ✅ Response Accepted
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {favor.description && (
                    <View className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <Text className="text-gray-600 font-medium mb-2">Description:</Text>
                      <Text className="text-gray-800 leading-5">
                        {favor.description}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            ) : null}
          </ScrollView>

          {/* Fixed Action Button at Bottom */}
          {favor && favor.can_apply && (
            <View className="p-6 pt-3  bg-[#FBFFF0]">
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