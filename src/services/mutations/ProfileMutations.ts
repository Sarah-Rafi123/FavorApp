import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePassword, UpdatePasswordData, updateProfile, UpdateProfileData, uploadProfileImage, removeProfileImage } from "../apis/ProfileApis";
import Toast from 'react-native-toast-message';

export const useUpdatePasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: UpdatePasswordData) => updatePassword(payload),
    onSuccess: (response) => {
      console.log('🎉 Update Password Success:', response);
      
      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2: 'Your password has been changed successfully.',
        position: 'top',
      });
    },
    onError: (error: any) => {
      console.error('❌ Update Password Error:', error);
      
      const errorMessage = error.message || 'Failed to update password. Please try again.';
      
      Toast.show({
        type: 'error',
        text1: 'Password Update Failed',
        text2: errorMessage,
        position: 'top',
      });
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileData) => updateProfile(payload),
    onSuccess: (response) => {
      console.log('🎉 Update Profile Success:', response);
      
      // Invalidate profile queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully.',
        position: 'top',
      });
    },
    onError: (error: any) => {
      console.error('❌ Update Profile Error:', error);
      
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      
      Toast.show({
        type: 'error',
        text1: 'Profile Update Failed',
        text2: errorMessage,
        position: 'top',
      });
    },
  });
};

export const useUploadProfileImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageFile: any) => uploadProfileImage(imageFile),
    onSuccess: (response) => {
      console.log('🎉 Upload Profile Image Success:', response);
      
      // Invalidate profile queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      Toast.show({
        type: 'success',
        text1: 'Image Uploaded',
        text2: 'Your profile image has been updated successfully.',
        position: 'top',
      });
    },
    onError: (error: any) => {
      console.error('❌ Upload Profile Image Error:', error);
      
      const errorMessage = error.message || 'Failed to upload image. Please try again.';
      
      Toast.show({
        type: 'error',
        text1: 'Image Upload Failed',
        text2: errorMessage,
        position: 'top',
      });
    },
  });
};

export const useRemoveProfileImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeProfileImage(),
    onSuccess: (response) => {
      console.log('🎉 Remove Profile Image Success:', response);
      
      // Invalidate profile queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      Toast.show({
        type: 'success',
        text1: 'Image Removed',
        text2: 'Your profile image has been removed successfully.',
        position: 'top',
      });
    },
    onError: (error: any) => {
      console.error('❌ Remove Profile Image Error:', error);
      
      const errorMessage = error.message || 'Failed to remove image. Please try again.';
      
      Toast.show({
        type: 'error',
        text1: 'Image Removal Failed',
        text2: errorMessage,
        position: 'top',
      });
    },
  });
};