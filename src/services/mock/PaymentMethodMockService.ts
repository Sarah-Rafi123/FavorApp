import { 
  SavePaymentMethodRequest, 
  SavePaymentMethodResponse, 
  ListPaymentMethodsResponse, 
  DeletePaymentMethodResponse,
  PaymentMethod 
} from '../apis/PaymentMethodApis';

class PaymentMethodMockService {
  private static paymentMethods: PaymentMethod[] = [];
  private static nextId = 1;

  private static generatePaymentMethodId(): string {
    return `pm_mock_${this.nextId++}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static createMockPaymentMethod(setupIntentId: string): PaymentMethod {
    const brands = ['visa', 'mastercard', 'amex'];
    const countries = ['US', 'CA', 'GB'];
    const fundings = ['credit', 'debit'];
    
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    
    return {
      id: this.generatePaymentMethodId(),
      type: 'card',
      card: {
        brand,
        last4,
        exp_month: Math.floor(1 + Math.random() * 12),
        exp_year: 2025 + Math.floor(Math.random() * 5),
        funding: fundings[Math.floor(Math.random() * fundings.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
      },
      billing_details: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: {
          city: 'San Francisco',
          country: 'US',
          line1: '123 Main St',
          line2: 'Apt 4B',
          postal_code: '94102',
          state: 'CA',
        },
      },
      is_default: this.paymentMethods.length === 0, // First one is default
      created_at: new Date().toISOString(),
    };
  }

  static async savePaymentMethod(data: SavePaymentMethodRequest): Promise<SavePaymentMethodResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Simulate potential error (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Mock save payment method failed');
    }

    // Validate setup_intent_id
    if (!data.setup_intent_id || !data.setup_intent_id.startsWith('seti_')) {
      throw new Error('Invalid setup intent ID');
    }

    const paymentMethod = this.createMockPaymentMethod(data.setup_intent_id);
    
    // Set all existing payment methods as non-default if this is the first
    if (paymentMethod.is_default) {
      this.paymentMethods.forEach(pm => pm.is_default = false);
    }
    
    this.paymentMethods.push(paymentMethod);

    const response: SavePaymentMethodResponse = {
      success: true,
      data: {
        payment_method: paymentMethod,
        is_default: paymentMethod.is_default,
      },
      message: 'Payment method added successfully',
    };

    console.log('Mock Payment Method Saved:', {
      payment_method_id: paymentMethod.id,
      is_default: paymentMethod.is_default,
      card_last4: paymentMethod.card.last4,
      card_brand: paymentMethod.card.brand,
    });

    return response;
  }

  static async listPaymentMethods(): Promise<ListPaymentMethodsResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    // Simulate potential error (3% chance)
    if (Math.random() < 0.03) {
      throw new Error('Mock list payment methods failed');
    }

    const hasPaymentMethod = this.paymentMethods.length > 0;
    const defaultPaymentMethod = this.paymentMethods.find(pm => pm.is_default);

    const response: ListPaymentMethodsResponse = {
      success: true,
      data: {
        payment_methods: [...this.paymentMethods], // Return copy
        has_payment_method: hasPaymentMethod,
        default_payment_method_id: defaultPaymentMethod?.id,
      },
      message: hasPaymentMethod ? null : 'No payment methods found',
    };

    console.log('Mock Payment Methods Listed:', {
      count: this.paymentMethods.length,
      has_payment_method: hasPaymentMethod,
      default_payment_method_id: defaultPaymentMethod?.id,
    });

    return response;
  }

  static async deletePaymentMethod(paymentMethodId: string): Promise<DeletePaymentMethodResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
    
    // Simulate potential error (3% chance)
    if (Math.random() < 0.03) {
      throw new Error('Mock delete payment method failed');
    }

    const index = this.paymentMethods.findIndex(pm => pm.id === paymentMethodId);
    
    if (index === -1) {
      throw new Error('Payment method not found');
    }

    const deletedPaymentMethod = this.paymentMethods[index];
    this.paymentMethods.splice(index, 1);

    // If we deleted the default payment method and there are others, set a new default
    if (deletedPaymentMethod.is_default && this.paymentMethods.length > 0) {
      this.paymentMethods[0].is_default = true;
    }

    const response: DeletePaymentMethodResponse = {
      success: true,
      data: {
        deleted_payment_method_id: paymentMethodId,
      },
      message: 'Payment method removed successfully',
    };

    console.log('Mock Payment Method Deleted:', {
      deleted_payment_method_id: paymentMethodId,
      was_default: deletedPaymentMethod.is_default,
      remaining_count: this.paymentMethods.length,
    });

    return response;
  }

  // Helper method to clear all payment methods (for testing)
  static clearAllPaymentMethods(): void {
    this.paymentMethods = [];
    this.nextId = 1;
    console.log('All mock payment methods cleared');
  }
}

export { PaymentMethodMockService };