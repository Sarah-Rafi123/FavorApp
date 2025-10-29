import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useStripeConnect } from '../../hooks/useStripeConnect';
import { StripeConnectWebView } from '../overlays/StripeConnectWebView';

interface StripeConnectWebViewExampleProps {
  onSetupComplete?: () => void;
}

/**
 * Example component showing how to integrate the new StripeConnect WebView
 * This replaces the old external browser approach
 */
export function StripeConnectWebViewExample({ onSetupComplete }: StripeConnectWebViewExampleProps) {
  const {
    showWebView,
    onboardingUrl,
    loading,
    startSetup,
    handleWebViewSuccess,
    handleWebViewClose,
  } = useStripeConnect();

  const handleSetupPayment = () => {
    startSetup(onSetupComplete);
  };

  return (
    <View>
      {/* Button to trigger payment setup */}
      <TouchableOpacity 
        className="bg-[#44A27B] rounded-full py-4 px-6"
        onPress={handleSetupPayment}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Loading...' : 'Setup Payment Account'}
        </Text>
      </TouchableOpacity>

      {/* WebView Modal */}
      <StripeConnectWebView
        visible={showWebView}
        onClose={handleWebViewClose}
        onSuccess={handleWebViewSuccess}
        onboardingUrl={onboardingUrl}
      />
    </View>
  );
}

/**
 * How to integrate into existing screens:
 * 
 * 1. Replace direct StripeConnectManager calls with useStripeConnect hook
 * 2. Add StripeConnectWebView component to your screen
 * 3. Update validation logic to use the new WebView approach
 * 
 * Before (old approach):
 * ```typescript
 * const stripeConnectManager = StripeConnectManager.getInstance();
 * await stripeConnectManager.setupPaymentAccount(onSetupComplete);
 * ```
 * 
 * After (new WebView approach):
 * ```typescript
 * const { startSetup, showWebView, ... } = useStripeConnect();
 * 
 * // Trigger setup
 * await startSetup(onSetupComplete);
 * 
 * // Add to JSX
 * <StripeConnectWebView
 *   visible={showWebView}
 *   onClose={handleWebViewClose}
 *   onSuccess={handleWebViewSuccess}
 *   onboardingUrl={onboardingUrl}
 * />
 * ```
 */