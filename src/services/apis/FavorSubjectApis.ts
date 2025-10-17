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
  };
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
        name: 'Moving Help',
        is_active: true,
        description: 'Help with moving furniture, boxes, and household items',
        icon: '📦',
      },
      {
        id: 2,
        name: 'Yard Work',
        is_active: true,
        description: 'Garden cleanup, lawn mowing, leaf removal',
        icon: '🌱',
      },
      {
        id: 3,
        name: 'Plumbing',
        is_active: true,
        description: 'Plumbing repairs and installations',
        icon: '🔧',
      },
      {
        id: 4,
        name: 'Electrical',
        is_active: true,
        description: 'Electrical repairs and installations',
        icon: '⚡',
      },
      {
        id: 5,
        name: 'Cleaning',
        is_active: true,
        description: 'House cleaning, deep cleaning, organization',
        icon: '🧹',
      },
      {
        id: 6,
        name: 'Painting',
        is_active: true,
        description: 'Interior and exterior painting services',
        icon: '🎨',
      },
      {
        id: 7,
        name: 'Pet Care',
        is_active: true,
        description: 'Pet sitting, dog walking, pet grooming',
        icon: '🐕',
      },
      {
        id: 8,
        name: 'Handyman',
        is_active: true,
        description: 'General handyman services and repairs',
        icon: '🔨',
      },
      {
        id: 9,
        name: 'Delivery',
        is_active: true,
        description: 'Package delivery, grocery pickup, errands',
        icon: '📦',
      },
      {
        id: 10,
        name: 'Tech Support',
        is_active: true,
        description: 'Computer setup, tech troubleshooting',
        icon: '💻',
      },
      {
        id: 11,
        name: 'Tutoring',
        is_active: true,
        description: 'Academic tutoring and teaching',
        icon: '📚',
      },
      {
        id: 12,
        name: 'Event Help',
        is_active: true,
        description: 'Event setup, party assistance, catering help',
        icon: '🎉',
      },
    ];

    return {
      success: true,
      data: {
        favor_subjects: mockSubjects,
      },
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