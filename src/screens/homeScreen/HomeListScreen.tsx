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
} from 'react-native';
import { FavorDetailsModal } from '../../components/overlays';
import { useFavors, useBrowseFavors } from '../../services/queries/FavorQueries';
import { Favor } from '../../services/apis/FavorApis';
import { useApplyToFavor } from '../../services/mutations/FavorMutations';
import { StripeConnectManager } from '../../services/StripeConnectManager';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';
import DollarSvg from '../../assets/icons/Dollar';
import UserSvg from '../../assets/icons/User';
import useFilterStore from '../../store/useFilterStore';

interface HomeListScreenProps {
  onMapView: () => void;
  onFilter: () => void;
  onNotifications: () => void;
}


export function HomeListScreen({ onMapView, onFilter, onNotifications }: HomeListScreenProps) {
  const [selectedFavorId, setSelectedFavorId] = useState<number | null>(null);
  const [showFavorDetailsModal, setShowFavorDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allFavors, setAllFavors] = useState<Favor[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  
  // Stripe Connect Manager
  const stripeConnectManager = StripeConnectManager.getInstance();
  
  // Get filter store state
  const { getFilterCount, hasActiveFilters, toBrowseParams } = useFilterStore();

  // Apply to Favor mutation
  const applyToFavorMutation = useApplyToFavor();

  // Use browseFavors when filters are active, useFavors when not
  const useFilteredData = hasActiveFilters();

  // Fetch filtered favors when filters are active
  const { 
    data: browseFavorsData, 
    isLoading: browseFavorsLoading, 
    error: browseFavorsError, 
    refetch: refetchBrowseFavors 
  } = useBrowseFavors(
    toBrowseParams(currentPage, 12),
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
    12,
    { enabled: !useFilteredData }
  );

  // Use the appropriate data source
  const currentData = useFilteredData ? browseFavorsData : favorsData;
  const isLoading = useFilteredData ? browseFavorsLoading : favorsLoading;
  const error = useFilteredData ? browseFavorsError : favorsError;
  const refetch = useFilteredData ? refetchBrowseFavors : refetchFavors;

  // Cleanup Stripe Connect listeners on unmount
  useEffect(() => {
    return () => {
      stripeConnectManager.cleanup();
    };
  }, [stripeConnectManager]);

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
        setAllFavors(currentData.data.favors);
      } else {
        // Additional pages - append to existing favors
        setAllFavors(prev => [...prev, ...currentData.data.favors]);
      }
      
      // Check if there are more pages
      setHasMorePages(currentPage < currentData.data.meta.total_pages);
    }
  }, [currentData, currentPage]);

  const loadMoreFavors = useCallback(() => {
    if (!isLoading && hasMorePages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoading, hasMorePages]);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setAllFavors([]);
    setHasMorePages(true);
    refetch();
  }, [refetch]);

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

  const handleFavorClick = (favor: Favor) => {
    setSelectedFavorId(favor.id);
    setShowFavorDetailsModal(true);
  };

  const handleProvideFavor = async (favor: Favor) => {
    console.log('🎯 Provide favor clicked for:', favor.user.full_name);
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
                  console.log('📝 Applying to favor:', favor.id);
                  
                  // Call the Apply to Favor API
                  await applyToFavorMutation.mutateAsync(favor.id);
                  
                  // Success is handled by the mutation's onSuccess callback
                  console.log('✅ Application submitted successfully');
                  
                } catch (error: any) {
                  // Error is handled by the mutation's onError callback
                  console.error('❌ Application failed:', error.message);
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
      console.error('❌ Error handling provide favor:', error);
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
            <View className="w-28 h-28 rounded-2xl mr-4 bg-gray-200 items-center justify-center border border-gray-300">
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
            <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
              {favor.title || favor.favor_subject.name} | {favor.time_to_complete || 'Time not specified'}
            </Text>
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {favor.city && favor.city !== 'undefined' ? favor.city : ''}{favor.city && favor.city !== 'undefined' && favor.state && favor.state !== 'undefined' ? ', ' : ''}{favor.state && favor.state !== 'undefined' ? favor.state : favor.address}
            </Text>
            <Text className="text-gray-700 text-sm mb-4 leading-5" numberOfLines={2}>
              {favor.description}
            </Text>
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
            <TouchableOpacity
              className="items-center justify-center"
              onPress={onNotifications}
            >
              <BellSvg />
            </TouchableOpacity>
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
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
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
            isLoading && currentPage > 1 ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#44A27B" />
                <Text className="text-gray-500 mt-2">Loading more...</Text>
              </View>
            ) : !hasMorePages && allFavors.length > 0 ? (
              <View className="py-4 items-center">
                <Text className="text-gray-500">No more favors to load</Text>
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
      />
    </ImageBackground>
  );
}