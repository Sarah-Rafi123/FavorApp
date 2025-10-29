import { axiosInstance } from '../axiosConfig';

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unread_count: number;
    meta: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
      next_page: number | null;
      prev_page: number | null;
    };
  };
  message: string;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
  message: string | null;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  time_ago: string;
  favour?: {
    id: number;
    title: string;
    status: string;
  };
  favor_response?: {
    id: number;
    status: string;
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  data: {
    notification: Notification;
    unread_count: number;
  };
  message: string;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

export interface MarkAllAsReadResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
  message: string;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

export interface DeleteNotificationResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
  message: string;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

export interface RegisterDeviceRequest {
  expo_push_token: string;
  device_name?: string;
}

export interface RegisterDeviceResponse {
  success: boolean;
  data: {
    registered: boolean;
    device_id: number;
    device_name: string;
    expo_push_token: string;
  };
  message: string;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

export interface UnregisterDeviceRequest {
  expo_push_token: string;
}

export interface UnregisterDeviceResponse {
  success: boolean;
  data: {
    unregistered: boolean;
    remaining_devices: number;
  };
  message: string;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

export interface Device {
  id: number;
  device_name: string;
  expo_push_token: string;
  last_active_at: string;
  last_active_ago: string;
  registered_at: string;
  is_active: boolean;
}

export interface DevicesResponse {
  success: boolean;
  data: {
    devices: Device[];
    total_count: number;
    active_count: number;
  };
  message: string | null;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

export const NotificationApis = {
  /**
   * Get all notifications with pagination
   */
  getAllNotifications: async (page: number = 1, perPage: number = 20): Promise<NotificationResponse> => {
    try {
      const response = await axiosInstance.get(`/notifications?page=${page}&per_page=${perPage}`);
      console.log('🔔 Get all notifications API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get all notifications API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  /**
   * Get unread notifications only
   */
  getUnreadNotifications: async (page: number = 1, perPage: number = 20): Promise<NotificationResponse> => {
    try {
      const response = await axiosInstance.get(`/notifications/unread?page=${page}&per_page=${perPage}`);
      console.log('🔔 Get unread notifications API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get unread notifications API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch unread notifications');
    }
  },

  /**
   * Get unread count - lightweight endpoint for polling
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    try {
      const response = await axiosInstance.get('/notifications/count');
      console.log('🔔 Get unread count API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get unread count API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
    }
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId: number): Promise<MarkAsReadResponse> => {
    try {
      const response = await axiosInstance.patch(`/notifications/${notificationId}/mark_as_read`);
      console.log('🔔 Mark as read API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Mark as read API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    try {
      const response = await axiosInstance.patch('/notifications/mark_all_as_read');
      console.log('🔔 Mark all as read API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Mark all as read API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  /**
   * Delete single notification
   */
  deleteNotification: async (notificationId: number): Promise<DeleteNotificationResponse> => {
    try {
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      console.log('🔔 Delete notification API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Delete notification API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  /**
   * Clear all notifications
   */
  clearAllNotifications: async (): Promise<DeleteNotificationResponse> => {
    try {
      const response = await axiosInstance.delete('/notifications/clear_all');
      console.log('🔔 Clear all notifications API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Clear all notifications API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to clear all notifications');
    }
  },

  /**
   * Register device for push notifications
   */
  registerDevice: async (data: RegisterDeviceRequest): Promise<RegisterDeviceResponse> => {
    try {
      const response = await axiosInstance.post('/notifications/register_device', data);
      console.log('🔔 Register device API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Register device API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to register device');
    }
  },

  /**
   * Unregister device from push notifications
   */
  unregisterDevice: async (data: UnregisterDeviceRequest): Promise<UnregisterDeviceResponse> => {
    try {
      const response = await axiosInstance.delete('/notifications/unregister_device', { data });
      console.log('🔔 Unregister device API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Unregister device API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to unregister device');
    }
  },

  /**
   * Get list of registered devices
   */
  getDevices: async (): Promise<DevicesResponse> => {
    try {
      const response = await axiosInstance.get('/notifications/devices');
      console.log('🔔 Get devices API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get devices API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch devices');
    }
  },
};