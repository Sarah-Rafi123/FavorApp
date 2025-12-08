import { useQuery } from '@tanstack/react-query';
import { getLifetimeSlots, LifetimeSlotsResponse } from '../apis/LifetimeSlotsApis';

/**
 * Hook to fetch lifetime slots availability
 */
export const useLifetimeSlots = () => {
  return useQuery<LifetimeSlotsResponse>({
    queryKey: ['lifetimeSlots'],
    queryFn: getLifetimeSlots,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 1, // Reduced retry attempts since API might not be implemented yet
    retryDelay: 2000, // Simple 2 second delay
    refetchOnWindowFocus: false, // Don't refetch on focus to reduce errors
    refetchOnReconnect: false, // Don't refetch on reconnect to reduce errors
  });
};