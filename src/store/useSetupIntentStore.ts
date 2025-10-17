import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SetupIntentData {
  client_secret: string;
  setup_intent_id: string;
  customer_id: string;
}

interface SetupIntentStore {
  setupIntentData: SetupIntentData | null;
  isSetupIntentLoading: boolean;
  setupIntentError: string | null;
  
  // Actions
  setSetupIntentData: (data: SetupIntentData) => Promise<void>;
  clearSetupIntentData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadSetupIntentFromStorage: () => Promise<void>;
}

const SETUP_INTENT_STORAGE_KEY = 'setup_intent_data';

export const useSetupIntentStore = create<SetupIntentStore>((set, get) => ({
  setupIntentData: null,
  isSetupIntentLoading: false,
  setupIntentError: null,

  setSetupIntentData: async (data: SetupIntentData) => {
    try {
      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem(SETUP_INTENT_STORAGE_KEY, JSON.stringify(data));
      
      set({ 
        setupIntentData: data, 
        setupIntentError: null 
      });
      
      console.log('Setup Intent data stored successfully');
    } catch (error) {
      console.error('Failed to store setup intent data:', error);
      set({ setupIntentError: 'Failed to store payment setup data' });
    }
  },

  clearSetupIntentData: async () => {
    try {
      await AsyncStorage.removeItem(SETUP_INTENT_STORAGE_KEY);
      set({ 
        setupIntentData: null, 
        setupIntentError: null 
      });
      console.log('Setup Intent data cleared');
    } catch (error) {
      console.error('Failed to clear setup intent data:', error);
    }
  },

  setLoading: (loading: boolean) => {
    set({ isSetupIntentLoading: loading });
  },

  setError: (error: string | null) => {
    set({ setupIntentError: error });
  },

  loadSetupIntentFromStorage: async () => {
    try {
      const storedData = await AsyncStorage.getItem(SETUP_INTENT_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData) as SetupIntentData;
        set({ setupIntentData: parsedData });
        console.log('Setup Intent data loaded from storage');
      }
    } catch (error) {
      console.error('Failed to load setup intent data from storage:', error);
      // Clear corrupted data
      await AsyncStorage.removeItem(SETUP_INTENT_STORAGE_KEY);
    }
  },
}));