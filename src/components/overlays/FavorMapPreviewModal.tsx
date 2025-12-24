import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { getPriorityColor, formatPriority } from '../../utils/priorityUtils';
import { Favor } from '../../services/apis/FavorApis';
import { useApplyToFavor } from '../../services/mutations/FavorMutations';
import { getCertificationStatus } from '../../services/apis/CertificationApis';
import { StripeConnectManager } from '../../services/StripeConnectManager';
import { StripeConnectWebView } from './StripeConnectWebView';
import { usePublicUserProfileQuery } from '../../services/queries/ProfileQueries';
import { BlurredEmail, BlurredPhone } from '../common';
import useAuthStore from '../../store/useAuthStore';
import { navigateToGetCertifiedWithSubscriptionCheck } from '../../utils/subscriptionUtils';

interface FavorMapPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  favor: Favor;
  navigation?: any;
}

export function FavorMapPreviewModal({ visible, onClose, favor, navigation }: FavorMapPreviewModalProps) {
  const [showStripeWebView, setShowStripeWebView] = useState(false);
  const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState<string>('');
  const [pendingFavorAction, setPendingFavorAction] = useState<(() => void) | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    isSubscribed: boolean;
    isKYCVerified: boolean;
    isLoading: boolean;
  }>({ isSubscribed: false, isKYCVerified: false, isLoading: false });

  // Apply to Favor mutation with Stripe Connect setup callback and Stripe Connect Manager
  const applyToFavorMutation = useApplyToFavor({
    onStripeSetupRequired: (favorId) => {
      // Show Stripe Connect setup popup
      Alert.alert(
        'Stripe Account Setup Required',
        'To apply to paid favors, you need to set up your Stripe account to receive payments. Would you like to set it up now?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Setup Stripe Account',
            onPress: () => {
              // Create callback that will apply to favor after setup
              const onSetupComplete = async () => {
                try {
                  console.log('🎯 Stripe setup completed, now applying to favor:', favorId);
                  await applyToFavorMutation.mutateAsync(favorId);
                } catch (error: any) {
                  console.error('❌ Apply to favor failed after Stripe setup:', error.message);
                  Alert.alert(
                    'Error',
                    'Failed to apply to favor after setup. Please try again.',
                    [{ text: 'OK' }]
                  );
                }
              };
              
              // Start WebView setup
              handleStripeSetupRequired(onSetupComplete);
            }
          }
        ]
      );
    }
  });
  const stripeConnectManager = StripeConnectManager.getInstance();
  const { user } = useAuthStore();

  // Get public user profile for additional details
  const { data: userProfileData } = usePublicUserProfileQuery(
    favor?.user?.id || null, 
    { enabled: !!favor?.user?.id && visible }
  );
  
  const userProfile = userProfileData?.data?.user;

  const checkVerificationStatus = async () => {
    try {
      setVerificationStatus(prev => ({ ...prev, isLoading: true }));
      
      // Check KYC certification status
      const certificationResponse = await getCertificationStatus();
      const isKYCVerified = certificationResponse.data.is_kyc_verified === 'verified';
      
      // Check subscription status from certification response
      const isSubscribed = certificationResponse.data.is_certified;
      
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

  const handleStripeSetupRequired = async (onSetupComplete: () => void) => {
    try {
      console.log('🚀 Starting Stripe Connect WebView setup from map modal...');
      
      // Get the onboarding URL
      const stripeManager = StripeConnectManager.getInstance();
      const url = await stripeManager.setupPaymentAccount();
      
      // Store the completion action
      setPendingFavorAction(() => onSetupComplete);
      
      // Show WebView
      setStripeOnboardingUrl(url);
      setShowStripeWebView(true);
      
    } catch (error) {
      console.error('❌ Failed to start Stripe setup from map modal:', error);
    }
  };

  const handleStripeWebViewSuccess = async () => {
    // Close WebView first
    setShowStripeWebView(false);
    setStripeOnboardingUrl('');
    
    // Check account status and execute pending action
    const stripeManager = StripeConnectManager.getInstance();
    await stripeManager.checkAccountStatusAfterSetup(pendingFavorAction || undefined);
    
    // Clear pending action
    setPendingFavorAction(null);
  };

  const handleStripeWebViewClose = () => {
    setShowStripeWebView(false);
    setStripeOnboardingUrl('');
    setPendingFavorAction(null);
  };

  // Handle applying to favor - same logic as FavorDetailsModal
  const handleApplyToFavor = async () => {
    if (!favor) return;

    console.log('🎯 Apply to favor clicked from map modal for:', favor.user.full_name);
    console.log('💰 Favor tip amount:', favor.tip);
    
    try {
      // Check if this is a paid favor and validate Stripe Connect status
      const tipAmount = typeof favor.tip === 'string' ? parseFloat(favor.tip) : (favor.tip || 0);
      
      if (tipAmount === 0) {
        // Free favor - no payment setup needed, proceed directly
        console.log('✅ Free favor, no payment setup required');
        
        Alert.alert(
          'Apply to Favor',
          `Apply to provide favor for ${favor.user.full_name}? This is a volunteer favor.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Apply',
              onPress: async () => {
                try {
                  console.log('📝 Applying to free favor from map modal:', favor.id);
                  await applyToFavorMutation.mutateAsync(favor.id);
                  console.log('✅ Application submitted successfully from map modal');
                  onClose(); // Close modal after successful application
                } catch (error: any) {
                  console.error('❌ Application failed from map modal:', error.message);
                }
              }
            }
          ]
        );
        return;
      }

      // For paid favors, check subscription and KYC verification first
      const verification = await checkVerificationStatus();
      
      if (!verification.isSubscribed || !verification.isKYCVerified) {
        setShowVerificationModal(true);
        return;
      }

      // For paid favors, check if user can receive payments
      const canReceivePayments = await stripeConnectManager.canApplyToPaidFavor();
      
      if (canReceivePayments) {
        console.log('✅ User can apply to this paid favor from map modal');
        
        // Show confirmation dialog and apply to favor
        Alert.alert(
          'Apply to Favor',
          `Apply to provide favor for ${favor.user.full_name}? You'll receive $${tipAmount.toFixed(2)}.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Apply',
              onPress: async () => {
                try {
                  console.log('📝 Applying to favor from map modal:', favor.id);
                  await applyToFavorMutation.mutateAsync(favor.id);
                  console.log('✅ Application submitted successfully from map modal');
                  onClose(); // Close modal after successful application
                } catch (error: any) {
                  console.error('❌ Application failed from map modal:', error.message);
                }
              }
            }
          ]
        );
      } else {
        console.log('⚠️ Payment account setup required for paid favor from map modal');
        
        // Create callback that will apply to favor after payment setup is complete
        const onSetupComplete = async () => {
          console.log('🎉 Payment setup complete, now applying to favor automatically from map modal');
          try {
            await applyToFavorMutation.mutateAsync(favor.id);
            console.log('✅ Auto-application after payment setup successful from map modal');
            onClose(); // Close modal after successful application
          } catch (error: any) {
            console.error('❌ Auto-application after payment setup failed from map modal:', error.message);
          }
        };
        
        // Show setup required dialog and trigger WebView setup
        Alert.alert(
          'Payment Account Required',
          'Set up your payment account to apply to paid favors',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Set Up Now', 
              onPress: () => handleStripeSetupRequired(onSetupComplete)
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error handling apply to favor from map modal:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50 items-center justify-center px-6"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          className="bg-white rounded-3xl p-6 w-full max-w-sm relative border-4" 
          style={{borderColor: '#71DFB1'}}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          
          {/* Close Button */}
          <TouchableOpacity 
            className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-white text-lg font-bold">×</Text>
          </TouchableOpacity>

          {/* Favor Title */}
          <Text className="text-xl font-bold text-gray-800 text-center mb-4 mt-4">
            {favor.title || favor.favor_subject.name}
          </Text>

          {/* User Details Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Posted by {favor.user.full_name}
            </Text>
            
            {/* User Avatar and Basic Info */}
            <View className="flex-row mb-4">
              <View className="w-12 h-12 bg-[#44A27B] rounded-xl mr-4 items-center justify-center">
                {userProfile?.image_url ? (
                  <Image 
                    source={{ uri: userProfile.image_url }}
                    className="w-full h-full rounded-xl"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    {favor.user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 font-bold text-sm mb-1">Email</Text>
                <BlurredEmail style={{ fontSize: 14 }}>
                  {userProfile?.email || favor.user.email}
                </BlurredEmail>
              </View>
            </View>

            {/* User Details Grid */}
            <View className="space-y-3">
              {/* Row 1 */}
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-600 font-bold text-xs mb-1">Member Since</Text>
                  <Text className="text-gray-800 text-sm">
                    {userProfile?.member_since || 'July 2025'}
                  </Text>
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-600 font-bold text-xs mb-1">Phone (call)</Text>
                  <BlurredPhone style={{ fontSize: 12 }}>
                    {userProfile?.phone_no_call || '** *** ****'}
                  </BlurredPhone>
                </View>
              </View>
              
              {/* Row 2 */}
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-600 font-bold text-xs mb-1">Age</Text>
                  <Text className="text-gray-800 text-sm">
                    {userProfile?.age || 'Not specified'}
                  </Text>
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-600 font-bold text-xs mb-1">Experience</Text>
                  <Text className="text-gray-800 text-sm">
                    {userProfile?.years_of_experience 
                      ? `${userProfile.years_of_experience} Years`
                      : favor.user.years_of_experience 
                      ? `${favor.user.years_of_experience} Years`
                      : '0 Years'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Favor Details */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">Favor Details</Text>
            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Category:</Text> {favor.favor_subject.name}
              </Text>
            </View>

            {favor.description && (
              <View className="mb-3">
                <Text className="text-gray-700 text-base">
                  <Text className="font-semibold">Description:</Text> {favor.description}
                </Text>
              </View>
            )}

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Payment:</Text> {parseFloat((favor.tip || 0).toString()) > 0 
                  ? `$${parseFloat((favor.tip || 0).toString()).toFixed(2)}`
                  : 'Unpaid'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Priority:</Text> {' '}
                <Text style={{ color: getPriorityColor(favor.priority), fontWeight: '600' }}>
                  {formatPriority(favor.priority)}
                </Text>
              </Text>
            </View>

            {favor.time_to_complete && (
              <View className="mb-3">
                <Text className="text-gray-700 text-base">
                  <Text className="font-semibold">Time to Complete:</Text> {favor.time_to_complete}
                </Text>
              </View>
            )}

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Location:</Text> {favor.city && favor.city !== 'undefined' ? favor.city : 'undefined'}, {favor.state && favor.state !== 'undefined' ? favor.state : 'Ohio'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Status:</Text> {favor.status}
              </Text>
            </View>

            {favor.created_at && (
              <View className="mb-3">
                <Text className="text-gray-700 text-base">
                  <Text className="font-semibold">Posted:</Text> {new Date(favor.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Apply Button - same as FavorDetailsModal */}
          {favor.can_apply && (
            <View className="mt-6">
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

        </TouchableOpacity>
      </TouchableOpacity>

      {/* Verification Status Modal */}
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
                    <Text className="text-gray-700 flex-1">Complete Identity Verification through Shufti Pro</Text>
                  </View>
                </View>
                
                <View className="gap-y-3">
                  
                  {!verificationStatus.isSubscribed && navigation && (
                    <TouchableOpacity
                      className="w-full py-3 px-4 bg-green-500 rounded-xl"
                      onPress={() => {
                        setShowVerificationModal(false);
                        navigation?.navigate('Settings', { screen: 'SubscriptionsScreen' });
                      }}
                    >
                      <Text className="text-white text-center font-semibold">Get Subscription</Text>
                    </TouchableOpacity>
                  )}
                  
                  {!verificationStatus.isKYCVerified && verificationStatus.isSubscribed && navigation && (
                    <TouchableOpacity
                      className="w-full py-3 px-4 bg-green-500 rounded-xl"
                      onPress={() => {
                        setShowVerificationModal(false);
                        navigation?.navigate('Settings', { screen: 'GetCertifiedScreen' });
                      }}
                    >
                      <Text className="text-white text-center font-semibold">Get Verified</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    className="w-full py-3 px-4 border border-gray-300 rounded-xl"
                    onPress={() => setShowVerificationModal(false)}
                  >
                    <Text className="text-gray-600 text-center font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Stripe Connect WebView */}
      <StripeConnectWebView
        visible={showStripeWebView}
        onClose={handleStripeWebViewClose}
        onSuccess={handleStripeWebViewSuccess}
        onboardingUrl={stripeOnboardingUrl}
      />
    </Modal>
  );
}