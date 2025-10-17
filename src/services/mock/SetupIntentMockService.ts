import { SetupIntentResponse } from '../apis/SetupIntentApis';

export class SetupIntentMockService {
  private static generateClientSecret(): string {
    return `seti_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 16)}`;
  }

  private static generateSetupIntentId(): string {
    return `seti_${Math.random().toString(36).substr(2, 16)}`;
  }

  private static generateCustomerId(): string {
    return `cus_${Math.random().toString(36).substr(2, 16)}`;
  }

  static async createSetupIntent(): Promise<SetupIntentResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Simulate potential error (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Mock setup intent creation failed');
    }

    const setupIntentResponse: SetupIntentResponse = {
      success: true,
      data: {
        client_secret: this.generateClientSecret(),
        setup_intent_id: this.generateSetupIntentId(),
        customer_id: this.generateCustomerId(),
      },
      message: 'Setup intent created successfully',
    };

    console.log('Mock Setup Intent Created:', {
      setup_intent_id: setupIntentResponse.data.setup_intent_id,
      customer_id: setupIntentResponse.data.customer_id,
      hasClientSecret: !!setupIntentResponse.data.client_secret,
    });

    return setupIntentResponse;
  }
}