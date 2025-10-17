import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFavor } from '../../services/queries/FavorQueries';

interface FavorDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  favorId: number | null;
}

export function FavorDetailsModal({ visible, onClose, favorId }: FavorDetailsModalProps) {
  const { data: favorData, isLoading, error } = useFavor(favorId || 0, {
    enabled: !!favorId && visible,
  });

  const favor = favorData?.data?.favor;

  if (!visible || !favorId) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-[#FBFFF0] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-lg border-2 border-[#44A27B]">
          {/* Close Button */}
          <TouchableOpacity 
            onPress={onClose}
            className="absolute top-4 right-4 z-10 bg-black rounded-full w-8 h-8 items-center justify-center"
          >
            <Text className="text-white text-lg font-bold">×</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#44A27B" />
                <Text className="text-gray-600 mt-2">Loading favor details...</Text>
              </View>
            ) : error ? (
              <View className="items-center py-8">
                <Text className="text-red-600 text-center">Failed to load favor details</Text>
                <TouchableOpacity 
                  className="bg-[#44A27B] px-4 py-2 rounded-lg mt-2"
                  onPress={onClose}
                >
                  <Text className="text-white font-medium">Close</Text>
                </TouchableOpacity>
              </View>
            ) : favor ? (
              <>
                {/* User Profile Section */}
                <View className="items-center mb-6">
                  <Image
                    source={{ 
                      uri: favor.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(favor.user.full_name) + '&background=44A27B&color=fff&size=120'
                    }}
                    className="w-20 h-20 rounded-2xl mb-3"
                    style={{ backgroundColor: '#f3f4f6' }}
                  />
                  <Text className="text-xl font-bold text-gray-800 text-center">
                    {favor.user.full_name}
                  </Text>
                </View>

                {/* User Details */}
                <View className="mb-6">
                  <View className="flex-row mb-2">
                    <Text className="text-gray-600 font-medium w-16">Email:</Text>
                    <Text className="text-gray-800 flex-1" numberOfLines={1}>
                      {favor.user.email}
                    </Text>
                  </View>
                  
                  <View className="flex-row mb-2">
                    <Text className="text-gray-600 font-medium w-16">Age:</Text>
                    <Text className="text-gray-800 flex-1">N/A</Text>
                  </View>
                  
                  <View className="flex-row mb-2">
                    <Text className="text-gray-600 font-medium w-16">Call:</Text>
                    <Text className="text-gray-800 flex-1">N/A</Text>
                  </View>
                  
                  <View className="flex-row mb-2">
                    <Text className="text-gray-600 font-medium w-16">Text:</Text>
                    <Text className="text-gray-800 flex-1">N/A</Text>
                  </View>
                  
                  <View className="flex-row">
                    <Text className="text-gray-600 font-medium w-16">Since:</Text>
                    <Text className="text-gray-800 flex-1">
                      {new Date(favor.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </Text>
                  </View>
                </View>

                {/* Favor Details Section */}
                <View className="border-t border-gray-200 pt-4">
                  <Text className="text-lg font-bold text-gray-800 mb-3">Favor Details</Text>
                  
                  <View>
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium">Title:</Text>
                      <Text className="text-gray-800 flex-1 ml-2">
                        {favor.title || favor.favor_subject.name}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium">Category:</Text>
                      <Text className="text-gray-800 flex-1 ml-2">
                        {favor.favor_subject.name}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium">Priority:</Text>
                      <Text className="text-red-600 flex-1 ml-2 capitalize">
                        {favor.priority}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium">Time:</Text>
                      <Text className="text-gray-800 flex-1 ml-2">
                        {favor.time_to_complete || 'Not specified'}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium">Location:</Text>
                      <Text className="text-gray-800 flex-1 ml-2">
                        {favor.city && favor.city !== 'undefined' ? favor.city : ''}{favor.city && favor.city !== 'undefined' && favor.state && favor.state !== 'undefined' ? ', ' : ''}{favor.state && favor.state !== 'undefined' ? favor.state : favor.address}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium">Payment:</Text>
                      <Text className="text-gray-800 flex-1 ml-2">
                        {favor.favor_pay ? 'Volunteer' : `$${parseFloat((favor.tip || 0).toString()).toFixed(2)}`}
                      </Text>
                    </View>
                    
                    <View className="flex-row mb-2">
                      <Text className="text-gray-600 font-medium">Status:</Text>
                      <Text className="text-gray-800 flex-1 ml-2 capitalize">
                        {favor.status}
                      </Text>
                    </View>
                    
                    <View className="flex-row">
                      <Text className="text-gray-600 font-medium">Responses:</Text>
                      <Text className="text-gray-800 flex-1 ml-2">
                        {favor.responses_count} total, {favor.pending_responses_count} pending
                      </Text>
                    </View>
                  </View>
                  
                  {favor.description && (
                    <View className="mt-3">
                      <Text className="text-gray-600 font-medium mb-1">Description:</Text>
                      <Text className="text-gray-800 leading-5">
                        {favor.description}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                {favor.can_apply && (
                  <View className="mt-6">
                    <TouchableOpacity 
                      className="bg-[#44A27B] rounded-full py-3"
                      onPress={() => {
                        console.log('Apply for favor:', favor.id);
                        // Add your apply logic here
                      }}
                    >
                      <Text className="text-white text-center font-semibold text-base">
                        {favor.favor_pay ? 'Volunteer' : `Apply for $${parseFloat((favor.tip || 0).toString()).toFixed(2)}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}