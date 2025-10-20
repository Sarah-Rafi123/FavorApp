import { Linking } from 'react-native';

export interface DeepLinkingConfig {
  returnUrl: string;
  refreshUrl: string;
}

export class DeepLinkingService {
  private static readonly SCHEME = 'favorapp'; // App scheme for actual deep linking
  private static readonly WEB_BASE_URL = 'https://your-domain.com'; // Replace with your actual domain
  
  /**
   * Get deep linking URLs for Stripe Connect onboarding
   * Uses web URLs that redirect to app scheme
   */
  static getStripeConnectUrls(): DeepLinkingConfig {
    // For development/testing, you can use a service like ngrok or your staging domain
    // For production, use your actual domain with redirect pages
    return {
      returnUrl: `${this.WEB_BASE_URL}/stripe-redirect?type=return&scheme=${this.SCHEME}`,
      refreshUrl: `${this.WEB_BASE_URL}/stripe-redirect?type=refresh&scheme=${this.SCHEME}`
    };
  }

  /**
   * Alternative: Use localhost for development (if backend supports it)
   */
  static getDevStripeConnectUrls(): DeepLinkingConfig {
    return {
      returnUrl: 'http://localhost:3000/stripe-redirect?type=return',
      refreshUrl: 'http://localhost:3000/stripe-redirect?type=refresh'
    };
  }

  /**
   * Open Stripe onboarding URL in browser
   */
  static async openStripeOnboarding(onboardingUrl: string): Promise<void> {
    try {
      console.log('🌐 Opening Stripe onboarding URL:', onboardingUrl);
      
      // Check if we can open the URL
      const canOpen = await Linking.canOpenURL(onboardingUrl);
      
      if (!canOpen) {
        throw new Error('Cannot open the payment setup URL on this device');
      }
      
      // Open URL in the system browser
      await Linking.openURL(onboardingUrl);
      
      console.log('📱 Opened Stripe onboarding in system browser');
    } catch (error) {
      console.error('❌ Failed to open Stripe onboarding:', error);
      throw new Error('Failed to open payment setup. Please try again.');
    }
  }

  /**
   * Handle deep link when app is opened from Stripe
   */
  static handleDeepLink(url: string): { type: 'stripe-return' | 'stripe-refresh' | 'unknown'; data?: any } {
    console.log('🔗 Handling deep link:', url);
    
    if (url.includes('stripe-return')) {
      console.log('✅ Stripe onboarding return detected');
      return { type: 'stripe-return' };
    } else if (url.includes('stripe-refresh')) {
      console.log('🔄 Stripe onboarding refresh detected');
      return { type: 'stripe-refresh' };
    }
    
    console.log('❓ Unknown deep link type');
    return { type: 'unknown' };
  }

  /**
   * Initialize deep link listeners
   */
  static initializeListeners(
    onStripeReturn: () => void,
    onStripeRefresh: () => void
  ): () => void {
    console.log('🎯 Initializing deep link listeners');
    
    // Handle deep links when app is already running
    const handleUrl = (event: { url: string }) => {
      const result = this.handleDeepLink(event.url);
      
      switch (result.type) {
        case 'stripe-return':
          onStripeReturn();
          break;
        case 'stripe-refresh':
          onStripeRefresh();
          break;
        default:
          console.log('Unhandled deep link:', event.url);
      }
    };

    // Add listener
    const subscription = Linking.addEventListener('url', handleUrl);

    // Handle initial URL if app was opened from deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('📱 App opened with initial URL:', url);
        handleUrl({ url });
      }
    });

    // Return cleanup function
    return () => {
      console.log('🧹 Cleaning up deep link listeners');
      subscription.remove();
    };
  }

  /**
   * Check if we can handle a specific URL scheme
   */
  static async canOpenURL(url: string): Promise<boolean> {
    try {
      return await Linking.canOpenURL(url);
    } catch (error) {
      console.error('❌ Error checking URL capability:', error);
      return false;
    }
  }
}