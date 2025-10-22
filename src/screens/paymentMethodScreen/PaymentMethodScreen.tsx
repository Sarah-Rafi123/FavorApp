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
  Image,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import { useCreateSetupIntent } from '../../services/mutations/SetupIntentMutations';
import { useSavePaymentMethod, useDeletePaymentMethod } from '../../services/mutations/PaymentMethodMutations';
import { usePaymentMethods } from '../../services/queries/PaymentMethodQueries';
import { useCreateStripeConnectAccount } from '../../services/mutations/StripeConnectMutations';
import BackSvg from '../../assets/icons/Back';

interface PaymentMethodScreenProps {
  navigation?: any;
}



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
  const [nameOnCard, setNameOnCard] = useState('');
  const [nameError, setNameError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [expirationError, setExpirationError] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [securityCodeError, setSecurityCodeError] = useState('');
  const [country, setCountry] = useState('US'); // Default to US
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [zip, setZip] = useState('');
  const [zipError, setZipError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<any>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // API hooks
  const createStripeConnectAccountMutation = useCreateStripeConnectAccount();
  const createSetupIntentMutation = useCreateSetupIntent();
  const savePaymentMethodMutation = useSavePaymentMethod();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const { data: paymentMethodsData } = usePaymentMethods();
  
  // Stripe hooks
  const { confirmSetupIntent, createToken } = useStripe();

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

  // Check for existing payment methods and auto-fill form
  useEffect(() => {
    if (paymentMethodsData?.data?.payment_methods && paymentMethodsData.data.payment_methods.length > 0) {
      const defaultPaymentMethod = paymentMethodsData.data.payment_methods.find(pm => pm.is_default) || paymentMethodsData.data.payment_methods[0];
      
      console.log('💳 Found existing payment method:', defaultPaymentMethod);
      
      setCurrentPaymentMethod(defaultPaymentMethod);
      setIsEditMode(true);
      
      // Auto-fill form with existing payment method data
      setNameOnCard(defaultPaymentMethod.billing_details?.name || '');
      setCardNumber(`**** **** **** ${defaultPaymentMethod.card.last4}`);
      setExpirationDate(`${defaultPaymentMethod.card.exp_month.toString().padStart(2, '0')}/${defaultPaymentMethod.card.exp_year.toString().slice(-2)}`);
      setCountry(defaultPaymentMethod.billing_details?.address?.country || '');
      setZip(defaultPaymentMethod.billing_details?.address?.postal_code || '');
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
              setNameOnCard('');
              setCardNumber('');
              setExpirationDate('');
              setSecurityCode('');
              setCountry('');
              setZip('');
              
              // Show success toast for deletion
              Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Payment Method Deleted! ✅',
                text2: 'Payment method removed successfully',
                visibilityTime: 3000,
                autoHide: true,
                topOffset: 60,
                renderLeadingIcon: () => (
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: '#FEF2F2',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Image 
                      source={require('../../assets/images/logo.png')} 
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                  </View>
                )
              });
              
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


  const validateName = (text: string) => {
    // Limit to 50 characters
    if (text.length > 50) {
      text = text.substring(0, 50);
    }
    
    setNameOnCard(text);
    
    if (text.trim().length === 0) {
      setNameError('Name on card is required');
    } else if (text.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(text)) {
      setNameError('Name can only contain letters and spaces');
    } else {
      setNameError('');
    }
  };

  const validateZip = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 characters
    if (cleaned.length > 10) {
      return;
    }
    
    setZip(cleaned);
    
    if (cleaned.length === 0) {
      setZipError('Zip code is required');
    } else if (cleaned.length < 5) {
      setZipError('Zip code must be at least 5 digits');
    } else if (cleaned.length > 10) {
      setZipError('Zip code cannot exceed 10 digits');
    } else {
      setZipError('');
    }
  };

  const isValidLuhn = (cardNumber: string) => {
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 16 digits
    if (cleaned.length > 16) {
      return;
    }
    
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    
    // Validate card number
    if (cleaned.length === 0) {
      setCardNumberError('Card number is required');
    } else if (cleaned.length < 13) {
      setCardNumberError('Card number must be at least 13 digits');
    } else if (cleaned.length > 16) {
      setCardNumberError('Card number cannot exceed 16 digits');
    } else if (!isValidLuhn(cleaned)) {
      setCardNumberError('Invalid card number');
    } else {
      setCardNumberError('');
    }
  };

  const formatExpirationDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 4 digits
    if (cleaned.length > 4) {
      return;
    }
    
    let formatted = cleaned;
    
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    
    setExpirationDate(formatted);
    
    // Validate expiration date
    if (cleaned.length === 0) {
      setExpirationError('Expiration date is required');
    } else if (cleaned.length < 4) {
      setExpirationError('Enter complete expiration date (MM/YY)');
    } else {
      const month = parseInt(cleaned.substring(0, 2));
      const year = parseInt(cleaned.substring(2, 4)) + 2000;
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      if (month < 1 || month > 12) {
        setExpirationError('Invalid month (01-12)');
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        setExpirationError('Card has expired');
      } else if (year > currentYear + 10) {
        setExpirationError('Expiration date too far in future');
      } else {
        setExpirationError('');
      }
    }
  };

  const validateSecurityCode = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 4 digits
    if (cleaned.length > 4) {
      return;
    }
    
    setSecurityCode(cleaned);
    
    // Validate security code
    if (cleaned.length === 0) {
      setSecurityCodeError('Security code is required');
    } else if (cleaned.length < 3) {
      setSecurityCodeError('Security code must be 3-4 digits');
    } else if (cleaned.length > 4) {
      setSecurityCodeError('Security code cannot exceed 4 digits');
    } else {
      setSecurityCodeError('');
    }
  };

  const validateForm = () => {
    if (isEditMode) {
      // In edit mode, no validation needed
      return true;
    }
    
    let isValid = true;
    
    // Validate all fields and check for errors
    if (!nameOnCard.trim()) {
      setNameError('Name on card is required');
      isValid = false;
    } else if (nameError) {
      isValid = false;
    }
    
    if (!cardNumber.trim()) {
      setCardNumberError('Card number is required');
      isValid = false;
    } else if (cardNumberError) {
      isValid = false;
    }
    
    if (!expirationDate.trim()) {
      setExpirationError('Expiration date is required');
      isValid = false;
    } else if (expirationError) {
      isValid = false;
    }
    
    if (!securityCode.trim()) {
      setSecurityCodeError('Security code is required');
      isValid = false;
    } else if (securityCodeError) {
      isValid = false;
    }
    
    if (!country) {
      Alert.alert('Error', 'Please select a country');
      isValid = false;
    }
    
    if (!zip.trim()) {
      setZipError('Zip code is required');
      isValid = false;
    } else if (zipError) {
      isValid = false;
    }
    
    return isValid;
  };

  const handlePayNow = async () => {
    if (!validateForm() || nameError || zipError) {
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

      // Parse card details for Stripe
      const cardNumberClean = cardNumber.replace(/\s/g, '');
      const [expMonth, expYear] = expirationDate.split('/');
      
      console.log('🔍 Card Details Processing:', {
        cardNumberLength: cardNumberClean.length,
        expMonth,
        expYear: expYear ? `20${expYear}` : undefined,
        securityCodeLength: securityCode.length,
        name: nameOnCard
      });

      // Step 2a: Create a token first using card details
      console.log('📋 Step 2a: Creating card token...');
      const { token, error: tokenError } = await createToken({
        type: 'Card',
        number: cardNumberClean,
        expMonth: parseInt(expMonth),
        expYear: parseInt(`20${expYear}`),
        cvc: securityCode,
        name: nameOnCard,
        address: {
          country: country,
          postalCode: zip
        }
      });

      if (tokenError) {
        console.error('❌ Token creation error:', tokenError);
        throw new Error(tokenError.message);
      }

      console.log('✅ Card token created:', token?.id);

      // Step 2b: Confirm SetupIntent with the token
      console.log('📋 Step 2b: Confirming SetupIntent with token...');
      const { setupIntent, error } = await confirmSetupIntent(
        setupIntentData.client_secret,
        {
          paymentMethodType: 'Card',
          paymentMethodData: {
            token: token?.id,
            billingDetails: {
              name: nameOnCard,
              address: {
                country: country,
                postalCode: zip
              }
            }
          }
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
      
      // Show custom toast notification with logo
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Payment Method Added! 🎉',
        text2: 'Your payment method has been added successfully',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 60,
        renderLeadingIcon: () => (
          <View style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: '#F0FDF4',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12
          }}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </View>
        ),
        onPress: () => {
          Toast.hide();
          navigation?.navigate('PaymentMethodsScreen');
        }
      });

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

        {isEditMode ? (
          /* Edit Mode - Show read-only card info */
          <View>
            {/* Name on card */}
            <Text className="text-base font-medium text-black mb-2">
              Name on card
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-xl px-4 text-base text-gray-600 mb-4"
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={nameOnCard}
              editable={false}
            />

            {/* Card number */}
            <Text className="text-base font-medium text-black mb-2">
              Card number
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-xl px-4 text-base text-gray-600 mb-4"
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={cardNumber}
              editable={false}
            />

            {/* Expiration date and Security code row */}
            <View className="flex-row gap-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-base font-medium text-black mb-2">
                  Expiration date
                </Text>
                <TextInput
                  className="bg-gray-100 border border-gray-200 rounded-xl px-4 text-base text-gray-600"
                  style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
                  value={expirationDate}
                  editable={false}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-black mb-2">
                  Security code
                </Text>
                <TextInput
                  className="bg-gray-100 border border-gray-200 rounded-xl px-4 text-base text-gray-600"
                  style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
                  value="***"
                  editable={false}
                />
              </View>
            </View>
          </View>
        ) : (
          /* Add Mode - Show individual input fields */
          <View>
            {/* Name on card */}
            <Text className="text-base font-medium text-black mb-2">
              Name on card
            </Text>
            <TextInput
              className={`bg-white border rounded-xl px-4 text-base text-black mb-4 ${nameError ? 'border-red-500' : 'border-gray-200'}`}
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={nameOnCard}
              onChangeText={validateName}
              placeholder="Enter cardholder name"
            />
            {nameError ? (
              <Text className="text-red-500 text-sm mb-2">{nameError}</Text>
            ) : null}

            {/* Card number */}
            <Text className="text-base font-medium text-black mb-2">
              Card number
            </Text>
            <TextInput
              className={`bg-white border rounded-xl px-4 text-base text-black mb-4 ${cardNumberError ? 'border-red-500' : 'border-gray-200'}`}
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={cardNumber}
              onChangeText={formatCardNumber}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />
            {cardNumberError ? (
              <Text className="text-red-500 text-sm mb-2">{cardNumberError}</Text>
            ) : null}

            {/* Expiration date and Security code row */}
            <View className="flex-row gap-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-base font-medium text-black mb-2">
                  Expiration date
                </Text>
                <TextInput
                  className={`bg-white border rounded-xl px-4 text-base text-black ${expirationError ? 'border-red-500' : 'border-gray-200'}`}
                  style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
                  value={expirationDate}
                  onChangeText={formatExpirationDate}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                />
                {expirationError ? (
                  <Text className="text-red-500 text-sm mt-1">{expirationError}</Text>
                ) : null}
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-black mb-2">
                  Security code
                </Text>
                <TextInput
                  className={`bg-white border rounded-xl px-4 text-base text-black ${securityCodeError ? 'border-red-500' : 'border-gray-200'}`}
                  style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
                  value={securityCode}
                  onChangeText={validateSecurityCode}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={true}
                />
                {securityCodeError ? (
                  <Text className="text-red-500 text-sm mt-1">{securityCodeError}</Text>
                ) : null}
              </View>
            </View>
          </View>
        )}

        {/* Country and Zip */}
        <View className="flex-row gap-x-4 mb-8">
          <View className="flex-1">
            <Text className="text-base font-medium text-black mb-2">
              Country
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl px-4 py-5 flex-row justify-between items-center"
              onPress={() => setShowCountryModal(true)}
            >
              <Text className={`text-base ${country ? 'text-black' : 'text-gray-400'}`}>
                {country ? countries.find(c => c.code === country)?.name || country : 'Select'}
              </Text>
              <Text className="text-gray-400">?</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-black mb-2">
              Zip
            </Text>
            <TextInput
              className={`bg-white border rounded-xl px-4 text-base text-black ${zipError ? 'border-red-500' : 'border-gray-200'}`}
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={zip}
              onChangeText={validateZip}
              placeholder="Enter"
              keyboardType="default"
            />
            {zipError ? (
              <Text className="text-red-500 text-sm mt-1">{zipError}</Text>
            ) : null}
          </View>
        </View>

        {/* Country Modal */}
        {showCountryModal && (
          <Modal
            visible={showCountryModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCountryModal(false)}
          >
            <TouchableOpacity 
              style={{ 
                flex: 1, 
                justifyContent: 'flex-end', 
                backgroundColor: 'rgba(0, 0, 0, 0.5)' 
              }}
              activeOpacity={1}
              onPress={() => setShowCountryModal(false)}
            >
              <View style={{ 
                backgroundColor: 'white', 
                borderTopLeftRadius: 20, 
                borderTopRightRadius: 20, 
                height: 500,
                paddingBottom: 34
              }}>
                {/* Header */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: 20, 
                  borderBottomWidth: 1, 
                  borderBottomColor: '#E5E7EB' 
                }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>
                    Select Country
                  </Text>
                  <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                    <Text style={{ color: '#44A27B', fontSize: 16, fontWeight: '600' }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Country List */}
                <ScrollView 
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {countries.map((countryItem, index) => (
                    <TouchableOpacity
                      key={`country-${index}`}
                      style={{ 
                        paddingVertical: 15, 
                        paddingHorizontal: 20, 
                        borderBottomWidth: 0.5, 
                        borderBottomColor: '#E5E7EB',
                        backgroundColor: country === countryItem.code ? '#F0FDF4' : 'white'
                      }}
                      onPress={() => {
                        setCountry(countryItem.code);
                        setShowCountryModal(false);
                      }}
                    >
                      <Text style={{ 
                        fontSize: 16, 
                        color: 'black',
                        fontWeight: country === countryItem.code ? '600' : '400'
                      }}>
                        {countryItem.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
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
                setSecurityCode('');
                setCountry('US');
                setZip('');
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
            className={`${isProcessing ? 'bg-gray-400' : 'bg-[#44A27B]'} rounded-full py-4 mx-2 flex-row justify-center items-center`}
            onPress={handlePayNow}
            disabled={isProcessing}
          >
            {isProcessing && (
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
            )}
            <Text className="text-white text-center text-lg font-semibold">
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ImageBackground>
  );
}