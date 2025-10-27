import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, TextInput, Alert, ActionSheetIOS, Platform } from 'react-native';
import { CustomButton } from '../buttons/CustomButton';
import { useProfileQuery } from '../../services/queries/ProfileQueries';
import { useUpdateProfileMutation, useUploadProfileImageMutation, useRemoveProfileImageMutation } from '../../services/mutations/ProfileMutations';
import ImagePicker from 'react-native-image-crop-picker';
import CalendarSvg from '../../assets/icons/Calender';
import PhoneSvg from '../../assets/icons/Phone';
import ChatSvg from '../../assets/icons/Chat';

interface UpdateProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (profileData: ProfileData) => void;
  initialData?: ProfileData;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  address: string;
  phoneCall: string;
  phoneText: string;
  yearsOfExperience?: number;
  aboutMe?: string;
  skills?: string[];
  otherSkills?: string;
  city?: string;
  state?: string;
}

export function UpdateProfileModal({ visible, onClose, onUpdate, initialData }: UpdateProfileModalProps) {
  const { data: profileResponse } = useProfileQuery();
  const profile = profileResponse?.data?.profile;
  
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadImageMutation = useUploadProfileImageMutation();
  const removeImageMutation = useRemoveProfileImageMutation();

  // Helper function to format date from API to MM/DD/YYYY
  const formatDateForForm = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Helper function to format phone number for form display
  const formatPhoneForForm = (phone: string) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    return phone;
  };

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    middleName: initialData?.middleName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    address: initialData?.address || '',
    phoneCall: initialData?.phoneCall || '',
    phoneText: initialData?.phoneText || '',
    yearsOfExperience: initialData?.yearsOfExperience || 0,
    aboutMe: initialData?.aboutMe || '',
    skills: initialData?.skills || [],
    otherSkills: initialData?.otherSkills || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
  });

  // Update form data when profile data is loaded from API
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        middleName: profile.middle_name || '',
        dateOfBirth: formatDateForForm(profile.date_of_birth) || '',
        address: profile.address?.full_address || '',
        phoneCall: formatPhoneForForm(profile.phone_no_call) || '',
        phoneText: formatPhoneForForm(profile.phone_no_text) || '',
        yearsOfExperience: profile.years_of_experience || 0,
        aboutMe: profile.about_me || '',
        skills: profile.skills || [],
        otherSkills: profile.other_skills || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
      });
    }
  }, [profile]);

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    address: '',
    phoneCall: '',
    phoneText: '',
    yearsOfExperience: '',
    aboutMe: '',
    city: '',
    state: '',
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Generate calendar dates
  const generateCalendarDates = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDates = generateCalendarDates(currentYear, currentMonth);

  const handleDateSelect = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    
    updateField('dateOfBirth', formattedDate);
    setShowCalendar(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Generate years for year picker (current year ± 50 years)
  const generateYears = () => {
    const years = [];
    const currentYearNow = new Date().getFullYear();
    for (let year = currentYearNow - 50; year <= currentYearNow + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const availableYears = generateYears();

  const handleYearSelect = (year: number) => {
    console.log(`Setting current year to: ${year}`);
    setCurrentYear(year);
    setShowYearPicker(false);
  };

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return 'This field is required';
    if (name.trim().length < 2) return 'Must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Only letters and spaces allowed';
    return '';
  };

  const validateDate = (date: string) => {
    if (!date.trim()) return 'Date of birth is required';
    const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dateRegex.test(date)) return 'Please use MM/DD/YYYY format';
    
    const [month, day, year] = date.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    
    if (inputDate > today) return 'Date cannot be in the future';
    if (year < 1900) return 'Please enter a valid year';
    
    return '';
  };

  const validateAddress = (address: string) => {
    if (!address.trim()) return 'Address is required';
    if (address.trim().length < 10) return 'Please enter a complete address';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
    if (!phoneRegex.test(phone)) return 'Please use (XXX) XXX-XXXX format';
    return '';
  };

  // Format phone number as user types
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

  const validateExperience = (experience: string) => {
    const num = Number(experience);
    if (isNaN(num) || num < 0 || num > 99) return 'Must be between 0 and 99';
    return '';
  };

  const validateAboutMe = (text: string) => {
    if (text.length > 1000) return 'Maximum 1000 characters allowed';
    return '';
  };

  const validateForm = () => {
    const newErrors = {
      firstName: validateName(profileData.firstName),
      lastName: validateName(profileData.lastName),
      middleName: profileData.middleName ? validateName(profileData.middleName) : '',
      dateOfBirth: validateDate(profileData.dateOfBirth),
      address: validateAddress(profileData.address),
      phoneCall: validatePhone(profileData.phoneCall),
      phoneText: validatePhone(profileData.phoneText),
      yearsOfExperience: validateExperience(profileData.yearsOfExperience?.toString() || '0'),
      aboutMe: validateAboutMe(profileData.aboutMe || ''),
      city: !profileData.city?.trim() ? 'City is required' : '',
      state: !profileData.state?.trim() ? 'State is required' : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleUpdate = () => {
    if (validateForm()) {
      // Transform form data to API format
      const updateData = {
        profile: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          middle_name: profileData.middleName || '',
          phone_no_call: profileData.phoneCall.replace(/\D/g, ''),
          phone_no_text: profileData.phoneText.replace(/\D/g, ''),
          years_of_experience: profileData.yearsOfExperience || 0,
          about_me: profileData.aboutMe || '',
          skills: profileData.skills || [],
          other_skills: profileData.otherSkills || '',
          remove_image: "0" as "0" | "1",
          address_attributes: {
            full_address: profileData.address,
            city: profileData.city || '',
            state: profileData.state || '',
          },
        },
      };

      updateProfileMutation.mutate(updateData, {
        onSuccess: () => {
          onUpdate(profileData);
          onClose();
        },
      });
    }
  };

  const updateField = (field: keyof ProfileData, value: string | number | string[]) => {
    let formattedValue = value;
    
    // Format phone numbers
    if ((field === 'phoneCall' || field === 'phoneText') && typeof value === 'string') {
      formattedValue = formatPhoneNumber(value);
    }
    
    setProfileData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageOptions = () => {
    const options = profile?.image_url 
      ? ['Take Photo', 'Choose from Library', 'Remove Photo', 'Cancel']
      : ['Take Photo', 'Choose from Library', 'Cancel'];
    
    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = profile?.image_url ? 2 : -1;

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
        'Profile Photo',
        'Choose an option',
        options.slice(0, -1).map((option, index) => ({
          text: option,
          onPress: () => handleImageAction(index, options),
          style: index === destructiveButtonIndex ? 'destructive' as 'destructive' : 'default' as 'default',
        })).concat([
          { text: 'Cancel', style: 'cancel' as 'cancel' }
        ])
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
      const image = await ImagePicker.openCamera({
        width: 800,
        height: 800,
        cropping: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeBase64: false,
      });

      // Check file size (10MB limit)
      if (image.size && image.size > 10 * 1024 * 1024) {
        Alert.alert('Error', 'Image file is too large. Please choose an image smaller than 10MB.');
        return;
      }

      await handleImageUpload(image);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    }
  };

  const launchImageLibrary = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeBase64: false,
      });

      // Check file size (10MB limit)
      if (image.size && image.size > 10 * 1024 * 1024) {
        Alert.alert('Error', 'Image file is too large. Please choose an image smaller than 10MB.');
        return;
      }

      await handleImageUpload(image);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to select image. Please try again.');
      }
    }
  };

  const handleImageUpload = async (image: any) => {
    const imageFile = {
      uri: image.path,
      type: image.mime,
      name: image.filename || `profile_image_${Date.now()}.jpg`,
    };

    uploadImageMutation.mutate(imageFile);
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
          onPress: () => removeImageMutation.mutate()
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-[#FBFFF0] rounded-3xl w-full max-w-sm mx-4 border-4 border-[#71DFB1]">
          <ScrollView className="max-h-[88vh]">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-black">Update Profile</Text>
                <TouchableOpacity 
                  onPress={onClose}
                  className="w-6 h-6 bg-black rounded-full items-center justify-center"
                >
                  <Text className="text-white  text-sm">×</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center mb-6">
                <View className="w-20 h-20 bg-gray-200 rounded-2xl overflow-hidden mr-4">
                  {profile?.image_url ? (
                    <Image 
                      source={{ uri: profile.image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-[#44A27B] items-center justify-center">
                      <Text className="text-white text-lg font-bold">
                        {profile?.first_name?.[0]?.toUpperCase() || 'K'}
                        {profile?.last_name?.[0]?.toUpperCase() || 'M'}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  className={`bg-transparent border-2 border-[#71DFB1] rounded-full px-4 py-2 ${
                    uploadImageMutation.isPending || removeImageMutation.isPending ? 'opacity-50' : ''
                  }`}
                  onPress={handleImageOptions}
                  disabled={uploadImageMutation.isPending || removeImageMutation.isPending}
                >
                  <Text className="text-[#71DFB1] font-medium">
                    {uploadImageMutation.isPending ? 'Uploading...' : 
                     removeImageMutation.isPending ? 'Removing...' : 'Change Photo'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </Text>
                  <TextInput
                    value={profileData.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 text-black"
                    placeholder={profile?.first_name || "Kathryn"}
                    placeholderTextColor="#9CA3AF"
                    style={{ 
                      backgroundColor: 'transparent',
                      fontSize: 16,
                      lineHeight: 20,
                      height: 50
                    }}
                  />
                  {errors.firstName ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.firstName}</Text>
                  ) : null}
                </View>

                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </Text>
                  <TextInput
                    value={profileData.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 text-black"
                    placeholder={profile?.last_name || "Murphy"}
                    placeholderTextColor="#9CA3AF"
                    style={{ 
                      backgroundColor: 'transparent',
                      fontSize: 16,
                     lineHeight: 20,
                      height: 50
                    }}
                  />
                  {errors.lastName ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.lastName}</Text>
                  ) : null}
                </View>

                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowCalendar(true)}
                    className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 flex-row items-center justify-between" 
                    style={{ height: 56 }}
                  >
                    <Text className="flex-1 text-black" style={{ fontSize: 16, lineHeight: 20 }}>
                      {profileData.dateOfBirth || formatDateForForm(profile?.date_of_birth || '') || '8/2/2001'}
                    </Text>
                    <CalendarSvg />
                  </TouchableOpacity>
                  {errors.dateOfBirth ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</Text>
                  ) : null}
                </View>

                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </Text>
                  <TextInput
                    value={profileData.address}
                    onChangeText={(text) => updateField('address', text)}
                    className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 text-black"
                    placeholder={profile?.address?.full_address || "4140 Parker Rd, Allentown, New Mexico 31134"}
                    placeholderTextColor="#9CA3AF"
                    style={{ 
                      backgroundColor: 'transparent',
                      fontSize: 16,
                      lineHeight: 20,
                      height: 50
                    }}
                  />
                  {errors.address ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.address}</Text>
                  ) : null}
                </View>

                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Call)
                  </Text>
                  <View className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 flex-row items-center justify-between" style={{ height: 56 }}>
                    <TextInput
                      value={profileData.phoneCall}
                      onChangeText={(text) => updateField('phoneCall', text)}
                      className="flex-1 text-black"
                      placeholder={formatPhoneForForm(profile?.phone_no_call || '') || "(629) 555-0129"}
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      style={{ 
                        backgroundColor: 'transparent',
                        fontSize: 16,
                        lineHeight: 22
                      }}
                    />
                    <PhoneSvg />
                  </View>
                  {errors.phoneCall ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.phoneCall}</Text>
                  ) : null}
                </View>

                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Text)
                  </Text>
                  <View className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 flex-row items-center justify-between" style={{ height: 56 }}>
                    <TextInput
                      value={profileData.phoneText}
                      onChangeText={(text) => updateField('phoneText', text)}
                      className="flex-1 text-black"
                      placeholder={formatPhoneForForm(profile?.phone_no_text || '') || "(406) 555-0120"}
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      style={{ 
                        backgroundColor: 'transparent',
                        fontSize: 16,
                        lineHeight: 22
                      }}
                    />
                    <ChatSvg />
                  </View>
                  {errors.phoneText ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.phoneText}</Text>
                  ) : null}
                </View>
              </View>

              <View className="mt-6">
                <CustomButton
                  title={updateProfileMutation.isPending ? "Updating..." : "Update"}
                  onPress={handleUpdate}
                  className="w-full"
                  disabled={updateProfileMutation.isPending}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-[#FBFFF0] rounded-3xl w-full max-w-sm border-4 border-[#71DFB1] p-6 shadow-lg">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-black mr-2">
                  {monthNames[currentMonth]}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    console.log('Year button pressed, opening year picker');
                    setShowYearPicker(true);
                  }}
                  className="bg-[#71DFB1] px-3 py-1 rounded-full"
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold text-sm">{currentYear}</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row">
                <TouchableOpacity 
                  onPress={() => navigateMonth('prev')}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-2"
                >
                  <Text className="text-xl font-bold text-[#71DFB1]">‹</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => navigateMonth('next')}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Text className="text-xl font-bold text-[#71DFB1]">›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Day Headers */}
            <View className="flex-row mb-3">
              {dayNames.map((day) => (
                <View key={day} className="flex-1 items-center py-2">
                  <Text className="text-xs font-bold text-gray-500 uppercase">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="flex-wrap flex-row mb-4">
              {calendarDates.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentMonth;
                const isToday = 
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();
                const isSelected = profileData.dateOfBirth === 
                  `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDateSelect(date)}
                    className={`w-[14.28%] h-12 items-center justify-center m-0.5 rounded-xl ${
                      isSelected 
                        ? 'bg-[#71DFB1]' 
                        : isToday 
                          ? 'bg-[#71DFB1]/20 border-2 border-[#71DFB1]' 
                          : isCurrentMonth 
                            ? 'bg-white hover:bg-gray-50' 
                            : ''
                    }`}
                    disabled={!isCurrentMonth}
                    style={{
                      shadowColor: isSelected || isToday ? '#71DFB1' : '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isSelected || isToday ? 0.3 : 0.1,
                      shadowRadius: 2,
                      elevation: isSelected || isToday ? 3 : 1,
                    }}
                  >
                    <Text className={`text-sm font-medium ${
                      !isCurrentMonth 
                        ? 'text-gray-300' 
                        : isSelected 
                          ? 'text-white font-bold' 
                          : isToday 
                            ? 'text-[#71DFB1] font-bold' 
                            : 'text-black'
                    }`}>
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                className="flex-1 bg-gray-100 rounded-full py-3"
              >
                <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const today = new Date();
                  handleDateSelect(today);
                }}
                className="flex-1 bg-[#71DFB1] rounded-full py-3"
              >
                <Text className="text-white text-center font-semibold">Today</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      {showYearPicker && (
        <Modal
          visible={showYearPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowYearPicker(false)}
        >
          <TouchableOpacity 
            className="flex-1 bg-black/50 justify-center items-center p-4"
            activeOpacity={1}
            onPress={() => setShowYearPicker(false)}
          >
            <TouchableOpacity 
              className="bg-[#FBFFF0] rounded-3xl w-full max-w-sm border-4 border-[#71DFB1] p-6 shadow-lg"
              activeOpacity={1}
              onPress={() => {}}
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-black">Select Year</Text>
                <TouchableOpacity 
                  onPress={() => {
                    console.log('Closing year picker');
                    setShowYearPicker(false);
                  }}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Text className="text-gray-600 text-lg">×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
                <View className="flex-wrap flex-row">
                  {availableYears.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => {
                        console.log(`Year ${year} selected`);
                        handleYearSelect(year);
                      }}
                      className={`w-[30%] m-1 py-3 rounded-xl items-center ${
                        year === currentYear 
                          ? 'bg-[#71DFB1]' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <Text className={`font-semibold ${
                        year === currentYear ? 'text-white' : 'text-black'
                      }`}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </Modal>
  );
}