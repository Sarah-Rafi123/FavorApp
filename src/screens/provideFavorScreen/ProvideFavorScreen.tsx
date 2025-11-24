import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import ProvideFavorSvg from '../../assets/icons/ProvideFavor';
import PersonwithHeartSvg from '../../assets/icons/PersonwithHeart';
import { TimerSvg } from '../../assets/icons/Timer';
import DollarSvg from '../../assets/icons/Dollar';
import UserSvg from '../../assets/icons/User';
import FilterSvg from '../../assets/icons/Filter';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import CancelSvg from '../../assets/icons/Cancel';
import { LocationSmallSvg } from '../../assets/icons/LocationSmall';
import { ClockSmallSvg } from '../../assets/icons/ClockSmall';
import { useMyFavors, useFavorSubjects, useBrowseFavors, useFavors } from '../../services/queries/FavorQueries';
import { useApplyToFavor, useCancelRequest, useCompleteFavor } from '../../services/mutations/FavorMutations';
import { StripeConnectManager } from '../../services/StripeConnectManager';
import { Favor } from '../../services/apis/FavorApis';
import { FavorSubject } from '../../services/apis/FavorSubjectApis';
import { FavorDetailsModal, StripeConnectWebView } from '../../components/overlays';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../store/useAuthStore';
import useFilterStore from '../../store/useFilterStore';

interface ProvideFavorScreenProps {
  navigation?: any;
}


