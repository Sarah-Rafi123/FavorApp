import axios from 'axios';
import { PaymentMockService } from '../mock/PaymentMockService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
const USE_MOCK_SERVICE = process.env.EXPO_PUBLIC_USE_MOCK_PAYMENTS === 'true' || !process.env.EXPO_PUBLIC_API_BASE_URL;

const paymentAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents (e.g., $10.00 = 1000)
  currency: string; // e.g., 'usd'
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export const PaymentApis = {
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
    if (USE_MOCK_SERVICE) {
      return PaymentMockService.createPaymentIntent(data);
    }
    const response = await paymentAxios.post('/payments/create-intent', data);
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string): Promise<PaymentIntentResponse> => {
    if (USE_MOCK_SERVICE) {
      return PaymentMockService.confirmPayment(paymentIntentId);
    }
    const response = await paymentAxios.post(`/payments/confirm/${paymentIntentId}`);
    return response.data;
  },

  getPaymentIntent: async (paymentIntentId: string): Promise<PaymentIntentResponse> => {
    if (USE_MOCK_SERVICE) {
      throw new Error('Mock service does not support getPaymentIntent');
    }
    const response = await paymentAxios.get(`/payments/${paymentIntentId}`);
    return response.data;
  },
};