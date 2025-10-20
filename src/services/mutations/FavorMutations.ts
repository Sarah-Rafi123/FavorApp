import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FavorApis, 
  CreateFavorRequest,
  CreateFavorFormData,
  UpdateFavorRequest,
  GetFavorResponse,
  ReassignFavorResponse,
  ApplyToFavorResponse
} from '../apis/FavorApis';
import Toast from 'react-native-toast-message';


/**
 * Hook for creating a new favor (JSON format)
 */
export const useCreateFavor = () => {
  const queryClient = useQueryClient();

  return useMutation<GetFavorResponse, Error, CreateFavorRequest>({
    mutationFn: (data: CreateFavorRequest) => FavorApis.createFavor(data),
    onSuccess: (data) => {
      console.log('Favor created successfully:', data.data.favor.id);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      queryClient.invalidateQueries({ queryKey: ['favors', 'my'] });
      
      Toast.show({
        type: 'success',
        text1: 'Favor Created',
        text2: 'Your favor has been posted successfully!',
        visibilityTime: 4000,
      });
    },
    onError: (error) => {
      console.error('Create favor failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Create Favor',
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};

/**
 * Hook for creating a new favor with image (FormData format)
 */
export const useCreateFavorWithImage = () => {
  const queryClient = useQueryClient();

  return useMutation<GetFavorResponse, Error, CreateFavorFormData>({
    mutationFn: (formData: CreateFavorFormData) => FavorApis.createFavorWithImage(formData),
    onSuccess: (data) => {
      console.log('Favor with image created successfully:', data.data.favor.id);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      queryClient.invalidateQueries({ queryKey: ['favors', 'my'] });
      
      Toast.show({
        type: 'success',
        text1: 'Favor Created',
        text2: 'Your favor with image has been posted successfully!',
        visibilityTime: 4000,
      });
    },
    onError: (error) => {
      console.error('Create favor with image failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Create Favor',
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};

/**
 * Hook for updating an existing favor (JSON format)
 */
export const useUpdateFavor = () => {
  const queryClient = useQueryClient();

  return useMutation<GetFavorResponse, Error, { id: number; data: UpdateFavorRequest }>({
    mutationFn: ({ id, data }) => FavorApis.updateFavor(id, data),
    onSuccess: (data, variables) => {
      console.log('Favor updated successfully:', data.data.favor.id);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      queryClient.invalidateQueries({ queryKey: ['favors', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['favor', variables.id] });
      
      Toast.show({
        type: 'success',
        text1: 'Favor Updated',
        text2: 'Your favor has been updated successfully!',
        visibilityTime: 4000,
      });
    },
    onError: (error) => {
      console.error('Update favor failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Update Favor',
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};

/**
 * Hook for updating an existing favor with image (FormData format)
 */
export const useUpdateFavorWithImage = () => {
  const queryClient = useQueryClient();

  return useMutation<GetFavorResponse, Error, { id: number; formData: FormData }>({
    mutationFn: ({ id, formData }) => FavorApis.updateFavorWithImage(id, formData),
    onSuccess: (data, variables) => {
      console.log('Favor with image updated successfully:', data.data.favor.id);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      queryClient.invalidateQueries({ queryKey: ['favors', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['favor', variables.id] });
      
      Toast.show({
        type: 'success',
        text1: 'Favor Updated',
        text2: 'Your favor with image has been updated successfully!',
        visibilityTime: 4000,
      });
    },
    onError: (error) => {
      console.error('Update favor with image failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Update Favor',
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};

/**
 * Hook for generic favor mutations with custom success/error handling
 */
export const useFavorMutation = <TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    showToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate favor-related queries
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      
      if (options?.showToast !== false) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: options?.successMessage || 'Operation completed successfully',
          visibilityTime: 3000,
        });
      }

      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      console.error('Favor mutation failed:', error);
      
      if (options?.showToast !== false) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: options?.errorMessage || error.message,
          visibilityTime: 4000,
        });
      }

      options?.onError?.(error, variables);
    },
  });
};

/**
 * Utility functions for building FormData for favor creation/updates
 */
export const buildFavorFormData = (
  data: CreateFavorRequest | UpdateFavorRequest,
  image?: {
    uri: string;
    type: string;
    name: string;
  }
): FormData => {
  const formData = new FormData();
  
  // Add all favor data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(`favor[${key}]`, value.toString());
    }
  });
  
  // Add image if provided
  if (image) {
    // Create a proper File-like object for React Native
    const fileObject = {
      uri: image.uri,
      type: image.type,
      name: image.name,
    };
    
    formData.append('favor[image]', fileObject as any);
  }
  
  return formData;
};

/**
 * Utility function for converting priority values
 */
export const convertPriority = (priority: string): 'immediate' | 'delayed' | 'no_rush' => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'immediate';
    case 'medium':
    case 'moderate':
      return 'delayed';
    case 'low':
    case 'none':
      return 'no_rush';
    default:
      return 'delayed';
  }
};

/**
 * Hook for applying to a favor
 */
export const useApplyToFavor = () => {
  const queryClient = useQueryClient();

  return useMutation<ApplyToFavorResponse, Error, number>({
    mutationFn: (favorId: number) => FavorApis.applyToFavor(favorId),
    onSuccess: (data, favorId) => {
      console.log('Apply to favor successful:', data.data.application.id);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      queryClient.invalidateQueries({ queryKey: ['favors', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['favor', favorId] });
      queryClient.invalidateQueries({ queryKey: ['favor', favorId, 'applicants'] });
      
      Toast.show({
        type: 'success',
        text1: 'Application Submitted! 🎉',
        text2: data.message || 'Your application has been submitted successfully!',
        visibilityTime: 4000,
      });
    },
    onError: (error, favorId) => {
      console.error('Apply to favor failed:', error);
      
      // Determine toast type based on error
      let toastType: 'error' | 'info' = 'error';
      let title = 'Application Failed';
      
      // Some errors are more informational than critical
      if (error.message.includes('already applied') || 
          error.message.includes('already the accepted provider') ||
          error.message.includes('cannot apply to your own favor')) {
        toastType = 'info';
        title = 'Cannot Apply';
      }
      
      Toast.show({
        type: toastType,
        text1: title,
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};

/**
 * Hook for deleting a favor
 */
export const useDeleteFavor = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { favorId: number; type?: 'active' | 'history' }>({
    mutationFn: ({ favorId, type = 'active' }) => FavorApis.deleteFavor(favorId, type),
    onSuccess: (data, { favorId, type }) => {
      console.log('Delete favor successful:', favorId);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      queryClient.invalidateQueries({ queryKey: ['favors', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['favor', favorId] });
      
      Toast.show({
        type: 'success',
        text1: 'Favor Cancelled ✅',
        text2: data.message || 'Your favor has been cancelled successfully!',
        visibilityTime: 4000,
      });
    },
    onError: (error, { favorId }) => {
      console.error('Delete favor failed:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Failed to Cancel Favor',
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};

/**
 * Hook for reassigning a favor to a different provider
 */
export const useReassignFavor = () => {
  const queryClient = useQueryClient();

  return useMutation<ReassignFavorResponse, Error, { favorId: number; newProviderId: number }>({
    mutationFn: ({ favorId, newProviderId }) => FavorApis.reassignFavor(favorId, newProviderId),
    onSuccess: (data, { favorId }) => {
      console.log('Reassign favor successful:', favorId);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      queryClient.invalidateQueries({ queryKey: ['favors', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['favor', favorId] });
      queryClient.invalidateQueries({ queryKey: ['favor', favorId, 'applicants'] });
      
      Toast.show({
        type: 'success',
        text1: 'Favor Reassigned! 🔄',
        text2: data.message || 'Favor has been reassigned to new provider successfully!',
        visibilityTime: 4000,
      });
    },
    onError: (error) => {
      console.error('Reassign favor failed:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Failed to Reassign Favor',
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};

/**
 * Hook for canceling a favor request (by provider)
 */
export const useCancelRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; data: {}; message: string }, Error, number>({
    mutationFn: (favorId: number) => FavorApis.cancelRequest(favorId),
    onSuccess: (data, favorId) => {
      console.log('Cancel request successful:', favorId);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      queryClient.invalidateQueries({ queryKey: ['favors', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['favor', favorId] });
      
      Toast.show({
        type: 'success',
        text1: 'Request Cancelled ✅',
        text2: data.message || 'Your favor request has been cancelled successfully!',
        visibilityTime: 4000,
      });
    },
    onError: (error, favorId) => {
      console.error('Cancel request failed:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Failed to Cancel Request',
        text2: error.message,
        visibilityTime: 4000,
      });
    },
  });
};

/**
 * Utility function for converting favor pay values
 */
export const convertFavorPay = (isPaid: boolean): '0' | '1' => {
  return isPaid ? '0' : '1'; // 0 = paid, 1 = free
};