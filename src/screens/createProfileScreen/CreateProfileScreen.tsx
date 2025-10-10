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
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CarouselButton } from '../../components/buttons';
import { CountryDropdown } from '../../components/overlays';
import { useRegisterMutation } from '../../services/mutations/AuthMutations';
import { useSkillsQuery } from '../../services/queries/UserQueries';
import useAuthStore from '../../store/useAuthStore';
import { CountryCode, RegistrationData } from '../../types';
import { countryData } from '../../utils/countryData';
import CalenderSvg from '../../assets/icons/Calender';
import Toast from 'react-native-toast-message';

interface CreateProfileScreenProps {
  onProfileComplete: () => void;
  onNavigateToOtp?: (email: string) => void;
}

export function CreateProfileScreen({ onProfileComplete, onNavigateToOtp }: CreateProfileScreenProps) {
  const registrationData = useAuthStore((state) => state.registrationData);
  const clearRegistrationData = useAuthStore((state) => state.clearRegistrationData);
  const setUser = useAuthStore((state) => state.setUser);
  const registerMutation = useRegisterMutation();
  const { data: skillsData, isLoading: skillsLoading, error: skillsError } = useSkillsQuery();

  // Show error toast if skills fail to load
  React.useEffect(() => {
    if (skillsError) {
      Toast.show({
        type: 'info',
        text1: 'Skills Loading',
        text2: 'Using default skills list'
      });
    }
  }, [skillsError]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(),
    fullAddress: '',
    city: '',
    state: '',
    phoneCall: '',
    phoneText: '',
    yearsOfExperience: '',
    aboutMe: '',
    heardAboutUs: '',
    skills: [] as string[],
    otherSkills: '',
    isOver18: false,
  });

  const [selectedCountryCall, setSelectedCountryCall] = useState<CountryCode>(countryData[0]);
  const [selectedCountryText, setSelectedCountryText] = useState<CountryCode>(countryData[0]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountryCallDropdown, setShowCountryCallDropdown] = useState(false);
  const [showCountryTextDropdown, setShowCountryTextDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showHeardAboutDropdown, setShowHeardAboutDropdown] = useState(false);

  // Get skills from API or use fallback
  const skillsOptions = skillsData?.data?.skills || [
    'Manual Labor',
    'General Repairs',
    'Mechanical',
    'Technical',
    'Dump Runs/Removals',
    'Pets',
    'Furniture Assembly',
    'Handyman',
    'Contractor',
    'Volunteer',
    'Others'
  ];

  const heardAboutOptions = [
    'Google',
    'Social Media',
    'Friend',
    'Advertisement',
    'Other'
  ];

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    fullAddress: '',
    city: '',
    state: '',
    phoneCall: '',
    phoneText: '',
    aboutMe: '',
    heardAboutUs: '',
  });

  const updateFormData = (field: string, value: string | boolean | string[] | Date) => {
    // Prevent numbers in first name and last name fields
    if ((field === 'firstName' || field === 'lastName') && typeof value === 'string') {
      const hasNumbers = /\d/.test(value);
      if (hasNumbers) {
        return; // Don't update if contains numbers
      }
    }
    
    // Prevent alphabetic characters in phone number fields
    if ((field === 'phoneCall' || field === 'phoneText') && typeof value === 'string') {
      const hasLetters = /[a-zA-Z]/.test(value);
      if (hasLetters) {
        return; // Don't update if contains letters
      }
    }
    
    // Allow only numbers in years of experience field
    if (field === 'yearsOfExperience' && typeof value === 'string') {
      const hasNonNumbers = /[^0-9]/.test(value);
      if (hasNonNumbers) {
        return; // Don't update if contains non-numeric characters
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (typeof value === 'string' && value && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      updateFormData('dateOfBirth', date);
    }
  };


  const handleSkillToggle = (skill: string) => {
    const currentSkills = formData.skills;
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    updateFormData('skills', updatedSkills);
  };

  const handleHeardAboutSelect = (option: string) => {
    updateFormData('heardAboutUs', option);
    setShowHeardAboutDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      fullAddress: '',
      city: '',
      state: '',
      phoneCall: '',
      phoneText: '',
      aboutMe: '',
      heardAboutUs: '',
    };
    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = 'Full address is required';
      isValid = false;
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
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

  const handleSubmit = async () => {
    if (!validateForm() || !registrationData) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all required fields'
      });
      return;
    }

    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    const registrationPayload: RegistrationData = {
      user: {
        email: registrationData.email,
        password: registrationData.password,
        password_confirmation: registrationData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_no_call: `${selectedCountryCall.dialCode}${formData.phoneCall}`,
        phone_no_text: `${selectedCountryText.dialCode}${formData.phoneText}`,
        date_of_birth: formatDate(formData.dateOfBirth),
        years_of_experience: formData.yearsOfExperience || "0",
        about_me: formData.aboutMe || undefined,
        heard_about_us: formData.heardAboutUs || undefined,
        birth_day: formData.dateOfBirth.getDate().toString(),
        birth_month: (formData.dateOfBirth.getMonth() + 1).toString(),
        birth_year: formData.dateOfBirth.getFullYear().toString(),
        terms_of_service: registrationData.termsAccepted ? "1" : "0",
        skills: formData.skills,
        other_skills: formData.otherSkills || undefined,
        address_attributes: {
          full_address: formData.fullAddress,
          city: formData.city,
          state: formData.state,
        },
      },
    };

    try {
      console.log('Registration payload:', JSON.stringify(registrationPayload, null, 2));
      const response = await registerMutation.mutateAsync(registrationPayload);
      console.log('Registration response:', response);
      
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please check your email for OTP verification'
      });
      
      // Navigate to OTP verification instead of completing profile
      if (onNavigateToOtp) {
        onNavigateToOtp(registrationData.email);
      } else {
        // Fallback: complete profile directly
        setUser({
          id: response.user?.id || '1',
          firstName: formData.firstName,
          email: registrationData.email,
        });
        clearRegistrationData();
        onProfileComplete();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Please try again';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.userMessage) {
        errorMessage = error.userMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage
      });
    }
  };

  const isFormComplete = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.fullAddress && 
           formData.city &&
           formData.state &&
           formData.phoneCall && 
           formData.phoneText && 
           formData.yearsOfExperience &&
           formData.isOver18;
  };

  const formatDateDisplay = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <ImageBackground 
      source={require('../../../assets/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-16">
            {/* Title */}
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
                Create a Profile
              </Text>
              <Text className="text-base text-gray-600 text-center px-4">
                Complete your profile to get started with FavorApp.
              </Text>
            </View>

            {/* Form */}
            <View className="flex-1">
          
              {/* First Name */}
              <View className="mb-4 relative">
                <TextInput
                 style={{ 
                    backgroundColor: 'transparent',
 
                    lineHeight: 20,

                  }}
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                  placeholder="Enter your first name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.firstName}
                  onChangeText={(text) => updateFormData('firstName', text)}
                />
                <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700" >
                  First Name
                </Text>
                {errors.firstName ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.firstName}</Text>
                ) : null}
              </View>

              {/* Last Name */}
              <View className="mb-4 relative">
                <TextInput
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                   style={{ 
                    backgroundColor: 'transparent',

                    lineHeight: 20,
                 
                  }}
                  placeholder="Enter your last name"
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
                  <Text className="text-base text-gray-800">
                    {formatDateDisplay(formData.dateOfBirth)}
                  </Text>
                </TouchableOpacity>
                <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                  Date of Birth
                </Text>
                <TouchableOpacity 
                  className="absolute right-3 top-4"
                  onPress={() => setShowDatePicker(true)}
                >
                  <CalenderSvg />
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

              {/* City */}
              <View className="mb-4 relative">
                <TextInput
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                  placeholder="Enter your city"
                   style={{ 
                    lineHeight: 20,
                  }}
                  placeholderTextColor="#9CA3AF"
                  value={formData.city}
                  onChangeText={(text) => updateFormData('city', text)}
                />
                <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                  City
                </Text>
                {errors.city ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.city}</Text>
                ) : null}
              </View>

              {/* State */}
              <View className="mb-4 relative">
                <TextInput
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                  placeholder="Enter your state"
                   style={{ 
                    lineHeight: 20,
                  }}
                  placeholderTextColor="#9CA3AF"
                  value={formData.state}
                  onChangeText={(text) => updateFormData('state', text)}
                />
                <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                  State
                </Text>
                {errors.state ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.state}</Text>
                ) : null}
              </View>

              {/* Phone Number (Call) */}
              <View className="mb-4 relative">
                <View className="flex-row">
                  <TouchableOpacity 
                    className="px-3 py-4 rounded-l-xl border border-r-0 border-gray-200 bg-transparent flex-row items-center"
                    onPress={() => setShowCountryCallDropdown(true)}
                  >
                    <Text className="text-lg mr-2">{selectedCountryCall.flag}</Text>
                    <Text className="text-base text-gray-800">{selectedCountryCall.dialCode}</Text>
                    <Text className="text-gray-500 ml-1">▼</Text>
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 px-4 py-4 rounded-r-xl border border-gray-200 text-base bg-transparent"
                    placeholder="Phone number"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phoneCall}
                    onChangeText={(text) => updateFormData('phoneCall', text)}
                    keyboardType="phone-pad"
                  />
                </View>
                <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                  Phone Number (Call)
                </Text>
                {errors.phoneCall ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.phoneCall}</Text>
                ) : null}
              </View>

              {/* Phone Number (Text) */}
              <View className="mb-4 relative">
                <View className="flex-row">
                  <TouchableOpacity 
                    className="px-3 py-4 rounded-l-xl border border-r-0 border-gray-200 bg-transparent flex-row items-center"
                    onPress={() => setShowCountryTextDropdown(true)}
                  >
                    <Text className="text-lg mr-2">{selectedCountryText.flag}</Text>
                    <Text className="text-base text-gray-800">{selectedCountryText.dialCode}</Text>
                    <Text className="text-gray-500 ml-1">▼</Text>
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 px-4 py-4 rounded-r-xl border border-gray-200 text-base bg-transparent"
                    placeholder="Text number"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phoneText}
                    onChangeText={(text) => updateFormData('phoneText', text)}
                    keyboardType="phone-pad"
                  />
                </View>
                <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                  Phone Number (Text)
                </Text>
                {errors.phoneText ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.phoneText}</Text>
                ) : null}
              </View>

              {/* Years of Experience */}
              <View className="mb-4 relative">
                <TextInput
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                  placeholder="Enter years of experience"
                  placeholderTextColor="#9CA3AF"
                  value={formData.yearsOfExperience}
                  onChangeText={(text) => updateFormData('yearsOfExperience', text)}
                  keyboardType="numeric"
                />
                <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                  Years of Experience
                </Text>
              </View>

              {/* Skills */}
              <View className="mb-4 relative">
                <TouchableOpacity 
                  className="px-4 py-4 rounded-xl border border-gray-200 pr-12 bg-transparent"
                  onPress={() => setShowSkillsDropdown(true)}
                >
                  <Text className={`text-base ${formData.skills.length > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                    {formData.skills.length > 0 ? `${formData.skills.length} skill(s) selected` : 'Select skills'}
                  </Text>
                </TouchableOpacity>
                <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                  Skills
                </Text>
                <TouchableOpacity 
                  className="absolute right-3 top-4"
                  onPress={() => setShowSkillsDropdown(true)}
                >
                  <Text className="text-gray-500">▼</Text>
                </TouchableOpacity>
              </View>

              {/* Other Skills */}
              {formData.skills.includes('Others') && (
                <View className="mb-4 relative">
                  <TextInput
                    className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                    placeholder="Describe your other skills..."
                    placeholderTextColor="#9CA3AF"
                    value={formData.otherSkills}
                    onChangeText={(text) => updateFormData('otherSkills', text)}
                    multiline
                    maxLength={200}
                  />
                  <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                    Other Skills
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1 text-right">
                    {formData.otherSkills.length}/200
                  </Text>
                </View>
              )}

              {/* About Me */}
              <View className="mb-4 relative">
                <TextInput
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent h-24"
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#9CA3AF"
                  value={formData.aboutMe}
                  onChangeText={(text) => updateFormData('aboutMe', text)}
                  multiline
                  textAlignVertical="top"
                  maxLength={300}
                />
                <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                  About Me
                </Text>
                <Text className="text-xs text-gray-500 mt-1 text-right">
                  {formData.aboutMe.length}/300
                </Text>
                {errors.aboutMe ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.aboutMe}</Text>
                ) : null}
              </View>

              {/* Where did you hear about us */}
              <View className="mb-4 relative">
                <TouchableOpacity 
                  className="px-4 py-4 rounded-xl border border-gray-200 pr-12 bg-transparent"
                  onPress={() => setShowHeardAboutDropdown(true)}
                >
                  <Text className={`text-base ${formData.heardAboutUs ? 'text-gray-800' : 'text-gray-400'}`}>
                    {formData.heardAboutUs || 'Select an option'}
                  </Text>
                </TouchableOpacity>
                <Text className="absolute -top-3 left-3 px-1 text-sm font-medium text-gray-700">
                  Where did you hear about us?
                </Text>
                <TouchableOpacity 
                  className="absolute right-3 top-4"
                  onPress={() => setShowHeardAboutDropdown(true)}
                >
                  <Text className="text-gray-500">▼</Text>
                </TouchableOpacity>
                {errors.heardAboutUs ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.heardAboutUs}</Text>
                ) : null}
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
                    I am 18+ years of age or older and agree to the Terms of Service
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Complete Profile Button */}
              <View className="mb-8">
                <CarouselButton
                  title={registerMutation.isPending ? "Creating Profile..." : "Complete Profile"}
                  onPress={handleSubmit}
                  disabled={!isFormComplete() || registerMutation.isPending}
                />
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
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
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-blue-500 text-lg font-semibold">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={formData.dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={formData.dateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)}
          />
        )
      )}

      {/* Country Dropdowns */}
      <CountryDropdown
        visible={showCountryCallDropdown}
        onClose={() => setShowCountryCallDropdown(false)}
        onSelect={setSelectedCountryCall}
        selectedCountry={selectedCountryCall}
      />

      <CountryDropdown
        visible={showCountryTextDropdown}
        onClose={() => setShowCountryTextDropdown(false)}
        onSelect={setSelectedCountryText}
        selectedCountry={selectedCountryText}
      />


      {/* Skills Dropdown Modal */}
      <Modal
        visible={showSkillsDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSkillsDropdown(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowSkillsDropdown(false)}
        >
          <View className="bg-white rounded-xl max-w-sm mx-auto w-full p-6">
            <View className="mb-4 flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-gray-800">
                Select Skills
              </Text>
              <TouchableOpacity onPress={() => setShowSkillsDropdown(false)}>
                <Text className="text-blue-500 font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-gray-50 rounded-lg p-4">
              {skillsOptions.map((skill, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center mb-3 last:mb-0"
                  onPress={() => handleSkillToggle(skill)}
                >
                  <View className={`w-5 h-5 rounded border-2 mr-3 ${
                    formData.skills.includes(skill) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                  }`}>
                    {formData.skills.includes(skill) && (
                      <Text className="text-white text-xs text-center leading-4">✓</Text>
                    )}
                  </View>
                  <Text className="text-base text-gray-800">{skill}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Heard About Us Dropdown Modal */}
      <Modal
        visible={showHeardAboutDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHeardAboutDropdown(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowHeardAboutDropdown(false)}
        >
          <View className="bg-white rounded-xl max-w-sm mx-auto w-full">
            <View className="py-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800 text-center">
                Where did you hear about us?
              </Text>
            </View>
            {heardAboutOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className="py-4 px-6 border-b border-gray-100 last:border-b-0"
                onPress={() => handleHeardAboutSelect(option)}
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