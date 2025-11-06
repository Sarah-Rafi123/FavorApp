import React, { useState, useEffect } from 'react';
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
import { usePaymentMethods } from '../../services/queries/PaymentMethodQueries';
import { useUpdateFavor, useUpdateFavorWithImage } from '../../services/mutations/FavorMutations';
import ImagePicker from 'react-native-image-crop-picker';
import BackSvg from '../../assets/icons/Back';
import { Favor, UpdateFavorRequest } from '../../services/apis/FavorApis';
import { useFavor } from '../../services/queries/FavorQueries';
import Toast from 'react-native-toast-message';

interface EditFavorScreenProps {
  navigation?: any;
  route?: any;
}

export function EditFavorScreen({ navigation, route }: EditFavorScreenProps) {
  const favorId = route?.params?.favorId;
  
  // Fetch favor details for pre-filling
  const { data: favorDetailsResponse, isLoading: favorLoading, error: favorError } = useFavor(
    favorId,
    { enabled: !!favorId }
  );

  const favor = favorDetailsResponse?.data?.favor;

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

  // Update favor mutations
  const updateFavorMutation = useUpdateFavor();
  const updateFavorWithImageMutation = useUpdateFavorWithImage();

  const { data: paymentMethodsData } = usePaymentMethods();
  const hasPaymentMethods = paymentMethodsData?.data?.payment_methods && paymentMethodsData.data.payment_methods.length > 0;

  const priorityOptions = [
    { label: 'Immediate', value: 'immediate' as const },
    { label: 'Delayed', value: 'delayed' as const },
    { label: 'No Rush', value: 'no_rush' as const }
  ];
  const timeOptions = ['15 minutes', '20 minutes', '30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours'];

  // Pre-fill form when favor data is loaded
  useEffect(() => {
    if (favor) {
      console.log('🔍 EditFavor - Loading favor data:', {
        favorSubject: favor.favor_subject,
        subjectName: favor.favor_subject?.name,
        subjectId: favor.favor_subject?.id,
        title: favor.title,
        description: favor.description
      });

      // Check if this is an "Others" subject - if the subject name is not in our predefined list
      const predefinedSubjectNames = ['Lifting', 'Gardening', 'Technical', 'Moving', 'Assisting', 'Opening', 'Maintenance'];
      const isOtherSubject = favor.favor_subject?.name && !predefinedSubjectNames.includes(favor.favor_subject.name);
      
      // For "Other" subjects, the custom name might be in the favor_subject.name or title
      const customSubjectName = isOtherSubject ? favor.favor_subject?.name : '';

      setFormData({
        priority: favor.priority || 'delayed',
        favorSubjectId: isOtherSubject ? 8 : (favor.favor_subject?.id || null),
        otherSubjectName: customSubjectName || '',
        timeToComplete: favor.time_to_complete || '20 minutes',
        favorPrice: !favor.favor_pay ? 'Paid' : 'Free',
        tip: favor.tip ? parseFloat(favor.tip.toString()) : 0,
        additionalTip: favor.additional_tip ? parseFloat(favor.additional_tip.toString()) : 0,
        address: favor.address || '',
        description: favor.description || '',
        city: favor.city || '',
        state: favor.state || '',
        latLng: favor.lat_lng || '',
      });

      console.log('✅ EditFavor - Form data set:', {
        favorSubjectId: isOtherSubject ? 8 : (favor.favor_subject?.id || null),
        otherSubjectName: customSubjectName || '',
        isOtherSubject,
        customSubjectName
      });

      // Set existing image if available
      if (favor.image_url) {
        setSelectedImage({
          uri: favor.image_url,
          type: 'image/jpeg',
          name: 'existing_image.jpg'
        });
      }
    }
  }, [favor]);

  const updateFormData = (field: string, value: any) => {
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
            onPress: () => navigation?.navigate('PaymentMethodScreen'),
          },
        ]
      );
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user updates field
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUpdateFavor = async () => {
    // Validation
    const newErrors = {
      favorSubjectId: '',
      otherSubjectName: '',
      tip: '',
      address: '',
      description: ''
    };

    if (!formData.favorSubjectId) {
      newErrors.favorSubjectId = 'Please select a favor type';
    }

    if (formData.favorSubjectId === 8 && !formData.otherSubjectName.trim()) {
      newErrors.otherSubjectName = 'Please specify the subject name';
    } else if (formData.favorSubjectId === 8 && formData.otherSubjectName.trim().length > 50) {
      newErrors.otherSubjectName = 'Subject name must be 50 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.favorPrice === 'Paid' && formData.tip < 1) {
      newErrors.tip = 'Tip must be at least $1 for paid favors';
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    try {
      // Prepare update data according to UpdateFavorRequest interface
      const updateData: UpdateFavorRequest = {
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
        favor_subject_id: formData.favorSubjectId || undefined,
        favor_pay: formData.favorPrice === 'Paid' ? '0' : '1', // 0 = paid, 1 = free
        time_to_complete: formData.timeToComplete,
        tip: formData.favorPrice === 'Paid' ? formData.tip : undefined,
        additional_tip: formData.favorPrice === 'Paid' ? formData.additionalTip : undefined,
      };

      // Add other subject name if "Other" is selected
      if (formData.favorSubjectId === 8 && formData.otherSubjectName.trim()) {
        (updateData as any).other_subject_name = formData.otherSubjectName.trim();
      }

      // Handle image removal - if there was an image before but now selectedImage is null
      const hadImageBefore = favor?.image_url;
      const hasImageNow = selectedImage;
      if (hadImageBefore && !hasImageNow) {
        (updateData as any).remove_image = '1';
      }

      console.log('🔄 Updating favor with data:', updateData);
      
      // Use the appropriate mutation based on whether image was changed
      if (selectedImage && !selectedImage.uri.startsWith('http')) {
        // New image selected - use multipart form data
        const formDataToSend = new FormData();
        
        // Add favor data
        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined) {
            formDataToSend.append(`favor[${key}]`, value.toString());
          }
        });

        // Add image
        formDataToSend.append('favor[image]', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.name,
        } as any);

        await updateFavorWithImageMutation.mutateAsync({
          id: favorId,
          formData: formDataToSend
        });
      } else {
        // No new image - use regular JSON update
        await updateFavorMutation.mutateAsync({
          id: favorId,
          data: updateData
        });
      }

      navigation?.goBack();
      
    } catch (error: any) {
      console.error('❌ Update favor error:', error);
      // Error handling is done by the mutation's onError callback
    }
  };

  const handleImageSelection = () => {
    setShowImageOptions(true);
  };

  const selectImageFromGallery = () => {
    ImagePicker.openPicker({
      width: 800,
      height: 600,
      cropping: true,
      mediaType: 'photo',
      compressImageQuality: 0.8,
      // Android cropper customization for proper status bar handling
      cropperStatusBarColor: '#71DFB1',
      cropperToolbarColor: '#71DFB1',
      cropperToolbarWidgetColor: '#FFFFFF',
      cropperToolbarTitle: 'Edit Photo',
    }).then(image => {
      setSelectedImage({
        uri: image.path,
        type: image.mime,
        name: `favor_image_${Date.now()}.jpg`,
        fileSize: image.size,
      });
      setShowImageOptions(false);
    }).catch(error => {
      console.log('Image picker error:', error);
      setShowImageOptions(false);
    });
  };

  const takePhoto = () => {
    ImagePicker.openCamera({
      width: 800,
      height: 600,
      cropping: true,
      mediaType: 'photo',
      compressImageQuality: 0.8,
      // Android cropper customization for proper status bar handling
      cropperStatusBarColor: '#71DFB1',
      cropperToolbarColor: '#71DFB1',
      cropperToolbarWidgetColor: '#FFFFFF',
      cropperToolbarTitle: 'Edit Photo',
    }).then(image => {
      setSelectedImage({
        uri: image.path,
        type: image.mime,
        name: `favor_image_${Date.now()}.jpg`,
        fileSize: image.size,
      });
      setShowImageOptions(false);
    }).catch(error => {
      console.log('Camera error:', error);
      setShowImageOptions(false);
    });
  };

  if (favorLoading) {
    return (
      <ImageBackground
        source={require('../../assets/images/Wallpaper.png')}
        className="flex-1"
        resizeMode="cover"
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#44A27B" />
          <Text className="text-gray-600 mt-4">Loading favor details...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (favorError || !favor) {
    return (
      <ImageBackground
        source={require('../../assets/images/Wallpaper.png')}
        className="flex-1"
        resizeMode="cover"
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
            Error Loading Favor
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            Could not load favor details for editing.
          </Text>
          <TouchableOpacity 
            className="bg-[#44A27B] rounded-full py-3 px-8"
            onPress={() => navigation?.goBack()}
          >
            <Text className="text-white font-semibold text-lg">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation?.goBack()}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Edit Favor</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6">
          
          {/* Priority Selection */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Priority</Text>
            <View className="flex-row flex-wrap">
              {priorityOptions.map((option) => (
                <View key={option.value} className="w-1/3 mb-4">
                  <TouchableOpacity 
                    className="flex-row items-center"
                    onPress={() => updateFormData('priority', option.value)}
                  >
                    <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                      formData.priority === option.value ? 'border-[#44A27B]' : 'border-gray-400'
                    }`}>
                      {formData.priority === option.value && (
                        <View className="w-3 h-3 rounded-full bg-[#44A27B]" />
                      )}
                    </View>
                    <Text className="text-black text-base flex-1">{option.label}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Subject Selection */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Subject</Text>
            <View className="flex-row flex-wrap">
              {favorSubjects.map((subject) => (
                <View key={subject.id} className="w-1/3 mb-4">
                  <TouchableOpacity 
                    className="flex-row items-center"
                    onPress={() => updateFormData('favorSubjectId', subject.id)}
                  >
                    <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                      formData.favorSubjectId === subject.id ? 'border-[#44A27B]' : 'border-gray-400'
                    }`}>
                      {formData.favorSubjectId === subject.id && (
                        <View className="w-3 h-3 rounded-full bg-[#44A27B]" />
                      )}
                    </View>
                    <Text className="text-black text-base flex-1">{subject.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View className="w-1/3 mb-4">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => updateFormData('favorSubjectId', 8)}
                >
                  <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                    formData.favorSubjectId === 8 ? 'border-[#44A27B]' : 'border-gray-400'
                  }`}>
                    {formData.favorSubjectId === 8 && (
                      <View className="w-3 h-3 rounded-full bg-[#44A27B]" />
                    )}
                  </View>
                  <Text className="text-black text-base flex-1">Other</Text>
                </TouchableOpacity>
              </View>
            </View>
            {errors.favorSubjectId ? (
              <Text className="text-red-500 text-sm mt-1">{errors.favorSubjectId}</Text>
            ) : null}
            
            {/* Custom Subject Name Input - Only show when Other is selected */}
            {formData.favorSubjectId === 8 && (
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
                    maxLength={50}
                  />
                </View>
                <Text className="text-gray-500 text-sm mt-2">{formData.otherSubjectName.length}/50 characters</Text>
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
              className="px-4 py-3 rounded-xl border border-gray-300 bg-white flex-row justify-between items-center"
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
              <View className="w-1/2 pr-2">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => updateFormData('favorPrice', 'Free')}
                >
                  <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                    formData.favorPrice === 'Free' ? 'border-[#44A27B]' : 'border-gray-400'
                  }`}>
                    {formData.favorPrice === 'Free' && (
                      <View className="w-3 h-3 rounded-full bg-[#44A27B]" />
                    )}
                  </View>
                  <Text className="text-black text-base">Free</Text>
                </TouchableOpacity>
              </View>
              <View className="w-1/2 pl-2">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => updateFormData('favorPrice', 'Paid')}
                >
                  <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                    formData.favorPrice === 'Paid' ? 'border-[#44A27B]' : 'border-gray-400'
                  }`}>
                    {formData.favorPrice === 'Paid' && (
                      <View className="w-3 h-3 rounded-full bg-[#44A27B]" />
                    )}
                  </View>
                  <Text className="text-black text-base">Paid</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Tip Inputs - Only show when Paid is selected */}
            {formData.favorPrice === 'Paid' && (
              <View>
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Favor Amount ($) *
                  </Text>
                  <TextInput
                    className={`px-4 py-3 rounded-xl border text-base bg-white ${
                      errors.tip ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{
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
                
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Additional Tip ($) - Optional
                  </Text>
                  <TextInput
                    className="px-4 py-3 rounded-xl border border-gray-300 text-base bg-white"
                    style={{
                      fontSize: 16,
                      lineHeight: 22,
                      height: 56
                    }}
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
          <View className="mb-12">
            <Text className="text-xl font-bold text-black mb-6">Address</Text>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Address
            </Text>
            <TouchableOpacity
              className={`px-4 py-4 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-300'} bg-white`}
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
              className={`px-4 py-3 rounded-xl border text-base bg-white ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                fontSize: 16,
                lineHeight: 22,
                minHeight: 120
              }}
              placeholder="Enter description about the work (min 20, max 1000 characters)"
              placeholderTextColor="#9CA3AF"
              value={formData.description}
              onChangeText={(text) => {
                if (text.length <= 1000) {
                  updateFormData('description', text);
                }
              }}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <View className="flex-row justify-between mt-2">
              <View className="flex-1">
                {errors.description ? (
                  <Text className="text-red-500 text-sm">{errors.description}</Text>
                ) : null}
              </View>
              <Text className={`text-xs ${formData.description.length < 20 || formData.description.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.description.length}/1000 characters {formData.description.length < 20 ? '(minimum 20)' : ''}
              </Text>
            </View>
          </View>

          {/* File Upload Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black mb-6">Add Image (Optional)</Text>
            <View className="bg-white border border-gray-300 rounded-2xl p-8 items-center">
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
                <View className="items-center">
                  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M16 6l-4 4-4-4-4 4v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10l-4-4z"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M8 14l4-4 4 4"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text className="text-gray-600 font-medium mt-4 mb-2">Add Image</Text>
                  <Text className="text-gray-500 text-sm text-center mb-6">
                    Upload an image to help explain your favor request
                  </Text>
                  <TouchableOpacity 
                    className="border-2 border-[#44A27B] rounded-full px-8 py-3"
                    onPress={handleImageSelection}
                  >
                    <Text className="text-[#44A27B] font-semibold">Choose Image</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity 
            className={`rounded-full py-4 mb-6 ${
              (updateFavorMutation.isPending || updateFavorWithImageMutation.isPending) ? 'bg-gray-400' : 'bg-[#44A27B]'
            }`}
            onPress={handleUpdateFavor}
            disabled={updateFavorMutation.isPending || updateFavorWithImageMutation.isPending}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {(updateFavorMutation.isPending || updateFavorWithImageMutation.isPending) ? 'Updating...' : 'Update Favor'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">
              Select Image
            </Text>
            
            <TouchableOpacity 
              className="bg-[#44A27B] rounded-full py-4 mb-4"
              onPress={takePhoto}
            >
              <Text className="text-white text-center text-lg font-semibold">
                Take Photo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-gray-500 rounded-full py-4 mb-4"
              onPress={selectImageFromGallery}
            >
              <Text className="text-white text-center text-lg font-semibold">
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="border border-gray-300 rounded-full py-4"
              onPress={() => setShowImageOptions(false)}
            >
              <Text className="text-gray-700 text-center text-lg font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Dropdown Modal */}
      <Modal
        visible={showTimeDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeDropdown(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">
              Select Time to Complete
            </Text>
            
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                className="py-4 border-b border-gray-100"
                onPress={() => {
                  updateFormData('timeToComplete', time);
                  setShowTimeDropdown(false);
                }}
              >
                <Text className={`text-center text-lg ${
                  formData.timeToComplete === time ? 'text-[#44A27B] font-semibold' : 'text-gray-700'
                }`}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              className="border border-gray-300 rounded-full py-4 mt-4"
              onPress={() => setShowTimeDropdown(false)}
            >
              <Text className="text-gray-700 text-center text-lg font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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