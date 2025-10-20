import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { CustomButton } from '../buttons/CustomButton';
import { useProfileQuery } from '../../services/queries/ProfileQueries';
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
  dateOfBirth: string;
  address: string;
  phoneCall: string;
  phoneText: string;
}

export function UpdateProfileModal({ visible, onClose, onUpdate, initialData }: UpdateProfileModalProps) {
  const { data: profileResponse } = useProfileQuery();
  const profile = profileResponse?.data?.profile;

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
    firstName: initialData?.firstName || 'Kathryn',
    lastName: initialData?.lastName || 'Murphy',
    dateOfBirth: initialData?.dateOfBirth || '8/2/2001',
    address: initialData?.address || '4140 Parker Rd, Allentown, New Mexico 31134',
    phoneCall: initialData?.phoneCall || '(629) 555-0129',
    phoneText: initialData?.phoneText || '(406) 555-0120',
  });

  // Update form data when profile data is loaded from API
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        dateOfBirth: formatDateForForm(profile.date_of_birth) || '',
        address: profile.address?.full_address || '',
        phoneCall: formatPhoneForForm(profile.phone_no_call) || '',
        phoneText: formatPhoneForForm(profile.phone_no_text) || '',
      });
    }
  }, [profile]);

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    phoneCall: '',
    phoneText: '',
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

  const validateForm = () => {
    const newErrors = {
      firstName: validateName(profileData.firstName),
      lastName: validateName(profileData.lastName),
      dateOfBirth: validateDate(profileData.dateOfBirth),
      address: validateAddress(profileData.address),
      phoneCall: validatePhone(profileData.phoneCall),
      phoneText: validatePhone(profileData.phoneText),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleUpdate = () => {
    if (validateForm()) {
      onUpdate(profileData);
      onClose();
    }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    let formattedValue = value;
    
    // Format phone numbers
    if (field === 'phoneCall' || field === 'phoneText') {
      formattedValue = formatPhoneNumber(value);
    }
    
    setProfileData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
                <TouchableOpacity className="bg-transparent border-2 border-[#71DFB1] rounded-full px-4 py-2">
                  <Text className="text-[#71DFB1] font-medium">Change Photo</Text>
                </TouchableOpacity>
              </View>

              <View>
                <View className="mb-6 relative">
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
                  <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 bg-[#FBFFF0]">
                    Full Name
                  </Text>
                  {errors.firstName ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.firstName}</Text>
                  ) : null}
                </View>

                <View className="mb-6 relative">
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
                  <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 bg-[#FBFFF0]">
                    Last Name
                  </Text>
                  {errors.lastName ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.lastName}</Text>
                  ) : null}
                </View>

                <View className="mb-6 relative">
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
                  <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 bg-[#FBFFF0]">
                    Date of Birth
                  </Text>
                  {errors.dateOfBirth ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</Text>
                  ) : null}
                </View>

                <View className="mb-6 relative">
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
                  <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 bg-[#FBFFF0]">
                    Full Address
                  </Text>
                  {errors.address ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.address}</Text>
                  ) : null}
                </View>

                <View className="mb-6 relative">
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
                  <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 bg-[#FBFFF0]">
                    Phone Number (Call)
                  </Text>
                  {errors.phoneCall ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.phoneCall}</Text>
                  ) : null}
                </View>

                <View className="mb-6 relative">
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
                  <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 bg-[#FBFFF0]">
                    Phone Number (Text)
                  </Text>
                  {errors.phoneText ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.phoneText}</Text>
                  ) : null}
                </View>
              </View>

              <View className="mt-6">
                <CustomButton
                  title="Update"
                  onPress={handleUpdate}
                  className="w-full"
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
                  onPress={() => setShowYearPicker(true)}
                  className="bg-[#71DFB1] px-3 py-1 rounded-full"
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
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-[#FBFFF0] rounded-3xl w-full max-w-sm border-4 border-[#71DFB1] p-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-black">Select Year</Text>
              <TouchableOpacity 
                onPress={() => setShowYearPicker(false)}
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
                    onPress={() => handleYearSelect(year)}
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
          </View>
        </View>
      </Modal>
    </Modal>
  );
}