export function ProvideFavorScreen({ navigation }: ProvideFavorScreenProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'History'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedFavorId, setSelectedFavorId] = useState<number | null>(null);
  const [showFavorDetailsModal, setShowFavorDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [favorToCancel, setFavorToCancel] = useState<Favor | null>(null);
  const [showStripeWebView, setShowStripeWebView] = useState(false);
  const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState<string>('');
  const [pendingFavorAction, setPendingFavorAction] = useState<(() => void) | null>(null);
  
  
  // Pagination state (same as HomeListScreen)
  const [currentPage, setCurrentPage] = useState(1);
  const [allFavors, setAllFavors] = useState<Favor[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  
  // Get auth store state for debugging
  const { user, accessToken } = useAuthStore();

  // Get filter store state
  const { hasActiveFilters, toBrowseParams, getFilterCount } = useFilterStore();

  // Apply to Favor mutation, Cancel Request mutation, Complete Favor mutation, and Stripe Connect Manager
  const applyToFavorMutation = useApplyToFavor();
  const cancelRequestMutation = useCancelRequest();
  const completeFavorMutation = useCompleteFavor();
  const stripeConnectManager = StripeConnectManager.getInstance();

  // Fetch favor subjects/categories
  const { data: favorSubjectsResponse } = useFavorSubjects();

  // Use browseFavors when filters are active, useFavors when not (same logic as HomeListScreen)
  const useFilteredData = hasActiveFilters();
  
  // Browse favors with filters when filters are active (same params as HomeListScreen)
  const {
    data: browseFavorsData,
    isLoading: browseFavorsLoading,
    error: browseFavorsError,
    refetch: refetchBrowseFavors,
  } = useBrowseFavors(
    toBrowseParams(currentPage, 12),
    { enabled: useFilteredData }
  );

  // Fetch data using regular favors API with pagination (same as HomeListScreen)
  const {
    data: favorsData,
    isLoading: favorsLoading,
    error: favorsError,
    refetch: refetchFavors,
  } = useFavors(
    currentPage, // page - now uses currentPage for pagination
    12, // per_page 
    { enabled: !useFilteredData }
  );

  const {
    data: activeMyFavorsResponse,
    isLoading: activeMyFavorsLoading,
    error: activeMyFavorsError,
    refetch: refetchActiveMyFavors,
  } = useMyFavors(
    { 
      type: 'providing', 
      tab: 'active', 
      page: 1, 
      per_page: 10,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      sort_by: 'updated_at',
      sort_order: 'asc'
    },
    { enabled: activeTab === 'Active' }
  );

  const {
    data: inProgressMyFavorsResponse,
    isLoading: inProgressMyFavorsLoading,
    error: inProgressMyFavorsError,
    refetch: refetchInProgressMyFavors,
  } = useMyFavors(
    { 
      type: 'providing', 
      tab: 'in-progress', 
      page: 1, 
      per_page: 10,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      sort_by: 'updated_at',
      sort_order: 'asc'
    },
    { enabled: activeTab === 'Active' }
  );

  const {
    data: completedMyFavorsResponse,
    isLoading: completedMyFavorsLoading,
    error: completedMyFavorsError,
    refetch: refetchCompletedMyFavors,
  } = useMyFavors(
    { 
      type: 'providing', 
      tab: 'completed', 
      page: 1, 
      per_page: 10,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      sort_by: 'updated_at',
      sort_order: 'asc'
    },
    { enabled: true } // Always enabled to prevent re-fetching when switching tabs
  );

  const {
    data: cancelledMyFavorsResponse,
    isLoading: cancelledMyFavorsLoading,
    error: cancelledMyFavorsError,
    refetch: refetchCancelledMyFavors,
  } = useMyFavors(
    { 
      type: 'providing', 
      tab: 'cancelled', 
      page: 1, 
      per_page: 10,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      sort_by: 'updated_at',
      sort_order: 'asc'
    },
    { enabled: true } // Always enabled to prevent re-fetching when switching tabs
  );

  // Use the appropriate data source for "All" tab (same as HomeListScreen)
  const currentData = useFilteredData ? browseFavorsData : favorsData;
  const isLoadingCurrentData = useFilteredData ? browseFavorsLoading : favorsLoading;
  const currentDataError = useFilteredData ? browseFavorsError : favorsError;
  const refetchCurrentData = useFilteredData ? refetchBrowseFavors : refetchFavors;

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'All':
        // For "All" tab, use paginated data from allFavors state (same as HomeListScreen)
        console.log('📊 getCurrentData for All tab - allFavors length:', allFavors.length);
        return allFavors;
      case 'Active':
        // Combine active and in-progress favors, but exclude completed/cancelled favors
        const rawActiveFavors = activeMyFavorsResponse?.data.favors || [];
        const rawInProgressFavors = inProgressMyFavorsResponse?.data.favors || [];
        
        // Filter out completed and cancelled favors from Active tab
        const activeFavors = rawActiveFavors.filter(favor => 
          favor.status !== 'completed' && favor.status !== 'cancelled'
        );
        const inProgressFavors = rawInProgressFavors.filter(favor => 
          favor.status !== 'completed' && favor.status !== 'cancelled'
        );
        
        // Debug logging to track active tab filtering
        console.log('📊 Active tab data filtering:');
        console.log(`   Raw active favors: ${rawActiveFavors.length}, filtered: ${activeFavors.length}`);
        console.log(`   Raw in-progress favors: ${rawInProgressFavors.length}, filtered: ${inProgressFavors.length}`);
        console.log('   Active tab favor statuses:', [...activeFavors, ...inProgressFavors].map(f => f.status));
        
        return [...activeFavors, ...inProgressFavors];
      case 'History':
        // Combine completed and cancelled favors - with extra filtering for safety
        const rawCompletedFavors = completedMyFavorsResponse?.data.favors || [];
        const rawCancelledFavors = cancelledMyFavorsResponse?.data.favors || [];
        
        const completedFavors = rawCompletedFavors
          .filter(favor => favor.status === 'completed');
        const cancelledFavors = rawCancelledFavors
          .filter(favor => favor.status === 'cancelled');
        
        // Debug logging to track status filtering
        console.log('📊 History tab data filtering:');
        console.log(`   Raw completed favors: ${rawCompletedFavors.length}, filtered: ${completedFavors.length}`);
        console.log(`   Raw cancelled favors: ${rawCancelledFavors.length}, filtered: ${cancelledFavors.length}`);
        
        const allHistoryFavors = [...completedFavors, ...cancelledFavors];
        console.log(`   Total history favors: ${allHistoryFavors.length}`);
        
        // Log any unexpected statuses for debugging
        const allRawFavors = [...rawCompletedFavors, ...rawCancelledFavors];
        const unexpectedStatuses = allRawFavors
          .filter(favor => favor.status !== 'completed' && favor.status !== 'cancelled')
          .map(favor => favor.status);
        if (unexpectedStatuses.length > 0) {
          console.warn('⚠️ Unexpected statuses in History tab:', Array.from(new Set(unexpectedStatuses)));
        }
        
        return allHistoryFavors;
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'All':
        // Same logic as HomeListScreen
        return isLoadingCurrentData;
      case 'Active':
        return activeMyFavorsLoading || inProgressMyFavorsLoading;
      case 'History':
        return completedMyFavorsLoading || cancelledMyFavorsLoading;
      default:
        return false;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case 'All':
        // Same logic as HomeListScreen
        return currentDataError;
      case 'Active':
        return activeMyFavorsError || inProgressMyFavorsError;
      case 'History':
        return completedMyFavorsError || cancelledMyFavorsError;
      default:
        return null;
    }
  };

  const currentFavors = getCurrentData();
  const isLoading = getCurrentLoading();
  const error = getCurrentError();
  
  // Enhanced loading detection to prevent premature empty states
  const isActuallyLoading = (
    // For "All" tab: show loading if we don't have data yet and no error, or during initial load
    activeTab === 'All' && (
      (allFavors.length === 0 && !error && !refreshing && isLoadingCurrentData) ||
      (allFavors.length === 0 && !error && currentPage === 1 && !currentData) ||
      (refreshing && allFavors.length === 0)
    )
  ) || (
    // For Active/History tabs: only show loading during initial load or refresh, not when data is present
    activeTab !== 'All' && (
      (refreshing) || 
      (currentFavors.length === 0 && !error && isLoading && !refreshing)
    )
  );

  // Debug logging for loading states
  React.useEffect(() => {
    console.log('🔍 ProvideFavorScreen Loading States:', {
      activeTab,
      isLoading,
      isLoadingCurrentData,
      refreshing,
      isActuallyLoading,
      currentFavorsLength: currentFavors.length,
      allFavorsLength: allFavors.length,
      hasError: !!error,
      currentPage,
      ...(activeTab === 'History' && {
        completedMyFavorsLoading,
        cancelledMyFavorsLoading,
        completedDataLength: completedMyFavorsResponse?.data?.favors?.length || 0,
        cancelledDataLength: cancelledMyFavorsResponse?.data?.favors?.length || 0,
        completedError: !!completedMyFavorsError,
        cancelledError: !!cancelledMyFavorsError,
      })
    });
  }, [activeTab, isLoading, isLoadingCurrentData, refreshing, isActuallyLoading, currentFavors.length, allFavors.length, error, currentPage, completedMyFavorsLoading, cancelledMyFavorsLoading, completedMyFavorsResponse, cancelledMyFavorsResponse, completedMyFavorsError, cancelledMyFavorsError]);

  // Debug logging
  React.useEffect(() => {
    const debugAuth = async () => {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔍 ProvideFavorScreen Debug:');
      console.log('Active Tab:', activeTab);
      console.log('Current Favors Count:', currentFavors.length);
      console.log('Is Loading:', isLoading);
      console.log('Error:', error?.message || 'No error');
      console.log('AsyncStorage Token:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('Auth Store User:', !!user, user?.firstName);
      console.log('Auth Store Token:', !!accessToken, accessToken ? `${accessToken.substring(0, 20)}...` : 'null');
      
      if (activeTab === 'All') {
        console.log('Current Data Response:', currentData);
        console.log('Current Data Error:', currentDataError);
      }
    };
    
    debugAuth();
  }, [activeTab, currentFavors, isLoading, error, currentData, currentDataError, user, accessToken]);

  // Reset pagination when switching between filtered and unfiltered (same as HomeListScreen)
  React.useEffect(() => {
    console.log('🔄 Resetting pagination due to filter change');
    console.log('🔍 Use Filtered Data:', useFilteredData);
    
    setCurrentPage(1);
    setAllFavors([]);
    setHasMorePages(true);
  }, [useFilteredData]);

  // Reset pagination and state when switching to All tab, and trigger refetch
  React.useEffect(() => {
    if (activeTab === 'All') {
      console.log('🔄 Switching to All tab - resetting state');
      setCurrentPage(1);
      setAllFavors([]);
      setHasMorePages(true);
      
      // Trigger refetch to ensure data loads when switching back to All tab
      setTimeout(() => {
        console.log('🚀 Triggering refetch for All tab after tab switch');
        refetchCurrentData();
      }, 100);
    }
  }, [activeTab, refetchCurrentData]);

  // Update allFavors when new data arrives (same as HomeListScreen)
  React.useEffect(() => {
    if (currentData?.data?.favors && activeTab === 'All') {
      console.log('🔄 Updating allFavors for currentPage:', currentPage);
      console.log('📊 Received favors count:', currentData.data.favors.length);
      console.log('📄 Total pages:', currentData.data.meta?.total_pages);
      
      if (currentPage === 1) {
        // First page - replace all favors
        console.log('🔄 First page - replacing all favors');
        setAllFavors(currentData.data.favors);
      } else {
        // Additional pages - append to existing favors
        console.log('🔄 Additional page - appending favors');
        setAllFavors(prev => [...prev, ...currentData.data.favors]);
      }
      
      // Check if there are more pages
      if (currentData.data.meta?.total_pages) {
        setHasMorePages(currentPage < currentData.data.meta.total_pages);
        console.log('📄 Has more pages:', currentPage < currentData.data.meta.total_pages);
      }
    } else if (activeTab === 'All') {
      console.log('⚠️ No data received or data structure is unexpected for All tab:', currentData);
    }
  }, [currentData, currentPage, activeTab]);

  // Load more favors function (same as HomeListScreen)
  const loadMoreFavors = useCallback(() => {
    if (activeTab === 'All' && !isLoading && hasMorePages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [activeTab, isLoading, hasMorePages]);

  const handleRefresh = useCallback(async () => {
    console.log('🔄 Handle refresh triggered for tab:', activeTab);
    
    switch (activeTab) {
      case 'All':
        // For All tab, use the refreshing state and refetch without clearing data first
        console.log('🔄 Refreshing All tab - setting refreshing state');
        setRefreshing(true);
        
        try {
          // Reset pagination state
          setCurrentPage(1);
          setHasMorePages(true);
          
          console.log('🚀 Calling refetch for All tab');
          const result = await refetchCurrentData();
          
          // Only clear and reset data after successful refetch
          if (result.data) {
            console.log('✅ All tab refetch successful, updating data');
            setAllFavors(result.data.data.favors || []);
            
            // Update pagination info
            if (result.data.data.meta?.total_pages) {
              setHasMorePages(1 < result.data.data.meta.total_pages);
            }
          }
        } catch (error) {
          console.error('❌ Error refreshing All tab:', error);
        } finally {
          setRefreshing(false);
        }
        break;
      case 'Active':
        console.log('🔄 Refreshing Active tab');
        setRefreshing(true);
        Promise.all([refetchActiveMyFavors(), refetchInProgressMyFavors()])
          .then(() => {
            console.log('✅ Active tab refetch completed');
          })
          .catch((error) => {
            console.error('❌ Error refreshing Active tab:', error);
          })
          .finally(() => {
            setRefreshing(false);
          });
        break;
      case 'History':
        console.log('🔄 Refreshing History tab');
        setRefreshing(true);
        Promise.all([refetchCompletedMyFavors(), refetchCancelledMyFavors()])
          .then(() => {
            console.log('✅ History tab refetch completed');
          })
          .catch((error) => {
            console.error('❌ Error refreshing History tab:', error);
          })
          .finally(() => {
            setRefreshing(false);
          });
        break;
    }
  }, [activeTab, refetchCurrentData, refetchActiveMyFavors, refetchInProgressMyFavors, refetchCompletedMyFavors, refetchCancelledMyFavors]);

  const handleAskFavor = () => {
    navigation?.navigate('AskFavorScreen');
  };

  const handleExploreFavors = () => {
    // Navigate to the Home tab
    navigation?.navigate('Home');
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(c => c !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  const categories = favorSubjectsResponse?.data.favor_subjects || [];


  // Check if user needs to re-authenticate
  React.useEffect(() => {
    if (user && !accessToken) {
      console.log('⚠️ User exists but no access token - authentication issue detected');
      // The user somehow got past the login screen without proper token storage
    }
  }, [user, accessToken]);

  // Refetch data when categories change
  React.useEffect(() => {
    const refetchData = async () => {
      try {
        switch (activeTab) {
          case 'All':
            await refetchCurrentData();
            break;
          case 'Active':
            await Promise.all([refetchActiveMyFavors(), refetchInProgressMyFavors()]);
            break;
          case 'History':
            await Promise.all([refetchCompletedMyFavors(), refetchCancelledMyFavors()]);
            break;
        }
      } catch (error) {
        console.error('Error refetching after category change:', error);
      }
    };

    if (selectedCategories.length >= 0) { // Refetch even when clearing filters
      refetchData();
    }
  }, [selectedCategories, activeTab]); // Dependencies

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

  const handleProvideFavor = async (favor: Favor) => {
    console.log('🎯 Provide favor clicked for:', favor.user.full_name);
    console.log('💰 Favor tip amount:', favor.tip);
    
    try {
      // Check if this is a paid favor and validate Stripe Connect status
      const tipAmount = typeof favor.tip === 'string' ? parseFloat(favor.tip) : (favor.tip || 0);
      
      if (tipAmount === 0) {
        // Free favor - no Stripe validation needed
        Alert.alert(
          'Apply to Favor',
          `Apply to provide favor for ${favor.user.full_name}? This is a volunteer favor.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Apply',
              onPress: async () => {
                try {
                  console.log('🤝 Applying to free favor:', favor.id);
                  await applyToFavorMutation.mutateAsync(favor.id);
                } catch (error: any) {
                  console.error('❌ Apply to favor failed:', error.message);
                  // Error handling is done by the mutation's onError callback
                }
              }
            }
          ]
        );
        return;
      }

      // Paid favor - check Stripe Connect status
      const stripeManager = StripeConnectManager.getInstance();
      const canReceive = await stripeManager.canApplyToPaidFavor();
      
      if (canReceive) {
        // User can receive payments - show confirmation and apply
        Alert.alert(
          'Apply to Favor',
          `Apply to provide favor for ${favor.user.full_name}? You'll receive $${tipAmount.toFixed(2)}.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Apply',
              onPress: async () => {
                try {
                  console.log('🤝 Applying to paid favor:', favor.id);
                  await applyToFavorMutation.mutateAsync(favor.id);
                } catch (error: any) {
                  console.error('❌ Apply to favor failed:', error.message);
                  // Error handling is done by the mutation's onError callback
                }
              }
            }
          ]
        );
      } else {
        // User needs to setup payment account - show WebView
        Alert.alert(
          'Payment Account Required',
          'Set up your payment account to apply to paid favors',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Set Up Now', 
              onPress: () => {
                // Create callback that will apply to favor after setup
                const onSetupComplete = async () => {
                  try {
                    console.log('🎯 Setup completed, now applying to favor...');
                    await applyToFavorMutation.mutateAsync(favor.id);
                  } catch (error: any) {
                    console.error('❌ Apply to favor failed after setup:', error.message);
                    Alert.alert(
                      'Error',
                      'Failed to apply to favor. Please try again.',
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
    } catch (error) {
      console.error('❌ Error handling provide favor:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelFavor = async (favor: Favor) => {
    console.log('Cancel favor request for:', favor.user.full_name);
    
    // Show custom confirmation modal
    setFavorToCancel(favor);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!favorToCancel) return;

    try {
      console.log('🗑️ Canceling favor request:', favorToCancel.id);
      await cancelRequestMutation.mutateAsync(favorToCancel.id);
      
      // Close modal and reset state
      setShowCancelModal(false);
      setFavorToCancel(null);
      
      // Immediately refresh the Active tab data after successful cancellation
      console.log('✅ Favor request cancelled successfully, refreshing Active tab data...');
      await Promise.all([refetchActiveMyFavors(), refetchInProgressMyFavors()]);
      
    } catch (error: any) {
      console.error('❌ Cancel request failed:', error.message);
      // Error handling is done by the mutation's onError callback
      // Keep modal open on error so user can try again
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setFavorToCancel(null);
  };

  const handleCompleteFavor = async (favor: Favor) => {
    console.log('🎯 Complete favor clicked for:', favor.user.full_name);
    
    try {
      console.log('🎯 Marking favor as completed:', favor.id);
      await completeFavorMutation.mutateAsync(favor.id);
      
      // Navigate to favor details screen for review submission
      navigation?.navigate('FavorDetailsScreen', { 
        favorId: favor.id,
        source: 'ProvideFavorScreen'
      });
      
      console.log('✅ Favor marked as completed successfully');
    } catch (error: any) {
      console.error('❌ Complete favor failed:', error.message);
      Alert.alert(
        'Error',
        'Failed to complete favor. Please try again.',
        [{ text: 'OK' }]
      );
    }
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


  const handleFavorCardPress = (favor: Favor) => {
    if (activeTab === 'All') {
      // For "All" tab, show modal like HomeListScreen
      setSelectedFavorId(favor.id);
      setShowFavorDetailsModal(true);
    } else {
      // For other tabs, navigate to ProvideFavorDetailsScreen
      navigation?.navigate('ProvideFavorDetailsScreen', { favorId: favor.id });
    }
  };

  const FavorCard = ({ favor }: { favor: Favor }) => {
    // For Active tab, all favors should be cancellable since they are user's active favors
    // For All tab, determine based on status
    const isActiveFavor = activeTab === 'Active' || favor.status === 'in_progress' || favor.status === 'pending';
    
    if (activeTab === 'All') {
      // For "All" tab, use the exact same UI as HomeListScreen
      return (
        <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
          <TouchableOpacity 
            onPress={() => handleFavorCardPress(favor)}
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
                    <Text className="text-[#D12E34] text-sm font-medium">{formatPriority(favor.priority)}</Text>
                  </View>
                </View>
                {/* Category and Time row */}
                <View className="flex-row items-center mb-1">
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
                <Text className="text-gray-700 text-sm mb-1 leading-5" numberOfLines={2} ellipsizeMode="tail">
                  {favor.description}
                </Text>
                
                {/* Status Badge */}
                <View className="flex-row mb-4">
                  <View className={`px-3 py-1 rounded-xl ${
                    favor.status === 'completed' ? 'bg-green-100' :
                    favor.status === 'in-progress' ? 'bg-blue-100' :
                    favor.status === 'pending' ? 'bg-orange-100' :
                    favor.status === 'cancelled' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    <Text className={`text-sm font-medium ${
                      favor.status === 'completed' ? 'text-green-700' :
                      favor.status === 'in-progress' ? 'text-blue-700' :
                      favor.status === 'pending' ? 'text-orange-700' :
                      favor.status === 'cancelled' ? 'text-red-700' :
                      'text-gray-700'
                    }`}>
                      {favor.status === 'in-progress' 
                        ? 'In Progress' 
                        : favor.status === 'completed'
                        ? 'Completed'
                        : favor.status?.charAt(0).toUpperCase() + favor.status?.slice(1).replace('_', ' ') || 'Unknown'
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-green-500 rounded-full py-3"
            onPress={() => handleProvideFavor(favor)}
          >
            <Text className="text-white text-center font-semibold text-base">
              ${parseFloat((favor.tip || 0).toString()).toFixed(2)} | Provide a Favor
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // For Active/History tabs, display user name and priority alongside image
    return (
      <TouchableOpacity 
        onPress={() => handleFavorCardPress(favor)}
        activeOpacity={0.7}
      >
        <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
          <View className="flex-row mb-4">
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
            <View className="flex-1">
              {/* User name and priority */}
              <View className="flex-row items-center mb-2">
                {!favor.favor_pay && parseFloat((favor.tip || 0).toString()) > 0 && (
                  <View className="mr-2">
                    <DollarSvg />
                  </View>
                )}
                <Text className="text-lg font-semibold text-gray-800 flex-1" numberOfLines={1}>
                  {favor.user.full_name}
                </Text>
                <View className="ml-2 px-2 py-1 rounded">
                  <Text className="text-[#D12E34] text-sm font-medium">{formatPriority(favor.priority)}</Text>
                </View>
              </View>
              
              {/* Category and Time row */}
              <View className="flex-row items-center mb-1">
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
              
              {/* Description */}
              <Text className="text-gray-700 text-sm mb-1 leading-5" numberOfLines={2} ellipsizeMode="tail">
                {favor.description}
              </Text>
              
              {/* Status Badge */}
              <View className="flex-row mb-4">
                <View className={`px-3 py-1 rounded-xl ${
                  favor.status === 'completed' ? 'bg-green-100' :
                  favor.status === 'in-progress' ? 'bg-blue-100' :
                  favor.status === 'pending' ? 'bg-orange-100' :
                  favor.status === 'cancelled' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  <Text className={`text-sm font-medium ${
                    favor.status === 'completed' ? 'text-green-700' :
                    favor.status === 'in-progress' ? 'text-blue-700' :
                    favor.status === 'pending' ? 'text-orange-700' :
                    favor.status === 'cancelled' ? 'text-red-700' :
                    'text-gray-700'
                  }`}>
                    {favor.status === 'in-progress' 
                      ? 'In Progress' 
                      : favor.status === 'completed'
                      ? 'Completed'
                      : favor.status?.charAt(0).toUpperCase() + favor.status?.slice(1).replace('_', ' ') || 'Unknown'
                    }
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Show contextual buttons for Active/History tabs */}
          {favor.status !== 'completed' && favor.status !== 'cancelled' && (
            <TouchableOpacity 
              className="bg-green-500 rounded-full py-3"
              onPress={() => {
                if (isActiveFavor) {
                  handleCancelFavor(favor);
                } else {
                  handleProvideFavor(favor);
                }
              }}
            >
              <Text className="text-white text-center font-semibold text-base">
                {isActiveFavor ? 'Cancel Favor' : 
                 `$${parseFloat((favor.tip || 0).toString()).toFixed(2)} | Provide a Favor`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Show Try Reapply button for cancelled favors in History tab */}
          {activeTab === 'History' && favor.status === 'cancelled' && (
            <TouchableOpacity 
              className="bg-green-500 rounded-full py-3"
              onPress={() => handleProvideFavor(favor)}
            >
              <Text className="text-white text-center font-semibold text-base">
                ${parseFloat((favor.tip || 0).toString()).toFixed(2)} | Reapply
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      className={`flex-1 py-3 rounded-full ${isActive ? 'bg-green-500' : ''}`}
      onPress={onPress}
    >
      <Text className={`font-semibold text-center ${isActive ? 'text-white' : 'text-gray-600'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-black">Provide Favor</Text>
          <View className="flex-row gap-x-2">
            <TouchableOpacity 
              className="w-10 h-10 rounded-full items-center justify-center"
              onPress={() => navigation?.navigate('FilterScreen')}
            >
              <FilterSvg />
              {(selectedCategories.length > 0 || getFilterCount() > 0) && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {selectedCategories.length + getFilterCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <NotificationBell />
          </View>
        </View>

        {/* Tab Bar */}
        <View className="flex-row bg-gray-100 rounded-full p-1 mx-4">
          <TabButton
            title="All"
            isActive={activeTab === 'All'}
            onPress={() => setActiveTab('All')}
          />
          <TabButton
            title="Active"
            isActive={activeTab === 'Active'}
            onPress={() => setActiveTab('Active')}
          />
          <TabButton
            title="History"
            isActive={activeTab === 'History'}
            onPress={() => setActiveTab('History')}
          />
        </View>

      </View>

      {/* Content Area */}
      {isActuallyLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#44A27B" />
          <Text className="text-gray-600 mt-4">Loading favors...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
            Error Loading Favors
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            {error.message || 'Please check your connection and try again.'}
          </Text>
          <Text className="text-gray-500 text-center mb-8 text-sm">
            Tap the button below to retry or check the console for more details.
          </Text>
          <TouchableOpacity 
            className="bg-green-500 rounded-full py-3 px-8"
            onPress={handleRefresh}
          >
            <Text className="text-white font-semibold text-lg">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : currentFavors.length > 0 ? (
        activeTab === 'All' ? (
          // Use FlatList with pagination for "All" tab (same as HomeListScreen)
          <FlatList
            data={currentFavors}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <FavorCard favor={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#44A27B']}
                tintColor="#44A27B"
              />
            }
            onEndReached={loadMoreFavors}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoading && currentPage > 1 ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#44A27B" />
                  <Text className="text-gray-500 mt-2">Loading more...</Text>
                </View>
              ) : !hasMorePages && currentFavors.length > 0 ? (
                <View className="py-4 items-center">
                  <Text className="text-gray-500">No more favors to load</Text>
                </View>
              ) : null
            }
          />
        ) : (
          // Use ScrollView for other tabs (Active/History)
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#44A27B']}
                tintColor="#44A27B"
              />
            }
          >
            {currentFavors.map((favor) => (
              <FavorCard key={favor.id} favor={favor} />
            ))}
          </ScrollView>
        )
      ) : (
        /* Empty State */
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#44A27B']}
              tintColor="#44A27B"
            />
          }
        >
          <View className="items-center">
            <View className="items-center mb-8">
              {activeTab === 'All' && (
                <View style={{ transform: [{ scale: 2 }] }}>
                  <ProvideFavorSvg focused={true} />
                </View>
              )}
              {activeTab === 'Active' && <PersonwithHeartSvg />}
              {activeTab === 'History' && <TimerSvg />}
            </View>
            
            <Text className="text-2xl font-bold text-[#000000B8] mb-4 text-center">
              {activeTab === 'All' && (hasActiveFilters() ? 'No favor found' : 'No favors available')}
              {activeTab === 'Active' && 'No Active Favors'}
              {activeTab === 'History' && 'No History Yet'}
            </Text>
            
            <Text className="text-[#000000B] text-center mb-12 leading-6">
              {activeTab === 'All' && (
                hasActiveFilters() 
                  ? 'Try adjusting your filters to see more results'
                  : 'Check back later for new favors or pull down to refresh'
              )}
              {activeTab === 'Active' && "You don't have any ongoing favors right\nnow. Start helping or request a hand to see\nthem here."}
              {activeTab === 'History' && 'Once you help someone, your favor history\nwill appear here.'}
            </Text>
            
            <View className="w-full max-w-sm">
              {activeTab === 'All' && hasActiveFilters() ? (
                <CarouselButton
                  title="Adjust Filters"
                  onPress={() => navigation?.navigate('FilterScreen')}
                />
              ) : (
                <CarouselButton
                  title={activeTab === 'All' ? 'Ask Favor' : 'Explore Favors'}
                  onPress={activeTab === 'All' ? handleAskFavor : handleExploreFavors}
                />
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Category Filter Modal */}
      {showCategoryFilter && (
        <View 
          className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-50"
          style={{ zIndex: 1000 }}
        >
          <View className="bg-white rounded-2xl m-6 max-h-96">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-300">
              <Text className="text-lg font-bold text-gray-900">Filter by Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryFilter(false)}>
                <Text className="text-gray-500 text-xl">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category List */}
            <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
              <View className="p-4">
                {categories.map((category: FavorSubject) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`flex-row items-center justify-between py-3 px-4 mb-2 rounded-xl ${
                      selectedCategories.includes(category.name) 
                        ? 'bg-green-100 border border-green-300' 
                        : 'bg-gray-50'
                    }`}
                    onPress={() => handleCategoryToggle(category.name)}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{category.icon || '📋'}</Text>
                      <Text className={`text-base font-medium ${
                        selectedCategories.includes(category.name) ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {category.name}
                      </Text>
                    </View>
                    {selectedCategories.includes(category.name) && (
                      <Text className="text-green-600 text-lg">✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View className="flex-row p-4 border-t border-gray-300">
              <TouchableOpacity
                className="flex-1 py-3 px-4 bg-gray-100 rounded-xl mr-2"
                onPress={handleClearFilters}
              >
                <Text className="text-gray-700 text-center font-medium">Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 px-4 bg-green-500 rounded-xl ml-2"
                onPress={() => setShowCategoryFilter(false)}
              >
                <Text className="text-white text-center font-medium">
                  Apply {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Favor Details Modal (for All tab only) */}
      <FavorDetailsModal
        visible={showFavorDetailsModal}
        onClose={() => {
          setShowFavorDetailsModal(false);
          setSelectedFavorId(null);
        }}
        favorId={selectedFavorId}
      />

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
              Are you sure you want to cancel this Favor request to help {favorToCancel?.user.full_name}?
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
