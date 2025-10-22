import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ImageBackground,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';
import { useSubmitSupportRequest } from '../../services/mutations/SupportMutations';

interface HelpSupportScreenProps {
  navigation?: any;
}


export function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  // Support API mutation
  const submitSupportRequestMutation = useSubmitSupportRequest();

  const handleSubmit = async () => {
    // Validation according to API requirements
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }
    
    if (fullName.trim().length > 50) {
      Alert.alert('Error', 'Full name must be 50 characters or less');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    
    if (email.trim().length > 50) {
      Alert.alert('Error', 'Email must be 50 characters or less');
      return;
    }

    // Email validation using API pattern
    const emailRegex = /^[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+$/i;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!subject.trim()) {
      Alert.alert('Error', 'Subject is required');
      return;
    }
    
    if (subject.trim().length > 50) {
      Alert.alert('Error', 'Subject must be 50 characters or less');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Description is required');
      return;
    }
    
    if (description.trim().length > 200) {
      Alert.alert('Error', 'Description must be 200 characters or less');
      return;
    }

    try {
      console.log('📝 Submitting support request...');
      
      await submitSupportRequestMutation.mutateAsync({
        full_name: fullName.trim(),
        email: email.trim(),
        subject: subject.trim(),
        description: description.trim(),
      });
      
      // Success is handled by the mutation's onSuccess callback
      console.log('✅ Support request submitted successfully');
      
      // Clear form and navigate back on success
      setFullName('');
      setEmail('');
      setSubject('');
      setDescription('');
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
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-6">
          
          {/* Full Name */}
          <View className="mb-6 relative">
            <TextInput
              className="px-4 py-3 rounded-xl border border-gray-200 text-base bg-transparent"
              style={{ 
                backgroundColor: 'transparent',
                fontSize: 16,
                lineHeight: 22,
                height: 56
              }}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              maxLength={50}
            />
            <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700">
              Full Name ({fullName.length}/50)
            </Text>
          </View>

          {/* Email */}
          <View className="mb-6 relative">
            <TextInput
              className="px-4 py-3 rounded-xl border border-gray-200 text-base bg-transparent"
              style={{ 
                backgroundColor: 'transparent',
                fontSize: 16,
                lineHeight: 22,
                height: 56
              }}
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={50}
            />
            <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700">
              Email ({email.length}/50)
            </Text>
          </View>

          {/* Subject */}
          <View className="mb-6 relative">
            <TextInput
              className="px-4 py-3 rounded-xl border border-gray-200 text-base bg-transparent"
              style={{ 
                backgroundColor: 'transparent',
                fontSize: 16,
                lineHeight: 22,
                height: 56
              }}
              placeholder="Brief subject of your inquiry"
              placeholderTextColor="#9CA3AF"
              value={subject}
              onChangeText={setSubject}
              maxLength={50}
            />
            <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700">
              Subject ({subject.length}/50)
            </Text>
          </View>

          {/* Description */}
          <View className="mb-8 relative">
            <TextInput
              className="px-4 py-3 rounded-xl border border-gray-200 text-base bg-transparent"
              style={{ 
                backgroundColor: 'transparent',
                fontSize: 16,
                lineHeight: 22,
                minHeight: 120
              }}
              placeholder="Detailed description of your issue or question (max 200 characters)"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
            <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700">
              Description ({description.length}/200)
            </Text>
          </View>

          {/* Submit Button */}
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