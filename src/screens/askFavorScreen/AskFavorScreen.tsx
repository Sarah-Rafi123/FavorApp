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
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useCreateFavor, useCreateFavorWithImage, buildFavorFormData } from '../../services/mutations/FavorMutations';
import { CreateFavorRequest } from '../../services/apis/FavorApis';
import { usePaymentMethods } from '../../services/queries/PaymentMethodQueries';
import { ImagePickerUtils } from '../../utils/ImagePickerUtils';
import BackSvg from '../../assets/icons/Back';
import { useFavorSubjects } from '../../services/queries/FavorSubjectQueries';

interface AskFavorScreenProps {
  navigation?: any;
}

export function AskFavorScreen({ navigation }: AskFavorScreenProps) {
  const [formData, setFormData] = useState({
    priority: 'delayed' as 'immediate' | 'delayed' | 'no_rush',
    favorSubjectId: null as number | null,
    otherSubjectName: '',
    timeToComplete: '20 minutes',
    favorPrice: 'Free',
    tip: 0,
    address: '',
    description: '',
    city: '',
    state: '',
    latLng: '',
  });

  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    type: string;
    name: string;
    fileSize?: number;
  } | null>(null);
  
  // Error state for form validation
  const [errors, setErrors] = useState({
    favorSubjectId: '',
    otherSubjectName: '',
    tip: '',
    address: '',
    description: ''
  });

  // Fetch favor subjects from API
  const { data: favorSubjectsResponse, isLoading: favorSubjectsLoading, error: favorSubjectsError } = useFavorSubjects();
  const favorSubjects = favorSubjectsResponse?.data?.favor_subjects || [];
  
  // Special ID for "Other" option that doesn't conflict with API data
  const OTHER_SUBJECT_ID = -1;

  // Create favor mutations
  const createFavorMutation = useCreateFavor();
  const createFavorWithImageMutation = useCreateFavorWithImage();
  const { data: paymentMethodsData } = usePaymentMethods();

  // Check if user has payment methods for paid favors
  const hasPaymentMethods = paymentMethodsData?.data?.payment_methods && paymentMethodsData.data.payment_methods.length > 0;

  const priorityOptions = [
    { label: 'Immediate', value: 'immediate' as const },
    { label: 'Delayed', value: 'delayed' as const },
    { label: 'No Rush', value: 'no_rush' as const }
  ];
  const timeOptions = ['15 minutes', '20 minutes', '30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours'];


  const updateFormData = (field: string, value: any) => {
    // Check if user is trying to select "Paid" but doesn't have payment methods
    if (field === 'favorPrice' && value === 'Paid' && !hasPaymentMethods) {
      Alert.alert(
        'Payment Method Required',
        'You need to add a payment method before creating paid favors. Would you like to add one now?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Add Payment Method',
            onPress: () => {
              // Navigate to Settings tab, then to PaymentMethodScreen
              navigation?.navigate('Settings', {
                screen: 'PaymentMethodScreen'
              });
            },
          },
        ]
      );
      return; // Don't update to "Paid" if no payment methods
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field being updated and validate
    validateField(field, value);
  };
  
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'favorSubjectId':
        if (!value) {
          newErrors.favorSubjectId = 'Please select a subject for your favor.';
        } else {
          newErrors.favorSubjectId = '';
        }
        break;
        
      case 'otherSubjectName':
        if (formData.favorSubjectId === OTHER_SUBJECT_ID && (!value || !value.trim())) {
          newErrors.otherSubjectName = 'Please provide a custom subject name.';
        } else {
          newErrors.otherSubjectName = '';
        }
        break;
        
      case 'tip':
        if (formData.favorPrice === 'Paid' && (value <= 0 || isNaN(value))) {
          newErrors.tip = 'Please provide a valid tip amount greater than 0.';
        } else {
          newErrors.tip = '';
        }
        break;
        
      case 'address':
        if (!value || !value.trim()) {
          newErrors.address = 'Please provide an address for your favor.';
        } else {
          newErrors.address = '';
        }
        break;
        
      case 'description':
        if (!value || !value.trim()) {
          newErrors.description = 'Please provide a description for your favor.';
        } else if (value.trim().length < 20) {
          newErrors.description = 'Description must be at least 20 characters long.';
        } else if (value.trim().length > 200) {
          newErrors.description = 'Description must not exceed 200 characters.';
        } else {
          newErrors.description = '';
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const pickImage = async () => {
    try {
      console.log('📷 Browse File button clicked');
      
      // Check if ImagePickerUtils is available
      if (!ImagePickerUtils) {
        console.error('❌ ImagePickerUtils not available');
        Alert.alert(
          'Feature Not Available',
          'Image picker is not available on this device.'
        );
        return;
      }
      
      // Show image options modal
      console.log('✅ Showing image options modal');
      setShowImageOptions(true);
      
    } catch (error) {
      console.error('❌ Error in pickImage function:', error);
      Alert.alert(
        'Error',
        'Something went wrong while trying to access the image picker. Please try again.'
      );
    }
  };

  const launchImageLibrary = async () => {
    try {
      setShowImageOptions(false);
      
      // Add a small delay to ensure modal is fully closed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await ImagePickerUtils.openImageLibrary();
      
      if (result) {
        // Set the selected image
        setSelectedImage({
          uri: result.uri,
          type: result.type,
          name: result.name,
          fileSize: result.fileSize,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      // Ensure modal is definitely closed
      setShowImageOptions(false);
    }
  };

  const launchCamera = async () => {
    try {
      setShowImageOptions(false);
      
      // Add a small delay to ensure modal is fully closed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await ImagePickerUtils.openCamera();
      
      if (result) {
        // Set the selected image
        setSelectedImage({
          uri: result.uri,
          type: result.type,
          name: result.name,
          fileSize: result.fileSize,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      // Ensure modal is definitely closed
      setShowImageOptions(false);
    }
  };

  const RadioButton = ({ 
    selected, 
    onPress, 
    label,
    color = 'green'
  }: { 
    selected: boolean; 
    onPress: () => void; 
    label: string;
    color?: string;
  }) => {
    const getColorClass = (colorName: string) => {
      switch (colorName) {
        case 'red':
          return selected ? 'border-red-500' : 'border-gray-400';
        case 'yellow':
          return selected ? 'border-yellow-500' : 'border-gray-400';
        case 'green':
        default:
          return selected ? 'border-green-500' : 'border-gray-400';
      }
    };

    const getBgColorClass = (colorName: string) => {
      switch (colorName) {
        case 'red':
          return 'bg-red-500';
        case 'yellow':
          return 'bg-yellow-500';
        case 'green':
        default:
          return 'bg-green-500';
      }
    };

    return (
      <TouchableOpacity 
        className="flex-row items-center mr-6 mb-3"
        onPress={onPress}
      >
        <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${getColorClass(color)}`}>
          {selected && <View className={`w-2.5 h-2.5 rounded-full ${getBgColorClass(color)}`} />}
        </View>
        <Text className="text-black text-base">{label}</Text>
      </TouchableOpacity>
    );
  };


  const handleCreateFavor = async () => {
    console.log('💳 Payment Methods Check:', {
      favorPrice: formData.favorPrice,
      hasPaymentMethods,
      paymentMethodsCount: paymentMethodsData?.data?.payment_methods?.length || 0
    });

    // Check payment methods for paid favors only
    if (formData.favorPrice === 'Paid' && !hasPaymentMethods) {
      Alert.alert(
        'Payment Method Required',
        'You need to add a payment method before creating paid favors. Please add a payment method first.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Add Payment Method',
            onPress: () => {
              // Navigate to Settings tab, then to PaymentMethodScreen
              navigation?.navigate('Settings', {
                screen: 'PaymentMethodScreen'
              });
            },
          },
        ]
      );
      return;
    }

    // Validate all fields
    const newErrors = {
      favorSubjectId: '',
      otherSubjectName: '',
      tip: '',
      address: '',
      description: ''
    };
    
    let hasErrors = false;
    
    if (!formData.favorSubjectId) {
      newErrors.favorSubjectId = 'Please select a subject for your favor.';
      hasErrors = true;
    }
    
    if (formData.favorSubjectId === OTHER_SUBJECT_ID && !formData.otherSubjectName.trim()) {
      newErrors.otherSubjectName = 'Please provide a custom subject name.';
      hasErrors = true;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description for your favor.';
      hasErrors = true;
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long.';
      hasErrors = true;
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must not exceed 200 characters.';
      hasErrors = true;
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Please provide an address for your favor.';
      hasErrors = true;
    }
    
    if (formData.favorPrice === 'Paid' && (formData.tip <= 0 || isNaN(formData.tip))) {
      newErrors.tip = 'Please provide a valid tip amount greater than 0 for paid favors.';
      hasErrors = true;
    }
    
    if (!formData.city.trim() || !formData.state.trim()) {
      Alert.alert('Error', 'Please ensure city and state are provided.');
      return;
    }
    
    setErrors(newErrors);
    
    if (hasErrors) {
      Alert.alert('Please fix the errors below', 'Please correct the highlighted fields and try again.');
      return;
    }

    try {
      const createRequest: CreateFavorRequest = {
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        address_attributes: {
          full_address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
        },
        priority: formData.priority,
        favor_subject_id: formData.favorSubjectId === OTHER_SUBJECT_ID ? 'other' : formData.favorSubjectId!,
        favor_pay: formData.favorPrice === 'Paid' ? '0' : '1', // 0 = paid, 1 = free
        time_to_complete: formData.timeToComplete,
        tip: formData.favorPrice === 'Paid' ? formData.tip : 0,
        lat_lng: formData.latLng || undefined,
        other_subject_name: formData.favorSubjectId === OTHER_SUBJECT_ID ? formData.otherSubjectName.trim() : undefined,
      };

      // Debug logging to verify request format
      console.log('🚀 Creating Favor Request:', createRequest);
      if (selectedImage) {
        console.log('📷 With Image:', {
          name: selectedImage.name,
          type: selectedImage.type,
          size: selectedImage.fileSize ? `${(selectedImage.fileSize / (1024 * 1024)).toFixed(2)}MB` : 'Unknown'
        });
      }

      // Use appropriate mutation based on whether image is selected
      if (selectedImage) {
        const formDataObj = buildFavorFormData(createRequest, selectedImage);
        console.log('📤 Sending FormData with image to https://api.favorapp.net/api/v1/favors');
        await createFavorWithImageMutation.mutateAsync(formDataObj);
      } else {
        console.log('📤 Sending JSON request to https://api.favorapp.net/api/v1/favors');
        await createFavorMutation.mutateAsync(createRequest);
      }
      
      // Only navigate back on successful creation
      console.log('✅ Favor created successfully, navigating back');
      navigation?.goBack();
    } catch (error) {
      console.error('❌ Error creating favor:', error);
      // Error handling is done in the mutation's onError callback
      // Don't navigate back on error
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation?.goBack()}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Ask Favor</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-6 pt-6">
          
          {/* Priority Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Priority</Text>
            <View className="flex-row flex-wrap">
              {priorityOptions.map((option) => {
                const getColorForPriority = (value: string) => {
                  switch (value) {
                    case 'immediate':
                      return 'red';
                    case 'delayed':
                      return 'yellow';
                    case 'no_rush':
                      return 'green';
                    default:
                      return 'green';
                  }
                };

                return (
                  <RadioButton
                    key={option.value}
                    selected={formData.priority === option.value}
                    onPress={() => updateFormData('priority', option.value)}
                    label={option.label}
                    color={getColorForPriority(option.value)}
                  />
                );
              })}
            </View>
          </View>

          {/* Subject Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Subject</Text>
            
            {favorSubjectsLoading ? (
              <View className="flex-row justify-center items-center py-4">
                <ActivityIndicator size="small" color="#44A27B" />
                <Text className="ml-2 text-gray-600">Loading subjects...</Text>
              </View>
            ) : favorSubjectsError ? (
              <View className="bg-red-50 p-4 rounded-xl">
                <Text className="text-red-600 text-center">Failed to load subjects. Please try again.</Text>
              </View>
            ) : (
              <View className="space-y-3">
                {favorSubjects.map((subject) => (
                  <TouchableOpacity 
                    key={subject.id}
                    className={`w-full p-4 rounded-xl flex-row items-center ${
                      formData.favorSubjectId === subject.id 
                        ? 'bg-[#44A27B]/10' 
                        : 'bg-transparent'
                    }`}
                    onPress={() => updateFormData('favorSubjectId', subject.id)}
                  >
                    <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                      formData.favorSubjectId === subject.id ? 'border-[#44A27B] bg-[#44A27B]' : 'border-gray-400'
                    }`}>
                      {formData.favorSubjectId === subject.id && (
                        <View className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </View>
                    <Text className={`text-base font-medium flex-1 ${
                      formData.favorSubjectId === subject.id ? 'text-[#44A27B]' : 'text-black'
                    }`}>
                      {subject.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity 
                  className={`w-full p-4 rounded-xl flex-row items-center ${
                    formData.favorSubjectId === OTHER_SUBJECT_ID 
                      ? 'bg-[#44A27B]/10' 
                      : 'bg-transparent'
                  }`}
                  onPress={() => updateFormData('favorSubjectId', OTHER_SUBJECT_ID)}
                >
                  <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                    formData.favorSubjectId === OTHER_SUBJECT_ID ? 'border-[#44A27B] bg-[#44A27B]' : 'border-gray-400'
                  }`}>
                    {formData.favorSubjectId === OTHER_SUBJECT_ID && (
                      <View className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </View>
                  <Text className={`text-base font-medium flex-1 ${
                    formData.favorSubjectId === OTHER_SUBJECT_ID ? 'text-[#44A27B]' : 'text-black'
                  }`}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {errors.favorSubjectId ? (
              <Text className="text-red-500 text-sm mt-1">{errors.favorSubjectId}</Text>
            ) : null}
            
            {/* Custom Subject Name Input - Only show when Other is selected */}
            {formData.favorSubjectId === OTHER_SUBJECT_ID && (
              <View className="mt-4">
                <Text className="text-lg font-semibold text-black mb-3">Please specify:</Text>
                <View className={`bg-white border-2 rounded-2xl px-4 py-4 ${
                  errors.otherSubjectName ? 'border-red-500' : 'border-white'
                }`}>
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
                <Text className="text-gray-300 text-sm mt-2">/50 characters</Text>
                {errors.otherSubjectName ? (
                  <Text className="text-red-500 text-sm mt-1">{errors.otherSubjectName}</Text>
                ) : null}
              </View>
            )}
          </View>

          {/* Time To Complete Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Time To Complete</Text>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Time to complete
            </Text>
            <TouchableOpacity
              className="px-4 py-3 rounded-xl border border-gray-300 bg-transparent flex-row justify-between items-center"
              style={{ height: 56 }}
              onPress={() => setShowTimeDropdown(true)}
            >
              <Text className="text-base text-gray-800">{formData.timeToComplete}</Text>
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
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Favor Amount ($) *
                  </Text>
                  <Text className="text-xs text-gray-500 mb-3">
                    Favor charges 3% + $0.30 per transaction to keep the app running.
                  </Text>
                  <TextInput
                    className={`px-4 py-3 rounded-xl border text-base bg-transparent ${
                      errors.tip ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{
                      backgroundColor: 'transparent',
                      fontSize: 16,
                      lineHeight: 22,
                      height: 56
                    }}
                    placeholder="Enter tip amount"
                    placeholderTextColor="#9CA3AF"
                    value={formData.tip.toString()}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text) || 0;
                      updateFormData('tip', numValue);
                    }}
                    keyboardType="numeric"
                  />
                  {errors.tip ? (
                    <Text className="text-red-500 text-sm mt-1">{errors.tip}</Text>
                  ) : null}
                </View>
              </View>
            )}
          </View>

          {/* Address Section */}
          <View className="mb-12">
            <Text className="text-xl font-bold text-black mb-6">Address</Text>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Address
            </Text>
            <TouchableOpacity
              className={`px-4 py-4 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-300'} bg-transparent`}
              onPress={() => setShowAddressModal(true)}
            >
              <Text className={`text-base ${formData.address ? 'text-black' : 'text-gray-400'}`}>
                {formData.address || 'Enter your address'}
              </Text>
            </TouchableOpacity>
            {errors.address ? (
              <Text className="text-red-500 text-sm mt-1">{errors.address}</Text>
            ) : null}
          </View>

          {/* Description Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Description</Text>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Description
            </Text>
            <TextInput
              className={`px-4 py-3 rounded-xl border text-base bg-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                backgroundColor: 'transparent',
                fontSize: 16,
                lineHeight: 22,
                minHeight: 120
              }}
              placeholder="Enter description about the work (min 20, max 200 characters)"
              placeholderTextColor="#9CA3AF"
              value={formData.description}
              onChangeText={(text) => {
                if (text.length <= 200) {
                  updateFormData('description', text);
                }
              }}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
            {/* <Text className={`text-sm mt-2 ${formData.description.length < 20 ? 'text-black' : formData.description.length >= 200 ? 'text-orange-500' : 'text-gray-500'}`}>
              {formData.description.length}/200 characters {formData.description.length < 20 ? '(minimum 20)' : ''}
            </Text> */}
            {errors.description ? (
              <Text className="text-red-500 text-sm mt-1">{errors.description}</Text>
            ) : null}
          </View>

          {/* File Upload Section */}
          <View className="mb-8">
            <View className="bg-transparent border border-gray-300 rounded-2xl p-8 items-center">
              {selectedImage ? (
                <View className="items-center">
                  <Image 
                    source={{ uri: selectedImage.uri }} 
                    className="w-40 h-40 rounded-2xl mb-4"
                    style={{ backgroundColor: '#f3f4f6' }}
                    resizeMode="cover"
                  />
                  <Text className="text-gray-700 font-medium mb-1 text-center">{selectedImage.name}</Text>
                  {selectedImage.fileSize && (
                    <Text className="text-gray-500 text-sm mb-3">
                      {(selectedImage.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  )}
                  <TouchableOpacity 
                    className="border-2 border-red-500 rounded-full px-8 py-3"
                    onPress={() => setSelectedImage(null)}
                  >
                    <Text className="text-red-500 font-semibold">Remove Image</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="items-center w-full">
                  <Text className="text-black text-center mb-2 text-sm">
                    Choose a file or drag & drop it here
                  </Text>
                  <Text className="text-black text-sm text-center mb-8">
                    JPEG and PNG formats up to 10 MB.
                  </Text>
                  <TouchableOpacity 
                    className="border-2 border-[#44A27B] rounded-full px-12 py-4 w-full max-w-xs"
                    onPress={pickImage}
                  >
                    <Text className="text-[#44A27B] font-semibold text-lg text-center">Browse File</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Additional Create Favor Button */}
          <View className="mb-8 px-4">
            <TouchableOpacity
              className="bg-[#44A27B] rounded-full py-5 items-center"
              onPress={handleCreateFavor}
              disabled={createFavorMutation.isPending || createFavorWithImageMutation.isPending}
              style={{
                opacity: createFavorMutation.isPending || createFavorWithImageMutation.isPending ? 0.6 : 1
              }}
            >
              <Text className="text-white font-bold text-lg">
                {createFavorMutation.isPending || createFavorWithImageMutation.isPending 
                  ? "Creating..." 
                  : "Create Favor"
                }
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          className="bg-[#44A27B] rounded-full py-5 items-center mx-4"
          onPress={handleCreateFavor}
          disabled={createFavorMutation.isPending || createFavorWithImageMutation.isPending}
          style={{
            opacity: createFavorMutation.isPending || createFavorWithImageMutation.isPending ? 0.6 : 1
          }}
        >
          <Text className="text-white font-bold text-lg">
            {createFavorMutation.isPending || createFavorWithImageMutation.isPending 
              ? "Creating..." 
              : "Create Favor"
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Dropdown Modal */}
      <Modal
        visible={showTimeDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeDropdown(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowTimeDropdown(false)}
          style={{ pointerEvents: 'auto' }}
        >
          <View className="bg-white rounded-xl max-w-sm mx-auto w-full" style={{ pointerEvents: 'auto' }}>
            <View className="py-4 border-b border-gray-300">
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

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
          style={{ pointerEvents: 'auto' }}
        >
          <View className="bg-white rounded-2xl max-w-sm mx-auto w-full" style={{ pointerEvents: 'auto' }}>
            <View className="py-6 border-b border-gray-300">
              <Text className="text-xl font-bold text-gray-800 text-center">
                Select Image
              </Text>
            </View>
            
            <TouchableOpacity
              className="py-4 px-6 border-b border-gray-100 flex-row items-center"
              onPress={launchCamera}
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M12 17a4 4 0 100-8 4 4 0 000 8z"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View>
                <Text className="text-lg font-medium text-gray-800">Take Photo</Text>
                <Text className="text-sm text-gray-500">Use camera to take a new photo</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="py-4 px-6 flex-row items-center"
              onPress={launchImageLibrary}
            >
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    stroke="#44A27B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View>
                <Text className="text-lg font-medium text-gray-800">Choose from Gallery</Text>
                <Text className="text-sm text-gray-500">Select from your photo library</Text>
              </View>
            </TouchableOpacity>
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

                    // Update form data with complete address information
                    setFormData(prev => ({
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
    </ImageBackground>
  );
}