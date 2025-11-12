import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, TextInput, Alert, ActionSheetIOS, Platform, KeyboardAvoidingView } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { CustomButton } from '../buttons/CustomButton';
import { useProfileQuery } from '../../services/queries/ProfileQueries';
import { useUpdateProfileMutation, useUploadProfileImageMutation, useRemoveProfileImageMutation } from '../../services/mutations/ProfileMutations';
import { ImagePickerUtils } from '../../utils/ImagePickerUtils';
import CalendarSvg from '../../assets/icons/Calender';
import PhoneSvg from '../../assets/icons/Phone';
import ChatSvg from '../../assets/icons/Chat';
import { CountryCode } from '../../types';
import { countryData } from '../../utils/countryData';

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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      console.warn('Date formatting error:', error);
      return '';
    }
  };

  // Helper function to format phone number for form display (without country code)
  const formatPhoneForForm = (phone: string, selectedCountry: CountryCode) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    
    // Remove the selected country's dial code from the number
    const dialCodeDigits = selectedCountry.dialCode.replace(/\D/g, '');
    let cleanNumber = numbers;
    
    if (numbers.startsWith(dialCodeDigits)) {
      cleanNumber = numbers.slice(dialCodeDigits.length);
    }
    
    // Format the clean number (without country code)
    if (cleanNumber.length === 10) {
      return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`;
    } else if (cleanNumber.length > 0) {
      // For partial numbers, format as much as possible
      if (cleanNumber.length <= 3) {
        return `(${cleanNumber}`;
      } else if (cleanNumber.length <= 6) {
        return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3)}`;
      } else {
        return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`;
      }
    }
    
    return cleanNumber;
  };

  // Format phone number input (only digits, formatted as (XXX) XXX-XXXX)
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
      const formattedDate = formatDateForForm(profile.date_of_birth);
      console.log('🗓️ Date formatting debug:', {
        raw: profile.date_of_birth,
        formatted: formattedDate
      });
      
      // Separate predefined skills from custom skills
      const allSkills = profile.skills || [];
      const predefinedSkills = allSkills.filter(skill => skillsOptions.includes(skill));
      const unlistedSkills = allSkills.filter(skill => !skillsOptions.includes(skill));
      
      // Combine existing other_skills with any unlisted skills found in the skills array
      const existingOtherSkills = profile.other_skills || '';
      const unlistedSkillsText = unlistedSkills.join(', ');
      
      // Combine both other skills sources, avoiding duplication
      let combinedOtherSkills = '';
      if (existingOtherSkills && unlistedSkillsText) {
        // Check if unlisted skills are already in other_skills to avoid duplication
        const existingSkillsLower = existingOtherSkills.toLowerCase();
        const newUnlistedSkills = unlistedSkills.filter(skill => 
          !existingSkillsLower.includes(skill.toLowerCase())
        );
        if (newUnlistedSkills.length > 0) {
          combinedOtherSkills = `${existingOtherSkills}, ${newUnlistedSkills.join(', ')}`;
        } else {
          combinedOtherSkills = existingOtherSkills;
        }
      } else if (existingOtherSkills) {
        combinedOtherSkills = existingOtherSkills;
      } else if (unlistedSkillsText) {
        combinedOtherSkills = unlistedSkillsText;
      }
      
      // Auto-check "Others" if there are any unlisted skills or existing other_skills
      const finalSkills = [...predefinedSkills];
      if (combinedOtherSkills) {
        finalSkills.push('Others');
      }
      
      console.log('🔧 Skills processing:', {
        allSkills,
        predefinedSkills,
        unlistedSkills,
        existingOtherSkills,
        combinedOtherSkills,
        finalSkills
      });
      
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        middleName: profile.middle_name || '',
        dateOfBirth: formattedDate,
        address: profile.address?.full_address || '',
        phoneCall: formatPhoneForForm(profile.phone_no_call || '', getCountryFromPhone(profile.phone_no_call || '')) || '',
        phoneText: formatPhoneForForm(profile.phone_no_text || '', getCountryFromPhone(profile.phone_no_text || '')) || '',
        yearsOfExperience: profile.years_of_experience || 0,
        aboutMe: profile.about_me || '',
        skills: finalSkills,
        otherSkills: combinedOtherSkills,
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
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState<'calendar' | 'yearPicker'>('calendar');
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showCountryCallDropdown, setShowCountryCallDropdown] = useState(false);
  const [showCountryTextDropdown, setShowCountryTextDropdown] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Country selection state
  const [selectedCountryCall, setSelectedCountryCall] = useState<CountryCode>(countryData[0]);
  const [selectedCountryText, setSelectedCountryText] = useState<CountryCode>(countryData[0]);

  // Generate calendar dates
  const generateCalendarDates = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Initialize calendar to show user's birth date when opened
  React.useEffect(() => {
    if (showCalendar && profileData.dateOfBirth) {
      try {
        // Parse MM/DD/YYYY format
        const [month, day, year] = profileData.dateOfBirth.split('/').map(num => parseInt(num, 10));
        if (month && day && year && month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1900) {
          const birthDate = new Date(year, month - 1, day);
          if (!isNaN(birthDate.getTime())) {
            setCurrentMonth(birthDate.getMonth());
            setCurrentYear(birthDate.getFullYear());
            setSelectedDate(birthDate);
          }
        }
      } catch (error) {
        console.warn('Error parsing birth date for calendar:', error);
      }
    }
  }, [showCalendar, profileData.dateOfBirth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Skills options
  const skillsOptions = [
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

  const handleSkillToggle = (skill: string) => {
    const currentSkills = profileData.skills || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    // If user unchecks "Others", clear the other skills field
    if (skill === 'Others' && currentSkills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: updatedSkills,
        otherSkills: '' // Clear other skills when unchecking Others
      }));
    } else {
      updateField('skills', updatedSkills);
    }
  };

  // Get country from phone number
  const getCountryFromPhone = (phone: string): CountryCode => {
    if (!phone) return countryData[0]; // Default to US
    
    const numbers = phone.replace(/\D/g, '');
    
    // Find matching country by dial code
    for (const country of countryData) {
      const dialCodeDigits = country.dialCode.replace(/\D/g, '');
      if (numbers.startsWith(dialCodeDigits)) {
        return country;
      }
    }
    
    return countryData[0]; // Default to US if no match
  };

  // Initialize countries from existing phone numbers
  React.useEffect(() => {
    if (profile?.phone_no_call) {
      const countryCall = getCountryFromPhone(profile.phone_no_call);
      setSelectedCountryCall(countryCall);
    }
    if (profile?.phone_no_text) {
      const countryText = getCountryFromPhone(profile.phone_no_text);
      setSelectedCountryText(countryText);
    }
  }, [profile?.phone_no_call, profile?.phone_no_text]);

  const calendarDates = generateCalendarDates(currentYear, currentMonth);

  const isDateValidAge = (date: Date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    return actualAge >= 18;
  };

  const handleDateSelect = (date: Date) => {
    // Only allow selection of dates that result in 18+ age
    if (isDateValidAge(date)) {
      setSelectedDate(date);
      // Clear any existing date error when valid date is selected
      setErrors(prev => ({ ...prev, dateOfBirth: '' }));
    }
  };

  const handleDateUpdate = () => {
    if (selectedDate) {
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${month}/${day}/${year}`;
      
      // Calculate age for the new date
      const [monthNum, dayNum, yearNum] = formattedDate.split('/').map(Number);
      const birthDate = new Date(yearNum, monthNum - 1, dayNum);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        calculatedAge = calculatedAge - 1;
      }
      
      console.log('🗓️ Date update debug:', {
        selectedDate,
        formattedDate,
        calculatedAge,
        month,
        day,
        year
      });
      
      // Validate age before updating
      const validationError = validateDate(formattedDate);
      if (validationError) {
        console.warn('🗓️ Date validation error:', validationError);
        // Show error but don't close modal
        setErrors(prev => ({ ...prev, dateOfBirth: validationError }));
        return;
      }
      
      // Clear any existing errors
      setErrors(prev => ({ ...prev, dateOfBirth: '' }));
      
      // Update the field
      updateField('dateOfBirth', formattedDate);
      setShowCalendar(false);
      setSelectedDate(null);
      
      console.log('🗓️ Date updated successfully:', formattedDate, 'Age:', calculatedAge);
    }
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

  // Generate years for year picker (suitable for birth dates)
  const generateYears = () => {
    const years = [];
    const currentYearNow = new Date().getFullYear();
    // Generate years from 1924 (100 years old) to current year - 18 (minimum age)
    const minYear = 1924;
    const maxYear = currentYearNow - 18;
    
    for (let year = maxYear; year >= minYear; year--) {
      years.push(year);
    }
    return years;
  };

  const availableYears = generateYears();

  const handleYearSelect = (year: number) => {
    console.log(`Setting current year to: ${year}`);
    setCurrentYear(year);
    setCalendarView('calendar');
  };
  
  // Add ref for scrolling to current year
  const yearScrollViewRef = React.useRef<ScrollView>(null);
  
  // Effect to scroll to current year when year picker opens
  React.useEffect(() => {
    if (calendarView === 'yearPicker' && yearScrollViewRef.current) {
      const currentIndex = availableYears.findIndex(year => year === currentYear);
      if (currentIndex !== -1) {
        // Scroll to show current year in view (approximate calculation)
        const itemHeight = 50; // Approximate height of each year button
        const scrollOffset = Math.max(0, (currentIndex - 2) * itemHeight);
        setTimeout(() => {
          yearScrollViewRef.current?.scrollTo({ y: scrollOffset, animated: true });
        }, 100);
      }
    }
  }, [calendarView, currentYear, availableYears]);

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
    
    // Age validation - user must be 18 or older
    const age = today.getFullYear() - inputDate.getFullYear();
    const monthDiff = today.getMonth() - inputDate.getMonth();
    const dayDiff = today.getDate() - inputDate.getDate();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    if (actualAge < 18) return 'You must be 18 years or above';
    
    return '';
  };

  const validateAddress = (address: string) => {
    if (!address.trim()) return 'Address is required';
    if (address.trim().length < 10) return 'Please enter a complete address';
    
    // Check if address likely contains city and state
    const commaCount = (address.match(/,/g) || []).length;
    if (commaCount < 1) {
      return 'Please include city and state (e.g., "123 Main St, New York, NY")';
    }
    
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
    if (!phoneRegex.test(phone)) return 'Please use (XXX) XXX-XXXX format';
    return '';
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
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleUpdate = () => {
    if (validateForm()) {
      // Convert date from MM/DD/YYYY to YYYY-MM-DD format
      const convertDateFormat = (dateStr: string) => {
        if (!dateStr) return '';
        const [month, day, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      // Calculate age from date of birth
      const calculateAge = (dateStr: string) => {
        if (!dateStr) return 0;
        
        try {
          const [month, day, year] = dateStr.split('/').map(Number);
          if (!month || !day || !year) return 0;
          
          const birthDate = new Date(year, month - 1, day);
          const today = new Date();
          
          // Basic validation
          if (isNaN(birthDate.getTime()) || birthDate > today) return 0;
          
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();
          
          // Adjust age if birthday hasn't occurred this year
          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age = age - 1;
          }
          
          console.log('🎂 Age Calculation Debug:', {
            input: dateStr,
            birthDate: birthDate.toDateString(),
            today: today.toDateString(),
            calculatedAge: age,
            monthDiff,
            dayDiff
          });
          
          return Math.max(0, age); // Ensure non-negative age
        } catch (error) {
          console.error('🎂 Age calculation error:', error);
          return 0;
        }
      };

      // Extract city and state from address (improved extraction)
      const extractCityState = (address: string) => {
        if (!address) return { city: '', state: '' };
        
        const parts = address.split(',').map(part => part.trim());
        
        // Try different address formats:
        // "123 Main St, New York, NY 10001"
        // "456 Oak Avenue, Brooklyn, NY"
        // "789 Pine St, Los Angeles, CA"
        
        let city = '';
        let state = '';
        
        if (parts.length >= 3) {
          // Format: Street, City, State ZIP
          city = parts[parts.length - 2];
          const lastPart = parts[parts.length - 1];
          state = lastPart.split(' ')[0]; // Extract state before ZIP code
        } else if (parts.length === 2) {
          // Format: Street, City State or City, State
          const lastPart = parts[1];
          const words = lastPart.split(' ');
          if (words.length >= 2) {
            // Assume last word is state, rest is city
            state = words[words.length - 1];
            city = words.slice(0, -1).join(' ');
          } else {
            city = lastPart;
          }
        } else {
          // Single part - try to extract from end
          const words = address.split(' ');
          if (words.length >= 2) {
            state = words[words.length - 1];
            city = words[words.length - 2];
          }
        }
        
        // Fallback values if extraction fails
        if (!city && !state) {
          city = 'Not specified';
          state = 'Not specified';
        }
        
        return { city: city.trim(), state: state.trim() };
      };

      const { city, state } = extractCityState(profileData.address || '');

      // Ensure city and state are not empty (API requirement)
      if (!city || !state) {
        setErrors(prev => ({ 
          ...prev, 
          address: 'Address must include city and state (e.g., "123 Main St, New York, NY")' 
        }));
        return;
      }

      // Transform form data to API format
      const convertedDate = convertDateFormat(profileData.dateOfBirth);
      const calculatedAge = calculateAge(profileData.dateOfBirth);
      
      console.log('🔄 Profile Update Debug:', {
        originalDateOfBirth: profileData.dateOfBirth,
        convertedDate,
        calculatedAge,
        dateValidation: validateDate(profileData.dateOfBirth),
      });

      // Additional date debugging
      if (profileData.dateOfBirth) {
        const [month, day, year] = profileData.dateOfBirth.split('/');
        console.log('🔄 Date Parts Debug:', { month, day, year, convertedDate });
      }
      
      // Prepare skills data - ensure other skills are only in other_skills field
      const cleanedSkills = (profileData.skills || []).filter(skill => 
        skillsOptions.includes(skill) && skill !== 'Others' // Keep only predefined skills except 'Others'
      );
      
      // Add 'Others' back if user has other skills
      if (profileData.otherSkills && profileData.otherSkills.trim()) {
        cleanedSkills.push('Others');
      }
      
      console.log('💾 Save skills processing:', {
        originalSkills: profileData.skills,
        cleanedSkills,
        otherSkills: profileData.otherSkills,
        hasOthers: profileData.otherSkills && profileData.otherSkills.trim()
      });
      
      const updateData = {
        profile: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone_no_call: `${selectedCountryCall.dialCode}${profileData.phoneCall.replace(/\D/g, '')}`,
          phone_no_text: `${selectedCountryText.dialCode}${profileData.phoneText.replace(/\D/g, '')}`,
          date_of_birth: convertedDate,
          age: calculatedAge,
          years_of_experience: profileData.yearsOfExperience || 0,
          about_me: profileData.aboutMe || '',
          skills: cleanedSkills,
          other_skills: profileData.otherSkills || '',
          address_attributes: {
            full_address: profileData.address || '',
            city: city,
            state: state,
          },
        },
      };

      console.log('✅ Sending both date_of_birth AND calculated age');

      console.log('🚀 Final API Payload:', JSON.stringify(updateData, null, 2));
      console.log('🔍 Date-specific payload check:', {
        date_of_birth: updateData.profile.date_of_birth,
        age: updateData.profile.age,
        raw_input: profileData.dateOfBirth,
        is_date_valid: !validateDate(profileData.dateOfBirth),
        calculated_age: calculatedAge,
      });

      updateProfileMutation.mutate(updateData, {
        onSuccess: (response) => {
          console.log('✅ Profile Update Success Response:', JSON.stringify(response, null, 2));
          console.log('🔍 Returned date_of_birth:', (response?.data?.profile as any)?.date_of_birth);
          console.log('🔍 Returned age:', (response?.data?.profile as any)?.age);
          console.log('🔍 Expected date_of_birth:', convertedDate);
          console.log('🔍 Expected age:', calculatedAge);
          
          // Check if the returned date matches what we sent
          const returnedDate = (response?.data?.profile as any)?.date_of_birth;
          if (returnedDate && returnedDate !== convertedDate) {
            console.warn('⚠️  DATE MISMATCH! Backend returned different date:', {
              sent: convertedDate,
              received: returnedDate
            });
          }
          
          onUpdate(profileData);
          onClose();
        },
        onError: (error: any) => {
          console.error('❌ Profile Update Error:', error);
          console.error('❌ Error response:', error?.response?.data);
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
    
    // Debug date updates
    if (field === 'dateOfBirth') {
      console.log('🗓️ UpdateField dateOfBirth:', {
        oldValue: profileData.dateOfBirth,
        newValue: formattedValue
      });
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
          { text: 'Cancel', style: 'default', onPress: () => {} }
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
      // Add a small delay to ensure any modals are closed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await ImagePickerUtils.openCamera();
      
      if (result) {
        await handleImageUpload(result);
      }
    } catch (error: any) {
      console.error('Camera launch error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const launchImageLibrary = async () => {
    try {
      // Add a small delay to ensure any modals are closed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await ImagePickerUtils.openImageLibrary();
      
      if (result) {
        await handleImageUpload(result);
      }
    } catch (error: any) {
      console.error('Image library launch error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleImageUpload = async (image: any) => {
    const imageFile = {
      uri: image.uri,
      type: image.type,
      name: image.name || `profile_image_${Date.now()}.jpg`,
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
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
        enabled
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-[#FBFFF0] rounded-3xl w-full max-w-sm mx-4 border-4 border-[#71DFB1]">
            <ScrollView 
              className="max-h-[88vh]"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              nestedScrollEnabled={true}
            >
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
                    <View className="flex-1">
                      <Text className="text-black" style={{ fontSize: 16, lineHeight: 20 }}>
                        {profileData.dateOfBirth || 'Select date of birth'}
                      </Text>
                      {profileData.dateOfBirth && (
                        <Text className="text-gray-500 text-sm mt-1">
                          Age: {(() => {
                            try {
                              const [month, day, year] = profileData.dateOfBirth.split('/').map(Number);
                              const birthDate = new Date(year, month - 1, day);
                              const today = new Date();
                              let age = today.getFullYear() - birthDate.getFullYear();
                              const monthDiff = today.getMonth() - birthDate.getMonth();
                              const dayDiff = today.getDate() - birthDate.getDate();
                              if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                                age = age - 1;
                              }
                              return age;
                            } catch {
                              return '?';
                            }
                          })()}
                        </Text>
                      )}
                    </View>
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
                  <TouchableOpacity
                    className={`bg-transparent border border-gray-300 rounded-xl px-4 py-3 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    onPress={() => setShowAddressModal(true)}
                    style={{ height: 50, justifyContent: 'center' }}
                  >
                    <Text className={`text-base ${profileData.address ? 'text-black' : 'text-gray-400'}`}>
                      {profileData.address || profile?.address?.full_address || "4140 Parker Rd, Allentown, New Mexico 31134"}
                    </Text>
                  </TouchableOpacity>
                  {errors.address ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.address}</Text>
                  ) : null}
                </View>

                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Call)
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
                    <View className="flex-1 bg-transparent border border-gray-300 rounded-r-xl px-4 py-3 flex-row items-center justify-between" style={{ height: 56 }}>
                      <TextInput
                        value={profileData.phoneCall}
                        onChangeText={(text) => updateField('phoneCall', text)}
                        className="flex-1 text-black"
                        placeholder={formatPhoneForForm(profile?.phone_no_call || '', selectedCountryCall) || "(629) 555-0129"}
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
                  </View>
                  {errors.phoneCall ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.phoneCall}</Text>
                  ) : null}
                </View>

                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Text)
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
                    <View className="flex-1 bg-transparent border border-gray-300 rounded-r-xl px-4 py-3 flex-row items-center justify-between" style={{ height: 56 }}>
                      <TextInput
                        value={profileData.phoneText}
                        onChangeText={(text) => updateField('phoneText', text)}
                        className="flex-1 text-black"
                        placeholder={formatPhoneForForm(profile?.phone_no_text || '', selectedCountryText) || "(406) 555-0120"}
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
                  </View>
                  {errors.phoneText ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.phoneText}</Text>
                  ) : null}
                </View>
              </View>

              {/* Years of Experience */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </Text>
                <TextInput
                  value={profileData.yearsOfExperience?.toString() || ''}
                  onChangeText={(text) => updateField('yearsOfExperience', parseInt(text) || 0)}
                  className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 text-black"
                  placeholder="Enter years of experience"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={2}
                  style={{ 
                    backgroundColor: 'transparent',
                    fontSize: 16,
                    lineHeight: 20,
                    height: 50
                  }}
                />
                {errors.yearsOfExperience ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</Text>
                ) : null}
              </View>

              {/* About Me */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  About Me
                </Text>
                <TextInput
                  value={profileData.aboutMe || ''}
                  onChangeText={(text) => updateField('aboutMe', text)}
                  className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 text-black"
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={1000}
                  style={{ 
                    backgroundColor: 'transparent',
                    fontSize: 16,
                    lineHeight: 20,
                    minHeight: 100
                  }}
                />
                <Text className="text-xs text-gray-500 mt-1 text-right">
                  {(profileData.aboutMe || '').length}/1000 characters
                </Text>
                {errors.aboutMe ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.aboutMe}</Text>
                ) : null}
              </View>

              {/* Skills */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Skills (You can add multiple skills)
                </Text>
                <TouchableOpacity 
                  className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 min-h-[50px] justify-center"
                  onPress={() => setShowSkillsDropdown(true)}
                >
                  <Text className="text-black" style={{ fontSize: 16, lineHeight: 20 }}>
                    {profileData.skills && profileData.skills.length > 0 
                      ? (() => {
                          // Show standard skills first, then 'Others' if selected
                          const standardSkills = profileData.skills.filter(skill => skill !== 'Others');
                          const hasOthers = profileData.skills.includes('Others');
                          const displaySkills = [...standardSkills];
                          if (hasOthers) {
                            displaySkills.push('Others');
                          }
                          return displaySkills.join(', ');
                        })()
                      : 'Select skills'
                    }
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Other Skills */}
              {profileData.skills?.includes('Others') && (
                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Other Skills
                  </Text>
                  <TextInput
                    value={profileData.otherSkills || ''}
                    onChangeText={(text) => updateField('otherSkills', text)}
                    className="bg-transparent border border-gray-300 rounded-xl px-4 py-3 text-black"
                    placeholder="Describe your other skills..."
                    placeholderTextColor="#9CA3AF"
                    maxLength={150}
                    style={{ 
                      backgroundColor: 'transparent',
                      fontSize: 16,
                      lineHeight: 20,
                      height: 50
                    }}
                  />
                  <Text className="text-xs text-gray-500 mt-1 text-right">
                    {(profileData.otherSkills || '').length}/150 characters
                  </Text>
                </View>
              )}


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
      </KeyboardAvoidingView>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowCalendar(false);
          setCalendarView('calendar');
        }}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4" style={{ pointerEvents: 'auto' }}>
          <View className="bg-[#FBFFF0] rounded-3xl w-full max-w-sm border-4 border-[#71DFB1] p-6 shadow-lg" style={{ pointerEvents: 'auto' }}>
            
            {calendarView === 'calendar' ? (
              // Calendar View
              <>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-black mr-2">
                  {monthNames[currentMonth]}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    console.log('Year button pressed, switching to year picker');
                    console.log('Available years:', availableYears.length, 'years');
                    console.log('Current year:', currentYear);
                    setCalendarView('yearPicker');
                  }}
                  className="bg-[#71DFB1] px-3 py-1 rounded-full"
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ minWidth: 50, minHeight: 25 }}
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
                const isValidAge = isDateValidAge(date);
                const isToday = 
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();
                const isSelected = selectedDate && 
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDateSelect(date)}
                    className={`w-[14.28%] h-12 items-center justify-center m-0.5 rounded-xl ${
                      !isCurrentMonth || !isValidAge
                        ? 'bg-gray-100'
                        : isSelected 
                          ? 'bg-[#71DFB1]' 
                          : isToday 
                            ? 'bg-[#71DFB1]/20 border-2 border-[#71DFB1]' 
                            : 'bg-white hover:bg-gray-50'
                    }`}
                    disabled={!isCurrentMonth || !isValidAge}
                    style={{
                      shadowColor: isSelected || isToday ? '#71DFB1' : '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isSelected || isToday ? 0.3 : 0.1,
                      shadowRadius: 2,
                      elevation: isSelected || isToday ? 3 : 1,
                    }}
                  >
                    <Text className={`text-sm font-medium ${
                      !isCurrentMonth || !isValidAge
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
                    onPress={handleDateUpdate}
                    className={`flex-1 rounded-full py-3 ${
                      selectedDate ? 'bg-[#71DFB1]' : 'bg-gray-300'
                    }`}
                    disabled={!selectedDate}
                  >
                    <Text className={`text-center font-semibold ${
                      selectedDate ? 'text-white' : 'text-gray-500'
                    }`}>Update</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Year Picker View
              <>
                <View className="flex-row justify-between items-center mb-4">
                  <TouchableOpacity 
                    onPress={() => setCalendarView('calendar')}
                    className="flex-row items-center"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-[#71DFB1] text-lg mr-2">‹</Text>
                    <Text className="text-lg font-bold text-black">Select Year</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowCalendar(false);
                      setCalendarView('calendar');
                    }}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-gray-600 text-lg">×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  ref={yearScrollViewRef}
                  className="max-h-64" 
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  <View className="flex-wrap flex-row justify-between">
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
                            : 'bg-white border border-gray-300'
                        }`}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        activeOpacity={0.7}
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
                
                <TouchableOpacity
                  onPress={() => setCalendarView('calendar')}
                  className="mt-4 bg-gray-200 rounded-full py-3"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-700 text-center font-semibold">Back to Calendar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>


      {/* Skills Dropdown Modal */}
      <Modal
        visible={showSkillsDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSkillsDropdown(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowSkillsDropdown(false)}
          style={{ pointerEvents: 'auto' }}
        >
          <View className="bg-[#FBFFF0] rounded-3xl max-w-sm mx-auto w-full p-6 border-4 border-[#71DFB1]" style={{ pointerEvents: 'auto' }}>
            <View className="mb-4 flex-row justify-between items-center">
              <Text className="text-xl font-semibold text-black">
                Select Skills
              </Text>
              <TouchableOpacity onPress={() => setShowSkillsDropdown(false)}>
                <Text className="text-[#71DFB1] font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-3">
              {skillsOptions.map((skill, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center py-2"
                  onPress={() => handleSkillToggle(skill)}
                >
                  <View className={`w-5 h-5 rounded border-2 mr-3 ${
                    profileData.skills?.includes(skill) ? 'bg-[#71DFB1] border-[#71DFB1]' : 'bg-white border-gray-300'
                  }`}>
                    {profileData.skills?.includes(skill) && (
                      <Text className="text-white text-xs text-center leading-4">✓</Text>
                    )}
                  </View>
                  <Text className="text-base text-black">{skill}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Country Call Dropdown Modal */}
      <Modal
        visible={showCountryCallDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryCallDropdown(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowCountryCallDropdown(false)}
          style={{ pointerEvents: 'auto' }}
        >
          <View className="bg-[#FBFFF0] rounded-3xl max-w-sm mx-auto w-full max-h-96 border-4 border-[#71DFB1]" style={{ pointerEvents: 'auto' }}>
            <View className="py-4 border-b border-gray-300">
              <Text className="text-lg font-semibold text-black text-center">
                Select Country (Call)
              </Text>
            </View>
            <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
              {countryData.map((country, index) => (
                <TouchableOpacity
                  key={index}
                  className="py-3 px-6 border-b border-gray-100 flex-row items-center"
                  onPress={() => {
                    setSelectedCountryCall(country);
                    setShowCountryCallDropdown(false);
                  }}
                >
                  <Text className="text-lg mr-3">{country.flag}</Text>
                  <Text className="flex-1 text-base text-black">{country.name}</Text>
                  <Text className="text-base text-gray-600">{country.dialCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Country Text Dropdown Modal */}
      <Modal
        visible={showCountryTextDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryTextDropdown(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowCountryTextDropdown(false)}
          style={{ pointerEvents: 'auto' }}
        >
          <View className="bg-[#FBFFF0] rounded-3xl max-w-sm mx-auto w-full max-h-96 border-4 border-[#71DFB1]" style={{ pointerEvents: 'auto' }}>
            <View className="py-4 border-b border-gray-300">
              <Text className="text-lg font-semibold text-black text-center">
                Select Country (Text)
              </Text>
            </View>
            <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
              {countryData.map((country, index) => (
                <TouchableOpacity
                  key={index}
                  className="py-3 px-6 border-b border-gray-100 flex-row items-center"
                  onPress={() => {
                    setSelectedCountryText(country);
                    setShowCountryTextDropdown(false);
                  }}
                >
                  <Text className="text-lg mr-3">{country.flag}</Text>
                  <Text className="flex-1 text-base text-black">{country.name}</Text>
                  <Text className="text-base text-gray-600">{country.dialCode}</Text>
                </TouchableOpacity>
              ))}
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
        statusBarTranslucent={true}
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

                    // Update profile data with complete address information
                    setProfileData(prev => ({
                      ...prev,
                      address: fullAddress,
                      city: city,
                      state: state,
                    }));
                    
                    // Clear any address errors
                    setErrors(prev => ({ ...prev, address: '' }));
                    
                    // Close modal
                    setShowAddressModal(false);
                  }
                }}
                query={{
                  key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
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
    </Modal>
  );
}