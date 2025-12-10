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
  Image,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { CarouselButton } from '../../components/buttons';
import { CountryDropdown } from '../../components/overlays';
import { useRegisterMutation } from '../../services/mutations/AuthMutations';
import { useSkillsQuery } from '../../services/queries/UserQueries';
import useAuthStore from '../../store/useAuthStore';
import { CountryCode, RegistrationData } from '../../types';
import { countryData } from '../../utils/countryData';
import { ImagePickerUtils, ImageResult } from '../../utils/ImagePickerUtils';
import CalenderSvg from '../../assets/icons/Calender';
import Toast from 'react-native-toast-message';

interface CreateProfileScreenProps {
  onProfileComplete: () => void;
  onNavigateToOtp?: (email: string) => void;
  onBack?: () => void;
}

export function CreateProfileScreen({ onProfileComplete, onNavigateToOtp, onBack }: CreateProfileScreenProps) {
  const registrationData = useAuthStore((state) => state.registrationData);
  const clearRegistrationData = useAuthStore((state) => state.clearRegistrationData);
  const setUser = useAuthStore((state) => state.setUser);
  const registerMutation = useRegisterMutation();
  const { data: skillsData, error: skillsError } = useSkillsQuery();

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
    ageConsent: false,
    profileImage: null as ImageResult | null,
  });

  const [selectedCountryCall, setSelectedCountryCall] = useState<CountryCode>(countryData[0]);
  const [selectedCountryText, setSelectedCountryText] = useState<CountryCode>(countryData[0]);
  

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showCountryCallDropdown, setShowCountryCallDropdown] = useState(false);
  const [showCountryTextDropdown, setShowCountryTextDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showHeardAboutDropdown, setShowHeardAboutDropdown] = useState(false);
  
  // Address field state
  const [showAddressModal, setShowAddressModal] = useState(false);

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
    profileImage: '',
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
    // Skip address field - use separate handler
    if (field === 'fullAddress') {
      return;
    }
    
    // Field-specific validations and character limits
    if (typeof value === 'string') {
      // First and Last Name: no numbers, 3-50 characters
      if ((field === 'firstName' || field === 'lastName')) {
        const hasNumbers = /\d/.test(value);
        if (hasNumbers || value.length > 50) {
          return;
        }
        
        // Real-time validation for name fields
        const trimmedValue = value.trim();
        let newError = '';
        if (trimmedValue.length > 0 && trimmedValue.length < 3) {
          newError = `${field === 'firstName' ? 'First' : 'Last'} name must be at least 3 characters long`;
        }
        
        setErrors(prev => ({
          ...prev,
          [field]: newError
        }));
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

  // Generate arrays for date selectors
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 18; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  const generateMonths = () => {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  };

  const generateDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(formData.dateOfBirth);
    newDate.setFullYear(year);
    
    // Adjust day if it doesn't exist in the new month/year combination
    const maxDay = new Date(year, newDate.getMonth() + 1, 0).getDate();
    if (newDate.getDate() > maxDay) {
      newDate.setDate(maxDay);
    }
    
    updateFormData('dateOfBirth', newDate);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(formData.dateOfBirth);
    newDate.setMonth(monthIndex);
    
    // Adjust day if it doesn't exist in the new month
    const maxDay = new Date(newDate.getFullYear(), monthIndex + 1, 0).getDate();
    if (newDate.getDate() > maxDay) {
      newDate.setDate(maxDay);
    }
    
    updateFormData('dateOfBirth', newDate);
    setShowMonthPicker(false);
  };

  const handleDaySelect = (day: number) => {
    const newDate = new Date(formData.dateOfBirth);
    newDate.setDate(day);
    updateFormData('dateOfBirth', newDate);
    setShowDayPicker(false);
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

  // Image handling functions
  const handleImageOptions = () => {
    const options = formData.profileImage 
      ? ['Take Photo', 'Choose from Library', 'Remove Photo', 'Cancel']
      : ['Take Photo', 'Choose from Library', 'Cancel'];
    
    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = formData.profileImage ? 2 : -1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (buttonIndex) => {
          handleImageAction(buttonIndex, options);
        }
      );
    } else {
      Alert.alert(
        'Select Image',
        'Choose how you would like to add an image',
        [
          {
            text: 'Take Photo',
            onPress: () => launchCamera()
          },
          {
            text: 'Choose from Library',
            onPress: () => launchImageLibrary()
          },
          ...(formData.profileImage ? [{
            text: 'Remove Photo',
            style: 'destructive' as const,
            onPress: () => handleRemoveImage()
          }] : []),
          {
            text: 'Cancel',
            style: 'cancel' as const
          }
        ]
      );
    }
  };

  const handleImageAction = (buttonIndex: number, options: string[]) => {
    switch (options[buttonIndex]) {
      case 'Take Photo':
        launchCamera();
        break;
      case 'Choose from Library':
        launchImageLibrary();
        break;
      case 'Remove Photo':
        handleRemoveImage();
        break;
    }
  };

  const launchCamera = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = await ImagePickerUtils.openCamera();
      if (result) {
        setFormData(prev => ({ ...prev, profileImage: result }));
        // Clear profile image error when image is selected
        setErrors(prev => ({ ...prev, profileImage: '' }));
      }
    } catch (error: any) {
      console.error('Camera launch error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const launchImageLibrary = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = await ImagePickerUtils.openImageLibrary();
      if (result) {
        setFormData(prev => ({ ...prev, profileImage: result }));
        // Clear profile image error when image is selected
        setErrors(prev => ({ ...prev, profileImage: '' }));
      }
    } catch (error: any) {
      console.error('Image library launch error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setFormData(prev => ({ ...prev, profileImage: null }));
            // Set profile image error when image is removed since it's required
            setErrors(prev => ({ ...prev, profileImage: 'Profile picture is required' }));
          }
        }
      ]
    );
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
      profileImage: '',
    };
    let isValid = true;

    // Required field validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    } else if (formData.firstName.trim().length < 3) {
      newErrors.firstName = 'First name must be at least 3 characters long';
      isValid = false;
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    } else if (formData.lastName.trim().length < 3) {
      newErrors.lastName = 'Last name must be at least 3 characters long';
      isValid = false;
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
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
      if (!formData.city.trim() || !formData.state.trim()) {
        newErrors.fullAddress = 'Please enter a valid address in format: Street, City, State';
        isValid = false;
      }
    }

    // Age consent validation
    if (!formData.ageConsent) {
      newErrors.ageConsent = 'You must confirm you are 18+ years old';
      isValid = false;
    }

    // Profile image validation
    if (!formData.profileImage) {
      newErrors.profileImage = 'Profile picture is required';
      isValid = false;
    }

    setErrors(newErrors);
    
    // Show popup with validation errors if there are any
    if (!isValid) {
      showValidationErrorsPopup(newErrors);
    }
    
    return isValid;
  };

  const showValidationErrorsPopup = (validationErrors: typeof errors) => {
    const errorMessages = Object.entries(validationErrors)
      .filter(([_, error]) => error)
      .map(([field, error]) => {
        const fieldLabels: Record<string, string> = {
          firstName: 'First Name',
          lastName: 'Last Name',
          dateOfBirth: 'Date of Birth',
          fullAddress: 'Full Address',
          phoneCall: 'Phone Number (Call)',
          phoneText: 'Phone Number (Text)',
          yearsOfExperience: 'Years of Experience',
          aboutMe: 'About Me',
          otherSkills: 'Other Skills',
          ageConsent: 'Age Consent',
          profileImage: 'Profile Picture',
        };
        return `• ${fieldLabels[field] || field}: ${error}`;
      });
    
    if (errorMessages.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Please fix the following errors:',
        text2: errorMessages.slice(0, 4).join('\n') + (errorMessages.length > 4 ? '\n• And more...' : ''),
        visibilityTime: 6000,
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !registrationData) {
      // Validation popup is already shown by validateForm()
      return;
    }

    // Create FormData for multipart upload
    const formDataPayload = new FormData();
    
    // Add user data fields
    formDataPayload.append('user[email]', registrationData.email);
    formDataPayload.append('user[password]', registrationData.password);
    formDataPayload.append('user[password_confirmation]', registrationData.password);
    formDataPayload.append('user[first_name]', formData.firstName);
    formDataPayload.append('user[last_name]', formData.lastName);
    formDataPayload.append('user[phone_no_call]', `${selectedCountryCall.dialCode}${formData.phoneCall.replace(/\D/g, '')}`);
    formDataPayload.append('user[phone_no_text]', `${selectedCountryText.dialCode}${formData.phoneText.replace(/\D/g, '')}`);
    formDataPayload.append('user[birth_day]', formData.dateOfBirth.getDate().toString());
    formDataPayload.append('user[birth_month]', (formData.dateOfBirth.getMonth() + 1).toString());
    formDataPayload.append('user[birth_year]', formData.dateOfBirth.getFullYear().toString());
    formDataPayload.append('user[years_of_experience]', formData.yearsOfExperience || "0");
    formDataPayload.append('user[about_me]', formData.aboutMe || '');
    formDataPayload.append('user[heard_about_us]', formData.heardAboutUs || '');
    formDataPayload.append('user[terms_of_service]', registrationData.termsAccepted ? "1" : "0");
    formDataPayload.append('user[other_skills]', formData.otherSkills || '');
    
    // Add skills array
    formData.skills.forEach((skill) => {
      formDataPayload.append('user[skills][]', skill);
    });
    
    // Add address attributes
    formDataPayload.append('user[address_attributes][full_address]', formData.fullAddress);
    formDataPayload.append('user[address_attributes][city]', formData.city);
    formDataPayload.append('user[address_attributes][state]', formData.state);
    
    // Add profile image if selected
    if (formData.profileImage) {
      formDataPayload.append('user[image]', {
        uri: formData.profileImage.uri,
        type: formData.profileImage.type,
        name: formData.profileImage.name,
      } as any);
    }

    try {
      console.log('Registration payload with image:', formData.profileImage ? 'Image included' : 'No image');
      const response = await registerMutation.mutateAsync(formDataPayload);
      console.log('Registration response:', response);
      
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please check your email\nfor OTP verification'
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
           formData.ageConsent &&
           formData.profileImage !== null;
    
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

  const handleBackPress = () => {
    // Clear all form data
    setFormData({
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
      skills: [],
      otherSkills: '',
      ageConsent: false,
      profileImage: null,
    });
    
    // Clear all errors
    setErrors({
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
      profileImage: '',
    });
    
    // Clear address modal state
    setShowAddressModal(false);
    
    // Clear country selections
    setSelectedCountryCall(countryData[0]);
    setSelectedCountryText(countryData[0]);
    
    // Clear registration data from auth store
    clearRegistrationData();
    
    // Navigate back
    if (onBack) {
      onBack();
    }
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
          nestedScrollEnabled={false}
        >
          <View className="flex-1 px-6 pt-16">
            {/* Back Button */}
            {onBack && (
              <View className="mb-4">
                <TouchableOpacity 
                  onPress={handleBackPress}
                  className="flex-row items-center"
                >
                  <Text className="text-lg mr-1">←</Text>
                  <Text className="text-base text-gray-600">Back</Text>
                </TouchableOpacity>
              </View>
            )}

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
                  className="px-4 py-4 rounded-xl border border-gray-300 text-base bg-transparent"
                  placeholder="Enter your first name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.firstName}
                  onChangeText={(text) => updateFormData('firstName', text)}
                />
                <View className="flex-row justify-between mt-1">
                  <View className="flex-1">
                    {errors.firstName ? (
                      <Text className="text-red-500 text-sm">{errors.firstName}</Text>
                    ) : null}
                  </View>
                  <Text className={`text-xs ${formData.firstName.length < 3 || formData.firstName.length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.firstName.length}/50 
                  </Text>
                </View>
              </View>

              {/* Last Name */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </Text>
                <TextInput
                  className="px-4 py-4 rounded-xl border border-gray-300 text-base bg-transparent"
                  style={{ 
                    backgroundColor: 'transparent',
                    lineHeight: 20,
                  }}
                  placeholder="Enter your last name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.lastName}
                  onChangeText={(text) => updateFormData('lastName', text)}
                />
                <View className="flex-row justify-between mt-1">
                  <View className="flex-1">
                    {errors.lastName ? (
                      <Text className="text-red-500 text-sm">{errors.lastName}</Text>
                    ) : null}
                  </View>
                  <Text className={`text-xs ${formData.lastName.length < 3 || formData.lastName.length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.lastName.length}/50 
                  </Text>
                </View>
              </View>


              {/* Date of Birth */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </Text>
                <View className="relative">
                  <TouchableOpacity
                    className="px-4 py-4 rounded-xl border border-gray-300 pr-12 bg-transparent"
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
              <View className="mb-8" style={{ zIndex: 1000, elevation: 1000 }}>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </Text>
                {!process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY && (
                  <Text className="text-yellow-600 text-xs mb-2">
                    ⚠️ Google Places API key not configured. Autocomplete may not work.
                  </Text>
                )}
                <TouchableOpacity
                  className={`px-4 py-4 rounded-xl border ${errors.fullAddress ? 'border-red-500' : 'border-gray-300'} bg-transparent`}
                  onPress={() => setShowAddressModal(true)}
                >
                  <Text className={`text-base ${formData.fullAddress ? 'text-gray-800' : 'text-gray-400'}`}>
                    {formData.fullAddress || 'Enter your address'}
                  </Text>
                </TouchableOpacity>
              
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
                    className="px-3 py-4 rounded-l-xl border border-r-0 border-gray-300 bg-transparent flex-row items-center"
                    onPress={() => setShowCountryCallDropdown(true)}
                  >
                    <Text className="text-lg mr-2">{selectedCountryCall.flag}</Text>
                    <Text className="text-base text-gray-800">{selectedCountryCall.dialCode}</Text>
                    <Text className="text-gray-500 ml-1">▼</Text>
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 px-4 py-4 rounded-r-xl border border-gray-300 text-base bg-transparent"
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
                    className="px-3 py-4 rounded-l-xl border border-r-0 border-gray-300 bg-transparent flex-row items-center"
                    onPress={() => setShowCountryTextDropdown(true)}
                  >
                    <Text className="text-lg mr-2">{selectedCountryText.flag}</Text>
                    <Text className="text-base text-gray-800">{selectedCountryText.dialCode}</Text>
                    <Text className="text-gray-500 ml-1">▼</Text>
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 px-4 py-4 rounded-r-xl border border-gray-300 text-base bg-transparent"
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
                    className="px-4 py-4 rounded-xl border border-gray-300 pr-12 bg-transparent"
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
                    className="px-4 py-4 rounded-xl border border-gray-300 text-base bg-transparent"
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
                  className="px-4 py-4 rounded-xl border border-gray-300 text-base bg-transparent"
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
                  className="px-4 py-4 rounded-xl border border-gray-300 text-base bg-transparent h-24"
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
                    className="px-4 py-4 rounded-xl border border-gray-300 pr-12 bg-transparent"
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

              {/* Profile Image Upload */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-4">
                  Profile Photo *
                </Text>
                <View className="items-center">
                  <View className="relative mb-4">
                    {formData.profileImage ? (
                      <Image
                        source={{ uri: formData.profileImage.uri }}
                        className="w-24 h-24 rounded-full bg-gray-100"
                        style={{ backgroundColor: '#f3f4f6' }}
                      />
                    ) : (
                      <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
                        <Text className="text-gray-400 text-xs text-center">No Photo</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity 
                    className="bg-transparent border-2 border-[#71DFB1] rounded-full px-4 py-2"
                    onPress={handleImageOptions}
                  >
                    <Text className="text-[#71DFB1] font-medium">
                      {formData.profileImage ? 'Change Photo' : 'Add Photo'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.profileImage ? (
                  <Text className="text-red-500 text-sm mt-2 text-center">{errors.profileImage}</Text>
                ) : null}
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
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-white rounded-3xl w-full max-w-sm p-6">
              <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-gray-500 text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Select Date of Birth</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-green-500 text-lg font-semibold">Done</Text>
                </TouchableOpacity>
              </View>
              
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={formData.dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date(1900, 0, 1)}
                  maximumDate={(() => {
                    const today = new Date();
                    return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                  })()}
                />
              ) : (
                <View className="space-y-4">
                  {/* Year Selector */}
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Year</Text>
                    <View className="border border-gray-300 rounded-xl">
                      <TouchableOpacity 
                        className="px-4 py-3 flex-row justify-between items-center"
                        onPress={() => setShowYearPicker(true)}
                      >
                        <Text className="text-base text-gray-800">{formData.dateOfBirth.getFullYear()}</Text>
                        <Text className="text-gray-500">▼</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Month Selector */}
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Month</Text>
                    <View className="border border-gray-300 rounded-xl">
                      <TouchableOpacity 
                        className="px-4 py-3 flex-row justify-between items-center"
                        onPress={() => setShowMonthPicker(true)}
                      >
                        <Text className="text-base text-gray-800">
                          {new Date(2000, formData.dateOfBirth.getMonth()).toLocaleDateString('en-US', { month: 'long' })}
                        </Text>
                        <Text className="text-gray-500">▼</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Day Selector */}
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Day</Text>
                    <View className="border border-gray-300 rounded-xl">
                      <TouchableOpacity 
                        className="px-4 py-3 flex-row justify-between items-center"
                        onPress={() => setShowDayPicker(true)}
                      >
                        <Text className="text-base text-gray-800">{formData.dateOfBirth.getDate()}</Text>
                        <Text className="text-gray-500">▼</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Selected Date Preview */}
                  <View className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                    <Text className="text-sm text-green-700 font-medium mb-1">Selected Date:</Text>
                    <Text className="text-lg text-green-800 font-semibold">
                      {formatDateDisplay(formData.dateOfBirth)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
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
            <View className="py-4 border-b border-gray-300">
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

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View className="bg-white rounded-xl max-w-sm mx-auto w-full max-h-96">
            <View className="py-4 border-b border-gray-300">
              <Text className="text-lg font-semibold text-gray-800 text-center">Select Year</Text>
            </View>
            <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
              {generateYears().map((year) => (
                <TouchableOpacity
                  key={year}
                  className={`py-3 px-6 border-b border-gray-100 ${
                    year === formData.dateOfBirth.getFullYear() ? 'bg-green-50' : ''
                  }`}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text className={`text-base ${
                    year === formData.dateOfBirth.getFullYear() ? 'text-green-600 font-semibold' : 'text-gray-800'
                  }`}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View className="bg-white rounded-xl max-w-sm mx-auto w-full">
            <View className="py-4 border-b border-gray-300">
              <Text className="text-lg font-semibold text-gray-800 text-center">Select Month</Text>
            </View>
            {generateMonths().map((month, index) => (
              <TouchableOpacity
                key={month}
                className={`py-4 px-6 border-b border-gray-100 last:border-b-0 ${
                  index === formData.dateOfBirth.getMonth() ? 'bg-green-50' : ''
                }`}
                onPress={() => handleMonthSelect(index)}
              >
                <Text className={`text-base ${
                  index === formData.dateOfBirth.getMonth() ? 'text-green-600 font-semibold' : 'text-gray-800'
                }`}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Day Picker Modal */}
      <Modal
        visible={showDayPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowDayPicker(false)}
        >
          <View className="bg-white rounded-xl max-w-sm mx-auto w-full max-h-96">
            <View className="py-4 border-b border-gray-300">
              <Text className="text-lg font-semibold text-gray-800 text-center">Select Day</Text>
            </View>
            <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap">
                {generateDaysInMonth(formData.dateOfBirth.getFullYear(), formData.dateOfBirth.getMonth()).map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`w-1/7 py-3 m-1 rounded-lg items-center ${
                      day === formData.dateOfBirth.getDate() ? 'bg-green-500' : 'bg-gray-100'
                    }`}
                    style={{ width: '13%' }}
                    onPress={() => handleDaySelect(day)}
                  >
                    <Text className={`text-base font-medium ${
                      day === formData.dateOfBirth.getDate() ? 'text-white' : 'text-gray-800'
                    }`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Address Search Modal */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-[#FBFFF0] mt-20 rounded-t-3xl">
            <View className="flex-row justify-between items-center p-6 border-b border-gray-300">
              <Text className="text-xl font-bold text-gray-800">Search Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Text className="text-gray-500 text-lg">✕</Text>
              </TouchableOpacity>
            </View>
            
            <View className="p-6 flex-1">
              <GooglePlacesAutocomplete
                placeholder="Enter your address"
                minLength={2}
                listViewDisplayed="auto"
                enablePoweredByContainer={false}
                predefinedPlaces={[]}
                currentLocation={false}
                keyboardShouldPersistTaps="handled"
                suppressDefaultStyles={false}
                textInputProps={{
                  placeholder: "Enter your address",
                  placeholderTextColor: "#9CA3AF"
                }}
                renderDescription={(row) => row.description}
                isRowScrollable={true}
                listEmptyComponent={() => (
                  <View className="p-4 items-center">
                    <Text className="text-gray-500 text-center">No addresses found. Please try a different search term.</Text>
                  </View>
                )}
                onPress={(_, details = null) => {
                  if (details) {
                    const addressComponents = details.address_components;
                    let city = '';
                    let state = '';
                    let fullAddress = details.formatted_address;

                    // Extract city and state from address components
                    addressComponents.forEach((component) => {
                      if (component.types.includes('locality')) {
                        city = component.long_name;
                      }
                      if (component.types.includes('administrative_area_level_1')) {
                        state = component.short_name;
                      }
                    });

                    // Update form data
                    setFormData(prev => ({
                      ...prev,
                      fullAddress: fullAddress,
                      city: city,
                      state: state,
                    }));
                    
                    // Clear any address errors
                    setErrors(prev => ({ ...prev, fullAddress: '' }));
                    
                    // Close modal
                    setShowAddressModal(false);
                  }
                }}
                query={{
                  key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                  language: 'en',
                  types: 'address',
                  components: 'country:us',
                }}
                fetchDetails={true}
                styles={{
                  container: {
                    flex: 0,
                  },
                  textInputContainer: {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    height: 56,
                    margin: 0,
                  },
                  textInput: {
                    backgroundColor: 'transparent',
                    height: 30,
                    margin: 0,
                    padding: 0,
                    fontSize: 16,
                    color: '#374151',
                    fontWeight: '400',
                  },
                  listView: {
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    marginTop: 8,
                    maxHeight: 300,
                  },
                  row: {
                    backgroundColor: 'white',
                    padding: 13,
                    minHeight: 44,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                  },
                  separator: {
                    height: 0,
                  },
                  poweredContainer: {
                    display: 'none'
                  },
                  description: {
                    fontSize: 13,
                    color: '#6b7280',
                  },
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}