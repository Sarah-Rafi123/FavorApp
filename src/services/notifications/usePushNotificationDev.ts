import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Alert } from 'react-native';
import { useRegisterDeviceMutation, useUnregisterDeviceMutation } from '../queries/NotificationQueries';

// Configure how notifications are handled
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationData {
  favor_id?: number;
  notification_id?: number;
  type?: string;
  screen?: string;
  [key: string]: any;
}

export interface NotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  showPopup: boolean;
  popupData: {
    title: string;
    message: string;
    type: string;
    data?: any;
  } | null;
}

export const usePushNotification = () => {
  const [state, setState] = useState<NotificationState>({
    expoPushToken: null,
    notification: null,
    isRegistered: false,
    isLoading: false,
    error: null,
    showPopup: false,
    popupData: null,
  });

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const registerDeviceMutation = useRegisterDeviceMutation();
  const unregisterDeviceMutation = useUnregisterDeviceMutation();

  // Get device name for registration
  const getDeviceName = async (): Promise<string> => {
    const deviceName = Device.deviceName || Device.modelName;
    const brand = Device.brand;
    return `${brand} ${deviceName}`.trim() || 'Unknown Device';
  };

  // Register for push notifications (development mode without Firebase)
  const registerForPushNotifications = async (): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!Device.isDevice) {
        console.warn('⚠️ Push notifications are only available on physical devices');
        setState(prev => ({ ...prev, isLoading: false, error: 'Simulator detected' }));
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Push notification permission denied');
        setState(prev => ({ ...prev, isLoading: false, error: 'Permission denied' }));
        return null;
      }

      // Generate a mock token for development (no Firebase required)
      const mockToken = `ExponentPushToken[dev-${Math.random().toString(36).substring(2, 11)}]`;
      console.log('📱 Development Push Token:', mockToken);

      // Try to register device with backend (optional for development)
      try {
        const deviceName = await getDeviceName();
        await registerDeviceMutation.mutateAsync({
          expo_push_token: mockToken,
          device_name: deviceName,
        });
        console.log('✅ Device registered with backend');
      } catch (backendError) {
        console.warn('⚠️ Backend registration failed, continuing with local notifications');
      }

      setState(prev => ({ 
        ...prev, 
        expoPushToken: mockToken, 
        isRegistered: true, 
        isLoading: false 
      }));

      console.log('✅ Push notifications initialized (development mode)');
      return mockToken;

    } catch (error: any) {
      console.error('❌ Error setting up notifications:', error);
      const errorMessage = error.message || 'Failed to setup notifications';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  };

  // Unregister from push notifications
  const unregisterFromPushNotifications = async (): Promise<void> => {
    if (!state.expoPushToken) {
      console.log('No push token to unregister');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await unregisterDeviceMutation.mutateAsync({
        expo_push_token: state.expoPushToken,
      });

      setState(prev => ({ 
        ...prev, 
        expoPushToken: null, 
        isRegistered: false, 
        isLoading: false 
      }));

      console.log('✅ Device unregistered from push notifications');
    } catch (error: any) {
      console.error('❌ Error unregistering from push notifications:', error);
      setState(prev => ({ ...prev, error: error.message, isLoading: false }));
    }
  };

  // Handle notification received while app is open
  const handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log('🔔 Notification received in usePushNotification:', notification);
    console.log('📱 Notification content:', notification.request.content);
    
    const { title, body, data } = notification.request.content;
    const notificationType = (data as PushNotificationData)?.type || 'default';
    
    console.log('🎯 Setting popup state:', {
      title: title || 'New Notification',
      body: body || 'You have a new notification',
      type: notificationType,
    });
    
    // Show popup for new notifications
    setState(prev => ({ 
      ...prev, 
      notification,
      showPopup: true,
      popupData: {
        title: title || 'New Notification',
        message: body || 'You have a new notification',
        type: notificationType,
        data: data,
      }
    }));
    
    console.log('✅ Popup state updated');
  };

  // Handle notification response (when user taps notification)
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('👆 Notification tapped:', response);
    
    const data = response.notification.request.content.data as PushNotificationData;
    
    // Handle navigation based on notification data
    if (data.screen) {
      console.log('Navigate to screen:', data.screen, 'with data:', data);
    }
  };

  // Set up notification listeners
  useEffect(() => {
    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Auto-register on mount
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  // Set notification badge count
  const setBadgeCount = async (count: number) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('❌ Error setting badge count:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await setBadgeCount(0);
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  };

  // Schedule local notification (for testing)
  const scheduleTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification from FavorApp",
          data: { test: true, type: 'favor_request' },
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('❌ Error scheduling test notification:', error);
    }
  };

  // Schedule different types of test notifications
  const scheduleTestNotificationWithType = async (type: string, title: string, body: string) => {
    try {
      console.log('🧪 Scheduling test notification:', { type, title, body });
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type, test: true },
        },
        trigger: null, // Immediate
      });
      
      console.log('✅ Test notification scheduled successfully');
    } catch (error) {
      console.error('❌ Error scheduling test notification:', error);
    }
  };

  // Dismiss popup
  const dismissPopup = () => {
    setState(prev => ({ 
      ...prev, 
      showPopup: false,
      popupData: null,
    }));
  };

  // Handle popup press (navigate to notification or specific screen)
  const handlePopupPress = (data?: any) => {
    dismissPopup();
    
    // You can add navigation logic here based on the data
    if (data?.screen) {
      console.log('Navigate to screen:', data.screen);
      // navigation.navigate(data.screen, data.params);
    } else if (data?.favor_id) {
      console.log('Navigate to favor:', data.favor_id);
      // navigation.navigate('FavorDetails', { favorId: data.favor_id });
    }
  };

  return {
    ...state,
    registerForPushNotifications,
    unregisterFromPushNotifications,
    setBadgeCount,
    clearAllNotifications,
    scheduleTestNotification,
    scheduleTestNotificationWithType,
    dismissPopup,
    handlePopupPress,
  };
};