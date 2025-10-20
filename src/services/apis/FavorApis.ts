import { axiosInstance } from '../axiosConfig';

// Types
export interface FavorUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_certified: boolean;
  years_of_experience?: number;
  about_me?: string;
  skills?: string[];
  member_since?: string;
  rating?: number;
}

export interface FavorSubject {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Favor {
  id: number;
  title?: string;
  description: string;
  address: string;
  tip: string | number;
  additional_tip?: string | number;
  favor_pay: boolean;
  priority: 'immediate' | 'delayed' | 'no_rush';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  is_active: boolean;
  time_to_complete?: string;
  city: string;
  state: string;
  lat_lng?: string;
  created_at: string;
  updated_at: string;
  user: FavorUser;
  favor_subject: FavorSubject;
  image_url?: string;
  responses_count: number;
  pending_responses_count: number;
  accepted_response?: any;
  can_edit: boolean;
  can_apply: boolean;
  has_applied: boolean;
}

export interface FavorApplicant {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  user: FavorUser;
}

// Request/Response Types
export interface ListFavorsResponse {
  success: boolean;
  data: {
    favors: Favor[];
    meta: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
      next_page: number | null;
      prev_page: number | null;
    };
  };
  message?: string;
}

export interface GetFavorResponse {
  success: boolean;
  data: {
    favor: Favor;
  };
}

export interface ReassignFavorResponse {
  success: boolean;
  data: {
    favor: Favor;
  };
  message: string;
}

export interface GetFavorApplicantsResponse {
  success: boolean;
  data: {
    favor: {
      id: number;
      title?: string;
      status: string;
    };
    applicants: FavorApplicant[];
  };
}

export interface CreateFavorRequest {
  description: string;
  address: string;
  priority: 'immediate' | 'delayed' | 'no_rush';
  favor_subject_id: number | 'other';
  favor_pay: '0' | '1'; // 0 = paid, 1 = free
  city: string;
  state: string;
  time_to_complete?: string;
  tip?: number;
  additional_tip?: number;
  lat_lng?: string;
  other_subject_name?: string;
}

export interface CreateFavorFormData extends FormData {
  // For multipart/form-data requests with images
}

export interface UpdateFavorRequest {
  description?: string;
  address?: string;
  priority?: 'immediate' | 'delayed' | 'no_rush';
  favor_subject_id?: number | 'other';
  favor_pay?: '0' | '1';
  city?: string;
  state?: string;
  time_to_complete?: string;
  tip?: number;
  additional_tip?: number;
  lat_lng?: string;
  other_subject_name?: string;
  remove_image?: '1';
}

export interface BrowseFavorsParams {
  priority?: ('immediate' | 'delayed' | 'no_rush')[];
  type?: ('paid' | 'unpaid')[]; // paid: favor_pay=false AND tip>0, unpaid: favor_pay=true OR tip=0
  member_type?: ('verified' | 'non_verified')[];
  category?: string[];
  page?: number;
  per_page?: number;
}

export interface MyFavorsParams {
  type?: 'requested' | 'providing';
  tab?: 'active' | 'in-progress' | 'completed' | 'cancelled';
  category?: string[];
  page?: number;
  per_page?: number;
}

export interface FavorApplication {
  id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ApplyToFavorResponse {
  success: boolean;
  data: {
    favor: Favor;
    application: FavorApplication;
  };
  message: string;
}

export interface FavorApplicationError {
  success: false;
  errors: string[];
  message: string;
}

// API Implementation
export const FavorApis = {
  // 1. List Available Favors (Basic)
  listFavors: async (page = 1, per_page = 12): Promise<ListFavorsResponse> => {
    const response = await axiosInstance.get('/favors', {
      params: { page, per_page }
    });
    return response.data;
  },

  // 2. Browse Favors (Advanced with Filters)
  browseFavors: async (params: BrowseFavorsParams): Promise<ListFavorsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.priority) {
      params.priority.forEach(p => queryParams.append('priority[]', p));
    }
    if (params.type) {
      params.type.forEach(t => queryParams.append('type[]', t));
    }
    if (params.member_type) {
      params.member_type.forEach(mt => queryParams.append('member_type[]', mt));
    }
    if (params.category) {
      params.category.forEach(c => queryParams.append('category[]', c));
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());

