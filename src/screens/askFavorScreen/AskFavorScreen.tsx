import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';

interface AskFavorScreenProps {
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

export function AskFavorScreen({ navigation }: AskFavorScreenProps) {
  const [formData, setFormData] = useState({
    priority: 'Delayed',
    subject: 'Gardening',
    timeToComplete: '20 minutes',
    favorPrice: 'Free',
    address: '',
    description: '',
  });

  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const priorityOptions = ['Immediate', 'Delayed', 'No Rush'];
  const subjectOptions = ['Lifting', 'Gardening', 'Opening', 'Moving', 'Assisting', 'Maintenance', 'Technical', 'Other'];
  const timeOptions = ['15 minutes', '20 minutes', '30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours'];

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const RadioButton = ({ 
    selected, 
    onPress, 
    label 
  }: { 
    selected: boolean; 
    onPress: () => void; 
    label: string;
  }) => (
    <TouchableOpacity 
      className="flex-row items-center mr-6 mb-3"
      onPress={onPress}
    >
      <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
        selected ? 'border-green-500' : 'border-gray-300'
      }`}>
        {selected && <View className="w-2.5 h-2.5 rounded-full bg-green-500" />}
      </View>
      <Text className="text-gray-700 text-base">{label}</Text>
    </TouchableOpacity>
  );

  const handleCreateFavor = () => {
    console.log('Creating favor:', formData);
    navigation?.goBack();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4 p-2"
            onPress={() => navigation?.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Ask Favor</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 pt-6">
          
          {/* Priority Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Priority</Text>
            <View className="flex-row flex-wrap">
              {priorityOptions.map((option) => (
                <RadioButton
                  key={option}
                  selected={formData.priority === option}
                  onPress={() => updateFormData('priority', option)}
                  label={option}
                />
              ))}
            </View>
          </View>

          {/* Subject Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Subject</Text>
            <View className="flex-row flex-wrap">
              {subjectOptions.map((option) => (
                <RadioButton
                  key={option}
                  selected={formData.subject === option}
                  onPress={() => updateFormData('subject', option)}
                  label={option}
                />
              ))}
            </View>
          </View>

          {/* Time To Complete Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Time To Complete</Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center"
              onPress={() => setShowTimeDropdown(true)}
            >
              <View>
                <Text className="text-gray-500 text-sm mb-1">Time to complete</Text>
                <Text className="text-gray-800 text-base">{formData.timeToComplete}</Text>
              </View>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
          </View>

          {/* Favor Price Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Favor Price</Text>
            <View className="flex-row">
              <RadioButton
                selected={formData.favorPrice === 'Free'}
                onPress={() => updateFormData('favorPrice', 'Free')}
                label="Free"
              />
              <RadioButton
                selected={formData.favorPrice === 'Paid'}
                onPress={() => updateFormData('favorPrice', 'Paid')}
                label="Paid"
              />
            </View>
          </View>

          {/* Address Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Address</Text>
            <View className="bg-white border border-gray-200 rounded-xl px-4 py-4">
              <Text className="text-gray-500 text-sm mb-2">Address</Text>
              <TextInput
                className="text-gray-800 text-base"
                placeholder="Enter a location"
                placeholderTextColor="#9CA3AF"
                value={formData.address}
                onChangeText={(text) => updateFormData('address', text)}
              />
            </View>
          </View>

          {/* Description Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Description</Text>
            <View className="bg-white border border-gray-200 rounded-xl px-4 py-4">
              <Text className="text-gray-500 text-sm mb-2">Description</Text>
              <TextInput
                className="text-gray-800 text-base min-h-[100px]"
                placeholder="Enter description about the work"
                placeholderTextColor="#9CA3AF"
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* File Upload Section */}
          <View className="mb-8">
            <View className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 items-center">
              <Text className="text-gray-500 text-center mb-4">
                Choose a file or drag & drop it here{'\n'}JPEG and PNG formats up to 10 MB.
              </Text>
              <TouchableOpacity className="border border-green-500 rounded-xl px-6 py-3">
                <Text className="text-green-500 font-semibold">Browse File</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white pt-6 pb-8 px-6 border-t border-gray-100">
        <CarouselButton
          title="Create Favor"
          onPress={handleCreateFavor}
        />
      </View>

      {/* Time Dropdown Modal */}
      <Modal
        visible={showTimeDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeDropdown(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowTimeDropdown(false)}
        >
          <View className="bg-white rounded-xl max-w-sm mx-auto w-full">
            <View className="py-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800 text-center">
                Time to Complete
              </Text>
            </View>
            {timeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className="py-4 px-6 border-b border-gray-100 last:border-b-0"
                onPress={() => {
                  updateFormData('timeToComplete', option);
                  setShowTimeDropdown(false);
                }}
              >
                <Text className="text-base text-gray-800">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}