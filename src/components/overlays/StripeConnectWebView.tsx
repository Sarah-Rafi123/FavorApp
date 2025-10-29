import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import BackSvg from '../../assets/icons/Back';

interface StripeConnectWebViewProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onboardingUrl: string;
}

export function StripeConnectWebView({ 
  visible, 
  onClose, 
  onSuccess, 
  onboardingUrl 
}: StripeConnectWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleNavigationStateChange = (navState: any) => {
    console.log('🌐 WebView navigation:', navState.url);
    setCanGoBack(navState.canGoBack);
    
    // More comprehensive URL detection for Stripe completion
    const completionPatterns = [
      'stripe-redirect',
      'stripe-return', 
      'return',
      'refresh',
      'success',
      'complete',
      'favorapp.net',  // Your API domain
      'favorapp.com',  // Your app domain
      '/stripe-success',
      '/stripe-complete',
      'onboarding_complete',
      'account_complete'
    ];
    
    const isCompleted = completionPatterns.some(pattern => 
      navState.url.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isCompleted) {
      console.log('✅ Stripe onboarding completed, closing WebView');
      console.log('🔗 Completion URL:', navState.url);
      
      // Give user feedback and close
      setTimeout(() => {
        Alert.alert(
          'Setup Complete!',
          'Your payment account setup is being processed. We\'ll check your status now.',
          [
            {
              text: 'OK',
              onPress: () => {
                onClose(); // Close WebView first
                onSuccess(); // Then execute success callback
              }
            }
          ]
        );
      }, 1000);
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Close Setup?',
      'Are you sure you want to close the payment setup? You can complete it later.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        { 
          text: 'Close', 
          style: 'destructive',
          onPress: onClose 
        }
      ]
    );
  };

  const handleGoBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const handleError = (error: any) => {
    console.error('❌ WebView error:', error);
    setLoading(false);
    Alert.alert(
      'Loading Error',
      'Failed to load payment setup. Please try again.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <StatusBar barStyle="light-content" backgroundColor="#44A27B" />
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-[#44A27B] pt-12 pb-4 px-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {canGoBack && (
                <TouchableOpacity 
                  onPress={handleGoBack}
                  className="mr-4 p-2"
                >
                  <BackSvg />
                </TouchableOpacity>
              )}
              <Text className="text-white text-lg font-semibold">
                Payment Account Setup
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleClose}
              className="p-2"
            >
              <Text className="text-white text-base font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View className="absolute top-20 left-0 right-0 bottom-0 bg-white items-center justify-center z-10">
            <ActivityIndicator size="large" color="#44A27B" />
            <Text className="text-gray-600 mt-4 text-center px-6">
              Loading Stripe Connect...
            </Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: onboardingUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={handleError}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          style={{ flex: 1 }}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        />
      </View>
    </Modal>
  );
}