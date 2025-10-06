import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { CustomButton } from '../buttons/CustomButton';

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
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: initialData?.firstName || 'Kathryn',
    lastName: initialData?.lastName || 'Murphy',
    dateOfBirth: initialData?.dateOfBirth || '8/2/2001',
    address: initialData?.address || '4140 Parker Rd, Allentown, New Mexico 31134',
    phoneCall: initialData?.phoneCall || '(629) 555-0129',
    phoneText: initialData?.phoneText || '(406) 555-0120',
  });

  const handleUpdate = () => {
    onUpdate(profileData);
    onClose();
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-3xl w-full max-w-sm mx-4 border-4 border-green-400">
          <ScrollView className="max-h-[80vh]">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-black">Update Profile</Text>
                <TouchableOpacity 
                  onPress={onClose}
                  className="w-8 h-8 bg-black rounded-full items-center justify-center"
                >
                  <Text className="text-white text-lg">×</Text>
                </TouchableOpacity>
              </View>

              <View className="items-center mb-6">
                <View className="w-20 h-20 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <TouchableOpacity className="bg-white border border-green-500 rounded-full px-4 py-2">
                  <Text className="text-green-600 font-medium">Change Photo</Text>
                </TouchableOpacity>
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-gray-600 text-sm mb-2">Full Name</Text>
                  <TextInput
                    value={profileData.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-black"
                    placeholder="Enter first name"
                  />
                </View>

                <View>
                  <Text className="text-gray-600 text-sm mb-2">Last Name</Text>
                  <TextInput
                    value={profileData.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-black"
                    placeholder="Enter last name"
                  />
                </View>

                <View>
                  <Text className="text-gray-600 text-sm mb-2">Date of Birth</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between">
                    <TextInput
                      value={profileData.dateOfBirth}
                      onChangeText={(text) => updateField('dateOfBirth', text)}
                      className="flex-1 text-black"
                      placeholder="MM/DD/YYYY"
                    />
                    <Text className="text-gray-400 ml-2">📅</Text>
                  </View>
                </View>

                <View>
                  <Text className="text-gray-600 text-sm mb-2">Full Address</Text>
                  <TextInput
                    value={profileData.address}
                    onChangeText={(text) => updateField('address', text)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-black"
                    placeholder="Enter full address"
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View>
                  <Text className="text-gray-600 text-sm mb-2">Phone Number (Call)</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between">
                    <TextInput
                      value={profileData.phoneCall}
                      onChangeText={(text) => updateField('phoneCall', text)}
                      className="flex-1 text-black"
                      placeholder="(000) 000-0000"
                      keyboardType="phone-pad"
                    />
                    <Text className="text-gray-400 ml-2">📞</Text>
                  </View>
                </View>

                <View>
                  <Text className="text-gray-600 text-sm mb-2">Phone Number (Text)</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between">
                    <TextInput
                      value={profileData.phoneText}
                      onChangeText={(text) => updateField('phoneText', text)}
                      className="flex-1 text-black"
                      placeholder="(000) 000-0000"
                      keyboardType="phone-pad"
                    />
                    <Text className="text-gray-400 ml-2">💬</Text>
                  </View>
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
    </Modal>
  );
}