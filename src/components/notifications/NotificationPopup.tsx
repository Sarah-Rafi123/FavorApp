import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationPopupProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'favor_request' | 'favor_accepted' | 'favor_declined' | 'favor_completed' | 'favor_cancelled' | 'review_received' | 'default';
  onPress?: () => void;
  onDismiss?: () => void;
}

export function NotificationPopup({
  visible,
  title,
  message,
  type = 'default',
  onPress,
  onDismiss,
}: NotificationPopupProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getNotificationIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'favor_request':
        return '🙋‍♂️';
      case 'favor_accepted':
        return '✅';
      case 'favor_declined':
        return '❌';
      case 'favor_completed':
        return '🎉';
      case 'favor_cancelled':
        return '⭕';
      case 'review_received':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (notificationType: string) => {
    switch (notificationType) {
      case 'favor_request':
        return '#3B82F6'; // Blue
      case 'favor_accepted':
        return '#10B981'; // Green
      case 'favor_declined':
        return '#EF4444'; // Red
      case 'favor_completed':
        return '#8B5CF6'; // Purple
      case 'favor_cancelled':
        return '#F59E0B'; // Orange
      case 'review_received':
        return '#F59E0B'; // Orange
      default:
        return '#44A27B'; // App green
    }
  };

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 2 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // Reset position when not visible
      slideAnim.setValue(-200);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleDismiss = () => {
    // Slide out animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const handlePress = () => {
    handleDismiss();
    onPress?.();
  };

  if (!visible) return null;

  const notificationColor = getNotificationColor(type);
  const notificationIcon = getNotificationIcon(type);

  return (
    <Animated.View
      className="absolute left-0 right-0 px-4"
      style={{
        top: insets.top + 10,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
        zIndex: 9999,
        elevation: 9999,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        className="bg-white rounded-2xl p-4 mx-2 shadow-lg border-l-4"
        style={{
          borderLeftColor: notificationColor,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <View className="flex-row items-start">
          {/* Icon */}
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: notificationColor + '20' }}
          >
            <Text className="text-lg">{notificationIcon}</Text>
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-sm mb-1" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-gray-600 text-xs" numberOfLines={2}>
              {message}
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={handleDismiss}
            className="w-6 h-6 items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-gray-400 text-lg">×</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: notificationColor,
              width: '100%',
            }}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}