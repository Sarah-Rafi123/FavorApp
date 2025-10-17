import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { 
  FavorApis, 
  ListFavorsResponse,
  GetFavorResponse,
  GetFavorApplicantsResponse,
  BrowseFavorsParams,
  MyFavorsParams
} from '../apis/FavorApis';
import useAuthStore from '../../store/useAuthStore';

/**
 * Hook for fetching available favors (basic list)
 */
export const useFavors = (
  page = 1, 
  per_page = 12,
  options?: Partial<UseQueryOptions<ListFavorsResponse, Error>>
) => {
  return useQuery<ListFavorsResponse, Error>({
    queryKey: ['favors', page, per_page],
    queryFn: async () => {
      try {
        console.log('🔥 Fetching favors - Page:', page, 'Per page:', per_page);
        const result = await FavorApis.listFavors(page, per_page);
        console.log('✅ Favors fetch success - First favor user:', result.data.favors[0]?.user?.full_name);
        return result;
      } catch (error) {
        console.error('❌ Favors fetch error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      console.log('🔄 Retry attempt:', failureCount, 'Error:', error.message);
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
 * Hook for browsing favors with advanced filters
 */
export const useBrowseFavors = (
  params: BrowseFavorsParams,
  options?: Partial<UseQueryOptions<ListFavorsResponse, Error>>
) => {
  return useQuery<ListFavorsResponse, Error>({
    queryKey: ['favors', 'browse', params],
    queryFn: () => FavorApis.browseFavors(params),
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes (shorter for filtered results)
    gcTime: 8 * 60 * 1000, // Keep in cache for 8 minutes
    retry: (failureCount, error) => {
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
 * Hook for fetching user's favors (requested or providing)
 * Only fetches when user is authenticated
 */
export const useMyFavors = (
  params: MyFavorsParams,
  options?: Partial<UseQueryOptions<ListFavorsResponse, Error>>
) => {
  const { user, accessToken } = useAuthStore();

  return useQuery<ListFavorsResponse, Error>({
    queryKey: ['favors', 'my', params],
    queryFn: async () => {
      console.log('🔍 MyFavors Query - User:', !!user, 'Token:', !!accessToken, 'Params:', params);
      const result = await FavorApis.getMyFavors(params);
      console.log('✅ MyFavors fetch success for:', params.type, params.tab);
      return result;
    },
    enabled: !!user && !!accessToken, // Only fetch when user is logged in AND token is available
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes (user's own data changes more frequently)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: (failureCount, error) => {
      console.log('🔄 MyFavors retry attempt:', failureCount, 'Error:', error.message);
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
 * Hook for fetching a specific favor by ID
 */
export const useFavor = (
  id: number,
  options?: Partial<UseQueryOptions<GetFavorResponse, Error>>
) => {
  return useQuery<GetFavorResponse, Error>({
    queryKey: ['favor', id],
    queryFn: () => FavorApis.getFavor(id),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry for 404 errors (favor not found)
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
 * Hook for fetching favor applicants (owner only)
 * Only fetches when user is authenticated
 */
export const useFavorApplicants = (
  id: number,
  options?: Partial<UseQueryOptions<GetFavorApplicantsResponse, Error>>
) => {
  const { user, accessToken } = useAuthStore();

  return useQuery<GetFavorApplicantsResponse, Error>({
    queryKey: ['favor', id, 'applicants'],
    queryFn: () => FavorApis.getFavorApplicants(id),
    enabled: !!user && !!accessToken, // Only fetch when user is logged in AND token is available
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute (applicants change frequently)
    gcTime: 3 * 60 * 1000, // Keep in cache for 3 minutes
    retry: (failureCount, error) => {
      // Don't retry for 403 errors (not authorized to view applicants)
      if (error.message.includes('403') || error.message.includes('not authorized')) {
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
 * Helper hook for infinite scroll/pagination
 */
export const useInfiniteFavors = (params: BrowseFavorsParams) => {
  return useQuery<ListFavorsResponse, Error>({
    queryKey: ['favors', 'infinite', params],
    queryFn: () => FavorApis.browseFavors({ ...params, page: 1 }),
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
  });
};