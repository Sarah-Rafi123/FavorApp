import { SetupIntentResponse } from '../apis/SetupIntentApis';

export class SetupIntentMockService {
  private static generateClientSecret(): string {
    // Generate more realistic Stripe client secret format
    const setupIntentId = Math.random().toString(36).substring(2, 11);
    const secretPart = Math.random().toString(36).substring(2, 25);
    return `seti_1${setupIntentId}_secret_${secretPart}`;
  }

  private static generateSetupIntentId(): string {
    // Generate a more realistic Stripe SetupIntent ID format
    // Real Stripe IDs are longer and use specific character patterns
    const randomPart1 = Math.random().toString(36).substring(2, 10);
    const randomPart2 = Math.random().toString(36).substring(2, 10);
    const randomPart3 = Math.random().toString(36).substring(2, 10);
    return `seti_1${randomPart1}${randomPart2}${randomPart3}`;
  }

  private static generateCustomerId(): string {
    return `cus_${Math.random().toString(36).substring(2, 18)}`;
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