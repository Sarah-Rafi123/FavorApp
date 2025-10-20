import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';
import FIconSmallSvg from '../../assets/icons/FIconSmall';
import DollarSvg from '../../assets/icons/Dollar';
import useFilterStore from '../../store/useFilterStore';
import { useBrowseFavors } from '../../services/queries/FavorQueries';
import { Favor } from '../../services/apis/FavorApis';

interface FilterScreenProps {
  onBack?: () => void;
  onApply?: () => void;
  navigation?: any;
}


const CheckIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M16.25 6.25L8.125 14.375L3.75 10"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FilteredResults = ({ 
  data, 
  loading, 
  error, 
  onRefresh, 
  onBackToFilters 
}: { 
  data: Favor[]; 
  loading: boolean; 
  error: any; 
  onRefresh: () => void;
  onBackToFilters: () => void;
}) => {
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
  const FavorCard = ({ favor }: { favor: Favor }) => (
    <View className="bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4 shadow-sm border-2 border-b-4 border-b-[#44A27B] border-[#44A27B66]">
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
              <Text className="text-4xl text-gray-400 mb-1">📋</Text>

            </View>
          </View>
        )}
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
              <Text className="text-[#D12E34] text-sm font-medium">{formatPriority(favor.priority)}</Text>
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
      
      <TouchableOpacity className="bg-green-500 rounded-full py-3">
        <Text className="text-white text-center font-semibold text-base">
          ${parseFloat((favor.tip || 0).toString()).toFixed(2)} | Provide a Favor
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#44A27B" />
        <Text className="text-gray-600 mt-2">Loading filtered results...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-red-600 text-center mb-4">Failed to load filtered results</Text>
        <TouchableOpacity 
          className="bg-[#44A27B] px-6 py-3 rounded-lg mb-4"
          onPress={onRefresh}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBackToFilters}>
          <Text className="text-gray-600 underline">Back to Filters</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="px-4 py-2">
        <TouchableOpacity 
          className="flex-row items-center mb-4"
          onPress={onBackToFilters}
        >
          <Text className="text-blue-600 mr-2">← Back to Filters</Text>
          <Text className="text-gray-600">({data.length} results found)</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <FavorCard favor={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={['#44A27B']}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-lg mb-2">No favors match your filters</Text>
            <Text className="text-gray-400 text-center px-4">
              Try adjusting your filter criteria
            </Text>
            <TouchableOpacity 
              className="mt-4"
              onPress={onBackToFilters}
            >
              <Text className="text-blue-600 underline">Back to Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export function FilterScreen({ onBack, onApply, navigation }: FilterScreenProps) {
  const [showResults, setShowResults] = useState(false);
  const { filters, updateFilter, clearFilters, hasActiveFilters, toBrowseParams } = useFilterStore();
  
  // Convert store filters to UI format for display
  const uiFilters = {
    priority: filters.priority.map(p => {
      switch(p) {
        case 'immediate': return 'Immediate';
        case 'delayed': return 'Delayed';
        case 'no_rush': return 'No Rush';
        default: return p;
      }
    }),
    type: filters.type.map(t => {
      switch(t) {
        case 'paid': return 'Paid';
        case 'unpaid': return 'Unpaid';
        default: return t;
      }
    }),
    memberType: filters.memberType.map(mt => {
      switch(mt) {
        case 'verified': return 'Verified';
        case 'non_verified': return 'Non Verified';
        default: return mt;
      }
    }),
    category: filters.category,
  };
  
  // Fetch filtered results when showing results
  const {
    data: browseFavorsData,
    isLoading: browseFavorsLoading,
    error: browseFavorsError,
    refetch: refetchBrowseFavors,
  } = useBrowseFavors(
    toBrowseParams(1, 20), // Get more results for filter screen
    { enabled: showResults && hasActiveFilters() }
  );

  const toggleFilter = (section: string, value: string) => {
    // Convert UI values to store format
    let storeValue = value;
    if (section === 'priority') {
      switch(value) {
        case 'Immediate': storeValue = 'immediate'; break;
        case 'Delayed': storeValue = 'delayed'; break;
        case 'No Rush': storeValue = 'no_rush'; break;
      }
    } else if (section === 'type') {
      switch(value) {
        case 'Paid': storeValue = 'paid'; break;
        case 'Unpaid': storeValue = 'unpaid'; break;
      }
    } else if (section === 'memberType') {
      switch(value) {
        case 'Verified': storeValue = 'verified'; break;
        case 'Non Verified': storeValue = 'non_verified'; break;
      }
    }
    
    updateFilter(section as any, storeValue);
  };

  const clearAll = () => {
    clearFilters();
    setShowResults(false);
  };

  const FilterSection = ({ 
    title, 
    options, 
    section,
    description 
  }: { 
    title: string; 
    options: string[]; 
    section: string;
    description?: string;
  }) => (
    <View className="border-[#44A27B66] border bg-[#F7FBF5] rounded-2xl p-4 mb-4 mx-4">
      <Text className="text-lg font-semibold text-gray-800 mb-2">{title}</Text>
      {description && (
        <Text className="text-sm text-gray-600 mb-4">{description}</Text>
      )}
      <View className="flex-row flex-wrap">
        {options.map((option) => {
          const isSelected = (uiFilters as any)[section].includes(option);
          return (
            <TouchableOpacity
              key={option}
              className="flex-row items-center mr-6 mb-3"
              onPress={() => toggleFilter(section, option)}
            >
              <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {isSelected && <CheckIcon />}
              </View>
              <Text className="text-gray-700 text-base">{option}</Text>
              {option === 'Verified' && (
                <View className="ml-1" >
                  <FIconSmallSvg />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
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
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={onBack || (() => navigation?.goBack())}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Filter</Text>
        </View>
      </View>

      {!showResults ? (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 180 }}
        >
          <FilterSection
            title="Priority"
            options={['Immediate', 'Delayed', 'No Rush']}
            section="priority"
          />

          <FilterSection
            title="Payment Type"
            description="Paid: $1+ tip required. Unpaid: volunteer favors."
            options={['Paid', 'Unpaid']}
            section="type"
          />

          <FilterSection
            title="Member Type"
            description="Filter by user verification status"
            options={['Verified', 'Non Verified']}
            section="memberType"
          />

          <FilterSection
            title="Category"
            options={['Lifting', 'Moving', 'Maintenance', 'Gardening', 'Assisting', 'Technical', 'Opening']}
            section="category"
          />
        </ScrollView>
      ) : (
        <FilteredResults 
          data={browseFavorsData?.data.favors || []}
          loading={browseFavorsLoading}
          error={browseFavorsError}
          onRefresh={refetchBrowseFavors}
          onBackToFilters={() => setShowResults(false)}
        />
      )}

      {/* Bottom Buttons */}
      <View className="absolute bottom-32 left-0 right-0 px-6 bg-transparent">
        {!showResults ? (
          <>
            <View className="mb-4">
              <CarouselButton
                title={hasActiveFilters() ? "View Results" : "Apply"}
                onPress={() => {
                  if (hasActiveFilters()) {
                    setShowResults(true);
                  } else {
                    const applyAction = onApply || (() => {
                      console.log('Applied filters:', filters);
                      navigation?.goBack();
                    });
                    applyAction();
                  }
                }}
              />
            </View>
            <TouchableOpacity onPress={clearAll}>
              <Text className="text-gray-700 text-center text-lg font-medium">
                Clear All
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="mb-4">
            <CarouselButton
              title="Apply Filters"
              onPress={() => {
                const applyAction = onApply || (() => {
                  console.log('Applied filters:', filters);
                  navigation?.goBack();
                });
                applyAction();
              }}
            />
          </View>
        )}
      </View>
    </ImageBackground>
  );
}