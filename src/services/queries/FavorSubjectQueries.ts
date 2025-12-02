import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { 
  FavorSubjectApis, 
  ListFavorSubjectsResponse,
  GetFavorSubjectResponse
} from '../apis/FavorSubjectApis';

/**
 * Hook for fetching all favor subjects/categories
 */
export const useFavorSubjects = (
  options?: Partial<UseQueryOptions<ListFavorSubjectsResponse, Error>>
) => {
  return useQuery<ListFavorSubjectsResponse, Error>({
    queryKey: ['favorSubjects'],
    queryFn: () => FavorSubjectApis.listFavorSubjects(),
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes (categories change rarely)
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error.message.includes('Authentication required')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

/**
 * Hook for fetching a specific favor subject by ID
 */
export const useFavorSubject = (
  id: number,
  options?: Partial<UseQueryOptions<GetFavorSubjectResponse, Error>>
) => {
  return useQuery<GetFavorSubjectResponse, Error>({
    queryKey: ['favorSubject', id],
    queryFn: () => FavorSubjectApis.getFavorSubject(id),
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    retry: (failureCount, error) => {
      // Don't retry for 404 errors (subject not found)
      if (error.message.includes('404') || error.message.includes('not found')) {
        return false;
      }
      if (error.message.includes('Authentication required')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

/**
 * Hook for getting active favor subjects only
 */
export const useActiveFavorSubjects = (
  options?: Partial<UseQueryOptions<ListFavorSubjectsResponse, Error>>
) => {
  return useQuery<ListFavorSubjectsResponse, Error>({
    queryKey: ['favorSubjects', 'active'],
    queryFn: async () => {
      const response = await FavorSubjectApis.listFavorSubjects();
      
      // Filter to only active subjects
      const activeSubjects = response.data.favor_subjects.filter(subject => subject.is_active);
      
      return {
        ...response,
        data: {
          favor_subjects: activeSubjects,
          total_count: activeSubjects.length,
        },
      };
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    ...options,
  });
};