import { create } from 'zustand';
import { BrowseFavorsParams } from '../services/apis/FavorApis';

export interface FilterState {
  priority: ('immediate' | 'delayed' | 'no_rush')[];
  type: ('paid' | 'unpaid')[]; // paid: favor_pay=false AND tip>0, unpaid: favor_pay=true OR tip=0
  memberType: ('verified' | 'non_verified')[];
  category: string[];
}

interface FilterStore {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilter: (key: keyof FilterState, value: string) => void;
  clearFilters: () => void;
  getFilterCount: () => number;
  hasActiveFilters: () => boolean;
  toBrowseParams: (page?: number, per_page?: number) => BrowseFavorsParams;
}

const defaultFilters: FilterState = {
  priority: [],
  type: [],
  memberType: [],
  category: [],
};

const useFilterStore = create<FilterStore>((set, get) => ({
  filters: defaultFilters,
  
  setFilters: (filters: FilterState) => set({ filters }),
  
  updateFilter: (key: keyof FilterState, value: string) => {
    const { filters } = get();
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    set({
      filters: {
        ...filters,
        [key]: newValues,
      },
    });
  },
  
  clearFilters: () => set({ filters: defaultFilters }),
  
  getFilterCount: () => {
    const { filters } = get();
    return Object.values(filters).reduce((count, arr) => count + arr.length, 0);
  },
  
  hasActiveFilters: () => {
    return get().getFilterCount() > 0;
  },
  
  toBrowseParams: (page = 1, per_page = 20) => {
    const { filters } = get();
    const params: BrowseFavorsParams = { page, per_page };
    
    if (filters.priority.length > 0) {
      params.priority = filters.priority;
    }
    if (filters.type.length > 0) {
      params.type = filters.type;
    }
    if (filters.memberType.length > 0) {
      // Convert UI values to API values
      params.member_type = filters.memberType.map(type => 
        type === 'verified' ? 'verified' : 'non_verified'
      ) as ('verified' | 'non_verified')[];
    }
    if (filters.category.length > 0) {
      params.category = filters.category;
    }
    
    return params;
  },
}));

export default useFilterStore;