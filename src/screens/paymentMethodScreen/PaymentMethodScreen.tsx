import React, { useState } from 'react';
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
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useCreateSetupIntent } from '../../services/mutations/SetupIntentMutations';
import { useSavePaymentMethod } from '../../services/mutations/PaymentMethodMutations';
import { useSetupIntentStore } from '../../store/useSetupIntentStore';
import BackSvg from '../../assets/icons/Back';
import EyeSvg from '../../assets/icons/Eye';

interface PaymentMethodScreenProps {
  navigation?: any;
  route?: any;
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
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Chad',
  'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
  'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
  'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

export function PaymentMethodScreen({ navigation, route }: PaymentMethodScreenProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Card');
  const [nameOnCard, setNameOnCard] = useState('');
  const [nameError, setNameError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [showSecurityCode, setShowSecurityCode] = useState(false);
  const [country, setCountry] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [zip, setZip] = useState('');
  const [zipError, setZipError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // API hooks
  const createSetupIntentMutation = useCreateSetupIntent();
  const savePaymentMethodMutation = useSavePaymentMethod();
  const { setupIntentData, setSetupIntentData } = useSetupIntentStore();

  const { plan } = route?.params || { plan: '1 Year' };
  const price = plan === '1 Year' ? '$30' : '$4.99';


  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const formatExpirationDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // If empty, return empty
    if (cleaned.length === 0) {
      return '';
    }
    
    // If only 1 digit, return as is
    if (cleaned.length === 1) {
      return cleaned;
    }
    
    // If 2 or more digits, add slash after first 2
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpirationChange = (text: string) => {
    // Handle backspace when cursor is after the slash
    if (text.length < expirationDate.length && text.endsWith('/')) {
      // Remove the slash when backspacing
      const withoutSlash = text.slice(0, -1);
      setExpirationDate(withoutSlash);
      return;
    }
    
    const formatted = formatExpirationDate(text);
    if (formatted.length <= 5) {
      setExpirationDate(formatted);
    }
  };

  const validateName = (text: string) => {
    setNameOnCard(text);
    if (text.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(text)) {
      setNameError('Name can only contain letters and spaces');
    } else {
      setNameError('');
    }
  };

  const validateZip = (text: string) => {
    setZip(text);
    if (text.length < 5) {
      setZipError('Zip code must be at least 5 characters');
    } else {
      setZipError('');
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!nameOnCard.trim()) {
      setNameError('Name on card is required');
      isValid = false;
    }
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      isValid = false;
    }
    if (!expirationDate || expirationDate.length < 5) {
      Alert.alert('Error', 'Please enter a valid expiration date');
      isValid = false;
    }
    if (!securityCode || securityCode.length < 3) {
      Alert.alert('Error', 'Please enter a valid security code');
      isValid = false;
    }
    if (!country) {
      Alert.alert('Error', 'Please select a country');
      isValid = false;
    }
    if (!zip.trim()) {
      setZipError('Zip code is required');
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
      // Step 1: Create SetupIntent if we don't have one
      let currentSetupIntent = setupIntentData;
      
      if (!currentSetupIntent) {
        console.log('Creating SetupIntent...');
        const setupIntentResponse = await createSetupIntentMutation.mutateAsync();
        currentSetupIntent = setupIntentResponse.data;
        setSetupIntentData(currentSetupIntent);
      }

      // Step 2: Simulate Stripe SDK card collection and confirmation
      // In a real app, you would use Stripe SDK here:
      // const { error } = await confirmSetupIntent(currentSetupIntent.client_secret, {
      //   payment_method: {
      //     card: cardElement,
      //     billing_details: { 
      //       name: nameOnCard,
      //       address: {
      //         country: country,
      //         postal_code: zip
      //       }
      //     }
      //   }
      // });

      console.log('🔄 Simulating Stripe SetupIntent confirmation...');
      console.log('Card Details:', {
        name: nameOnCard,
        cardNumber: cardNumber.replace(/\s/g, '').slice(-4),
        expirationDate,
        country,
        zip
      });

      // For demo purposes, simulate successful Stripe confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Save payment method via our API
      console.log('💾 Saving payment method via API...');
      const result = await savePaymentMethodMutation.mutateAsync({
        setup_intent_id: currentSetupIntent.setup_intent_id,
      });

      console.log('✅ Payment method saved:', result);

      setIsProcessing(false);
      
      Alert.alert(
        'Success!',
        'Your payment method has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation?.navigate('PaymentMethodsScreen')
          }
        ]
      );

    } catch (error) {
      setIsProcessing(false);
      console.error('Payment method setup failed:', error);
      Alert.alert(
        'Error',
        'Failed to save payment method. Please try again.',
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
          <Text className="text-2xl font-bold text-black">Payment Method</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Choose a payment method */}
        <Text className="text-lg font-medium text-black mb-4">
          Choose a payment method
        </Text>

        {/* Payment Method Options */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            className="flex-row items-center mr-6"
            onPress={() => setSelectedPaymentMethod('Card')}
          >
            <RadioButton selected={selectedPaymentMethod === 'Card'} />
            <Text className="ml-2 text-base text-black">Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center mr-6"
            onPress={() => setSelectedPaymentMethod('Bank Transfer')}
          >
            <RadioButton selected={selectedPaymentMethod === 'Bank Transfer'} />
            <Text className="ml-2 text-base text-black">Bank Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setSelectedPaymentMethod('Other Option')}
          >
            <RadioButton selected={selectedPaymentMethod === 'Other Option'} />
            <Text className="ml-2 text-base text-black">Other Option</Text>
          </TouchableOpacity>
        </View>

        {/* Name on card */}
        <Text className="text-base font-medium text-black mb-2">
          Name on card
        </Text>
        <TextInput
          className={`bg-[#FBFFF0] border rounded-xl px-4 text-base text-black ${nameError ? 'border-red-500' : 'border-[#D0D5DD]'}`}
          style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
          value={nameOnCard}
          onChangeText={validateName}
          placeholder="Name on card"
        />
        {nameError ? (
          <Text className="text-red-500 text-sm mb-4">{nameError}</Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* Card number */}
        <Text className="text-base font-medium text-black mb-2">
          Card number
        </Text>
        <TextInput
          className="bg-[#FBFFF0] border border-[#D0D5DD] rounded-xl px-4 text-base text-black mb-4"
          style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
          value={cardNumber}
          onChangeText={handleCardNumberChange}
          placeholder="2345 4567 4567 5467"
          keyboardType="numeric"
        />

        {/* Expiration date and Security code */}
        <View className="flex-row gap-x-4 mb-4">
          <View className="flex-1">
            <Text className="text-base font-medium text-black mb-2">
              Expiration date
            </Text>
            <TextInput
              className="bg-[#FBFFF0] border border-[#D0D5DD] rounded-xl px-4 text-base text-black"
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={expirationDate}
              onChangeText={handleExpirationChange}
              placeholder="12/27"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-black mb-2">
              Security code
            </Text>
            <View className="relative">
              <TextInput
                className="bg-[#FBFFF0] border border-[#D0D5DD] rounded-xl px-4 pr-12 text-base text-black"
                style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
                value={securityCode}
                onChangeText={setSecurityCode}
                placeholder="***"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry={!showSecurityCode}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 16, top: 16 }}
                onPress={() => setShowSecurityCode(!showSecurityCode)}
              >
                <EyeSvg />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Country and Zip */}
        <View className="flex-row gap-x-4 mb-8">
          <View className="flex-1">
            <Text className="text-base font-medium text-black mb-2">
              Country
            </Text>
            <TouchableOpacity
              className="bg-[#FBFFF0] border border-[#D0D5DD] rounded-xl px-4 py-5"
              onPress={() => setShowCountryModal(true)}
            >
              <Text className={`text-base ${country ? 'text-black' : 'text-gray-400'}`}>
                {country || 'Select'}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-black mb-2">
              Zip
            </Text>
            <TextInput
              className={`bg-[#FBFFF0] border rounded-xl px-4 text-base text-black ${zipError ? 'border-red-500' : 'border-[#D0D5DD]'}`}
              style={{ height: 56, lineHeight: 20, textAlignVertical: 'center', paddingTop: 18, paddingBottom: 18 }}
              value={zip}
              onChangeText={validateZip}
              placeholder="Enter"
              keyboardType="numeric"
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
                  {countries.map((countryName, index) => (
                    <TouchableOpacity
                      key={`country-${index}`}
                      style={{ 
                        paddingVertical: 15, 
                        paddingHorizontal: 20, 
                        borderBottomWidth: 0.5, 
                        borderBottomColor: '#E5E7EB',
                        backgroundColor: country === countryName ? '#F0FDF4' : 'white'
                      }}
                      onPress={() => {
                        setCountry(countryName);
                        setShowCountryModal(false);
                      }}
                    >
                      <Text style={{ 
                        fontSize: 16, 
                        color: 'black',
                        fontWeight: country === countryName ? '600' : '400'
                      }}>
                        {countryName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Manage Payment Methods Button */}
        <TouchableOpacity 
          className="bg-blue-600 rounded-full py-4 mx-2 mb-4"
          onPress={() => navigation?.navigate('PaymentMethodsScreen')}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Manage Payment Methods
          </Text>
        </TouchableOpacity>

        {/* Pay Now Button */}
        <TouchableOpacity 
          className={`${isProcessing ? 'bg-gray-400' : 'bg-[#44A27B]'} rounded-full py-4 mx-2 flex-row justify-center items-center`}
          onPress={handlePayNow}
          disabled={isProcessing}
        >
          {isProcessing && (
            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          )}
          <Text className="text-white text-center text-lg font-semibold">
            {isProcessing ? 'Saving Payment Method...' : 'Save Payment Method'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}