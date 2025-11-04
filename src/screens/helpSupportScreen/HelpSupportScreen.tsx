import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  ImageBackground,
} from 'react-native';
import BackSvg from '../../assets/icons/Back';
import { useSubmitSupportRequest } from '../../services/mutations/SupportMutations';

interface HelpSupportScreenProps {
  navigation?: any;
}


export function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    description: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    subject: '',
    description: '',
  });
  
  // Support API mutation
  const submitSupportRequestMutation = useSubmitSupportRequest();

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const newErrors = { ...errors };
    
    if (field === 'fullName') {
      const trimmedValue = value.trim();
      if (trimmedValue.length > 0 && trimmedValue.length < 3) {
        newErrors.fullName = 'Full name must be at least 3 characters long';
      } else if (trimmedValue.length > 50) {
        newErrors.fullName = 'Full name must be 50 characters or less';
      } else {
        newErrors.fullName = '';
      }
    }
    
    if (field === 'subject') {
      const trimmedValue = value.trim();
      if (trimmedValue.length > 0 && trimmedValue.length < 3) {
        newErrors.subject = 'Subject must be at least 3 characters long';
      } else if (trimmedValue.length > 50) {
        newErrors.subject = 'Subject must be 50 characters or less';
      } else {
        newErrors.subject = '';
      }
    }
    
    if (field === 'description') {
      const trimmedValue = value.trim();
      if (trimmedValue.length > 200) {
        newErrors.description = 'Description must be 200 characters or less';
      } else {
        newErrors.description = '';
      }
    }
    
    if (field === 'email') {
      const trimmedValue = value.trim();
      if (trimmedValue.length > 0 && !validateEmail(trimmedValue)) {
        newErrors.email = 'Please enter a valid email address';
      } else if (trimmedValue.length > 50) {
        newErrors.email = 'Email must be 50 characters or less';
      } else {
        newErrors.email = '';
      }
    }
    
    setErrors(newErrors);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+$/i;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = async () => {
    // Reset errors
    const newErrors = {
      fullName: '',
      email: '',
      subject: '',
      description: '',
    };

    // Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters long';
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Full name must be 50 characters or less';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.trim().length > 50) {
      newErrors.email = 'Email must be 50 characters or less';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters long';
    } else if (formData.subject.trim().length > 50) {
      newErrors.subject = 'Subject must be 50 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    setErrors(newErrors);

    // If there are errors, don't proceed
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    try {
      console.log('📝 Submitting support request...');
      
      await submitSupportRequestMutation.mutateAsync({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      });
      
      // Success is handled by the mutation's onSuccess callback
      console.log('✅ Support request submitted successfully');
      
      // Clear form and navigate back on success
      setFormData({
        fullName: '',
        email: '',
        subject: '',
        description: '',
      });
      navigation?.goBack();
      
    } catch (error: any) {
      // Error is handled by the mutation's onError callback
      console.error('❌ Support request submission failed:', error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation?.goBack()}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Help and Support</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 pt-6">
          
          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Full Name
            </Text>
            <TextInput
              className={`px-4 py-3 rounded-xl border text-base bg-transparent ${
                errors.fullName ? 'border-red-500' : 'border-gray-200'
              }`}
              style={{ 
                backgroundColor: 'transparent',
                fontSize: 16,
                lineHeight: 22,
                height: 56
              }}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={formData.fullName}
              onChangeText={(text) => updateFormData('fullName', text)}
              autoCapitalize="words"
              maxLength={50}
            />
            <View className="flex-row justify-between mt-1">
              <View className="flex-1">
                {errors.fullName ? (
                  <Text className="text-red-500 text-sm">{errors.fullName}</Text>
                ) : null}
              </View>
              <Text className={`text-xs ${formData.fullName.length < 3 || formData.fullName.length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.fullName.length}/50 (min 3)
              </Text>
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email
            </Text>
            <TextInput
              className={`px-4 py-3 rounded-xl border text-base bg-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              style={{ 
                backgroundColor: 'transparent',
                fontSize: 16,
                lineHeight: 22,
                height: 56
              }}
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={50}
            />
            {errors.email ? (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            ) : null}
          </View>

          {/* Subject */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Subject
            </Text>
            <TextInput 
              className={`px-4 py-3 rounded-xl border text-base bg-transparent ${
                errors.subject ? 'border-red-500' : 'border-gray-200'
              }`}
              style={{ 
                backgroundColor: 'transparent',
                fontSize: 16,
                lineHeight: 22,
                height: 56
              }}
              placeholder="Brief subject of your inquiry"
              placeholderTextColor="#9CA3AF"
              value={formData.subject}
              onChangeText={(text) => updateFormData('subject', text)}
              maxLength={50}
            />
            <View className="flex-row justify-between mt-1">
              <View className="flex-1">
                {errors.subject ? (
                  <Text className="text-red-500 text-sm">{errors.subject}</Text>
                ) : null}
              </View>
              <Text className={`text-xs ${formData.subject.length < 3 || formData.subject.length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.subject.length}/50 (min 3)
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Description
            </Text>
            <TextInput
              className={`px-4 py-3 rounded-xl border text-base bg-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-200'
              }`}
              style={{ 
                backgroundColor: 'transparent',
                fontSize: 16,
                lineHeight: 22,
                minHeight: 120
              }}
              placeholder="Detailed description of your issue or question (min 20, max 200 characters)"
              placeholderTextColor="#9CA3AF"
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
            <View className="flex-row justify-between mt-1">
              <View className="flex-1">
                {errors.description ? (
                  <Text className="text-red-500 text-sm">{errors.description}</Text>
                ) : null}
              </View>
              <Text className={`text-xs ${formData.description.length > 200 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.description.length}/200 characters
              </Text>
            </View>
          </View>

          {/* Validation Errors */}
          {/* {Object.values(errors).some(error => error !== '') && (
            <View className="mb-4">
              {errors.fullName && (
                <Text className="text-red-500 text-sm mb-1">• {errors.fullName}</Text>
              )}
              {errors.email && (
                <Text className="text-red-500 text-sm mb-1">• {errors.email}</Text>
              )}
              {errors.subject && (
                <Text className="text-red-500 text-sm mb-1">• {errors.subject}</Text>
              )}
              {errors.description && (
                <Text className="text-red-500 text-sm mb-1">• {errors.description}</Text>
              )}
            </View>
          )} */}
          <TouchableOpacity 
            className={`rounded-full py-4 ${
              submitSupportRequestMutation.isPending 
                ? 'bg-gray-400' 
                : 'bg-green-500'
            }`}
            onPress={handleSubmit}
            disabled={submitSupportRequestMutation.isPending}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {submitSupportRequestMutation.isPending ? 'Submitting...' : 'Submit Support Request'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}