import { useQuery } from "@tanstack/react-query";
import { getProfile, getPublicUserProfile, getFavorProviderProfile, getUserReviews, UserReviewsParams } from "../apis/ProfileApis";

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
  });
};