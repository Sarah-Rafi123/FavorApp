import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';
import FIconSmallSvg from '../../assets/icons/FIconSmall';
import BackSvg from '../../assets/icons/Back';
import useFilterStore from '../../store/useFilterStore';
import { useFavorSubjects } from '../../services/queries/FavorSubjectQueries';

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


export function FilterScreen({ onBack, onApply, navigation }: FilterScreenProps) {
  const { filters, updateFilter, clearFilters } = useFilterStore();
  const insets = useSafeAreaInsets();
  
  // Fetch favor subjects from API
  const { data: favorSubjectsResponse, isLoading: favorSubjectsLoading, error: favorSubjectsError } = useFavorSubjects();
  const favorSubjects = favorSubjectsResponse?.data?.favor_subjects || [];
  const categoryOptions = favorSubjects.map(subject => subject.name);
  
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
    <View className="flex-1 bg-transparent">
      <ImageBackground
        source={require('../../assets/images/Wallpaper.png')}
        className="flex-1 rounded-t-3xl overflow-hidden pt-16"
        resizeMode="cover"
      >
          <StatusBar className='bg-transparent'  />
          
          
          {/* Modal Drag Indicator */}
          <View className="pt-4 pb-2 items-center">
            <View className="w-12 h-1.5 bg-gray-400 rounded-full opacity-60" />
          </View>
      
          {/* Header */}
          <View className="pt-2 pb-4 px-6">
            <View className="flex-row items-center">
              <TouchableOpacity 
                className="mr-4"
                onPress={onBack || (() => {
                  if (navigation?.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation?.navigate('Home');
                  }
                })}
              >
                <BackSvg />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-black">Filters</Text>
            </View>
          </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 220 }}
      >
        <FilterSection
          title="Priority"
          options={['Immediate', 'Delayed', 'No Rush']}
          section="priority"
        />

        <FilterSection
          title="Compensation"
          description="Paid: $1+ Unpaid: Volunteer Hours"
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
          options={favorSubjectsLoading ? ['Loading...'] : favorSubjectsError ? ['Error loading categories'] : categoryOptions}
          section="category"
        />
      </ScrollView>

          {/* Bottom Buttons */}
          <View className="absolute bottom-0 left-0 right-0">
            {/* Background with gradient effect */}
            <View 
              className="bg-[#FBFFF0] px-6 mt-36 shadow-lg"
              style={{ paddingTop: 32, paddingBottom: Math.max(16, insets.bottom + 8) }}
            >
              <View className="mb-4">
                <CarouselButton
                  title="Apply Filters"
                  onPress={() => {
                    const applyAction = onApply || (() => {
                      console.log('Applied filters:', filters);
                      if (navigation?.canGoBack()) {
                        navigation.goBack();
                      } else {
                        navigation?.navigate('Home');
                      }
                    });
                    applyAction();
                  }}
                />
              </View>
              <TouchableOpacity onPress={clearAll}>
                <Text className="text-gray-600 text-center text-lg font-medium">
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
    </View>
  );
}