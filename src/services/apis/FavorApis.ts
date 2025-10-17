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
  type?: ('paid' | 'unpaid')[];
  member_type?: ('verified' | 'non_verified')[];
  category?: string[];
  page?: number;
  per_page?: number;
}

export interface MyFavorsParams {
  type?: 'requested' | 'providing';
  tab?: 'active' | 'in-progress' | 'completed' | 'cancelled';
  page?: number;
  per_page?: number;
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
    const response = await axiosInstance.get('/favors/my_favors', {
      params: {
        type: params.type || 'requested',
        tab: params.tab || 'active',
        page: params.page || 1,
        per_page: params.per_page || 10
      }
    });
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
};

