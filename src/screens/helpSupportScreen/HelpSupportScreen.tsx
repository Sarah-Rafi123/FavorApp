import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HelpSupportScreenProps {
  navigation?: any;
}

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const [fullName, setFullName] = useState('Kathryn');
  const [email, setEmail] = useState('Kathryn@gmail.com');
  const [subject, setSubject] = useState('Help');
  const [description, setDescription] = useState('Lacus pharetra aenean pellentesque massa. Est posuere tortor porttitor libero sed sem consequat sollicitudin pellentesque. Sed nisl et placerat ipsum sit quam. Libero sollicitudin consequat sit imperdiet consectetur integer etiam. Nec phasellus.');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !subject.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success', 
        'Your support request has been submitted successfully. We will get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFullName('');
              setEmail('');
              setSubject('');
              setDescription('');
              navigation?.goBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-green-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-green-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4 p-2"
            onPress={() => navigation?.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Help and Support</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-6">
          
          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Subject */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Subject</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="Enter subject"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="Describe your issue or question in detail"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            className={`rounded-2xl py-4 ${
              isLoading 
                ? 'bg-gray-400' 
                : 'bg-green-500'
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isLoading ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>

          {/* Contact Information */}
          <View className="mt-8 bg-white rounded-2xl p-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Other Ways to Reach Us</Text>
            
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700">Email</Text>
              <Text className="text-base text-gray-600">support@favorapp.com</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700">Phone</Text>
              <Text className="text-base text-gray-600">+1 (555) 123-4567</Text>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-700">Business Hours</Text>
              <Text className="text-base text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}