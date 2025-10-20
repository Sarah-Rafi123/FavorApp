import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../apis/ProfileApis";

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};