import { useState } from 'react';
import { StripeConnectManager } from '../services/StripeConnectManager';

export function useStripeConnect() {
  const [showWebView, setShowWebView] = useState(false);
  const [onboardingUrl, setOnboardingUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const startSetup = async (onSetupComplete?: () => void) => {
    try {
      setLoading(true);
      const stripeManager = StripeConnectManager.getInstance();
      
      // Get the onboarding URL
      const url = await stripeManager.setupPaymentAccount();
      
      setOnboardingUrl(url);
      setShowWebView(true);
      setLoading(false);
      
      // Store the completion callback for later use
      if (onSetupComplete) {
        // We'll call this when WebView completes
        (window as any).__stripeSetupComplete = onSetupComplete;
      }
      
    } catch (error) {
      setLoading(false);
      console.error('Failed to start Stripe setup:', error);
    }
  };

  const handleWebViewSuccess = async () => {
    // Check account status after WebView completion
    const stripeManager = StripeConnectManager.getInstance();
    
    // Call the stored completion callback if available
    const onSetupComplete = (window as any).__stripeSetupComplete;
    if (onSetupComplete) {
      await stripeManager.checkAccountStatusAfterSetup(onSetupComplete);
      delete (window as any).__stripeSetupComplete;
    } else {
      await stripeManager.checkAccountStatusAfterSetup();
    }
  };

  const handleWebViewClose = () => {
    setShowWebView(false);
    setOnboardingUrl('');
    // Clean up the stored callback
    delete (window as any).__stripeSetupComplete;
  };

  return {
    showWebView,
    onboardingUrl,
    loading,
    startSetup,
    handleWebViewSuccess,
    handleWebViewClose,
  };
}