import { CreatePaymentIntentRequest, PaymentIntentResponse } from '../apis/PaymentApis';

export class PaymentMockService {
  private static generateClientSecret(): string {
    return `pi_test_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generatePaymentIntentId(): string {
    return `pi_test_${Math.random().toString(36).substr(2, 16)}`;
  }

  static async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Note: Random error simulation removed for better development experience
    // You can uncomment the lines below to test error handling:
    // if (Math.random() < 0.05) {
    //   throw new Error('Mock payment intent creation failed');
    // }

    const paymentIntent: PaymentIntentResponse = {
      id: this.generatePaymentIntentId(),
      clientSecret: this.generateClientSecret(),
      amount: data.amount,
      currency: data.currency,
      status: 'requires_payment_method',
    };

    console.log('Mock Payment Intent Created:', paymentIntent);
    return paymentIntent;
  }

  static async confirmPayment(paymentIntentId: string): Promise<PaymentIntentResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Note: Random error simulation removed for better development experience
    // You can uncomment the lines below to test error handling:
    // if (Math.random() < 0.03) {
    //   throw new Error('Mock payment confirmation failed');
    // }

    const confirmedPayment: PaymentIntentResponse = {
      id: paymentIntentId,
      clientSecret: this.generateClientSecret(),
      amount: 1000, // Mock amount
      currency: 'usd',
      status: 'succeeded',
    };

    console.log('Mock Payment Confirmed:', confirmedPayment);
    return confirmedPayment;
  }
}