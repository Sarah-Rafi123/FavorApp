import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { navigateToGetCertifiedWithSubscriptionCheck } from '../../utils/subscriptionUtils';
import { getPriorityColor, formatPriority } from '../../utils/priorityUtils';
import { FavorDetailsModal, StripeConnectWebView } from '../../components/overlays';
import { useFavors, useBrowseFavors } from '../../services/queries/FavorQueries';
import { Favor } from '../../services/apis/FavorApis';
import { useApplyToFavor } from '../../services/mutations/FavorMutations';
import { getCertificationStatus } from '../../services/apis/CertificationApis';
import { StripeConnectManager } from '../../services/StripeConnectManager';
import FilterSvg from '../../assets/icons/Filter';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import DollarSvg from '../../assets/icons/Dollar';
import UserSvg from '../../assets/icons/User';
import { LocationSmallSvg } from '../../assets/icons/LocationSmall';
import { ClockSmallSvg } from '../../assets/icons/ClockSmall';
import useFilterStore from '../../store/useFilterStore';
import useAuthStore from '../../store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HomeListScreenProps {
  onMapView: () => void;
  onFilter: () => void;
  onNotifications: () => void;
  navigation?: any;
}


export function HomeListScreen({ onMapView, onFilter, onNotifications, navigation }: HomeListScreenProps) {
  const [selectedFavorId, setSelectedFavorId] = useState<number | null>(null);
  const [showFavorDetailsModal, setShowFavorDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allFavors, setAllFavors] = useState<Favor[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [showStripeWebView, setShowStripeWebView] = useState(false);
  const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState<string>('');
  const [pendingFavorAction, setPendingFavorAction] = useState<(() => void) | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showEncouragementModal, setShowEncouragementModal] = useState(false);
  const [loadingFavorId, setLoadingFavorId] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    isSubscribed: boolean;
    isKYCVerified: boolean;
    isLoading: boolean;
    hasShownEncouragement: boolean;
  }>({ isSubscribed: false, isKYCVerified: false, isLoading: false, hasShownEncouragement: false });
  
  // Stripe Connect Manager
  const stripeConnectManager = StripeConnectManager.getInstance();
  
  // Get filter store state
  const { getFilterCount, hasActiveFilters, toBrowseParams } = useFilterStore();

  // Apply to Favor mutation with Stripe Connect setup callback
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
  const { user } = useAuthStore();

  // Use browseFavors when filters are active, useFavors when not
  const useFilteredData = hasActiveFilters();

  // Fetch filtered favors when filters are active
  const { 
    data: browseFavorsData, 
    isLoading: browseFavorsLoading, 
    error: browseFavorsError, 
    refetch: refetchBrowseFavors 
  } = useBrowseFavors(
    toBrowseParams(currentPage, 20),
    { enabled: useFilteredData }
  );

  // Fetch regular favors when no filters are active
  const { 
    data: favorsData, 
    isLoading: favorsLoading, 
    error: favorsError, 
    refetch: refetchFavors 
  } = useFavors(
    currentPage, 
    20,
    { enabled: !useFilteredData }
  );

  // Use the appropriate data source
  const currentData = useFilteredData ? browseFavorsData : favorsData;
  const isLoading = useFilteredData ? browseFavorsLoading : favorsLoading;
  const error = useFilteredData ? browseFavorsError : favorsError;
  const refetch = useFilteredData ? refetchBrowseFavors : refetchFavors;

  // Check verification status and show encouragement on every login
  const checkVerificationAndShowEncouragement = async () => {
    try {
      console.log('Checking verification status for encouragement modal on login');

      // Check KYC certification status
      const certificationResponse = await getCertificationStatus();
      const isKYCVerified = certificationResponse.data.is_kyc_verified === 'verified';
      
      // Check subscription status from certification response - is_certified is the definitive check
      const isSubscribed = certificationResponse.data.is_certified;
      
      setVerificationStatus({
        isKYCVerified,
        isSubscribed,
        isLoading: false,
        hasShownEncouragement: false
      });
      
      // Show encouragement on every login if user is not fully verified/subscribed
      // Do NOT show if user is both subscribed AND KYC verified
      if (!isKYCVerified || !isSubscribed) {
        console.log('Showing encouragement modal for incomplete verification/subscription');
        setShowEncouragementModal(true);
      } else {
        console.log('User is both subscribed and KYC verified - hiding promotional pop-ups');
        setShowEncouragementModal(false);
      }
    } catch (error) {
      console.error('Error checking verification status for encouragement:', error);
    }
  };

  const handleSkipEncouragement = async () => {
    try {
      // Simply close the modal without storing any skip status (will show on every login)
      setShowEncouragementModal(false);
      setVerificationStatus(prev => ({ ...prev, hasShownEncouragement: true }));
    } catch (error) {
      console.error('Error handling encouragement skip:', error);
      setShowEncouragementModal(false);
    }
  };

  // Cleanup Stripe Connect listeners on unmount
  useEffect(() => {
    return () => {
      stripeConnectManager.cleanup();
    };
  }, [stripeConnectManager]);

  // Check verification status after screen loads
  useEffect(() => {
    if (user?.id) {
      const timer = setTimeout(() => {
        checkVerificationAndShowEncouragement();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // Reset data when switching between filtered and unfiltered
  React.useEffect(() => {
    setCurrentPage(1);
    setAllFavors([]);
    setHasMorePages(true);
  }, [useFilteredData]);

  // Update allFavors when new data arrives
  React.useEffect(() => {
    if (currentData?.data.favors) {
      if (currentPage === 1) {
        // First page - replace all favors
        console.log('📚 First page loaded:', currentData.data.favors.length, 'favors');
        setAllFavors(currentData.data.favors);
        setIsLoadingMore(false);
      } else {
        // Additional pages - append to existing favors
        console.log('📚 Page', currentPage, 'loaded:', currentData.data.favors.length, 'new favors');
        setAllFavors(prev => {
          const newFavors = [...prev, ...currentData.data.favors];
          console.log('📚 Total favors now:', newFavors.length);
          return newFavors;
        });
        setIsLoadingMore(false);
      }
      
      // Check if there are more pages
      const hasMore = currentPage < currentData.data.meta.total_pages;
      console.log('📚 Has more pages:', hasMore, `(${currentPage}/${currentData.data.meta.total_pages})`);
      setHasMorePages(hasMore);
    }
  }, [currentData, currentPage]);

  const loadMoreFavors = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMorePages) {
      console.log('📚 Loading more favors - Current page:', currentPage, 'Has more pages:', hasMorePages);
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoading, isLoadingMore, hasMorePages, currentPage]);

  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing favor list...');
    setCurrentPage(1);
    setAllFavors([]);
    setHasMorePages(true);
    setIsLoadingMore(false);
    refetch();
  }, [refetch]);

  // Helper function to format priority text

  const handleFavorClick = (favor: Favor) => {
    setSelectedFavorId(favor.id);
    setShowFavorDetailsModal(true);
  };


  const handleStripeSetupRequired = async (onSetupComplete: () => void) => {
    try {
      console.log('🚀 Starting Stripe Connect WebView setup...');
      
      // Get the onboarding URL
      const stripeManager = StripeConnectManager.getInstance();
      const url = await stripeManager.setupPaymentAccount();
      
      // Store the completion action
      setPendingFavorAction(() => onSetupComplete);
      
      // Show WebView
      setStripeOnboardingUrl(url);
      setShowStripeWebView(true);
      
    } catch (error) {
      console.error('❌ Failed to start Stripe setup:', error);
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

  const checkVerificationStatus = async () => {
    try {
      setVerificationStatus(prev => ({ ...prev, isLoading: true }));
      
      // Check KYC certification status
      const certificationResponse = await getCertificationStatus();
      const isKYCVerified = certificationResponse.data.is_kyc_verified === 'verified';
      
      // Check subscription status from certification response - is_certified is the definitive check
      const isSubscribed = certificationResponse.data.is_certified;
      
      setVerificationStatus({
        isKYCVerified,
        isSubscribed,
        isLoading: false,
        hasShownEncouragement: false
      });
      
      return { isKYCVerified, isSubscribed };
    } catch (error) {
      console.error('Error checking verification status:', error);
      setVerificationStatus(prev => ({ ...prev, isLoading: false }));
      return { isKYCVerified: false, isSubscribed: false };
    }
  };

  const handleProvideFavor = async (favor: Favor) => {
    console.log('🎯 Provide favor clicked for:', favor.user.full_name);
    console.log('💰 Favor tip amount:', favor.tip);
    
    // Set loading state
    setLoadingFavorId(favor.id);
    
    try {
      // Check if this is a paid favor and validate Stripe Connect status
      const tipAmount = typeof favor.tip === 'string' ? parseFloat(favor.tip) : (favor.tip || 0);
      
      if (tipAmount === 0) {
        // Free favor - no payment setup needed, proceed directly
        console.log('✅ Free favor, no payment setup required');
        
        // Clear loading state before showing alert
        setLoadingFavorId(null);
        
        Alert.alert(
          'Apply to Favor',
          `Apply to provide favor for ${favor.user.full_name}? This is a volunteer favor.`,
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => setLoadingFavorId(null)
            },
            { 
              text: 'Apply',
              onPress: async () => {
                setLoadingFavorId(favor.id);
                try {
                  console.log('📝 Applying to free favor:', favor.id);
                  await applyToFavorMutation.mutateAsync(favor.id);
                  console.log('✅ Application submitted successfully');
                } catch (error: any) {
                  console.error('❌ Application failed:', error.message);
                } finally {
                  setLoadingFavorId(null);
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
        setLoadingFavorId(null);
        setShowVerificationModal(true);
        return;
      }

      // For paid favors, check if user can receive payments
      const canReceivePayments = await stripeConnectManager.canApplyToPaidFavor();
      
      if (canReceivePayments) {
        console.log('✅ User can apply to this paid favor');
        
        // Clear loading state before showing alert
        setLoadingFavorId(null);
        
        // Show confirmation dialog and apply to favor
        Alert.alert(
          'Apply to Favor',
          `Apply to provide favor for ${favor.user.full_name}? You'll receive $${tipAmount.toFixed(2)}.`,
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => setLoadingFavorId(null)
            },
            { 
              text: 'Apply',
              onPress: async () => {
                setLoadingFavorId(favor.id);
                try {
                  console.log('📝 Applying to favor:', favor.id);
                  await applyToFavorMutation.mutateAsync(favor.id);
                  console.log('✅ Application submitted successfully');
                } catch (error: any) {
                  console.error('❌ Application failed:', error.message);
                } finally {
                  setLoadingFavorId(null);
                }
              }
            }
          ]
        );
      } else {
        console.log('⚠️ Payment account setup required for paid favor');
        
        // Clear loading state before showing alert
        setLoadingFavorId(null);
        
        // Create callback that will apply to favor after payment setup is complete
        const onSetupComplete = async () => {
          console.log('🎉 Payment setup complete, now applying to favor automatically');
          try {
            await applyToFavorMutation.mutateAsync(favor.id);
            console.log('✅ Auto-application after payment setup successful');
          } catch (error: any) {
            console.error('❌ Auto-application after payment setup failed:', error.message);
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
      console.error('❌ Error handling provide favor:', error);
      setLoadingFavorId(null);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const FavorCard = ({ favor }: { favor: Favor }) => (
    <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
      <TouchableOpacity 
        onPress={() => handleFavorClick(favor)}
        activeOpacity={0.7}
      >
        <View className="flex-row mb-3">
          {favor.image_url ? (
            <Image
              source={{ uri: favor.image_url }}
              className="w-28 h-28 rounded-2xl mr-4"
              style={{ backgroundColor: '#f3f4f6' }}
            />
          ) : (
            <View className="w-28 h-28 rounded-2xl mr-4 bg-[#44A27B] items-center justify-center border border-gray-300">
              <View className="items-center">
                <UserSvg focused={false} />
              </View>
            </View>
          )}
          <View className="flex-1 justify-start">
            <View className="flex-row items-center mb-1">
              {!favor.favor_pay && parseFloat((favor.tip || 0).toString()) > 0 && (
                <View className="mr-2">
                  <DollarSvg />
                </View>
              )}
              <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
                {favor.user.full_name.length > 10 
                  ? `${favor.user.full_name.substring(0, 10)}...` 
                  : favor.user.full_name}
              </Text>
              <View className="ml-2 px-2 py-1 rounded">
                <Text 
                  className="text-sm font-medium"
                  style={{ color: getPriorityColor(favor.priority) }}
                >
                  {formatPriority(favor.priority)}
                </Text>
              </View>
            </View>
            {/* Category and Time row */}
            <View className="flex-row items-center mb-2">
              <Text className="text-sm text-gray-600" numberOfLines={1}>
                • {favor.title || favor.favor_subject.name}
              </Text>
              <Text className="text-sm text-gray-600 mx-1">|</Text>
              <ClockSmallSvg width={12} height={12} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
                {favor.time_to_complete || 'Time not specified'}
              </Text>
            </View>
            
            {/* Location row */}
            <View className="flex-row items-center mb-1">
              <LocationSmallSvg width={12} height={12} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
                {(() => {
                  // Display city and state if both are available
                  if (favor.city && favor.city !== 'undefined' && favor.state && favor.state !== 'undefined') {
                    return `${favor.city}, ${favor.state}`;
                  }
                  // Display city only if available
                  if (favor.city && favor.city !== 'undefined') {
                    return favor.city;
                  }
                  // Display state only if available
                  if (favor.state && favor.state !== 'undefined') {
                    return favor.state;
                  }
                  // Fall back to full address
                  return favor.address || 'Location not specified';
                })()}
              </Text>
            </View>
            <Text className="text-gray-700 text-sm mb-4 leading-5" numberOfLines={2}>
              {favor.description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className={`${loadingFavorId === favor.id ? 'bg-gray-400' : 'bg-green-500'} rounded-full py-3`}
        onPress={() => handleProvideFavor(favor)}
        disabled={loadingFavorId === favor.id}
      >
        {loadingFavorId === favor.id ? (
          <View className="flex-row justify-center items-center">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white text-center font-semibold text-base ml-2">Loading...</Text>
          </View>
        ) : (
          <Text className="text-white text-center font-semibold text-base">
            ${parseFloat((favor.tip || 0).toString()).toFixed(2)} | Provide a Favor
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-4 px-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-black">Home</Text>
          <View className="flex-row gap-x-2">
            <TouchableOpacity
              className="items-center justify-center relative w-10 h-10 rounded-full"
              onPress={onFilter}
            >
              <FilterSvg />
              {getFilterCount() > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">{getFilterCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
            <NotificationBell onPress={onNotifications} />
          </View>
        </View>

        {/* Map View / List View Toggle */}
        <View className="flex-row p-2 bg-white rounded-full shadow-lg">
          <TouchableOpacity 
            className="flex-1 py-2.5 items-center"
            onPress={onMapView}
          >
            <Text className="text-gray-600 font-semibold text-sm">Map View</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-2.5 bg-green-500 rounded-full items-center">
            <Text className="text-white font-semibold text-sm">List View</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Favor List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#44A27B" />
          <Text className="text-gray-600 mt-2">Loading favors...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-600 text-center mb-4">Failed to load favors</Text>
          <TouchableOpacity 
            className="bg-[#44A27B] px-6 py-3 rounded-lg"
            onPress={() => refetch()}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={allFavors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <FavorCard favor={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 160 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && currentPage === 1}
              onRefresh={handleRefresh}
              colors={['#44A27B']}
            />
          }
          onEndReached={loadMoreFavors}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            (isLoading && currentPage > 1) || isLoadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#44A27B" />
                <Text className="text-gray-500 mt-2">Loading more</Text>
              </View>
            ) : !hasMorePages && allFavors.length > 0 ? (
              <View className="py-4 items-center">
                <Text className="text-gray-500">No more favors to show</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-gray-500 text-lg mb-2">
                  {hasActiveFilters() ? "No favor found" : "No favors available"}
                </Text>
                <Text className="text-gray-400 text-center px-4">
                  {hasActiveFilters() 
                    ? "Try adjusting your filters to see more results"
                    : "Check back later for new favors"
                  }
                </Text>
                {hasActiveFilters() && (
                  <TouchableOpacity 
                    className="mt-4 bg-[#44A27B] px-6 py-3 rounded-lg"
                    onPress={onFilter}
                  >
                    <Text className="text-white font-medium">Adjust Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
        />
      )}

      {/* Favor Details Modal */}
      <FavorDetailsModal
        visible={showFavorDetailsModal}
        onClose={() => {
          setShowFavorDetailsModal(false);
          setSelectedFavorId(null);
        }}
        favorId={selectedFavorId}
        navigation={navigation}
      />

      {/* Encouragement Modal */}
      <Modal
        visible={showEncouragementModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipEncouragement}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-6 max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              🚀 Unlock Premium Benefits!
            </Text>
            
            <Text className="text-gray-600 text-center mb-6 leading-6">
              Get the most out of FavorApp by completing your verification and subscribing to premium features.
            </Text>
            
            <View className="mb-6">
              {/* {!verificationStatus.isSubscribed && (
                <View className="flex-row items-center mb-3">
                  <View className="w-5 h-5 rounded-full mr-3 bg-blue-500">
                    <Text className="text-white text-xs text-center leading-5">💎</Text>
                  </View>
                  <Text className="text-gray-700 flex-1">Premium subscription benefits</Text>
                </View>
              )} */}
              
              {!verificationStatus.isKYCVerified && (
                <View className="flex-row items-center mb-3">
                  <View className="w-5 h-5 rounded-full mr-3 bg-green-500">
                    <Text className="text-white text-xs text-center leading-5">✓</Text>
                  </View>
                  <Text className="text-gray-700 flex-1">Verified Community</Text>
                </View>
              )}
              
              {/* <View className="flex-row items-center mb-3">
                <View className="w-5 h-5 rounded-full mr-3 bg-yellow-500">
                  <Text className="text-white text-xs text-center leading-5">⭐</Text>
                </View>
                <Text className="text-gray-700 flex-1">Access to premium features</Text>
              </View> */}
              
              <View className="flex-row items-center mb-3">
                <View className="w-5 h-5 rounded-full mr-3 bg-purple-500">
                  <Text className="text-white text-xs text-center leading-5">🔒</Text>
                </View>
                <Text className="text-gray-700 flex-1">No Admin or Extra Fees</Text>
              </View>
              
              <View className="flex-row items-center mb-3">
                <View className="w-5 h-5 rounded-full mr-3 bg-cyan-500">
                  <Text className="text-white text-xs text-center leading-5">✓</Text>
                </View>
                <Text className="text-gray-700 flex-1">Free Verification</Text>
              </View>
              
              <View className="flex-row items-center mb-3">
                <View className="w-5 h-5 rounded-full mr-3 bg-orange-500">
                  <Text className="text-white text-xs text-center leading-5">💰</Text>
                </View>
                <Text className="text-gray-700 flex-1">Ask or Do Paid Favors</Text>
              </View>
              
              <View className="flex-row items-center mb-3">
                <View className="w-5 h-5 rounded-full mr-3 bg-green-600">
                  <Text className="text-white text-xs text-center leading-5">💲</Text>
                </View>
                <Text className="text-gray-700 flex-1">Just $4.99/month • Cancel anytime</Text>
              </View>
            </View>
            
            <View className="space-y-3">
              
              {!verificationStatus.isKYCVerified && (
                <TouchableOpacity
                  className="py-3 px-4 bg-green-500 rounded-xl mb-3"
                  onPress={() => {
                    setShowEncouragementModal(false);
                    navigateToGetCertifiedWithSubscriptionCheck(navigation);
                  }}
                >
                  <Text className="text-white text-center font-semibold">Upgrade Now</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                className="py-3 px-4 border border-gray-300 rounded-xl"
                onPress={handleSkipEncouragement}
              >
                <Text className="text-gray-600 text-center font-semibold">Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                  
                  {!verificationStatus.isKYCVerified && (
                    <TouchableOpacity
                      className="w-full py-3 px-4 bg-green-500 rounded-xl"
                      onPress={() => {
                        setShowVerificationModal(false);
                        navigateToGetCertifiedWithSubscriptionCheck(navigation);
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
    </ImageBackground>
  );
}