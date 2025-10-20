import { axiosInstance } from '../axiosConfig';
import { ProfileResponse } from '../../types';

// Update Profile Types
export interface UpdateProfileData {
  profile: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone_no_call?: string;
    phone_no_text?: string;
    years_of_experience?: number;
    about_me?: string;
    skills?: string[];
    other_skills?: string;
    remove_image?: "0" | "1";
    address_attributes?: {
      full_address?: string;
      city?: string;
      state?: string;
    };
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  data: {
    profile: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      middle_name?: string;
      phone_no_call: string;
      phone_no_text: string;
      years_of_experience: number;
      about_me: string;
      skills: string[];
      other_skills: string;
      updated_at: string;
    };
  };
  message: string;
}

// Update Password Types
export interface UpdatePasswordData {
  profile: {
    current_password: string;
    password: string;
    password_confirmation: string;
  };
}

export interface UpdatePasswordResponse {
  success: boolean;
  data: {
    profile: {
      id: number;
      email: string;
      updated_at: string;
    };
  };
  message: string;
}

// Upload Image Types
export interface UploadImageResponse {
  success: boolean;
  data: {
    image_url: string;
  };
  message: string;
}

// Remove Image Types
export interface RemoveImageResponse {
  success: boolean;
  data: {};
  message: string;
}

export const getProfile = async (): Promise<ProfileResponse> => {
  console.log(`[INIT] => /profile`);
  const response = await axiosInstance.get('/profile');
  console.log(`[OK] => /profile`);
  return response.data;
};

export const updateProfile = async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
  try {
    console.log(`🚀 Making Update Profile API call to: /profile`);
    console.log('📤 Request Data:', JSON.stringify(data, null, 2));
    
    const response = await axiosInstance.patch('/profile', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🎉 Update Profile API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Update Profile API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 422) {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.join(', '));
      } else {
        throw new Error('Validation failed. Please check your input.');
      }
    } else if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to update profile. Please check your connection and try again.');
    }
  }
};

export const updatePassword = async (data: UpdatePasswordData): Promise<UpdatePasswordResponse> => {
  try {
    console.log(`🚀 Making Update Password API call to: /profile`);
    
    const response = await axiosInstance.patch('/profile', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🎉 Update Password API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Update Password API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      if (errorData?.errors?.includes('Current password is incorrect')) {
        throw new Error('Current password is incorrect');
      } else {
        throw new Error('Authentication failed. Please try again.');
      }
    } else if (error.response?.status === 422) {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.join(', '));
      } else {
        throw new Error('Validation failed. Please check your input.');
      }
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to update password. Please check your connection and try again.');
    }
  }
};

export const uploadProfileImage = async (imageFile: any): Promise<UploadImageResponse> => {
  try {
    console.log(`🚀 Making Upload Profile Image API call to: /profile/upload_image`);
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await axiosInstance.post('/profile/upload_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('🎉 Upload Profile Image API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Upload Profile Image API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 400) {
      const errorData = error.response?.data;
      if (errorData?.errors?.includes('No image file provided')) {
        throw new Error('No image file provided');
      } else {
        throw new Error('Upload failed. Please check your request.');
      }
    } else if (error.response?.status === 422) {
      const errorData = error.response?.data;
      if (errorData?.errors?.includes('Image file is invalid')) {
        throw new Error('Image file is invalid. Please choose a valid image file.');
      } else {
        throw new Error('Failed to upload image. Please try again.');
      }
    } else if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to upload image. Please check your connection and try again.');
    }
  }
};

export const removeProfileImage = async (): Promise<RemoveImageResponse> => {
  try {
    console.log(`🚀 Making Remove Profile Image API call to: /profile/remove_image`);
    
    const response = await axiosInstance.delete('/profile/remove_image');
    
    console.log('🎉 Remove Profile Image API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Remove Profile Image API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 404) {
      const errorData = error.response?.data;
      if (errorData?.errors?.includes('No profile image to remove')) {
        throw new Error('No profile image to remove');
      } else {
        throw new Error('No image found');
      }
    } else if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to remove image. Please check your connection and try again.');
    }
  }
};