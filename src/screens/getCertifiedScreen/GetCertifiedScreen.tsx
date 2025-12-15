import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';
import FIcon from '../../assets/icons/FIcon';
import { startKYCVerification, getKYCStatus, getCertificationStatus } from '../../services/apis/CertificationApis';
import { ShuftiProWebView } from '../../components/overlays/ShuftiProWebView';

interface GetCertifiedScreenProps {
  navigation?: any;
}

const CheckIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#44A27B" />
    <Path
      d="M9 12L11 14L15 10"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PendingIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#F59E0B" />
    <Path
      d="M12 6V12L16 14"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ErrorIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#EF4444" />
    <Path
      d="M15 9L9 15M9 9L15 15"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function GetCertifiedScreen({ navigation }: GetCertifiedScreenProps) {
  const [kycStatus, setKycStatus] = useState<'not-verified' | 'pending' | 'verified' | 'failed'>('not-verified');
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [verificationReference, setVerificationReference] = useState<string | null>(null);
  const [showShuftiProWebView, setShowShuftiProWebView] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string>('');
  const [isCertified, setIsCertified] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);

  const features = [
    "Complete identity verification process",
    "Upload valid government-issued ID (passport, driver's license, etc.)",
    "Take a live selfie for identity confirmation",
    "Get certified status upon successful verification"
  ];

  useEffect(() => {
    loadCertificationStatus();
  }, []);

  const loadCertificationStatus = async () => {
    try {
      setIsLoading(true);
      // Load full certification status including KYC and subscription info
      const response = await getCertificationStatus();
      setKycStatus(response.data.is_kyc_verified);
      setIsCertified(response.data.is_certified);
      setActiveSubscription(response.data.active_subscription);
      setHasPaymentMethod(response.data.has_payment_method);
      
      // Also load specific KYC status for verification reference
      try {
        const kycResponse = await getKYCStatus();
        setVerificationReference(kycResponse.data.verification_reference || null);
      } catch (kycError) {
        console.log('Could not load KYC reference, using certification data only');
      }
    } catch (error: any) {
      console.error('Error loading certification status:', error);
      Alert.alert('Error', error.message || 'Failed to load certification status');
    } finally {
      setIsLoading(false);
    }
  };

  const startVerification = async () => {
    try {
      setIsStarting(true);
      
      // Check if user has an active subscription first
      if (!activeSubscription) {
        Alert.alert(
          'Subscription Required',
          'You need an active subscription before you can start identity verification. Please subscribe to continue.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Get Subscription',
              onPress: () => navigation?.navigate('SubscriptionsScreen')
            }
          ]
        );
        setIsStarting(false);
        return;
      }
      
      const response = await startKYCVerification();
      
      // Set up WebView data
      setVerificationUrl(response.data.redirect_url);
      setVerificationReference(response.data.reference);
      setKycStatus('pending');
      
      // Show confirmation and open WebView
      Alert.alert(
        'Identity Verification',
        'Please have your government-issued ID ready. You will be able to take photos and upload documents within the app.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Start Verification',
            onPress: () => {
              setShowShuftiProWebView(true);
              startStatusPolling();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error starting KYC verification:', error);
      Alert.alert('Error', error.message || 'Failed to start verification');
    } finally {
      setIsStarting(false);
    }
  };

  const startStatusPolling = () => {
    const pollStatus = async () => {
      try {
        // Poll both KYC and certification status
        const response = await getCertificationStatus();
        const status = response.data.is_kyc_verified;
        setKycStatus(status);
        setIsCertified(response.data.is_certified);
        setActiveSubscription(response.data.active_subscription);
        setHasPaymentMethod(response.data.has_payment_method);
        
        if (status === 'verified') {
          Alert.alert(
            'Verification Complete!',
            'Your identity has been successfully verified. You are now certified!',
            [{ text: 'OK' }]
          );
        } else if (status === 'failed') {
          Alert.alert(
            'Verification Failed',
            'Your identity verification was not successful. Please try again or contact support.',
            [{ text: 'OK' }]
          );
        } else if (status === 'pending') {
          // Continue polling
          setTimeout(pollStatus, 5000);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        // Stop polling on error but don't show alert to avoid spam
      }
    };
    
    // Start polling after a delay
    setTimeout(pollStatus, 5000);
  };

  const handleShuftiProSuccess = () => {
    console.log('🎉 ShuftiPro verification completed successfully');
    setShowShuftiProWebView(false);
    setKycStatus('verified');
    Alert.alert(
      'Verification Complete!',
      'Your identity has been successfully verified. You are now certified!',
      [{ text: 'OK', onPress: () => navigation?.navigate('SettingsMain') }]
    );
  };

  const handleShuftiProError = (error: string) => {
    console.error('❌ ShuftiPro verification failed:', error);
    setShowShuftiProWebView(false);
    setKycStatus('failed');
    Alert.alert(
      'Verification Failed',
      error || 'Your identity verification was not successful. Please try again.',
      [{ text: 'OK' }]
    );
  };

  const handleShuftiProClose = () => {
    console.log('🔄 ShuftiPro WebView closed');
    setShowShuftiProWebView(false);
    // Don't change status immediately, let polling handle it
  };

  const getStatusDisplay = () => {
    switch (kycStatus) {
      case 'verified':
        return {
          icon: <CheckIcon />,
          title: 'Verification Complete',
          subtitle: 'You are now certified!',
          color: 'text-green-600',
          bgColor: 'bg-[#DCFBCC]',
          borderColor: 'border-green-600'
        };
      case 'pending':
        return {
          icon: <PendingIcon />,
          title: 'Verification In Progress',
          subtitle: 'Please wait while we verify your identity. If you encounter issues, you can restart the verification below.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'failed':
        return {
          icon: <ErrorIcon />,
          title: 'Verification Failed',
          subtitle: 'Please try again or contact support',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation?.navigate('SettingsMain')}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Get Verified</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        <View className="items-center px-6 pt-8">
          
          {/* Icon */}
          <View className="mb-8">
            <FIcon />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Identity Verification
          </Text>
          
          {/* Subtitle with lines */}
          <View className="flex-row items-center mb-8 w-full px-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-lg text-gray-600 px-4">
              Get Certified
            </Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Status Card */}
          {statusDisplay && (
            <View className={`w-full ${statusDisplay.bgColor} rounded-2xl p-6 mb-6 border ${statusDisplay.borderColor}`}>
              <View className="flex-row items-center mb-4">
                <View className="mr-3">
                  {statusDisplay.icon}
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${statusDisplay.color}`}>
                    {statusDisplay.title}
                  </Text>
                  <Text className={`text-sm ${statusDisplay.color} opacity-80`}>
                    {statusDisplay.subtitle}
                  </Text>
                </View>
              </View>
              {verificationReference && (
                <Text className="text-xs text-gray-500 mt-2">
                  Reference: {verificationReference}
                </Text>
              )}
            </View>
          )}

          {/* Certification Status Card */}
          <View className="w-full bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-6 text-center">
              Verification Status
            </Text>
            
            <View className="space-y-4">
              {/* Identity Verification */}
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-700 font-medium">Identity Verification</Text>
                <View className="flex-row items-center">
                  {kycStatus === 'verified' && <CheckIcon />}
                  {kycStatus === 'pending' && <PendingIcon />}
                  {kycStatus === 'failed' && <ErrorIcon />}
                  {kycStatus === 'not-verified' && (
                    <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center">
                      <Text className="text-xs text-gray-600">×</Text>
                    </View>
                  )}
                  <Text className={`ml-2 font-medium ${
                    kycStatus === 'verified' ? 'text-green-600' :
                    kycStatus === 'pending' ? 'text-yellow-600' :
                    kycStatus === 'failed' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {kycStatus === 'verified' ? 'Verified' :
                     kycStatus === 'pending' ? 'Pending' :
                     kycStatus === 'failed' ? 'Failed' : 'Not Verified'}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-200" />

              {/* Certification Status */}
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-700 font-medium">Certification Status</Text>
                <View className="flex-row items-center">
                  {isCertified ? <CheckIcon /> : 
                   <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center">
                     <Text className="text-xs text-gray-600">×</Text>
                   </View>
                  }
                  <Text className={`ml-2 font-medium ${isCertified ? 'text-green-600' : 'text-gray-500'}`}>
                    {isCertified ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-200" />

              {/* Subscription Status */}
              <View className="py-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-700 font-medium">Subscription Status</Text>
                  <View className="flex-row items-center">
                    {activeSubscription ? <CheckIcon /> : 
                     <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center">
                       <Text className="text-xs text-gray-600">×</Text>
                     </View>
                    }
                    <Text className={`ml-2 font-medium ${activeSubscription ? 'text-green-600' : 'text-gray-500'}`}>
                      {activeSubscription ? activeSubscription.plan.name : 'None'}
                    </Text>
                  </View>
                </View>
                {activeSubscription && (
                  <View className="mt-2 ml-8">
                    <Text className={`text-sm ${
                      activeSubscription.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {activeSubscription.status === 'paid' ? 'Active' : activeSubscription.status} • ${(activeSubscription.plan.price_cents / 100).toFixed(2)}/{activeSubscription.plan.interval}
                    </Text>
                  </View>
                )}
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-200" />

              {/* Payment Method */}
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-700 font-medium">Payment Method</Text>
                <View className="flex-row items-center">
                  {hasPaymentMethod ? <CheckIcon /> : 
                   <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center">
                     <Text className="text-xs text-gray-600">×</Text>
                   </View>
                  }
                  <Text className={`ml-2 font-medium ${hasPaymentMethod ? 'text-green-600' : 'text-gray-500'}`}>
                    {hasPaymentMethod ? 'Setup' : 'Not Setup'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons for Subscription/Payment */}
            {!isCertified && kycStatus === 'verified' && (
              <TouchableOpacity 
                className="mt-4 bg-[#DCFBCC] border border-blue-200 rounded-xl py-3 px-4"
                onPress={() => navigation?.navigate('SubscriptionsScreen')}
              >
                <Text className="text-green-600 text-center font-medium">
                  Get Subscription to Complete Certification
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Features List */}
          <View className="w-full mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Verification Process:
            </Text>
            {features.map((feature, index) => (
              <View key={index} className="flex-row items-start mb-4">
                <View className="mr-3 mt-1">
                  <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center">
                    <Text className="text-sm font-medium text-gray-600">{index + 1}</Text>
                  </View>
                </View>
                <Text className="flex-1 text-gray-700 text-base leading-6">
                  {feature}
                </Text>
              </View>
            ))}
            
            {/* Additional info for pending verifications */}
            {kycStatus === 'pending' && (
              <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <Text className="text-blue-800 font-medium mb-2 text-center">💡 Need to restart verification?</Text>
                <Text className="text-blue-700 text-sm leading-5 text-center">
                  If your verification is taking too long or you encountered technical issues, you can start a new verification process. This will cancel your current pending verification.
                </Text>
              </View>
            )}
          </View>

          {/* Loading State */}
          {isLoading && (
            <View className="flex-row justify-center items-center py-8">
              <ActivityIndicator size="large" color="#44A27B" />
              <Text className="ml-3 text-gray-600">Loading verification status...</Text>
            </View>
          )}

          {/* Action Button */}
          {!isLoading && (
            <View className="w-full mb-8">
              {kycStatus === 'not-verified' && (
                <TouchableOpacity 
                  className={`rounded-3xl py-4 ${isStarting ? 'bg-gray-400' : 'bg-[#44A27B]'}`}
                  onPress={startVerification}
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white text-center font-semibold ml-2">
                        Starting Verification...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-center font-semibold text-lg">
                      Start Identity Verification
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              
              {kycStatus === 'failed' && (
                <TouchableOpacity 
                  className={`rounded-3xl py-4 ${isStarting ? 'bg-gray-400' : 'bg-[#44A27B]'}`}
                  onPress={startVerification}
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white text-center font-semibold ml-2">
                        Starting Verification...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-center font-semibold text-lg">
                      Try Again
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {kycStatus === 'pending' && (
                <>
                  <TouchableOpacity 
                    className="rounded-3xl py-4 bg-gray-400 mb-3"
                    disabled={true}
                  >
                    <Text className="text-white text-center font-semibold text-lg">
                      Verification In Progress...
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Restart KYC Option */}
                  <TouchableOpacity 
                    className="rounded-3xl py-4 border-2 border-[#44A27B] bg-transparent"
                    onPress={() => {
                      Alert.alert(
                        'Restart KYC Verification',
                        'Your current verification is still being processed. Starting a new verification will cancel the current one. Do you want to proceed?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel'
                          },
                          {
                            text: 'Start New Verification',
                            onPress: startVerification
                          }
                        ]
                      );
                    }}
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <View className="flex-row justify-center items-center">
                        <ActivityIndicator size="small" color="#44A27B" />
                        <Text className="text-[#44A27B] text-center font-semibold ml-2">
                          Starting New Verification...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-[#44A27B] text-center font-semibold text-lg">
                        Start New Verification
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {kycStatus === 'verified' && (
                <TouchableOpacity 
                  className="rounded-3xl py-4 bg-green-600"
                  disabled={true}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    ✓ Verified & Certified
                  </Text>
                </TouchableOpacity>
              )}

              {/* Refresh Status Button */}
              <TouchableOpacity 
                className="mt-4 py-3"
                onPress={loadCertificationStatus}
              >
                <Text className="text-[#44A27B] text-center font-medium">
                  Refresh Status
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ShuftiPro WebView */}
      <ShuftiProWebView
        visible={showShuftiProWebView}
        onClose={handleShuftiProClose}
        onSuccess={handleShuftiProSuccess}
        onError={handleShuftiProError}
        verificationUrl={verificationUrl}
        reference={verificationReference || undefined}
      />
    </ImageBackground>
  );
}