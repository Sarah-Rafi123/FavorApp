import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';

interface FilterScreenProps {
  onBack?: () => void;
  onApply?: (filters: any) => void;
  navigation?: any;
}

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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
  const [filters, setFilters] = useState({
    priority: ['Delayed'],
    type: ['Paid'],
    memberType: ['Verified'],
    category: ['Lifting'],
  });

  const toggleFilter = (section: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: prev[section as keyof typeof prev].includes(value)
        ? prev[section as keyof typeof prev].filter(item => item !== value)
        : [...prev[section as keyof typeof prev], value]
    }));
  };

  const clearAll = () => {
    setFilters({
      priority: [],
      type: [],
      memberType: [],
      category: [],
    });
  };

  const FilterSection = ({ 
    title, 
    options, 
    section 
  }: { 
    title: string; 
    options: string[]; 
    section: string;
  }) => (
    <View className="bg-white rounded-2xl p-6 mb-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">{title}</Text>
      <View className="flex-row flex-wrap">
        {options.map((option) => {
          const isSelected = filters[section as keyof typeof filters].includes(option);
          return (
            <TouchableOpacity
              key={option}
              className={`flex-row items-center mr-6 mb-3`}
              onPress={() => toggleFilter(section, option)}
            >
              <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {isSelected && <CheckIcon />}
              </View>
              <Text className="text-gray-700 text-base">
                {option}
                {option === 'Verified' && ' 🛡️'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4 p-2"
            onPress={onBack || (() => navigation?.goBack())}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Filter</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 140 }}
      >
        <FilterSection
          title="Priority"
          options={['Immediate', 'Delayed', 'No Rush']}
          section="priority"
        />

        <FilterSection
          title="Type"
          options={['Paid', 'Unpaid']}
          section="type"
        />

        <FilterSection
          title="Member Type"
          options={['Verified', 'Non Verified']}
          section="memberType"
        />

        <FilterSection
          title="Category"
          options={['Lifting', 'Moving', 'Maintenance', 'Gardening', 'Assisting', 'Technical', 'Opening']}
          section="category"
        />
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white pt-6 pb-8 px-6 border-t border-gray-100">
        <View className="mb-4">
          <CarouselButton
            title="Apply"
            onPress={() => {
              const applyAction = onApply || ((filters) => {
                console.log('Applied filters:', filters);
                navigation?.goBack();
              });
              applyAction(filters);
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
  );
}