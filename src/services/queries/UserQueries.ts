import { useQuery } from "@tanstack/react-query";
import { getAvailableSkills } from "../apis/AuthApis";

export const useSkillsQuery = () => {
  return useQuery({
    queryKey: ['skills', 'available'],
    queryFn: getAvailableSkills,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

// import { getUserDetails } from "../apis/UserApis";

// export const useGetUserDetailsQuery = (userId: string, options = {}) => {
//     return useQuery({
//         queryKey: ['user', userId],
//         queryFn: () => getUserDetails(userId),
//         enabled: !!userId, // only run if userId is available
//         ...options,
//     });
// };