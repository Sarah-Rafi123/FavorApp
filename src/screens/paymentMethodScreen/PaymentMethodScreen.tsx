import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
  Alert, 
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import { useCreateSetupIntent } from '../../services/mutations/SetupIntentMutations';
import { useDeletePaymentMethod, useSavePaymentMethod } from '../../services/mutations/PaymentMethodMutations';
import { usePaymentMethods } from '../../services/queries/PaymentMethodQueries';
import BackSvg from '../../assets/icons/Back';

interface PaymentMethodScreenProps {
  navigation?: any;
}

export function PaymentMethodScreen({ navigation }: PaymentMethodScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<any>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // API hooks
  const createSetupIntentMutation = useCreateSetupIntent();
  const savePaymentMethodMutation = useSavePaymentMethod();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const { data: paymentMethodsData } = usePaymentMethods();
  
  // Stripe hooks
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  // Keyboard event listeners for better UX
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Check for existing payment methods
  useEffect(() => {
    if (paymentMethodsData?.data?.payment_methods && paymentMethodsData.data.payment_methods.length > 0) {
      const defaultPaymentMethod = paymentMethodsData.data.payment_methods.find(pm => pm.is_default) || paymentMethodsData.data.payment_methods[0];
      
      console.log('💳 Found existing payment method:', defaultPaymentMethod);
      
      setCurrentPaymentMethod(defaultPaymentMethod);
      setIsEditMode(true);
    } else {
      console.log('📝 No existing payment methods found - showing add new form');
      setIsEditMode(false);
      setCurrentPaymentMethod(null);
    }
  }, [paymentMethodsData]);

  const handleDeletePaymentMethod = () => {
    if (!currentPaymentMethod) return;
    
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete your ${currentPaymentMethod.card.brand.toUpperCase()} card ending in ${currentPaymentMethod.card.last4}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              console.log('🗑️ Deleting payment method:', currentPaymentMethod.id);
              
              await deletePaymentMethodMutation.mutateAsync(currentPaymentMethod.id);
              
              console.log('✅ Payment method deleted successfully');
              
              // Reset form to add new payment method mode
              setIsEditMode(false);
              setCurrentPaymentMethod(null);
              
              Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Payment Method Deleted! ✅',
                text2: 'Payment method\nremoved successfully',
                visibilityTime: 3000,
                autoHide: true,
                topOffset: 60,
              });
              
              // Navigate back to settings after successful deletion
              setTimeout(() => {
                navigation?.navigate('SettingsMain');
              }, 2000);
              
            } catch (error: any) {
              console.error('❌ Failed to delete payment method:', error);
              Alert.alert(
                'Error',
                'Failed to delete payment method. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const initializePaymentSheet = async () => {
    try {
      console.log('🚀 Initializing Payment Sheet...');
      
      // Step 1: Create Setup Intent
      const setupIntentResponse = await createSetupIntentMutation.mutateAsync();
      const { client_secret, setup_intent_id } = setupIntentResponse.data;
      
      console.log('✅ Setup Intent created:', {
        setupIntentId: setup_intent_id,
        hasClientSecret: !!client_secret,
        clientSecretFormat: client_secret.substring(0, 20) + '...'
      });
      
      // Validate client secret format for better error handling
      if (!client_secret.startsWith('seti_')) {
        console.error('❌ Invalid client secret format:', client_secret);
        throw new Error('Invalid payment setup format. Please try again.');
      }
      
      // Step 2: Initialize Payment Sheet
      const { error } = await initPaymentSheet({
        setupIntentClientSecret: client_secret,
        merchantDisplayName: 'Favor App',
        style: 'automatic',
        returnURL: 'favor://payment-return',
      });

      if (error) {
        console.error('❌ Payment Sheet initialization error:', error);
        
        // Provide more specific error messages based on error type
        if (error.message?.includes('setupintent')) {
          Alert.alert(
            'Payment Setup Error', 
            'There was an issue with the payment setup. This might be due to development mode limitations. Please try again or contact support if the issue persists.'
          );
        } else {
          Alert.alert('Error', `Failed to initialize payment sheet: ${error.message}`);
        }
        return null;
      }
      
      console.log('✅ Payment Sheet initialized successfully');
      return setup_intent_id;
    } catch (error: any) {
      console.error('❌ Setup Intent creation error:', error);
      
      // Provide more helpful error messages
      if (error.message?.includes('setupintent')) {
        Alert.alert(
          'Development Mode Limitation', 
          'This appears to be a development mode issue with Stripe. The payment system is working but may have limitations in the test environment. In production, this will work normally.'
        );
      } else {
        Alert.alert('Error', 'Failed to setup payment sheet');
      }
      return null;
    }
  };

  const handleAddPaymentMethod = async () => {
    setIsProcessing(true);
    let setupIntentId = null;

    try {
      // Step 1: Always initialize Payment Sheet fresh
      console.log('🚀 Initializing Payment Sheet...');
      setupIntentId = await initializePaymentSheet();
      
      if (!setupIntentId) {
        console.error('❌ Failed to get setup intent ID');
        setIsProcessing(false);
        return;
      }

      console.log('🚀 Opening Payment Sheet with setup intent:', setupIntentId);
      
      // Step 2: Present Payment Sheet
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          console.log('Payment Sheet was canceled by user');
          setIsProcessing(false);
          return;
        }
        
        console.error('❌ Payment Sheet error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Payment Sheet completed successfully');

      // Step 3: Save payment method via API
      console.log('📋 Saving payment method to backend with setup intent:', setupIntentId);
      
      const saveResult = await savePaymentMethodMutation.mutateAsync({
        setup_intent_id: setupIntentId
      });

      console.log('✅ Payment method saved:', saveResult);

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Payment Method Added! 🎉',
        text2: 'Your payment method\nhas been added successfully',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 60,
      });

      setIsProcessing(false);
      
      // Navigate back to settings after successful payment method addition
      setTimeout(() => {
        navigation?.navigate('SettingsMain');
      }, 2000); // Wait 2 seconds to let user see the success message

    } catch (error: any) {
      setIsProcessing(false);
      console.error('❌ Payment Method Flow Failed:', error);
      
      let errorMessage = 'Failed to add payment method. Please try again.';
      
      if (error.message?.includes('setup_intent_id')) {
        errorMessage = 'Payment setup incomplete. Please try again.';
      } else if (error.message?.includes('unauthorized')) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.message?.includes('No payment sheet has been initialized')) {
        errorMessage = 'Payment setup failed. Please try again.';
      }
      
      Alert.alert(
        'Payment Method Setup Failed',
        error.message || errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

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
          <Text className="text-2xl font-bold text-black">
            {isEditMode ? 'Manage Payment Method' : 'Payment Method'}
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: keyboardVisible ? 200 : 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >

        {isEditMode ? (
          /* Edit Mode - Show current payment method */
          <View>
            <Text className="text-base font-medium text-black mb-2">
              Current Payment Method
            </Text>
            <View className="bg-gray-100 border border-gray-300 rounded-xl p-4 mb-6">
              <Text className="text-base text-gray-600 mb-2">
                {currentPaymentMethod?.billing_details?.name || 'Card holder name'}
              </Text>
              <Text className="text-base text-gray-600 mb-2">
                {currentPaymentMethod?.card?.brand?.toUpperCase()} **** **** **** {currentPaymentMethod?.card?.last4}
              </Text>
              <Text className="text-base text-gray-600">
                Expires: {currentPaymentMethod?.card?.exp_month?.toString().padStart(2, '0')}/{currentPaymentMethod?.card?.exp_year?.toString().slice(-2)}
              </Text>
            </View>
          </View>
        ) : (
          /* Add Mode - Show Payment Sheet info */
          <View>
            <Text className="text-lg font-medium text-black mb-4">
              Add New Payment Method
            </Text>
            
            {/* Instructions */}
            {/* <View className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Text className="text-sm text-blue-800 font-medium mb-2">
                🔒 Secure Payment Setup
              </Text>
              <Text className="text-xs text-blue-700">
                Tap "Add Payment Method" below to open Stripe's secure payment form. Your card details are processed securely and never stored on our servers.
              </Text>
            </View> */}

            {/* Test card info */}
            {/* <View className="mb-6 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <Text className="text-xs text-yellow-800 font-medium mb-1">
                💳 Test Card (Development Mode)
              </Text>
              <Text className="text-xs text-yellow-700">
                4242 4242 4242 4242 • Any future date • Any 3-digit CVC
              </Text>
            </View> */}
          </View>
        )}

        {/* Action Buttons */}
        {isEditMode ? (
          /* Edit Mode - Show payment method details and delete option */
          <View>
            {/* Current Payment Method Info */}
            {/* <View className="mx-2 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Text className="text-sm text-blue-800 font-medium mb-2">
                💳 Current Payment Method
              </Text>
              <Text className="text-xs text-blue-700">
                {currentPaymentMethod?.card?.brand?.toUpperCase()} card ending in {currentPaymentMethod?.card?.last4}
              </Text>
              <Text className="text-xs text-blue-700">
                {currentPaymentMethod?.is_default ? 'Default payment method' : 'Additional payment method'}
              </Text>
            </View>
             */}
            {/* Delete Button */}
            <TouchableOpacity 
              className={`${isProcessing ? 'bg-gray-400' : 'bg-red-600'} rounded-full py-4 mx-2 flex-row justify-center items-center mb-4`}
              onPress={handleDeletePaymentMethod}
              disabled={isProcessing}
            >
              {isProcessing && (
                <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              )}
              <Text className="text-white text-center text-lg font-semibold">
                {isProcessing ? 'Deleting...' : 'Delete Payment Method'}
              </Text>
            </TouchableOpacity>
            
            {/* Add New Card Button */}
            <TouchableOpacity 
              className="bg-[#44A27B] rounded-full py-4 mx-2 flex-row justify-center items-center"
              onPress={() => {
                setIsEditMode(false);
                setCurrentPaymentMethod(null);
              }}
            >
              <Text className="text-white text-center text-lg font-semibold">
                + Update Card
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Add Mode - Show add payment method button */
          <TouchableOpacity 
            className={`${isProcessing ? 'bg-gray-400' : 'bg-[#44A27B]'} rounded-full py-4 mx-2 flex-row justify-center items-center`}
            onPress={handleAddPaymentMethod}
            disabled={isProcessing}
          >
            {isProcessing && (
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
            )}
            <Text className="text-white text-center text-lg font-semibold">
              {isProcessing ? 'Processing...' : 'Add Payment Method'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ImageBackground>
  );
}