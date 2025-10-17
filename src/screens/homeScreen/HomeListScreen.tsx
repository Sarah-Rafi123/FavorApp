import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { FavorDetailsModal } from '../../components/overlays';
import { useFavors } from '../../services/queries/FavorQueries';
import { Favor } from '../../services/apis/FavorApis';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';
import DollarSvg from '../../assets/icons/Dollar';

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

  // Fetch favors using the new API
  const { data: favorsData, isLoading, error, refetch } = useFavors(currentPage, 12);

  // Update allFavors when new data arrives
  React.useEffect(() => {
    if (favorsData?.data.favors) {
      if (currentPage === 1) {
        // First page - replace all favors
        setAllFavors(favorsData.data.favors);
      } else {
        // Additional pages - append to existing favors
        setAllFavors(prev => [...prev, ...favorsData.data.favors]);
      }
      
      // Check if there are more pages
      setHasMorePages(currentPage < favorsData.data.meta.total_pages);
    }
  }, [favorsData, currentPage]);

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

  const handleFavorClick = (favor: Favor) => {
    setSelectedFavorId(favor.id);
    setShowFavorDetailsModal(true);
  };

  const FavorCard = ({ favor }: { favor: Favor }) => (
    <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
      <TouchableOpacity 
        onPress={() => handleFavorClick(favor)}
        activeOpacity={0.7}
      >
        <View className="flex-row mb-3">
          <Image
            source={{ uri: favor.image_url || 'https://via.placeholder.com/112x112' }}
            className="w-28 h-28 rounded-2xl mr-4"
            style={{ backgroundColor: '#f3f4f6' }}
          />
          <View className="flex-1 justify-start">
            <View className="flex-row items-center mb-1">
              {!favor.favor_pay && (
                <View className="mr-2">
                  <DollarSvg />
                </View>
              )}
              <Text className="text-lg font-semibold text-gray-800">
                {favor.user.full_name.length > 15 
                  ? `${favor.user.full_name.substring(0, 15)}...` 
                  : favor.user.full_name}
              </Text>
              <View className="ml-2 px-2 py-1 rounded">
                <Text className="text-[#D12E34] text-sm font-medium capitalize">{favor.priority}</Text>
              </View>
            </View>
            <Text className="text-sm text-gray-600 mb-1">
              {favor.title || favor.favor_subject.name} | {favor.time_to_complete || 'Time not specified'}
            </Text>
            <Text className="text-sm text-gray-600">
              {favor.city && favor.city !== 'undefined' ? favor.city : ''}{favor.city && favor.city !== 'undefined' && favor.state && favor.state !== 'undefined' ? ', ' : ''}{favor.state && favor.state !== 'undefined' ? favor.state : favor.address}
            </Text>
            <Text className="text-gray-700 text-sm mb-4 leading-5">
              {favor.description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-green-500 rounded-full py-3"
        onPress={() => {
          console.log('Provide favor for:', favor.user.full_name);
        }}
      >
        <Text className="text-white text-center font-semibold text-base">
          {favor.favor_pay ? 'Volunteer' : `$${parseFloat((favor.tip || 0).toString()).toFixed(2)}`} | Provide a Favor
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
              className="items-center justify-center"
              onPress={onFilter}
            >
              <FilterSvg />
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
                <Text className="text-gray-500 text-lg mb-2">No favors available</Text>
                <Text className="text-gray-400 text-center px-4">
                  Check back later or adjust your filters
                </Text>
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