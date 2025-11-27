import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Favor } from '../../services/apis/FavorApis';
import { useApplyToFavor } from '../../services/mutations/FavorMutations';
import { getCertificationStatus } from '../../services/apis/CertificationApis';
import { StripeConnectManager } from '../../services/StripeConnectManager';
import useAuthStore from '../../store/useAuthStore';
import Toast from 'react-native-toast-message';

interface FavorMapPopupProps {
  visible: boolean;
  onClose: () => void;
  favor: Favor | null;
  navigation?: any;
}

export function FavorMapPopup({ visible, onClose, favor, navigation }: FavorMapPopupProps) {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    isSubscribed: boolean;
    isKYCVerified: boolean;
    isLoading: boolean;
  }>({ isSubscribed: false, isKYCVerified: false, isLoading: false });
  
  const { user } = useAuthStore();
  const applyToFavorMutation = useApplyToFavor({
    onStripeSetupRequired: (favorId) => {
      // For map popup, show simple alert directing to settings
      Alert.alert(
        'Stripe Account Setup Required',
        'To apply to paid favors, you need to set up your Stripe account. Please go to Settings > Payment Methods to set up your account.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Go to Settings',
            onPress: () => {
              // Close popup and navigate to settings
              onClose();
              // Navigation would be handled by parent component
              Alert.alert(
                'Navigate to Settings',
                'Please go to Settings > Payment Methods to set up your Stripe account.',
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    }
  });
  const stripeConnectManager = StripeConnectManager.getInstance();
  
  if (!favor) return null;

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

  const formatStatus = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In-Progress';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  const formatPayment = (favor: Favor) => {
    const tipAmount = typeof favor.tip === 'string' ? parseFloat(favor.tip) : (favor.tip || 0);
    if (tipAmount === 0) {
      return 'Unpaid';
    }
    return `$${tipAmount.toFixed(2)}`;
  };

  const formatLocation = (favor: Favor) => {
    if (favor.city && favor.state) {
      return `${favor.city}, ${favor.state}`;
    }
    if (favor.city) {
      return favor.city;
    }
    if (favor.state) {
      return favor.state;
    }
    return favor.address || 'Location not specified';
  };

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const checkVerificationStatus = async () => {
    try {
      setVerificationStatus(prev => ({ ...prev, isLoading: true }));
      
      const certificationResponse = await getCertificationStatus();
      const isKYCVerified = certificationResponse.data.is_kyc_verified === 'verified';
      const isSubscribed = user?.id ? true : false; // Placeholder logic
      
      setVerificationStatus({
        isKYCVerified,
        isSubscribed,
        isLoading: false
      });
      
      return { isKYCVerified, isSubscribed };
    } catch (error) {
      console.error('Error checking verification status:', error);
      setVerificationStatus(prev => ({ ...prev, isLoading: false }));
      return { isKYCVerified: false, isSubscribed: false };
    }
  };

  const handleApplyToFavor = async () => {
    const tipAmount = typeof favor.tip === 'string' ? parseFloat(favor.tip) : (favor.tip || 0);
    
    try {
      if (tipAmount === 0) {
        // Free favor - apply directly
        await applyToFavorMutation.mutateAsync(favor.id);
        Toast.show({
          type: 'success',
          text1: 'Application Successful!',
          text2: 'You have successfully applied to this favor.',
          visibilityTime: 3000,
        });
        onClose();
        return;
      }
      
      // Paid favor - check verification first
      const verification = await checkVerificationStatus();
      
      if (!verification.isSubscribed || !verification.isKYCVerified) {
        setShowVerificationModal(true);
        return;
      }
      
      // Check Stripe Connect status for paid favors
      const canReceive = await stripeConnectManager.canApplyToPaidFavor();
      
      if (canReceive) {
        await applyToFavorMutation.mutateAsync(favor.id);
        Toast.show({
          type: 'success',
          text1: 'Application Successful!',
          text2: `You have applied to this $${tipAmount.toFixed(2)} favor.`,
          visibilityTime: 3000,
        });
        onClose();
      } else {
        Alert.alert(
          'Payment Account Required',
          'You need to set up your payment account to apply to paid favors.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Set Up Payment', 
              onPress: () => {
                onClose();
                // Navigate to payment setup if navigation is available
                // This would need to be handled by the parent component
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error applying to favor:', error);
      
      // Show error toast based on the error message
      let errorMessage = 'Failed to apply to favor. Please try again.';
      
      if (error?.message) {
        if (error.message.includes('already applied')) {
          errorMessage = 'You have already applied to this favor.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'This favor is no longer available.';
        } else if (error.message.includes('completed')) {
          errorMessage = 'This favor has already been completed.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Toast.show({
        type: 'error',
        text1: 'Application Failed',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white rounded-2xl border-4 border-[#44A27B] p-6 w-full max-w-sm relative">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full items-center justify-center z-10"
          >
            <Text className="text-white font-bold text-lg leading-none">×</Text>
          </TouchableOpacity>

          {/* Title */}
          <View className="mb-6 pr-8">
            <Text className="text-2xl font-bold text-black text-center">
              {favor.title || favor.favor_subject?.name || 'Favor'}
            </Text>
          </View>

          {/* Favor Details */}
          <View className="space-y-4">
            {/* Category */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Category:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {favor.favor_subject?.name || 'N/A'}
              </Text>
            </View>

            {/* Description */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Description:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2" numberOfLines={3}>
                {favor.description || 'No description provided'}
              </Text>
            </View>

            {/* Payment */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Payment:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatPayment(favor)}
              </Text>
            </View>

            {/* Priority */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Priority:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatPriority(favor.priority)}
              </Text>
            </View>

            {/* Time to Complete */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Time to Complete:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {favor.time_to_complete || 'Not specified'}
              </Text>
            </View>

            {/* Location */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Location:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatLocation(favor)}
              </Text>
            </View>

            {/* Status */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Status:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatStatus(favor.status)}
              </Text>
            </View>

            {/* Posted Date */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Posted:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatPostedDate(favor.created_at)}
              </Text>
            </View>
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            className="bg-green-500 rounded-full py-3 mt-6"
            onPress={handleApplyToFavor}
            disabled={applyToFavorMutation.isPending}
          >
            {applyToFavorMutation.isPending ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center font-semibold ml-2">Applying...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold">
                ${typeof favor.tip === 'string' ? parseFloat(favor.tip).toFixed(2) : (favor.tip || 0).toFixed(2)} | Apply to Favor
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Verification Modal */}
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-6 max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              Verification Required
            </Text>
            
            {verificationStatus.isLoading ? (
              <View className="flex-row justify-center items-center py-8">
                <ActivityIndicator size="large" color="#44A27B" />
                <Text className="ml-3 text-gray-600">Checking verification status...</Text>
              </View>
            ) : (
              <>
                <Text className="text-gray-600 text-center mb-6 leading-6">
                  To apply for paid favors, you need to:
                </Text>
                
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <View className={`w-5 h-5 rounded-full mr-3 ${verificationStatus.isSubscribed ? 'bg-green-500' : 'bg-red-500'}`}>
                      <Text className="text-white text-xs text-center leading-5">
                        {verificationStatus.isSubscribed ? '✓' : '✗'}
                      </Text>
                    </View>
                    <Text className="text-gray-700 flex-1">Have an active subscription</Text>
                  </View>
                  
                  <View className="flex-row items-center mb-3">
                    <View className={`w-5 h-5 rounded-full mr-3 ${verificationStatus.isKYCVerified ? 'bg-green-500' : 'bg-red-500'}`}>
                      <Text className="text-white text-xs text-center leading-5">
                        {verificationStatus.isKYCVerified ? '✓' : '✗'}
                      </Text>
                    </View>
                    <Text className="text-gray-700 flex-1">Complete KYC verification through Shufti Pro</Text>
                  </View>
                </View>
                
                <View className="flex-row gap-x-3">
                  <TouchableOpacity
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                    onPress={() => setShowVerificationModal(false)}
                  >
                    <Text className="text-gray-600 text-center font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  
                  {!verificationStatus.isSubscribed && (
                    <TouchableOpacity
                      className="flex-1 py-3 px-4 bg-blue-500 rounded-xl"
                      onPress={() => {
                        setShowVerificationModal(false);
                        onClose();
                        navigation?.navigate('Settings', {
                          screen: 'SubscriptionsScreen'
                        });
                      }}
                    >
                      <Text className="text-white text-center font-semibold">Get Subscribed</Text>
                    </TouchableOpacity>
                  )}
                  
                  {!verificationStatus.isKYCVerified && (
                    <TouchableOpacity
                      className="flex-1 py-3 px-4 bg-green-500 rounded-xl"
                      onPress={() => {
                        setShowVerificationModal(false);
                        onClose();
                        navigation?.navigate('Settings', {
                          screen: 'GetCertifiedScreen'
                        });
                      }}
                    >
                      <Text className="text-white text-center font-semibold">Get Certified</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
}