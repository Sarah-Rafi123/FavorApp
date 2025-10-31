import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useUnreadCountQuery } from '../services/queries/NotificationQueries';
import { usePushNotification } from '../services/notifications/usePushNotificationDev';
import { NotificationApis } from '../services/apis/NotificationApis';
import { NotificationPopup } from '../components/notifications/NotificationPopup';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../store/useAuthStore';

interface NotificationContextType {
  unreadCount: number;
  isLoading: boolean;
  refetchUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { setBadgeCount, scheduleTestNotificationWithType } = usePushNotification();
  const [previousUnreadCount, setPreviousUnreadCount] = useState<number>(0);
  
  // Get authentication state
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!(user && accessToken);
  
  // Query for unread count with polling - only when authenticated
  const { 
    data: unreadData, 
    isLoading, 
    refetch: refetchUnreadCount 
  } = useUnreadCountQuery({
    refetchInterval: isAuthenticated ? 30000 : undefined, // Poll every 30 seconds only when authenticated
    enabled: isAuthenticated, // Only enable when user is authenticated
  });

  const unreadCount = unreadData?.data?.unread_count || 0;

  // Debug logging for unread count changes
  useEffect(() => {
    console.log('📊 NotificationContext - Unread count changed:', {
      previousCount: previousUnreadCount,
      currentCount: unreadCount,
      isLoading,
      isAuthenticated,
      hasToken: !!accessToken
    });
  }, [unreadCount, previousUnreadCount, isLoading, isAuthenticated, accessToken]);

  // Update app badge when unread count changes
  useEffect(() => {
    setBadgeCount(unreadCount);
  }, [unreadCount, setBadgeCount]);

  // Detect new notifications and show popup
  useEffect(() => {
    // Skip if not authenticated or on first load or if count decreased (mark as read)
    if (!isAuthenticated || previousUnreadCount === 0 || unreadCount <= previousUnreadCount) {
      setPreviousUnreadCount(unreadCount);
      return;
    }

    // New notification(s) arrived - fetch latest notifications to show popup
    const fetchLatestAndShowPopup = async () => {
      try {
        console.log('🔔 New notification detected! Count increased from', previousUnreadCount, 'to', unreadCount);
        
        // Fetch the latest notifications to get the newest one
        const response = await NotificationApis.getAllNotifications(1, 1);
        const latestNotification = response.data.notifications[0];
        
        if (latestNotification) {
          // Show popup for the latest notification
          console.log('📱 Showing popup for latest notification:', latestNotification.description);
          
          // Schedule a local notification to trigger the popup
          await scheduleTestNotificationWithType(
            latestNotification.notification_type || 'default',
            'New Notification',
            latestNotification.description || 'You have a new notification'
          );
        }
      } catch (error) {
        console.error('Failed to fetch latest notification:', error);
      }
    };

    fetchLatestAndShowPopup();
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount]);

  // Handle app state changes for polling optimization
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated) {
        // App came to foreground - refetch immediately (only if authenticated)
        console.log('📱 App became active - refreshing notifications');
        refetchUnreadCount();
        
        // Invalidate all notification queries to get fresh data
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [refetchUnreadCount, queryClient, isAuthenticated]);

  // Auto-refresh when user performs notification actions
  useEffect(() => {
    if (!isAuthenticated) return; // Don't set up interval if not authenticated
    
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        refetchUnreadCount();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetchUnreadCount, isAuthenticated]);

  const value: NotificationContextType = {
    unreadCount,
    isLoading,
    refetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Navigation-aware popup renderer that should be placed inside NavigationContainer
export const NotificationPopupRenderer: React.FC = () => {
  const navigation = useNavigation();
  const { showPopup, popupData, dismissPopup, handlePopupPress } = usePushNotification();

  const handlePopupPressInternal = () => {
    // Handle navigation based on popup data
    if (popupData?.data?.screen) {
      // Navigate to specific screen
      (navigation as any).navigate(popupData.data.screen, popupData.data.params || {});
    } else if (popupData?.data?.favor_id) {
      // Navigate to favor details (if you have this screen)
      console.log('Navigate to favor:', popupData.data.favor_id);
    } else {
      // Default: navigate to notifications screen
      (navigation as any).navigate('NotificationsScreen');
    }
    
    handlePopupPress(popupData?.data);
  };

  if (!showPopup || !popupData) {
    return null;
  }

  return (
    <NotificationPopup
      visible={showPopup}
      title={popupData.title}
      message={popupData.message}
      type={popupData.type as any}
      onPress={handlePopupPressInternal}
      onDismiss={dismissPopup}
    />
  );
};