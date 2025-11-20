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

interface ShuftiProWebViewProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
  verificationUrl: string;
  reference?: string;
}

export function ShuftiProWebView({ 
  visible, 
  onClose, 
  onSuccess, 
  onError,
  verificationUrl,
  reference
}: ShuftiProWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleNavigationStateChange = (navState: any) => {
    console.log('🔍 ShuftiPro WebView navigation:', navState.url);
    setCanGoBack(navState.canGoBack);
    
    // ShuftiPro completion/callback URL patterns
    const completionPatterns = [
      'verification-complete',
      'verification-success', 
      'kyc-complete',
      'kyc-success',
      'shuftipro-callback',
      'verification-callback',
      'identity-verified',
      'favorapp.net',  // Your API domain callback
      'favorapp.com',  // Your app domain callback
      '/kyc-success',
      '/kyc-complete',
      '/verification-success',
      'status=success',
      'status=verified',
      'verification_complete',
      'identity_complete'
    ];

    const errorPatterns = [
      'verification-failed',
      'verification-error',
      'kyc-failed',
      'kyc-error', 
      'identity-failed',
      'status=failed',
      'status=error',
      'verification_failed',
      'identity_failed'
    ];
    
    const isCompleted = completionPatterns.some(pattern => 
      navState.url.toLowerCase().includes(pattern.toLowerCase())
    );

    const hasFailed = errorPatterns.some(pattern => 
      navState.url.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isCompleted) {
      console.log('✅ ShuftiPro verification completed successfully');
      console.log('🔗 Success URL:', navState.url);
      
      setTimeout(() => {
        onClose(); // Close WebView first
        onSuccess(); // Then trigger success callback
      }, 1000);
    } else if (hasFailed) {
      console.log('❌ ShuftiPro verification failed');
      console.log('🔗 Error URL:', navState.url);
      
      setTimeout(() => {
        onClose(); // Close WebView first
        onError('Verification failed. Please try again.'); // Then trigger error callback
      }, 1000);
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Close Verification?',
      'Are you sure you want to close the identity verification? You can complete it later.',
      [
        { text: 'Continue Verification', style: 'cancel' },
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

  const handleWebViewError = (error: any) => {
    console.error('❌ ShuftiPro WebView error:', error);
    setLoading(false);
    Alert.alert(
      'Loading Error',
      'Failed to load identity verification. Please check your internet connection and try again.',
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
            <View className="flex-row items-center flex-1">
              {canGoBack && (
                <TouchableOpacity 
                  onPress={handleGoBack}
                  className="mr-3 p-2"
                >
                  <BackSvg />
                </TouchableOpacity>
              )}
              <View className="flex-1">
                <Text className="text-white text-lg font-semibold">
                  Identity Verification
                </Text>
                {reference && (
                  <Text className="text-white text-xs opacity-80 mt-1">
                    Ref: {reference}
                  </Text>
                )}
              </View>
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
          <View className="absolute top-24 left-0 right-0 bottom-0 bg-white items-center justify-center z-10">
            <ActivityIndicator size="large" color="#44A27B" />
            <Text className="text-gray-600 mt-4 text-center px-6">
              Loading identity verification...
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center px-6">
              Please have your government ID ready
            </Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: verificationUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={handleWebViewError}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          allowsBackForwardNavigationGestures={true}
          style={{ flex: 1 }}
          // Enhanced user agent for better compatibility with ShuftiPro
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 FavorApp/1.0"
          // Additional props for better camera/media access
          mediaCapturePermissionGrantType="grant"
          cameraPermissionGrantType="grant"
          microphonePermissionGrantType="grant"
        />
      </View>
    </Modal>
  );
}