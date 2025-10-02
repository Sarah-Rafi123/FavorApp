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
import Svg, { Path, Circle } from 'react-native-svg';

interface DeleteAccountScreenProps {
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
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (selectedReason === "Other(Please Specify)" && !customReason.trim()) {
      Alert.alert('Error', 'Please specify your reason for deleting the account');
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
            setIsLoading(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 2000));
              
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
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsLoading(false);
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
          <Text className="text-2xl font-bold text-gray-800">Delete Account</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
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
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Reason</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Please specify your reason"
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-4 mt-6">
            <TouchableOpacity
              className="flex-1 bg-transparent border-2 border-green-500 rounded-2xl py-3"
              onPress={handleCancel}
            >
              <Text className="text-green-500 text-center text-lg font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-2xl py-3 ${
                isLoading 
                  ? 'bg-gray-400' 
                  : 'bg-green-500'
              }`}
              onPress={handleDeleteAccount}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Warning Notice */}
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-6">
            <Text className="text-sm text-red-700 text-center">
              ⚠️ Warning: This action is irreversible. All your data, including your profile, favor history, and connections will be permanently deleted.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}