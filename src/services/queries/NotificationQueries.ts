import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationApis } from "../apis/NotificationApis";

export const useNotificationsQuery = (page: number = 1, perPage: number = 20) => {
  return useQuery({
    queryKey: ['notifications', page, perPage],
    queryFn: () => NotificationApis.getAllNotifications(page, perPage),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
  });
};

export const useInfiniteNotificationsQuery = (perPage: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['notifications', 'infinite'],
    queryFn: ({ pageParam = 1 }) => NotificationApis.getAllNotifications(pageParam, perPage),
    getNextPageParam: (lastPage) => {
      return lastPage.data.meta.next_page || undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
  });
};

export const useUnreadNotificationsQuery = (page: number = 1, perPage: number = 20) => {
  return useQuery({
    queryKey: ['notifications', 'unread', page, perPage],
    queryFn: () => NotificationApis.getUnreadNotifications(page, perPage),
    staleTime: 1000 * 60 * 1, // 1 minute (more frequent for unread)
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
};

export const useUnreadCountQuery = (options?: { enabled?: boolean; refetchInterval?: number }) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: NotificationApis.getUnreadCount,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval || 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false,
  });
};

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: NotificationApis.markAsRead,
    onSuccess: (data, notificationId) => {
      // Update notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Update unread count immediately
      queryClient.setQueryData(['notifications', 'unread-count'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              unread_count: data.data.unread_count,
            },
          };
        }
        return oldData;
      });

      // Update specific notification in cache
      queryClient.setQueryData(['notifications', 'infinite'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                notifications: page.data.notifications.map((notif: any) =>
                  notif.id === notificationId ? { ...notif, is_read: true } : notif
                ),
                unread_count: data.data.unread_count,
              },
            })),
          };
        }
        return oldData;
      });
    },
  });
};

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: NotificationApis.markAllAsRead,
    onSuccess: (data) => {
      // Update notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Update unread count immediately
      queryClient.setQueryData(['notifications', 'unread-count'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              unread_count: 0,
            },
          };
        }
        return oldData;
      });

      // Update all notifications as read in cache
      queryClient.setQueryData(['notifications', 'infinite'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                notifications: page.data.notifications.map((notif: any) => ({
                  ...notif,
                  is_read: true,
                })),
                unread_count: 0,
              },
            })),
          };
        }
        return oldData;
      });
    },
  });
};

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: NotificationApis.deleteNotification,
    onSuccess: (data, notificationId) => {
      // Update notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Update unread count immediately
      queryClient.setQueryData(['notifications', 'unread-count'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              unread_count: data.data.unread_count,
            },
          };
        }
        return oldData;
      });

      // Remove notification from cache
      queryClient.setQueryData(['notifications', 'infinite'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                notifications: page.data.notifications.filter(
                  (notif: any) => notif.id !== notificationId
                ),
                unread_count: data.data.unread_count,
              },
            })),
          };
        }
        return oldData;
      });
    },
  });
};

export const useClearAllNotificationsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: NotificationApis.clearAllNotifications,
    onSuccess: () => {
      // Update notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Update unread count immediately
      queryClient.setQueryData(['notifications', 'unread-count'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              unread_count: 0,
            },
          };
        }
        return oldData;
      });

      // Clear all notifications from cache
      queryClient.setQueryData(['notifications', 'infinite'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                notifications: [],
                unread_count: 0,
              },
            })),
          };
        }
        return oldData;
      });
    },
  });
};

export const useRegisterDeviceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: NotificationApis.registerDevice,
    onSuccess: () => {
      // Update devices list
      queryClient.invalidateQueries({ queryKey: ['notification-devices'] });
    },
  });
};

export const useUnregisterDeviceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: NotificationApis.unregisterDevice,
    onSuccess: () => {
      // Update devices list
      queryClient.invalidateQueries({ queryKey: ['notification-devices'] });
    },
  });
};

export const useDevicesQuery = () => {
  return useQuery({
    queryKey: ['notification-devices'],
    queryFn: NotificationApis.getDevices,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
  });
};