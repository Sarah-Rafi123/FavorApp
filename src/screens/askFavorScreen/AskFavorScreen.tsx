import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path } from 'react-native-svg';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useCreateFavor } from '../../services/mutations/FavorMutations';
import { CreateFavorRequest } from '../../services/apis/FavorApis';

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
    priority: 'delayed' as 'immediate' | 'delayed' | 'no_rush',
    favorSubjectId: null as number | null,
    otherSubjectName: '',
    timeToComplete: '20 minutes',
    favorPrice: 'Free',
    tip: 0,
    additionalTip: 0,
    address: '',
    description: '',
    city: '',
    state: '',
    latLng: '',
  });

  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // Hardcoded favor subjects with their IDs
  const favorSubjects = [
    { id: 1, name: 'Lifting' },
    { id: 2, name: 'Gardening' },
    { id: 3, name: 'Technical' },
    { id: 4, name: 'Moving' },
    { id: 5, name: 'Assisting' },
    { id: 6, name: 'Opening' },
    { id: 7, name: 'Maintenance' }
  ];

  // Create favor mutation
  const createFavorMutation = useCreateFavor();

  const priorityOptions = [
    { label: 'Immediate', value: 'immediate' as const },
    { label: 'Delayed', value: 'delayed' as const },
    { label: 'No Rush', value: 'no_rush' as const }
  ];
  const timeOptions = ['15 minutes', '20 minutes', '30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours'];

  const updateFormData = (field: string, value: any) => {
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

  const handleCreateFavor = async () => {
    // Validate form
    if (!formData.favorSubjectId) {
      Alert.alert('Error', 'Please select a subject for your favor.');
      return;
    }
    if (formData.favorSubjectId === 8 && !formData.otherSubjectName.trim()) {
      Alert.alert('Error', 'Please provide a custom subject name.');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please provide a description for your favor.');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please provide an address for your favor.');
      return;
    }
    if (formData.favorPrice === 'Paid' && (formData.tip <= 0 || isNaN(formData.tip))) {
      Alert.alert('Error', 'Please provide a valid tip amount greater than 0 for paid favors.');
      return;
    }
    if (!formData.city.trim() || !formData.state.trim()) {
      Alert.alert('Error', 'Please ensure city and state are provided.');
      return;
    }

    try {
      const createRequest: CreateFavorRequest = {
        description: formData.description.trim(),
        address: formData.address.trim(),
        priority: formData.priority,
        favor_subject_id: formData.favorSubjectId === 8 ? 'other' : formData.favorSubjectId!,
        favor_pay: formData.favorPrice === 'Paid' ? '0' : '1', // 0 = paid, 1 = free
        city: formData.city.trim(),
        state: formData.state.trim(),
        time_to_complete: formData.timeToComplete,
        tip: formData.favorPrice === 'Paid' ? formData.tip : 0,
        additional_tip: formData.favorPrice === 'Paid' && formData.additionalTip > 0 ? formData.additionalTip : undefined,
        lat_lng: formData.latLng || undefined,
        other_subject_name: formData.favorSubjectId === 8 ? formData.otherSubjectName.trim() : undefined,
      };

      // Debug logging to verify request format
      console.log('🚀 Creating Favor Request:', createRequest);
      console.log('📤 Sending JSON request');
      await createFavorMutation.mutateAsync(createRequest);
      
      navigation?.goBack();
    } catch (error) {
      console.error('Error creating favor:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#E8F5E8]"> {/* Light green background */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-[#E8F5E8]">
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
            <Text className="text-xl font-bold text-black mb-6">Priority</Text>
            <View className="flex-row flex-wrap">
              {priorityOptions.map((option) => (
                <RadioButton
                  key={option.value}
                  selected={formData.priority === option.value}
                  onPress={() => updateFormData('priority', option.value)}
                  label={option.label}
                />
              ))}
            </View>
          </View>

          {/* Subject Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Subject</Text>
            <View className="flex-row flex-wrap">
              {favorSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  className={`border-2 rounded-2xl px-6 py-4 mr-3 mb-3 ${
                    formData.favorSubjectId === subject.id
                      ? 'bg-[#44A27B] border-[#44A27B]'
                      : 'bg-white border-black'
                  }`}
                  onPress={() => updateFormData('favorSubjectId', subject.id)}
                >
                  <Text className={`text-base font-medium ${
                    formData.favorSubjectId === subject.id ? 'text-white' : 'text-black'
                  }`}>
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                className={`border-2 rounded-2xl px-6 py-4 mr-3 mb-3 ${
                  formData.favorSubjectId === 8
                    ? 'bg-[#44A27B] border-[#44A27B]'
                    : 'bg-white border-black'
                }`}
                onPress={() => updateFormData('favorSubjectId', 8)}
              >
                <Text className={`text-base font-medium ${
                  formData.favorSubjectId === 8 ? 'text-white' : 'text-black'
                }`}>
                  Other
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Custom Subject Name Input - Only show when Other is selected */}
            {formData.favorSubjectId === 8 && (
              <View className="mt-4">
                <Text className="text-lg font-semibold text-black mb-3">Please specify:</Text>
                <View className="bg-white border-2 border-gray-300 rounded-2xl px-4 py-4">
                  <TextInput
                    className="text-black text-base min-h-[60px]"
                    placeholder="Enter custom subject name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.otherSubjectName}
                    onChangeText={(text) => updateFormData('otherSubjectName', text)}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                <Text className="text-gray-500 text-sm mt-2">/50 characters</Text>
              </View>
            )}
          </View>

          {/* Time To Complete Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Time To Complete</Text>
            <TouchableOpacity
              className="bg-white border-2 border-gray-300 rounded-2xl px-4 py-4 flex-row justify-between items-center"
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
            <Text className="text-xl font-bold text-black mb-6">Favor Price</Text>
            <View className="flex-row mb-4">
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
            
            {/* Tip Inputs - Only show when Paid is selected */}
            {formData.favorPrice === 'Paid' && (
              <View>
                <View className="bg-white border-2 border-gray-300 rounded-2xl px-4 py-4 mb-4">
                  <Text className="text-gray-500 text-sm mb-2">Tip Amount ($) *</Text>
                  <TextInput
                    className="text-gray-800 text-base"
                    placeholder="Enter tip amount"
                    placeholderTextColor="#9CA3AF"
                    value={formData.tip.toString()}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text) || 0;
                      updateFormData('tip', numValue);
                    }}
                    keyboardType="numeric"
                  />
                </View>
                
                <View className="bg-white border-2 border-gray-300 rounded-2xl px-4 py-4">
                  <Text className="text-gray-500 text-sm mb-2">Additional Tip ($) - Optional</Text>
                  <TextInput
                    className="text-gray-800 text-base"
                    placeholder="Enter additional tip (optional)"
                    placeholderTextColor="#9CA3AF"
                    value={formData.additionalTip.toString()}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text) || 0;
                      updateFormData('additionalTip', numValue);
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Address Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Address</Text>
            <View className="bg-white border-2 border-gray-300 rounded-2xl overflow-hidden">
              <Text className="text-gray-500 text-sm px-4 pt-4 pb-2">Address</Text>
              <GooglePlacesAutocomplete
                placeholder="Enter a location"
                onPress={(data, details) => {
                  updateFormData('address', data.description);
                  
                  // Extract city, state, and coordinates from details if available
                  if (details?.address_components) {
                    let city = '';
                    let state = '';
                    
                    details.address_components.forEach(component => {
                      if (component.types.includes('locality')) {
                        city = component.long_name;
                      }
                      if (component.types.includes('administrative_area_level_1')) {
                        state = component.short_name;
                      }
                    });
                    
                    updateFormData('city', city);
                    updateFormData('state', state);
                  }
                  
                  // Extract coordinates if available
                  if (details?.geometry?.location) {
                    const { lat, lng } = details.geometry.location;
                    updateFormData('latLng', `${lat},${lng}`);
                  }
                }}
                query={{
                  key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyDt1zyVSt1snXRBteLuH9ngKmE8ABve268',
                  language: 'en',
                }}
                fetchDetails={true}
                styles={{
                  textInputContainer: {
                    paddingHorizontal: 16,
                    paddingBottom: 16,
                    backgroundColor: 'transparent',
                  },
                  textInput: {
                    height: 40,
                    fontSize: 16,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    paddingHorizontal: 0,
                    color: '#000000',
                    fontWeight: '400',
                  },
                  predefinedPlacesDescription: {
                    color: '#44A27B',
                  },
                  listView: {
                    backgroundColor: 'white',
                    marginTop: 0,
                    borderTopWidth: 2,
                    borderTopColor: '#d1d5db',
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  },
                  row: {
                    backgroundColor: 'white',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    minHeight: 48,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                  separator: {
                    height: 1,
                    backgroundColor: '#f3f4f6',
                    marginHorizontal: 16,
                  },
                  description: {
                    fontSize: 15,
                    color: '#374151',
                    fontWeight: '400',
                  },
                  loader: {
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    height: 20,
                    paddingRight: 16,
                  },
                }}
                enablePoweredByContainer={false}
                debounce={200}
              />
            </View>
          </View>

          {/* Description Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Description</Text>
            <View className="bg-white border-2 border-gray-300 rounded-2xl px-4 py-4">
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


        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#E8F5E8] pt-6 pb-8 px-6">
        <CarouselButton
          title={createFavorMutation.isPending ? "Creating..." : "Create Favor"}
          onPress={handleCreateFavor}
          disabled={createFavorMutation.isPending}
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