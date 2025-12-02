import { axiosInstance } from '../axiosConfig';

// Types
export interface FavorSubject {
  id: number;
  name: string;
  is_active: boolean;
  description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ListFavorSubjectsResponse {
  success: boolean;
  data: {
    favor_subjects: FavorSubject[];
    total_count: number;
  };
  message: string;
}

export interface GetFavorSubjectResponse {
  success: boolean;
  data: {
    favor_subject: FavorSubject;
  };
}

// API Implementation
export const FavorSubjectApis = {
  // Get all favor subjects/categories
  listFavorSubjects: async (): Promise<ListFavorSubjectsResponse> => {
    const response = await axiosInstance.get('/favor_subjects');
    return response.data;
  },

  // Get a specific favor subject
  getFavorSubject: async (id: number): Promise<GetFavorSubjectResponse> => {
    const response = await axiosInstance.get(`/favor_subjects/${id}`);
    return response.data;
  },
};

// Mock Services for Development
export const FavorSubjectMockService = {
  listFavorSubjects: async (): Promise<ListFavorSubjectsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockSubjects: FavorSubject[] = [
      {
        id: 1,
        name: 'Lifting',
        is_active: true,
        description: 'Help with lifting heavy items',
        icon: '💪',
      },
      {
        id: 2,
        name: 'Gardening',
        is_active: true,
        description: 'Garden work and landscaping assistance',
        icon: '🌱',
      },
      {
        id: 3,
        name: 'Technical',
        is_active: true,
        description: 'Technical support and repairs',
        icon: '⚡',
      },
      {
        id: 4,
        name: 'Moving',
        is_active: true,
        description: 'Moving assistance and transportation',
        icon: '📦',
      },
      {
        id: 5,
        name: 'Assisting',
        is_active: true,
        description: 'General assistance and helping hands',
        icon: '🤝',
      },
      {
        id: 6,
        name: 'Opening',
        is_active: true,
        description: 'Opening services and access help',
        icon: '🔑',
      },
      {
        id: 7,
        name: 'Maintenance',
        is_active: true,
        description: 'Maintenance and repair services',
        icon: '🔨',
      },
    ];

    return {
      success: true,
      data: {
        favor_subjects: mockSubjects,
        total_count: mockSubjects.length,
      },
      message: "Favor subjects retrieved successfully",
    };
  },

  getFavorSubject: async (id: number): Promise<GetFavorSubjectResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const subjects = await FavorSubjectMockService.listFavorSubjects();
    const subject = subjects.data.favor_subjects.find(s => s.id === id);
    
    if (!subject) {
      throw new Error('Favor subject not found');
    }

    return {
      success: true,
      data: {
        favor_subject: subject,
      },
    };
  },
};