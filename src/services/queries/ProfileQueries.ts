import { useQuery } from "@tanstack/react-query";
import { getProfile, getPublicUserProfile, getFavorProviderProfile } from "../apis/ProfileApis";

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