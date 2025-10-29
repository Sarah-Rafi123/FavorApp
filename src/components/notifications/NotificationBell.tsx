import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BellSvg from '../../assets/icons/Bell';
import { useNotificationContext } from '../../context/NotificationContext';

interface NotificationBellProps {
  size?: 'small' | 'large';
  color?: string;
  onPress?: () => void;
}

export function NotificationBell({ 
  size = 'small', 
  color = '#333', 
  onPress 
}: NotificationBellProps) {
  const navigation = useNavigation();
  const { unreadCount, isLoading } = useNotificationContext();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('NotificationsScreen' as never);
    }
  };

  const iconSize = size === 'large' ? 32 : 24;
  const badgeSize = size === 'large' ? 20 : 16;
  const badgeText = size === 'large' ? 14 : 12;

  return (
    <View 
      className="relative"
      style={{ 
        width: 40, 
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <TouchableOpacity 
        onPress={handlePress}
        className="w-full h-full items-center justify-center"
        activeOpacity={0.7}
      >
        <BellSvg />
      </TouchableOpacity>
      
      {/* Badge for unread count */}
      {!isLoading && unreadCount > 0 && (
        <View 
          className="absolute bg-red-500 rounded-full items-center justify-center"
          style={{
            top: -2,
            right: -2,
            minWidth: badgeSize,
            height: badgeSize,
            paddingHorizontal: unreadCount > 9 ? 2 : 0,
            zIndex: 1,
          }}
        >
          <Text 
            className="text-white font-bold"
            style={{ fontSize: badgeText }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <View 
          className="absolute bg-gray-400 rounded-full"
          style={{
            top: 2,
            right: 2,
            width: 8,
            height: 8,
            zIndex: 1,
          }}
        />
      )}
    </View>
  );
}