    const response = await axiosInstance.get(`/favors/browse?${queryParams.toString()}`);
    return response.data;
  },

  // 3. Get My Favors
  getMyFavors: async (params: MyFavorsParams): Promise<ListFavorsResponse> => {
    const queryParams = new URLSearchParams();
    
    queryParams.append('type', params.type || 'requested');
    queryParams.append('tab', params.tab || 'active');
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('per_page', (params.per_page || 10).toString());
    
    // Add category filters if provided
    if (params.category) {
      params.category.forEach(c => queryParams.append('category[]', c));
    }

    const response = await axiosInstance.get(`/favors/my_favors?${queryParams.toString()}`);
    return response.data;
  },

  // 4. View Specific Favor
  getFavor: async (id: number): Promise<GetFavorResponse> => {
    const response = await axiosInstance.get(`/favors/${id}`);
    return response.data;
  },

  // 5. View Favor Applicants (Owner Only)
  getFavorApplicants: async (id: number): Promise<GetFavorApplicantsResponse> => {
    const response = await axiosInstance.get(`/favors/${id}/applicants`);
    return response.data;
  },

  // 6. Create Favor (JSON)
  createFavor: async (data: CreateFavorRequest): Promise<GetFavorResponse> => {
    const response = await axiosInstance.post('/favors', { favor: data });
    return response.data;
  },

  // 6. Create Favor (Form Data with Image)
  createFavorWithImage: async (formData: CreateFavorFormData): Promise<GetFavorResponse> => {
    const response = await axiosInstance.post('/favors', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 7. Edit Favor
  updateFavor: async (id: number, data: UpdateFavorRequest): Promise<GetFavorResponse> => {
    const response = await axiosInstance.patch(`/favors/${id}`, { favor: data });
    return response.data;
  },

  // 7. Edit Favor with Image (Form Data)
  updateFavorWithImage: async (id: number, formData: FormData): Promise<GetFavorResponse> => {
    const response = await axiosInstance.patch(`/favors/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 8. Apply to Favor
  applyToFavor: async (favorId: number): Promise<ApplyToFavorResponse> => {
    try {
      console.log('🚀 Making Apply to Favor API call to: /favors/' + favorId + '/apply');
      const response = await axiosInstance.post(`/favors/${favorId}/apply`);
      
      console.log('🎉 Apply to Favor API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Apply to Favor API Error!');
      console.error('📄 Full API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle specific error scenarios based on status codes
      if (error.response?.status === 422) {
        const errorData = error.response?.data;
        if (errorData?.errors?.includes('You cannot apply to your own favor')) {
          throw new Error('You cannot apply to your own favor');
        } else if (errorData?.errors?.includes('This favor is no longer available')) {
          throw new Error('This favor is no longer available');
        } else if (errorData?.errors?.includes('You have already applied to this favor')) {
          throw new Error('You have already applied to this favor');
        } else if (errorData?.errors?.includes('You are already the accepted provider for this favor')) {
          throw new Error('You are already the accepted provider for this favor');
        } else {
          throw new Error(errorData?.message || 'Cannot apply to this favor');
        }
      } else if (error.response?.status === 402) {
        const errorData = error.response?.data;
        if (errorData?.errors?.includes('To accept payments, please set up your payment account in your profile')) {
          throw new Error('Payment account required. Please set up your payment account in your profile.');
        } else if (errorData?.errors?.includes('Your payment account setup is incomplete')) {
          throw new Error('Payment account setup incomplete. Please complete your payment account setup.');
        } else {
          throw new Error('Payment setup required to apply to paid favors');
        }
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to apply to favor. Please try again.');
      }
    }
  },

  // 9. Delete Favor
  deleteFavor: async (favorId: number, type: 'active' | 'history' = 'active'): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🚀 Making Delete Favor API call to: /favors/' + favorId + '?type=' + type);
      const response = await axiosInstance.delete(`/favors/${favorId}`, {
        params: { type }
      });
      
      console.log('🎉 Delete Favor API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Delete Favor API Error!');
      console.error('📄 Full API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle specific error scenarios based on status codes
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to delete this favor.');
      } else if (error.response?.status === 404) {
        throw new Error('Favor not found.');
      } else if (error.response?.status === 422) {
        const errorData = error.response?.data;
        throw new Error(errorData?.message || 'Cannot delete this favor at this time.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to delete favor. Please try again.');
      }
    }
  },

  // 11. Reassign Favor
  reassignFavor: async (favorId: number, newProviderId: number): Promise<ReassignFavorResponse> => {
    try {
      console.log('🚀 Making Reassign Favor API call to: /favors/' + favorId + '/reassign/' + newProviderId);
      const response = await axiosInstance.post(`/favors/${favorId}/reassign/${newProviderId}`);
      
      console.log('🎉 Reassign Favor API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Reassign Favor API Error!');
      console.error('📄 Full API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle specific error scenarios based on status codes
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to reassign this favor.');
      } else if (error.response?.status === 404) {
        throw new Error('Favor or new provider not found.');
      } else if (error.response?.status === 422) {
        const errorData = error.response?.data;
        throw new Error(errorData?.message || 'Cannot reassign this favor at this time.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to reassign favor. Please try again.');
      }
    }
  },

  // 14. Cancel Request
  cancelRequest: async (favorId: number): Promise<{ success: boolean; data: {}; message: string }> => {
    try {
      console.log('🚀 Making Cancel Request API call to: /favors/' + favorId + '/cancel_request');
      const response = await axiosInstance.post(`/favors/${favorId}/cancel_request`);
      
      console.log('🎉 Cancel Request API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Cancel Request API Error!');
      console.error('📄 Full API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle specific error scenarios based on status codes
      if (error.response?.status === 422) {
        const errorData = error.response?.data;
        if (errorData?.errors?.includes('Failed to cancel favor request')) {
          throw new Error('Failed to cancel favor request. Please try again.');
        } else {
          throw new Error(errorData?.message || 'Cannot cancel request at this time.');
        }
      } else if (error.response?.status === 403) {
        throw new Error('You are not authorized to cancel this request.');
      } else if (error.response?.status === 404) {
        throw new Error('Favor request not found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to cancel request. Please try again.');
      }
    }
  },
};

