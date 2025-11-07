import { axiosInstance } from '../axiosConfig';
import { ProfileResponse } from '../../types';
import { Review } from './FavorApis';

// Update Profile Types
export interface UpdateProfileData {
  profile: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone_no_call?: string;
    phone_no_text?: string;
    date_of_birth?: string;
    age?: number;
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

// Public User Profile Types
export interface PublicUserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  phone_no_call: string;
  phone_no_text: string;
  years_of_experience: number;
  about_me: string;
  skills: string[];
  other_skills?: string;
  member_since: string;
  age?: number;
  is_active: boolean;
  is_certified: boolean;
  address: {
    city: string;
    state: string;
  };
  image_url?: string;
  created_at: string;
}

export interface PublicUserProfileResponse {
  success: boolean;
  data: {
    user: PublicUserProfile;
  };
  message?: string;
}

// Provider Profile Types
export interface ProviderProfile {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  image_url?: string;
  age?: number;
  years_of_experience?: number;
  about_me?: string;
  is_certified: boolean;
  favor_history: {
    total_hours: number;
    completed_favors_count: number;
    favors_requested: number;
    favors_provided: number;
  };
  average_rating: number;
  total_reviews: number;
  email?: string;
  phone_no_call?: string;
  phone_no_text?: string;
  member_since?: string;
  has_contact_info: boolean;
}

export interface ProviderProfileResponse {
  success: boolean;
  data: {
    user: ProviderProfile;
    favor: {
      id: number;
      title: string;
      status: string;
    };
    viewer_relationship: 'public' | 'connected';
  };
  message: string;
}

// User Reviews Types
export interface UserReviewsParams {
  page?: number;
  per_page?: number;
  role?: 'requester' | 'provider';
}

export interface UserReviewsResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      full_name: string;
      is_certified: boolean;
    };
    reviews: Review[];
    statistics: {
      total_reviews: number;
      average_rating: number;
    };
    meta: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
      next_page: number | null;
      prev_page: number | null;
    };
  };
}

// Export Profile Types
export interface ExportProfileParams {
  start_date?: string; // YYYY-MM-DD format
  end_date?: string;   // YYYY-MM-DD format
  debug?: boolean;     // Set to true for HTML preview in development
}

export interface ExportProfileJSONResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      middle_name?: string;
      phone_no_call?: string;
      phone_no_text?: string;
      years_of_experience?: number;
      about_me?: string;
      skills?: string[];
      other_skills?: string;
      image_url?: string;
      created_at: string;
    };
    statistics: {
      date_range: {
        start_date: string;
        end_date: string;
      };
      favors_requested: {
        count: number;
        total_hours: number;
      };
      favors_provided: {
        count: number;
        total_hours: number;
      };
      monthly_unpaid_hours: Array<{
        month: string;
        hours: number;
      }>;
    };
  };
  message: string;
}

export const getProfile = async (): Promise<ProfileResponse> => {
  console.log(`[INIT] => /profile`);
  const response = await axiosInstance.get('/profile');
  console.log(`[OK] => /profile`);
  return response.data;
};

export const getPublicUserProfile = async (userId: number): Promise<PublicUserProfileResponse> => {
  try {
    console.log(`🚀 Making Get Public User Profile API call to: /users/${userId}`);
    
    const response = await axiosInstance.get(`/users/${userId}`);
    
    console.log('🎉 Get Public User Profile API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Public User Profile API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 404) {
      throw new Error('User not found');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to load user profile. Please check your connection and try again.');
    }
  }
};

export const getFavorProviderProfile = async (favorId: number): Promise<ProviderProfileResponse> => {
  try {
    console.log(`🚀 Making Get Favor Provider Profile API call to: /favors/${favorId}/provider_profile`);
    
    const response = await axiosInstance.get(`/favors/${favorId}/provider_profile`);
    
    console.log('🎉 Get Favor Provider Profile API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Favor Provider Profile API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 404) {
      throw new Error('Favor not found');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to load provider profile. Please check your connection and try again.');
    }
  }
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

export const exportProfilePDF = async (params?: ExportProfileParams): Promise<ExportProfileJSONResponse> => {
  try {
    console.log(`🚀 Making Export Profile Data API call to: /profile/export`);
    console.log('📤 Request Params:', JSON.stringify(params, null, 2));
    
    // Build query parameters (same as Postman)
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.debug) queryParams.append('debug', '1');
    
    // Use the JSON endpoint since PDF is not supported
    const url = `/profile/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await axiosInstance.get(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('🎉 Export Profile Data API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Response Type:', response.headers['content-type']);
    console.log('📄 Export Data Retrieved:', JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Export Profile Data API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', error.response?.data);
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.status === 500) {
      throw new Error('Failed to generate export data. Please try again later.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to export profile. Please check your connection and try again.');
    }
  }
};

export const exportProfileJSON = async (params?: ExportProfileParams): Promise<ExportProfileJSONResponse> => {
  try {
    console.log(`🚀 Making Export Profile JSON API call to: /profile/export`);
    console.log('📤 Request Params:', JSON.stringify(params, null, 2));
    
    // Build query parameters (same as Postman)
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.debug) queryParams.append('debug', '1');
    
    const url = `/profile/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await axiosInstance.get(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('🎉 Export Profile JSON API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Export Profile JSON API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.status === 500) {
      throw new Error('Failed to generate export data. Please try again later.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else { 
      throw new Error('Failed to export profile. Please check your connection and try again.');
    }
  }
};

export const getUserReviews = async (
  userId: number, 
  params: UserReviewsParams = {}
): Promise<UserReviewsResponse> => {
  try {
    console.log(`🚀 Making Get User Reviews API call to: /users/${userId}/reviews`);
    console.log('📤 Request Params:', JSON.stringify(params, null, 2));
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.role) queryParams.append('role', params.role);
    
    const url = `/users/${userId}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await axiosInstance.get(url);
    
    console.log('🎉 Get User Reviews API Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get User Reviews API Error!');
    console.error('📄 Full API Error:', error);
    console.error('📊 Error Response Status:', error.response?.status);
    console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error scenarios based on status codes
    if (error.response?.status === 404) {
      throw new Error('User not found');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to load user reviews. Please check your connection and try again.');
    }
  }
};