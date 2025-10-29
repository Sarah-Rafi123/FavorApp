import React from 'react';
import { NotificationPopup } from './NotificationPopup';
import { usePushNotification } from '../../services/notifications/usePushNotificationDev';
import { useNavigation } from '@react-navigation/native';

export function NotificationPopupProvider() {
  const navigation = useNavigation();
  const { 
    showPopup, 
    popupData, 
    dismissPopup, 
    handlePopupPress 
  } = usePushNotification();

  // Debug logging
  React.useEffect(() => {
    console.log('🎨 NotificationPopupProvider state:', { showPopup, popupData });
  }, [showPopup, popupData]);

  const handlePress = () => {
    // Handle navigation based on popup data
    if (popupData?.data?.screen) {
      // Navigate to specific screen
      (navigation as any).navigate(popupData.data.screen, popupData.data.params || {});
    } else if (popupData?.data?.favor_id) {
      // Navigate to favor details (if you have this screen)
      // (navigation as any).navigate('FavorDetails', { favorId: popupData.data.favor_id });
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
      onPress={handlePress}
      onDismiss={dismissPopup}
    />
  );
}