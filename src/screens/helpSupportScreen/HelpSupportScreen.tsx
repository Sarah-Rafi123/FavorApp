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

interface HelpSupportScreenProps {
  navigation?: any;
}


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
              placeholder="Kathryn"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
            <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 ">
              Full Name
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
              placeholder="Kathryn@gmail.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700">
              Email
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
              placeholder="Help"
              placeholderTextColor="#9CA3AF"
              value={subject}
              onChangeText={setSubject}
            />
            <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 ">
              Subject
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
              placeholder="Lacus pharetra aenean pellentesque massa. Est posuere tortor porttitor libero sed sem consequat sollicitudin pellentesque. Sed nisl et placerat ipsum sit quam. Libero sollicitudin consequat sit imperdiet consectetur integer etiam. Nec phasellus."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
            <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 ">
              Description
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            className={`rounded-full py-4 ${
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
        </View>
      </ScrollView>
    </ImageBackground>
  );
}