import { axiosInstance } from '../axiosConfig';

export interface LifetimeSlotsResponse {
  plan_name: string;
  slots_remaining: number;
  total_slots: number;
  slots_taken: number;
}

export interface LifetimeSlotsErrorResponse {
  error: string;
  slots_remaining: number;
}

/**
 * Get the current availability of lifetime plan slots
 */
export const getLifetimeSlots = async (): Promise<LifetimeSlotsResponse> => {
  try {
    console.log('🎫 Fetching lifetime slots availability...');
    
    const response = await axiosInstance.get('/plans/lifetime_slots_remaining');
    
    console.log('✅ Lifetime slots response:', {
      plan_name: response.data.plan_name,
      slots_remaining: response.data.slots_remaining,
      total_slots: response.data.total_slots,
      slots_taken: response.data.slots_taken
    });
    
    return response.data;
  } catch (error: any) {
    console.log('⚠️ Lifetime slots API not available:', error.message);
    
    // Handle 404 - Plan not found or API not implemented yet
    if (error.response?.status === 404 || error.message?.includes('Resource not found')) {
      console.log('ℹ️ Lifetime plan API not implemented yet, returning default values');
      return {
        plan_name: 'Lifetime Plan',
        slots_remaining: 0,
        total_slots: 100,
        slots_taken: 100
      };
    }
    
    // Handle network errors gracefully
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.log('ℹ️ Network error accessing lifetime slots API, returning default values');
      return {
        plan_name: 'Lifetime Plan',
        slots_remaining: 0,
        total_slots: 100,
        slots_taken: 100
      };
    }
    
    // For other errors, still return default to prevent app crashes
    console.log('ℹ️ Lifetime slots API error, returning default values');
    return {
      plan_name: 'Lifetime Plan',
      slots_remaining: 0,
      total_slots: 100,
      slots_taken: 100
    };
  }
};