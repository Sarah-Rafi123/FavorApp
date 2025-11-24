import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Favor } from '../../services/apis/FavorApis';

interface FavorMapPopupProps {
  visible: boolean;
  onClose: () => void;
  favor: Favor | null;
}

export function FavorMapPopup({ visible, onClose, favor }: FavorMapPopupProps) {
  if (!favor) return null;

  const formatPriority = (priority: string) => {
    switch (priority) {
      case 'no_rush':
        return 'No Rush';
      case 'immediate':
        return 'Immediate';
      case 'delayed':
        return 'Delayed';
      default:
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In-Progress';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  const formatPayment = (favor: Favor) => {
    const tipAmount = typeof favor.tip === 'string' ? parseFloat(favor.tip) : (favor.tip || 0);
    if (tipAmount === 0) {
      return 'Unpaid';
    }
    return `$${tipAmount.toFixed(2)}`;
  };

  const formatLocation = (favor: Favor) => {
    if (favor.city && favor.state) {
      return `${favor.city}, ${favor.state}`;
    }
    if (favor.city) {
      return favor.city;
    }
    if (favor.state) {
      return favor.state;
    }
    return favor.address || 'Location not specified';
  };

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white rounded-2xl border-4 border-[#44A27B] p-6 w-full max-w-sm relative">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full items-center justify-center z-10"
          >
            <Text className="text-white font-bold text-lg leading-none">×</Text>
          </TouchableOpacity>

          {/* Title */}
          <View className="mb-6 pr-8">
            <Text className="text-2xl font-bold text-black text-center">
              {favor.title || favor.favor_subject?.name || 'Favor'}
            </Text>
          </View>

          {/* Favor Details */}
          <View className="space-y-4">
            {/* Category */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Category:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {favor.favor_subject?.name || 'N/A'}
              </Text>
            </View>

            {/* Description */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Description:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2" numberOfLines={3}>
                {favor.description || 'No description provided'}
              </Text>
            </View>

            {/* Payment */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Payment:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatPayment(favor)}
              </Text>
            </View>

            {/* Priority */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Priority:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatPriority(favor.priority)}
              </Text>
            </View>

            {/* Time to Complete */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Time to Complete:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {favor.time_to_complete || 'Not specified'}
              </Text>
            </View>

            {/* Location */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Location:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatLocation(favor)}
              </Text>
            </View>

            {/* Status */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Status:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatStatus(favor.status)}
              </Text>
            </View>

            {/* Posted Date */}
            <View className="flex-row items-start">
              <Text className="text-lg font-bold text-black w-28 flex-shrink-0">Posted:</Text>
              <Text className="text-lg text-gray-600 flex-1 ml-2">
                {formatPostedDate(favor.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}