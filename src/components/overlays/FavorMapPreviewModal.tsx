import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { getPriorityColor, formatPriority } from '../../utils/priorityUtils';
import { Favor } from '../../services/apis/FavorApis';

interface FavorMapPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  favor: Favor;
}

export function FavorMapPreviewModal({ visible, onClose, favor }: FavorMapPreviewModalProps) {

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50 items-center justify-center px-6"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          className="bg-white rounded-3xl p-6 w-full max-w-sm relative border-4" 
          style={{borderColor: '#71DFB1'}}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          
          {/* Close Button */}
          <TouchableOpacity 
            className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-white text-lg font-bold">×</Text>
          </TouchableOpacity>

          {/* Favor Title */}
          <Text className="text-xl font-bold text-gray-800 text-center mb-6 mt-4">
            {favor.title || favor.favor_subject.name}
          </Text>

          {/* Favor Details */}
          <View className="mb-6">
            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Category:</Text> {favor.favor_subject.name}
              </Text>
            </View>

            {favor.description && (
              <View className="mb-3">
                <Text className="text-gray-700 text-base">
                  <Text className="font-semibold">Description:</Text> {favor.description}
                </Text>
              </View>
            )}

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Payment:</Text> {parseFloat((favor.tip || 0).toString()) > 0 
                  ? `$${parseFloat((favor.tip || 0).toString()).toFixed(2)}`
                  : 'Unpaid'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Priority:</Text> {' '}
                <Text style={{ color: getPriorityColor(favor.priority), fontWeight: '600' }}>
                  {formatPriority(favor.priority)}
                </Text>
              </Text>
            </View>

            {favor.time_to_complete && (
              <View className="mb-3">
                <Text className="text-gray-700 text-base">
                  <Text className="font-semibold">Time to Complete:</Text> {favor.time_to_complete}
                </Text>
              </View>
            )}

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Location:</Text> {favor.city && favor.city !== 'undefined' ? favor.city : 'undefined'}, {favor.state && favor.state !== 'undefined' ? favor.state : 'Ohio'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-700 text-base">
                <Text className="font-semibold">Status:</Text> {favor.status}
              </Text>
            </View>

            {favor.created_at && (
              <View className="mb-3">
                <Text className="text-gray-700 text-base">
                  <Text className="font-semibold">Posted:</Text> {new Date(favor.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}