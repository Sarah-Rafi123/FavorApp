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
    phoneCall: '',
    phoneText: '',
    yearsOfExperience: '',
    aboutMe: '',
    heardAboutUs: '',
    skills: [] as string[],
    otherSkills: '',
    ageConsent: false,
  });

  const [selectedCountryCall, setSelectedCountryCall] = useState<CountryCode>(countryData[0]);
  const [selectedCountryText, setSelectedCountryText] = useState<CountryCode>(countryData[0]);
  
  // Extracted from address
  const [extractedCity, setExtractedCity] = useState('');
  const [extractedState, setExtractedState] = useState('');

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
    phoneCall: '',
    phoneText: '',
    yearsOfExperience: '',
    aboutMe: '',
    otherSkills: '',
    ageConsent: '',
  });

  // Phone number formatting functions
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
    if (!phoneRegex.test(phone)) return 'Please use (XXX) XXX-XXXX format';
    return '';
  };

  const updateFormData = (field: string, value: string | boolean | string[] | Date) => {
    // Field-specific validations and character limits
    if (typeof value === 'string') {
      // First and Last Name: no numbers, max 30 characters
      if ((field === 'firstName' || field === 'lastName')) {
        const hasNumbers = /\d/.test(value);
        if (hasNumbers || value.length > 30) {
          return;
        }
      }
      
      // Phone fields: format as (XXX) XXX-XXXX
      if ((field === 'phoneCall' || field === 'phoneText')) {
        const formattedPhone = formatPhoneNumber(value);
        if (formattedPhone.length > 14) { // Max length for (XXX) XXX-XXXX
          return;
        }
        value = formattedPhone;
      }
      
      // Years of experience: only numbers, 0-99
      if (field === 'yearsOfExperience') {
        const hasNonNumbers = /[^0-9]/.test(value);
        const numValue = parseInt(value);
        if (hasNonNumbers || (value && (numValue < 0 || numValue > 99))) {
          return;
        }
      }
      
      // About me: max 1000 characters
      if (field === 'aboutMe' && value.length > 1000) {
        return;
      }
      
      // Other skills: max 150 characters
      if (field === 'otherSkills' && value.length > 150) {
        return;
      }
      
      // Auto-extract city and state from address
      if (field === 'fullAddress') {
        const addressParts = value.split(',').map(part => part.trim());
        if (addressParts.length >= 2) {
          let city = '';
          let state = '';
          
          if (addressParts.length === 2) {
            // Format: "City, State" or "City, State ZIP"
            city = addressParts[0];
            const stateZip = addressParts[1];
            state = stateZip.split(' ')[0];
          } else if (addressParts.length >= 3) {
            // Format: "Street, City, State" or "Street, City, State ZIP"
            city = addressParts[addressParts.length - 2];
            const stateZip = addressParts[addressParts.length - 1];
            state = stateZip.split(' ')[0];
          }
          
          // Auto-populate extracted city and state
          setExtractedCity(city);
          setExtractedState(state);
        } else {
          // Clear city and state if address format is invalid
          setExtractedCity('');
          setExtractedState('');
        }
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
      phoneCall: '',
      phoneText: '',
      yearsOfExperience: '',
      aboutMe: '',
      otherSkills: '',
      ageConsent: '',
    };
    let isValid = true;

    // Required field validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    const phoneCallError = validatePhone(formData.phoneCall);
    if (phoneCallError) {
      newErrors.phoneCall = phoneCallError;
      isValid = false;
    }

    const phoneTextError = validatePhone(formData.phoneText);
    if (phoneTextError) {
      newErrors.phoneText = phoneTextError;
      isValid = false;
    }

    if (!formData.yearsOfExperience.trim()) {
      newErrors.yearsOfExperience = 'Years of experience must be between 0 and 99';
      isValid = false;
    } else {
      const years = parseInt(formData.yearsOfExperience);
      if (years < 0 || years > 99) {
        newErrors.yearsOfExperience = 'Years of experience must be between 0 and 99';
        isValid = false;
      }
    }

    // Date validation - user must be 18 or older
    const today = new Date();
    const birthDate = formData.dateOfBirth;
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    if (actualAge < 18) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
      isValid = false;
    }

    // About me validation
    if (formData.aboutMe.trim().length < 20) {
      newErrors.aboutMe = 'About me must be at least 20 characters';
      isValid = false;
    }

    // Address validation
    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = 'Please enter a valid address';
      isValid = false;
    } else {
      // Check if city and state were successfully extracted
      if (!extractedCity.trim() || !extractedState.trim()) {
        newErrors.fullAddress = 'Please enter a valid address in format: Street, City, State';
        isValid = false;
      }
    }

    // Age consent validation
    if (!formData.ageConsent) {
      newErrors.ageConsent = 'You must confirm you are 18+ years old';
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
        phone_no_call: `${selectedCountryCall.dialCode}${formData.phoneCall.replace(/\D/g, '')}`,
        phone_no_text: `${selectedCountryText.dialCode}${formData.phoneText.replace(/\D/g, '')}`,
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
          city: extractedCity,
          state: extractedState,
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
    // Check all required fields
    const requiredFieldsComplete = formData.firstName.trim() && 
           formData.lastName.trim() && 
           formData.fullAddress.trim() && 
           validatePhone(formData.phoneCall) === '' && 
           validatePhone(formData.phoneText) === '' && 
           formData.yearsOfExperience.trim() &&
           formData.aboutMe.trim().length >= 20 &&
           formData.ageConsent;
    
    // Check age validation
    const today = new Date();
    const birthDate = formData.dateOfBirth;
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    const isOver18 = actualAge >= 18;
    
    // Check years of experience is valid
    const yearsValid = formData.yearsOfExperience.trim() && 
                      parseInt(formData.yearsOfExperience) >= 0 && 
                      parseInt(formData.yearsOfExperience) <= 99;
    
    return requiredFieldsComplete && isOver18 && yearsValid;
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
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </Text>
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
                {errors.firstName ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.firstName}</Text>
                ) : null}
              </View>

              {/* Last Name */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </Text>
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
                {errors.lastName ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.lastName}</Text>
                ) : null}
              </View>


              {/* Date of Birth */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </Text>
                <View className="relative">
                  <TouchableOpacity
                    className="px-4 py-4 rounded-xl border border-gray-200 pr-12 bg-transparent"
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text className="text-base text-gray-800">
                      {formatDateDisplay(formData.dateOfBirth)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="absolute right-3 top-4"
                    onPress={() => setShowDatePicker(true)}
                  >
                    <CalenderSvg />
                  </TouchableOpacity>
                </View>
                {errors.dateOfBirth ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</Text>
                ) : null}
              </View>

              {/* Full Address */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </Text>
                <TextInput
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                  placeholder="Enter your address"
                  placeholderTextColor="#9CA3AF"
                  value={formData.fullAddress}
                  onChangeText={(text) => updateFormData('fullAddress', text)}     
                  multiline
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Example: 123 Main St, New York, NY
                </Text>
                {errors.fullAddress ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.fullAddress}</Text>
                ) : null}
              </View>


              {/* Phone Number (Call) */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Call) *
                </Text>
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
                    placeholder="(XXX) XXX-XXXX"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phoneCall}
                    onChangeText={(text) => updateFormData('phoneCall', text)}
                    keyboardType="phone-pad"
                    maxLength={14}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  Format: (XXX) XXX-XXXX
                </Text>
                {errors.phoneCall ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.phoneCall}</Text>
                ) : null}
              </View>

              {/* Phone Number (Text) */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Text) *
                </Text>
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
                    placeholder="(XXX) XXX-XXXX"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phoneText}
                    onChangeText={(text) => updateFormData('phoneText', text)}
                    keyboardType="phone-pad"
                    maxLength={14}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  Format: (XXX) XXX-XXXX
                </Text>
                {errors.phoneText ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.phoneText}</Text>
                ) : null}
              </View>

              {/* Skills */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Skills
                </Text>
                <View className="relative">
                  <TouchableOpacity 
                    className="px-4 py-4 rounded-xl border border-gray-200 pr-12 bg-transparent"
                    onPress={() => setShowSkillsDropdown(true)}
                  >
                    <Text className={`text-base ${formData.skills.length > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                      {formData.skills.length > 0 ? `${formData.skills.length} skill(s) selected` : 'Select skills'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="absolute right-3 top-4"
                    onPress={() => setShowSkillsDropdown(true)}
                  >
                    <Text className="text-gray-500">▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Other Skills */}
              {formData.skills.includes('Others') && (
                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Other Skills
                  </Text>
                  <TextInput
                    className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                    placeholder="Describe your other skills..."
                    placeholderTextColor="#9CA3AF"
                    value={formData.otherSkills}
                    onChangeText={(text) => updateFormData('otherSkills', text)}
                    multiline
                    maxLength={150}
                  />
                  <Text className="text-xs text-gray-500 mt-1 text-right">
                    {formData.otherSkills.length}/150 characters
                  </Text>
                </View>
              )}

              {/* Years of Experience */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </Text>
                <TextInput
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent"
                  placeholder="Enter years of experience (0-99)"
                  placeholderTextColor="#9CA3AF"
                  value={formData.yearsOfExperience}
                  onChangeText={(text) => updateFormData('yearsOfExperience', text)}
                  keyboardType="numeric"
                />
                {errors.yearsOfExperience ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</Text>
                ) : null}
              </View>

              {/* About Me */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  About Me *
                </Text>
                <TextInput
                  className="px-4 py-4 rounded-xl border border-gray-200 text-base bg-transparent h-24"
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#9CA3AF"
                  value={formData.aboutMe}
                  onChangeText={(text) => updateFormData('aboutMe', text)}
                  multiline
                  textAlignVertical="top"
                  maxLength={1000}
                />
                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-xs text-gray-500">
                    Minimum 20 characters required
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formData.aboutMe.length}/1000 characters
                  </Text>
                </View>
                {errors.aboutMe ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.aboutMe}</Text>
                ) : null}
              </View>

              {/* Where did you hear about us */}
              <View className="mb-8">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Where did you hear about us?
                </Text>
                <View className="relative">
                  <TouchableOpacity 
                    className="px-4 py-4 rounded-xl border border-gray-200 pr-12 bg-transparent"
                    onPress={() => setShowHeardAboutDropdown(true)}
                  >
                    <Text className={`text-base ${formData.heardAboutUs ? 'text-gray-800' : 'text-gray-400'}`}>
                      {formData.heardAboutUs || 'Select an option'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="absolute right-3 top-4"
                    onPress={() => setShowHeardAboutDropdown(true)}
                  >
                    <Text className="text-gray-500">▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Age Consent Checkbox */}
              <View className="mb-6">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => updateFormData('ageConsent', !formData.ageConsent)}
                >
                  <View className={`w-5 h-5 rounded border-2 mr-3 ${
                    formData.ageConsent ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {formData.ageConsent && (
                      <Text className="text-white text-xs text-center">✓</Text>
                    )}
                  </View>
                  <Text className="text-gray-700 flex-1">
                    I confirm that I am 18 years of age or older
                  </Text>
                </TouchableOpacity>
                {errors.ageConsent ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.ageConsent}</Text>
                ) : null}
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
          <View className="bg-[#F4F5DE] rounded-xl max-w-sm mx-auto w-full p-6">
            <View className="mb-4 flex-row justify-between items-center">
              <Text className="text-xl font-semibold text-gray-800">
                Select Skills
              </Text>
              <TouchableOpacity onPress={() => setShowSkillsDropdown(false)}>
                <Text className="text-green-500 font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-5">
              {skillsOptions.map((skill, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center"
                  onPress={() => handleSkillToggle(skill)}
                >
                  <View className={`w-5 h-5 rounded border-2 mr-3 ${
                    formData.skills.includes(skill) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                  }`}>
                    {formData.skills.includes(skill) && (
                      <Text className="text-white text-xs text-center leading-4">✓</Text>
                    )}
                  </View>
                  <Text className="text-lg text-gray-800">{skill}</Text>
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
          <View className="bg-[#F4F5DE] rounded-xl max-w-sm mx-auto w-full">
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