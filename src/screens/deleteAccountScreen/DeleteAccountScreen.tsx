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
import Svg, { Path, Circle } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';
import { useDeleteAccountMutation } from '../../services/mutations/AuthMutations';

interface DeleteAccountScreenProps {
  navigation?: any;
}


const RadioButton = ({ selected }: { selected: boolean }) => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Circle
      cx="10"
      cy="10"
      r="9"
      stroke="#44A27B"
      strokeWidth="2"
      fill={selected ? "#44A27B" : "none"}
    />
    {selected && (
      <Circle
        cx="10"
        cy="10"
        r="4"
        fill="white"
      />
    )}
  </Svg>
);

const deleteReasons = [
  "I no longer need the app",
  "I found a different service",
  "I had a bad experience",
  "I received too many notifications",
  "I couldn't find the help I needed",
  "I'm just taking a break",
  "Other(Please Specify)"
];

export function DeleteAccountScreen({ navigation }: DeleteAccountScreenProps) {
  const [selectedReason, setSelectedReason] = useState("Other(Please Specify)");
  const [customReason, setCustomReason] = useState("I appreciated the idea behind the app, but it doesn't fully match my needs at this time. I may return if future updates better align with what I'm looking for.");
  const [password, setPassword] = useState("");
  
  const deleteAccountMutation = useDeleteAccountMutation();

  const handleDeleteAccount = async () => {
    if (selectedReason === "Other(Please Specify)" && !customReason.trim()) {
      Alert.alert('Error', 'Please specify your reason for deleting the account');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password\nto confirm account deletion');
      return;
    }

    Alert.alert(
      'Confirm Account Deletion',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccountMutation.mutateAsync({ password });
              
              Alert.alert(
                'Account Deleted', 
                'Your account has been successfully deleted. We\'re sorry to see you go.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to auth screen or exit app
                      navigation?.navigate('AuthScreen');
                    }
                  }
                ]
              );
            } catch (error) {
              // Error handling is done in the mutation hook
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    navigation?.goBack();
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
          <Text className="text-2xl font-bold text-black">Delete Account</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 pt-6">
          
          {/* Question */}
          <Text className="text-lg font-medium text-gray-800 mb-6">
            Are you sure you want to delete your account?
          </Text>

          {/* Reasons List */}
          <View className="mb-6">
            {deleteReasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center mb-4"
                onPress={() => setSelectedReason(reason)}
              >
                <View className="mr-3">
                  <RadioButton selected={selectedReason === reason} />
                </View>
                <Text className="flex-1 text-base text-gray-700">
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Reason Input */}
          {selectedReason === "Other(Please Specify)" && (
            <View className="mb-6 relative">
              <TextInput
                className="bg-transparent border border-[#D0D5DD] rounded-xl px-4 py-4 text-base text-black"
                placeholder="Please specify your reason"
                placeholderTextColor="#9CA3AF"
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ 
                  minHeight: 120,
                  lineHeight: 20
                }}
              />
              <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 bg-[#FBFFF0]">
                Reason
              </Text>
            </View>
          )}

          {/* Password Confirmation */}
          <View className="mb-6 relative">
            <TextInput
              className="bg-transparent border border-[#D0D5DD] rounded-xl px-4 py-4 text-base text-black"
              placeholder="Enter your password\nto confirm"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text className="absolute -top-2 left-3 px-1 text-sm font-medium text-gray-700 bg-[#FBFFF0]">
              Password Confirmation
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-x-4 mt-6">
            <TouchableOpacity
              className="flex-1 bg-transparent border-2 border-[#44A27B] rounded-full py-4"
              onPress={handleCancel}
            >
              <Text className="text-[#44A27B] text-center text-lg font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-full py-4 ${
                deleteAccountMutation.isPending 
                  ? 'bg-gray-400' 
                  : 'bg-[#44A27B]'
              }`}
              onPress={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}