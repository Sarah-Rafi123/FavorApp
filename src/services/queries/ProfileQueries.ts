import { useQuery } from "@tanstack/react-query";
import { getProfile, getPublicUserProfile, getFavorProviderProfile, getUserReviews, UserReviewsParams } from "../apis/ProfileApis";
import { StripeConnectApis } from "../apis/StripeConnectApis";

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const usePublicUserProfileQuery = (userId: number | null, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['publicUserProfile', userId],
    queryFn: () => getPublicUserProfile(userId!),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useFavorProviderProfileQuery = (favorId: number | null, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['favorProviderProfile', favorId],
    queryFn: () => getFavorProviderProfile(favorId!),
    enabled: !!favorId && (options?.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useUserReviewsQuery = (
  userId: number | null, 
  params: UserReviewsParams = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['userReviews', userId, params],
    queryFn: () => getUserReviews(userId!, params),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: 1000 * 60 * 3, // 3 minutes (reviews change more frequently)
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 500 errors after first attempt
      if (error?.response?.status === 500) {
        return failureCount < 1;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useStripeBalanceQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['stripeBalance'],
    queryFn: StripeConnectApis.getBalance,
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 2, // 2 minutes (balance changes frequently)
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};