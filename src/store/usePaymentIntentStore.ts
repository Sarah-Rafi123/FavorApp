import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentIntentData {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface PaymentIntentStore {
  paymentIntentData: PaymentIntentData | null;
  isLoading: boolean;
  error: string | null;
  
  setPaymentIntentData: (data: PaymentIntentData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPaymentIntentData: () => void;
  loadPaymentIntentFromStorage: () => Promise<void>;
}

const STORAGE_KEY = 'payment_intent_data';

export const usePaymentIntentStore = create<PaymentIntentStore>((set, get) => ({
  paymentIntentData: null,
  isLoading: false,
  error: null,

  setPaymentIntentData: async (data: PaymentIntentData) => {
    set({ paymentIntentData: data });
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Payment Intent data saved to AsyncStorage:', data);
    } catch (error) {
      console.error('Failed to save Payment Intent data to AsyncStorage:', error);
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setError: (error: string | null) => set({ error }),

  clearPaymentIntentData: async () => {
    set({ paymentIntentData: null, error: null });
    
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Payment Intent data cleared from AsyncStorage');
    } catch (error) {
      console.error('Failed to clear Payment Intent data from AsyncStorage:', error);
    }
  },

  loadPaymentIntentFromStorage: async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        set({ paymentIntentData: parsedData });
        console.log('📱 Payment Intent data loaded from AsyncStorage:', parsedData);
      } else {
        console.log('📱 No Payment Intent data found in AsyncStorage');
      }
    } catch (error) {
      console.error('Failed to load Payment Intent data from AsyncStorage:', error);
      set({ error: 'Failed to load payment data' });
    }
  },
}));