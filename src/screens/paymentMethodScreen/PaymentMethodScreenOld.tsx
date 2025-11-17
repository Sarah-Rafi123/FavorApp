import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  ImageBackground,
  Modal,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import Svg, { Circle } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import { useCreateSetupIntent } from '../../services/mutations/SetupIntentMutations';
import { useSavePaymentMethod, useDeletePaymentMethod } from '../../services/mutations/PaymentMethodMutations';
import { usePaymentMethods } from '../../services/queries/PaymentMethodQueries';
import { useCreateStripeConnectAccount } from '../../services/mutations/StripeConnectMutations';
import BackSvg from '../../assets/icons/Back';

interface PaymentMethodScreenProps {
  navigation?: any;
}


const RadioButton = ({ selected }: { selected: boolean }) => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Circle
      cx="10"
      cy="10"
      r="9"
      stroke={selected ? "#44A27B" : "#D1D5DB"}
      strokeWidth="2"
      fill={selected ? "#44A27B" : "white"}
    />
    {selected && (
      <Circle
        cx="10"
        cy="10"
        r="4"
        fill="white"
      />
    )}
  </Svg>
);

const countries = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KP', name: 'North Korea' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];

export function PaymentMethodScreen({ navigation }: PaymentMethodScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<any>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [ready, setReady] = useState(false);

  // API hooks
  const createStripeConnectAccountMutation = useCreateStripeConnectAccount();
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
              setReady(false);
              
              Alert.alert(
                'Success',
                'Payment method deleted successfully',
                [{ text: 'OK' }]
              );
              
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
      const { client_secret } = setupIntentResponse.data;
      
      console.log('✅ Setup Intent created, initializing Payment Sheet...');
      
      // Step 2: Initialize Payment Sheet
      const { error } = await initPaymentSheet({
        setupIntentClientSecret: client_secret,
        merchantDisplayName: 'Your App Name',
        style: 'automatic', // Use 'alwaysLight' or 'alwaysDark' if needed
        returnURL: 'your-app://payment-return',
      });

      if (error) {
        console.error('❌ Payment Sheet initialization error:', error);
        Alert.alert('Error', 'Failed to initialize payment sheet');
        return false;
      }
      
      console.log('✅ Payment Sheet initialized successfully');
      setReady(true);
      return true;
    } catch (error: any) {
      console.error('❌ Setup Intent creation error:', error);
      Alert.alert('Error', 'Failed to setup payment sheet');
      return false;
    }
  };

  const handlePayNow = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🚀 Starting Payment Method Setup Flow...');
      
      // Step 0: Create Stripe Connect Account (required for payment processing)
      console.log('📋 Step 0: Creating/Verifying Stripe Connect Account...');
      try {
        const connectAccountResponse = await createStripeConnectAccountMutation.mutateAsync();
        console.log('✅ Stripe Connect Account ready:', {
          accountId: connectAccountResponse.data.account_id,
          chargesEnabled: connectAccountResponse.data.charges_enabled,
          alreadyExists: connectAccountResponse.data.already_exists
        });
      } catch (connectError: any) {
        console.error('⚠️ Stripe Connect Account error (continuing anyway):', connectError);
        // Continue with Setup Intent creation even if Connect account fails
      }
      
      // Step 1: Create SetupIntent (force new customer to fix mismatch)
      console.log('📋 Step 1: Creating SetupIntent with new customer...');
      const setupIntentResponse = await createSetupIntentMutation.mutateAsync(true);
      const setupIntentData = setupIntentResponse.data;
      
      console.log('✅ SetupIntent created successfully:', {
        setupIntentId: setupIntentData.setup_intent_id,
        customerId: setupIntentData.customer_id,
        hasClientSecret: !!setupIntentData.client_secret
      });

      // Step 2: Confirm SetupIntent with Stripe React Native SDK
      console.log('📋 Step 2: Confirming SetupIntent with Stripe SDK...');
      console.log('💳 Card Details for confirmation:', {
        name: nameOnCard,
        country,
        zip,
        clientSecretLength: setupIntentData.client_secret?.length,
        clientSecretValue: setupIntentData.client_secret,
        clientSecretParts: setupIntentData.client_secret?.split('_'),
        setupIntentIdFromSecret: setupIntentData.client_secret?.split('_secret_')[0]
      });

      // Validate client secret format
      if (!setupIntentData.client_secret) {
        throw new Error('No client secret received from backend');
      }
      
      if (!setupIntentData.client_secret.startsWith('seti_')) {
        console.error('❌ Invalid client secret format:', setupIntentData.client_secret);
        throw new Error('Invalid client secret format received from backend');
      }
      
      // Check if backend is returning Setup Intent ID instead of client secret
      if (!setupIntentData.client_secret.includes('_secret_')) {
        console.error('❌ Backend Error: Received Setup Intent ID instead of client secret');
        console.error('📄 Backend returned:', setupIntentData.client_secret);
        console.error('📋 Expected format: seti_xxx_secret_yyy');
        throw new Error('Backend configuration error: Setup Intent client_secret is required but Setup Intent ID was returned instead. Please check your backend API implementation.');
      }

      // Debug environment mode
      console.log('🔍 Environment Check:', {
        isTestMode: setupIntentData.client_secret?.includes('_test_'),
        isLiveMode: setupIntentData.client_secret?.includes('_live_'),
        frontendKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 25) + '...',
        frontendIsTest: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.includes('_test_'),
        frontendIsLive: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.includes('_live_')
      });

      // Real Stripe React Native SDK implementation
      const { setupIntent, error } = await confirmSetupIntent(
        setupIntentData.client_secret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (error) {
        console.error('❌ Stripe confirmSetupIntent error:', error);
        
        // Check if this is the account mismatch error
        if (error.message?.includes('No such setupintent')) {
          throw new Error(`
🔥 STRIPE ACCOUNT MISMATCH DETECTED 🔥

Your backend created a Setup Intent in one Stripe account, but your frontend is configured for a different Stripe account.

Backend Setup Intent: ${setupIntentData.setup_intent_id}
Frontend Stripe Account: pk_test_51Q7dmgB0ebyuNLiR...

SOLUTION: 
1. Check your Stripe Dashboard at https://dashboard.stripe.com/
2. Ensure your backend uses the SECRET KEY that matches your frontend's PUBLISHABLE KEY
3. Both keys should have the same account ID and be from the same API key pair

Contact your backend team to verify the Stripe configuration.
          `);
        }
        
        throw new Error(error.message);
      }

      console.log('✅ Stripe SDK confirmation completed successfully');
      console.log('💳 Setup Intent Result:', {
        setupIntentId: setupIntent.id,
        status: setupIntent.status,
        paymentMethod: setupIntent.paymentMethod
      });
      
      const confirmed_setup_intent_id = setupIntent.id;

      // Step 3: Save payment method via our API
      console.log('📋 Step 3: Saving payment method via backend API...');
      const saveResult = await savePaymentMethodMutation.mutateAsync({
        setup_intent_id: confirmed_setup_intent_id,
      });

      console.log('🎉 Complete Payment Method Setup Flow Successful!');
      console.log('💾 Final Result:', JSON.stringify(saveResult, null, 2));

      setIsProcessing(false);
      
      Alert.alert(
        'Success!',
        'Your payment method has been added successfully and is ready to use.',
        [
          {
            text: 'View Payment Methods',
            onPress: () => navigation?.navigate('PaymentMethodsScreen')
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );

    } catch (error: any) {
      setIsProcessing(false);
      console.error('❌ Payment Method Setup Flow Failed:', error);
      console.error('📄 Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to add payment method. Please try again.';
      
      // Check for specific error types
      if (error.message?.includes('No such customer')) {
        errorMessage = `🔥 STRIPE CUSTOMER MISMATCH DETECTED 🔥

Your backend is trying to use a Stripe customer that doesn't exist in your current Stripe account.

Customer ID: ${error.message.match(/cus_[a-zA-Z0-9]+/)?.[0] || 'Unknown'}

SOLUTION: Your backend team needs to:
1. Create a new Stripe customer for this user, OR
2. Fix the stored customer ID for this user

This is a backend configuration issue.`;
      } else if (error.message?.includes('Authentication')) {
        errorMessage = 'Please log in again to continue.';
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Payment Method Setup Failed',
        errorMessage,
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
            onPress={() => navigation?.goBack()}
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
        {/* Choose a payment method */}
        <Text className="text-lg font-medium text-black mb-4">
          Choose a payment method
        </Text>

        {/* Payment Method Options */}
        <View className="flex-row flex-wrap mb-6">
          <TouchableOpacity
            className="flex-row items-center mr-6 mb-2"
            onPress={() => setSelectedPaymentMethod('Card')}
          >
            <RadioButton selected={selectedPaymentMethod === 'Card'} />
            <Text className="ml-2 text-base text-black">Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center mr-6 mb-2"
            onPress={() => setSelectedPaymentMethod('Bank Transfer')}
          >
            <RadioButton selected={selectedPaymentMethod === 'Bank Transfer'} />
            <Text className="ml-2 text-base text-black">Bank Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center mb-2"
            onPress={() => setSelectedPaymentMethod('Other Option')}
          >
            <RadioButton selected={selectedPaymentMethod === 'Other Option'} />
            <Text className="ml-2 text-base text-black">Other Option</Text>
          </TouchableOpacity>
        </View>

        {isEditMode ? (
          /* Edit Mode - Show read-only card info */
          <View>
            {/* Name on card */}
            <Text className="text-base font-medium text-black mb-2">
              Name on card
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 text-base text-gray-600 mb-4"
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={nameOnCard}
              editable={false}
            />

            {/* Card number */}
            <Text className="text-base font-medium text-black mb-2">
              Card number
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 text-base text-gray-600 mb-4"
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={cardNumber}
              editable={false}
            />

            {/* Expiration date */}
            <Text className="text-base font-medium text-black mb-2">
              Expiration date
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 text-base text-gray-600 mb-4"
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={expirationDate}
              editable={false}
            />
          </View>
        ) : (
          /* Add Mode - Show Stripe CardField for new cards */
          <View>
            {/* Instructions */}
            <View className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Text className="text-sm text-blue-800 font-medium mb-2">
                🔒 Secure Card Entry
              </Text>
              <Text className="text-xs text-blue-700">
                Your card details are processed securely by Stripe and never stored on our servers.
              </Text>
            </View>

            {/* Name on card - kept separate as Stripe CardField doesn't include this */}
            <Text className="text-base font-medium text-black mb-2">
              Name on card
            </Text>
            <TextInput
              className={`bg-white border rounded-xl px-4 text-base text-black ${nameError ? 'border-red-500' : 'border-gray-300'}`}
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={nameOnCard}
              onChangeText={validateName}
              placeholder="Enter cardholder name"
            />
            {nameError ? (
              <Text className="text-red-500 text-sm mb-4">{nameError}</Text>
            ) : (
              <View className="mb-4" />
            )}

            {/* Stripe CardField */}
            <Text className="text-base font-medium text-black mb-2">
              Card details
            </Text>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
                expiration: 'MM/YY',
                cvc: 'CVC',
                postalCode: 'ZIP',
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
              }}
              style={{
                width: '100%',
                height: 50,
                marginVertical: 20,
              }}
              onCardChange={(cardDetails) => {
                console.log('💳 Card details changed:', {
                  complete: cardDetails.complete,
                  validNumber: cardDetails.validNumber,
                  validCVC: cardDetails.validCVC,
                  validExpiryDate: cardDetails.validExpiryDate,
                });
                setCardDetails(cardDetails);
                setCardComplete(cardDetails.complete);
              }}
            />
            
            {/* Debug info */}
            <Text className="text-sm text-gray-600 mb-4">
              Card Status: {cardDetails?.complete ? '✅ Complete' : '⏳ Fill all fields'}
            </Text>

            {/* Test card info */}
            <View className="mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <Text className="text-xs text-yellow-800 font-medium mb-1">
                💳 Test Card (Development)
              </Text>
              <Text className="text-xs text-yellow-700">
                4242 4242 4242 4242 • Any future date • Any 3-digit CVC
              </Text>
            </View>
          </View>
        )}



        {/* Action Buttons */}
        {isEditMode ? (
          /* Edit Mode - Show payment method details and delete option */
          <View>
            {/* Current Payment Method Info */}
            <View className="mx-2 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
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
                setNameOnCard('');
                setCardNumber('');
                setExpirationDate('');
                setCountry('US');
                setZip('');
                setCardDetails(null);
                setCardComplete(false);
              }}
            >
              <Text className="text-white text-center text-lg font-semibold">
                + Add New Card
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Add Mode - Show pay now button */
          <TouchableOpacity 
            className={`${isProcessing || !cardDetails?.complete ? 'bg-gray-400' : 'bg-[#44A27B]'} rounded-full py-4 mx-2 flex-row justify-center items-center`}
            onPress={handlePayNow}
            disabled={isProcessing || !cardDetails?.complete}
          >
            {isProcessing && (
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
            )}
            <Text className="text-white text-center text-lg font-semibold">
              {isProcessing ? 'Processing...' : !cardDetails?.complete ? 'Enter Card Details' : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ImageBackground>
  );
}