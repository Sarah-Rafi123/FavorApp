import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CarouselButton } from '../../components/buttons';

interface CreateProfileScreenProps {
  onProfileComplete: () => void;
}

export function CreateProfileScreen({ onProfileComplete }: CreateProfileScreenProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    lastName: '',
    dateOfBirth: '',
    fullAddress: '',
    phoneCall: '',
    phoneText: '',
    hearAbout: '',
    isOver18: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const hearAboutOptions = [
    'Google',
    'Facebook',
    'Instagram',
    'Friend Referral',
    'App Store',
    'Other'
  ];

  const [errors, setErrors] = useState({
    fullName: '',
    lastName: '',
    dateOfBirth: '',
    fullAddress: '',
    phoneCall: '',
    phoneText: '',
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (typeof value === 'string' && value && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      updateFormData('dateOfBirth', formattedDate);
    }
  };

  const handleDropdownSelect = (option: string) => {
    updateFormData('hearAbout', option);
    setShowDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      lastName: '',
      dateOfBirth: '',
      fullAddress: '',
      phoneCall: '',
      phoneText: '',
    };
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
      isValid = false;
    }

    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = 'Full address is required';
      isValid = false;
    }

    if (!formData.phoneCall.trim()) {
      newErrors.phoneCall = 'Phone number is required';
      isValid = false;
    }

    if (!formData.phoneText.trim()) {
      newErrors.phoneText = 'Text number is required';
      isValid = false;
    }

    if (!formData.isOver18) {
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onProfileComplete();
    }
  };

  const isFormComplete = () => {
    return formData.fullName && 
           formData.lastName && 
           formData.dateOfBirth && 
           formData.fullAddress && 
           formData.phoneCall && 
           formData.phoneText && 
           formData.isOver18;
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1 px-6 pt-16">
        
        {/* Title */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Create a Profile
          </Text>
          <Text className="text-base text-gray-600 text-center px-4">
            Create an account or login to explore about our app.
          </Text>
        </View>

        {/* Form */}
        <View className="flex-1">
          
          {/* First Name */}
          <View className="mb-4 relative">
            <TextInput
              className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={formData.fullName}
              onChangeText={(text) => updateFormData('fullName', text)}
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              First Name
            </Text>
            {errors.fullName ? (
              <Text className="text-red-500 text-sm mt-1">{errors.fullName}</Text>
            ) : null}
          </View>

          {/* Last Name */}
          <View className="mb-4 relative">
            <TextInput
              className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={formData.lastName}
              onChangeText={(text) => updateFormData('lastName', text)}
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Last Name
            </Text>
            {errors.lastName ? (
              <Text className="text-red-500 text-sm mt-1">{errors.lastName}</Text>
            ) : null}
          </View>

          {/* Date of Birth */}
          <View className="mb-4 relative">
            <TouchableOpacity
              className="px-4 py-4 rounded-xl border border-gray-200 pr-12 bg-transparent"
              onPress={() => setShowDatePicker(true)}
            >
              <Text className={`text-base ${formData.dateOfBirth ? 'text-gray-800' : 'text-gray-400'}`}>
                {formData.dateOfBirth || 'Enter'}
              </Text>
            </TouchableOpacity>
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Date of Birth
            </Text>
            <TouchableOpacity 
              className="absolute right-3 top-4"
              onPress={() => setShowDatePicker(true)}
            >
              <Text className="text-gray-500">📅</Text>
            </TouchableOpacity>
            {errors.dateOfBirth ? (
              <Text className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</Text>
            ) : null}
          </View>

          {/* Full Address */}
          <View className="mb-4 relative">
            <TextInput
              className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
              placeholder="Enter your address"
              placeholderTextColor="#9CA3AF"
              value={formData.fullAddress}
              onChangeText={(text) => updateFormData('fullAddress', text)}
              multiline
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Full Address
            </Text>
            {errors.fullAddress ? (
              <Text className="text-red-500 text-sm mt-1">{errors.fullAddress}</Text>
            ) : null}
          </View>

          {/* Phone Number (Call) */}
          <View className="mb-4 relative">
            <TextInput
              className="px-4 py-4 rounded-xl border border-gray-200 pr-12 text-base bg-transparent"
              placeholder="Enter"
              placeholderTextColor="#9CA3AF"
              value={formData.phoneCall}
              onChangeText={(text) => updateFormData('phoneCall', text)}
              keyboardType="phone-pad"
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Phone Number (Call)
            </Text>
            <TouchableOpacity className="absolute right-3 top-4">
              <Text className="text-gray-500">📞</Text>
            </TouchableOpacity>
            {errors.phoneCall ? (
              <Text className="text-red-500 text-sm mt-1">{errors.phoneCall}</Text>
            ) : null}
          </View>

          {/* Phone Number (Text) */}
          <View className="mb-4 relative">
            <TextInput
              className="px-4 py-4 rounded-xl border border-gray-200 pr-12 text-base bg-transparent"
              placeholder="Enter"
              placeholderTextColor="#9CA3AF"
              value={formData.phoneText}
              onChangeText={(text) => updateFormData('phoneText', text)}
              keyboardType="phone-pad"
            />
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Phone Number (Text)
            </Text>
            <TouchableOpacity className="absolute right-3 top-4">
              <Text className="text-gray-500">💬</Text>
            </TouchableOpacity>
            {errors.phoneText ? (
              <Text className="text-red-500 text-sm mt-1">{errors.phoneText}</Text>
            ) : null}
          </View>

          {/* Where did you hear about us */}
          <View className="mb-4 relative">
            <TouchableOpacity 
              className="px-4 py-4 rounded-xl border border-gray-200 pr-12 bg-transparent"
              onPress={() => setShowDropdown(true)}
            >
              <Text className={`text-base ${formData.hearAbout ? 'text-gray-800' : 'text-gray-400'}`}>
                {formData.hearAbout || 'Select an option'}
              </Text>
            </TouchableOpacity>
            <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
              Where did you hear about us?
            </Text>
            <TouchableOpacity 
              className="absolute right-3 top-4"
              onPress={() => setShowDropdown(true)}
            >
              <Text className="text-gray-500">▼</Text>
            </TouchableOpacity>
          </View>

          {/* Age Confirmation */}
          <View className="mb-8">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => updateFormData('isOver18', !formData.isOver18)}
            >
              <View className={`w-5 h-5 rounded border-2 mr-3 ${
                formData.isOver18 ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {formData.isOver18 && (
                  <Text className="text-white text-xs text-center">✓</Text>
                )}
              </View>
              <Text className="text-gray-700 flex-1">
                I am 18+ years of age or older
              </Text>
            </TouchableOpacity>
          </View>

          {/* Complete Profile Button */}
          <View className="mb-8">
            <CarouselButton
              title="Complete Profile"
              onPress={handleSubmit}
              disabled={!isFormComplete()}
            />
          </View>

        </View>

      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
          >
            <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-3xl p-4">
                <View className="flex-row justify-between items-center mb-4">
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-blue-500 text-lg">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    const formattedDate = `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;
                    updateFormData('dateOfBirth', formattedDate);
                    setShowDatePicker(false);
                  }}>
                    <Text className="text-blue-500 text-lg font-semibold">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setSelectedDate(date);
                  }}
                  maximumDate={new Date()}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View className="bg-white rounded-xl max-w-sm mx-auto w-full">
            <View className="py-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800 text-center">
                Where did you hear about us?
              </Text>
            </View>
            {hearAboutOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className="py-4 px-6 border-b border-gray-100 last:border-b-0"
                onPress={() => handleDropdownSelect(option)}
              >
                <Text className="text-base text-gray-800">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
}