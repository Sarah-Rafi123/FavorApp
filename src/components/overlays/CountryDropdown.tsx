import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { CountryCode } from '../../types';
import { countryData } from '../../utils/countryData';

interface CountryDropdownProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryCode) => void;
  selectedCountry?: CountryCode;
}

export function CountryDropdown({ 
  visible, 
  onClose, 
  onSelect, 
  selectedCountry 
}: CountryDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countryData.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  const handleSelect = (country: CountryCode) => {
    onSelect(country);
    setSearchQuery('');
    onClose();
  };

  const renderCountryItem = ({ item }: { item: CountryCode }) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-6 border-b border-gray-100"
      onPress={() => handleSelect(item)}
    >
      <Text className="text-2xl mr-3">{item.flag}</Text>
      <View className="flex-1">
        <Text className="text-base text-gray-800 font-medium">{item.name}</Text>
      </View>
      <Text className="text-base text-gray-600">{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <SafeAreaView className="flex-1 bg-white mt-12 rounded-t-3xl">
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500 text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              Select Country
            </Text>
            <View className="w-12" />
          </View>

          {/* Search */}
          <View className="px-6 py-4 border-b border-gray-200">
            <TextInput
              className="px-4 py-3 rounded-xl border border-gray-200 text-base bg-gray-50"
              placeholder="Search countries..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}