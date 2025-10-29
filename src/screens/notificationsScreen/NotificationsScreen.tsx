import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ImageBackground, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BigBellSvg from '../../assets/icons/BigBell';
import BackSvg from '../../assets/icons/Back';
import { useInfiniteNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation, useMarkAllAsReadMutation, useClearAllNotificationsMutation } from '../../services/queries/NotificationQueries';
import { Notification } from '../../services/apis/NotificationApis';
import { usePushNotification } from '../../services/notifications/usePushNotificationDev';

export function NotificationsScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteNotificationsQuery();
  
  const markAsReadMutation = useMarkAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const clearAllMutation = useClearAllNotificationsMutation();
  
  const { clearAllNotifications, scheduleTestNotificationWithType } = usePushNotification();
  
  const notifications = data?.pages?.flatMap((page: any) => page.data.notifications) || [];
  const unreadCount = data?.pages?.[0]?.data?.unread_count || 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      await clearAllNotifications(); // Clear app badge
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllMutation.mutateAsync();
      await clearAllNotifications(); // Clear app badge
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  const handleTestNotification = async () => {
    await scheduleTestNotificationWithType(
      'favor_request', 
      'Test Notification', 
      'This is a test notification to check popup functionality'
    );
  };

  // Test function to simulate API notification (for testing the polling detection)
  const handleTestAPINotification = async () => {
    console.log('🧪 Testing API notification detection by refetching count...');
    // Force refetch the unread count to simulate new notifications from API
    await refetch();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
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

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className="mx-4 py-4 bg-transparent"
      onPress={() => !item.is_read && handleMarkAsRead(item.id)}
      onLongPress={() => handleDelete(item.id)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Profile Image / Icon */}
        <View className="w-12 h-12 bg-gray-300 rounded-full mr-3 items-center justify-center">
          <Text className="text-lg">{getNotificationIcon(item.notification_type)}</Text>
        </View>
        
        {/* Content */}
        <View className="flex-1">
          <Text className={`text-sm font-medium mb-1 ${
            item.is_read ? 'text-gray-700' : 'text-black'
          }`} numberOfLines={2}>
            {item.description}
          </Text>
          
          <Text className="text-xs text-gray-500">{item.time_ago}</Text>
        </View>
        
        {/* Unread indicator */}
        {!item.is_read && (
          <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#44A27B" />
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-4 w-8 h-8 items-center justify-center"
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Notifications</Text>
        </View>
      </View>

      {/* Header Actions */}
      {notifications.length > 0 && (
        <View className="px-6 pb-2">
          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="mr-4"
            >
              <Text className="text-[#44A27B] text-sm font-medium">
                {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark All Read'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClearAll}
              disabled={clearAllMutation.isPending}
            >
              <Text className="text-red-500 text-sm font-medium">
                {clearAllMutation.isPending ? 'Clearing...' : 'Clear All'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#44A27B" />
          <Text className="mt-4 text-gray-600">Loading notifications...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-center mb-4">Failed to load notifications</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-[#44A27B] px-6 py-3 rounded-full"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center">
            {/* Bell Icon */}
            <View className="w-24 h-24 items-center justify-center mb-8">
              <BigBellSvg />
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-black mb-4">No Notifications Yet</Text>
            
            {/* Description */}
            <Text className="text-gray-600 text-center leading-6 px-4 mb-8">
              Your notification will appear here once{'\n'}you've received them.
            </Text>
            
            {/* Test Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleTestNotification}
                className="bg-[#44A27B] px-6 py-3 rounded-full"
              >
                <Text className="text-white font-medium">Test Local Notification</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleTestAPINotification}
                className="bg-blue-500 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-medium">Test API Notification</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#44A27B']}
              tintColor="#44A27B"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => (
            <View className="mx-6 h-px bg-gray-100" />
          )}
        />
      )}
    </ImageBackground>
  );
}