import { Alert } from 'react-native';
import { DeepLinkingService } from './DeepLinkingService';
import { StripeConnectApis } from './apis/StripeConnectApis';

export interface StripeConnectStatus {
  hasAccount: boolean;
  canReceivePayments: boolean;
  needsOnboarding: boolean;
  accountId?: string;
  message: string;
}

export class StripeConnectManager {
  private static instance: StripeConnectManager;

  private constructor() {}

  static getInstance(): StripeConnectManager {
    if (!StripeConnectManager.instance) {
      StripeConnectManager.instance = new StripeConnectManager();
    }
    return StripeConnectManager.instance;
  }

  /**
   * Complete flow: Setup payment account for providers
   */
  async setupPaymentAccount(onSetupComplete?: () => void): Promise<void> {
    try {
      console.log('🚀 Starting Stripe Connect setup flow...');
      
      // Step 1: Call setup API without custom URLs (let backend handle defaults)
      // This avoids the "Not a valid URL" error for development
      const setupResponse = await StripeConnectApis.setup();
      console.log('✅ Setup API response:', setupResponse);
      
      // Step 2: Open onboarding URL
      await DeepLinkingService.openStripeOnboarding(setupResponse.data.onboarding_url);
      
      // Step 3: Show instruction to user
      Alert.alert(
        'Complete Setup',
        'Complete your payment account setup in the browser, then return to the app and check your account status.',
        [
          { text: 'OK' },
          { 
            text: 'Check Status', 
            onPress: () => this.checkAccountStatusAfterSetup(onSetupComplete)
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Setup payment account failed:', error);
      Alert.alert(
        'Setup Failed',
        error.message || 'Failed to setup payment account. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Check if user can apply to paid favors
   */
  async canApplyToPaidFavor(): Promise<boolean> {
    try {
      const statusResponse = await StripeConnectApis.getAccountStatus();
      return statusResponse.data.can_receive_payments;
    } catch (error) {
      console.error('❌ Failed to check account status:', error);
      return false;
    }
  }

  /**
   * Get detailed account status
   */
  async getAccountStatus(): Promise<StripeConnectStatus> {
    try {
      const statusResponse = await StripeConnectApis.getAccountStatus();
      const data = statusResponse.data;
      
      return {
        hasAccount: data.has_account,
        canReceivePayments: data.can_receive_payments,
        needsOnboarding: data.has_account && !data.onboarding_complete,
        accountId: data.account_id,
        message: data.message
      };
    } catch (error: any) {
      console.error('❌ Failed to get account status:', error);
      return {
        hasAccount: false,
        canReceivePayments: false,
        needsOnboarding: false,
        message: error.message || 'Failed to check account status'
      };
    }
  }

  /**
   * Get balance for providers
   */
  async getBalance(): Promise<{ available: number; pending: number; currency: string } | null> {
    try {
      const balanceResponse = await StripeConnectApis.getBalance();
      const data = balanceResponse.data;
      
      return {
        available: data.available,
        pending: data.pending,
        currency: data.currency
      };
    } catch (error) {
      console.error('❌ Failed to get balance:', error);
      return null;
    }
  }

  /**
   * Check account status after user completes setup
   */
  async checkAccountStatusAfterSetup(onSetupComplete?: () => void): Promise<void> {
    try {
      console.log('🔍 Checking account status after setup...');
      const status = await this.getAccountStatus();
      
      if (status.canReceivePayments) {
        Alert.alert(
          'Setup Complete! 🎉',
          'Your payment account is fully verified. You can now apply to paid favors!',
          [{ 
            text: 'Great!',
            onPress: () => {
              // Call the completion callback if provided
              if (onSetupComplete) {
                console.log('🎯 Calling onSetupComplete callback');
                onSetupComplete();
              }
            }
          }]
        );
      } else if (status.hasAccount && !status.canReceivePayments) {
        Alert.alert(
          'Setup In Progress ⏳',
          'Your account is being processed. This can take a few minutes. Please try again shortly.',
          [
            { text: 'OK' },
            { 
              text: 'Check Again', 
              onPress: () => this.checkAccountStatusAfterSetup()
            }
          ]
        );
      } else {
        Alert.alert(
          'Setup Needed',
          'Please complete your payment account setup to receive payments.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Setup Now', 
              onPress: () => this.setupPaymentAccount()
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error checking account status:', error);
      Alert.alert(
        'Check Failed',
        'Unable to check account status. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Validate before applying to paid favor
   */
  async validateBeforeApplying(favorTip: number, onSetupComplete?: () => void): Promise<boolean> {
    if (favorTip === 0) {
      // Free favor - no validation needed
      return true;
    }

    const canReceive = await this.canApplyToPaidFavor();
    
    if (!canReceive) {
      Alert.alert(
        'Payment Account Required',
        'Set up your payment account to apply to paid favors',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Set Up Now', 
            onPress: () => this.setupPaymentAccount(onSetupComplete)
          }
        ]
      );
      return false;
    }

    return true;
  }


  /**
   * Cleanup when component unmounts (simplified - no deep linking cleanup needed)
   */
  cleanup(): void {
    // Currently no cleanup needed since we're using a simpler manual status check approach
    console.log('🧹 StripeConnectManager cleanup called');
  }
}