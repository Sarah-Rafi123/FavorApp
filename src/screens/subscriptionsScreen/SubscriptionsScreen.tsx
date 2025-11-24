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
  Platform,
} from 'react-native';
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import Svg, { Path, Circle } from 'react-native-svg';
// Using main app logo for consistency
import BackSvg from '../../assets/icons/Back';
import FIcon from '../../assets/icons/FIcon';
import useAuthStore from '../../store/useAuthStore';

interface SubscriptionsScreenProps {
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

export function SubscriptionsScreen({ navigation }: SubscriptionsScreenProps) {
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { user } = useAuthStore();

  const features = [
    "Unlock premium subscription features",
    "Priority support for your favor requests", 
    "Access to exclusive subscriber benefits"
  ];

  useEffect(() => {
    initializeRevenueCatAndLoadOfferings();
  }, [user]);

  const initializeRevenueCatAndLoadOfferings = async () => {
    if (!user?.id) {
      console.warn('⚠️ No user ID available for RevenueCat login');
      await loadOfferings();
      return;
    }

    try {
      // Log in user to RevenueCat with their user ID
      console.log('🔗 Logging in to RevenueCat with user ID:', user.id);
      const customerInfo = await Purchases.logIn(user.id);
      
      console.log('✅ RevenueCat login successful:', {
        originalAppUserId: customerInfo.customerInfo.originalAppUserId,
        isAnonymous: customerInfo.customerInfo.originalAppUserId.startsWith('$RCAnonymousID'),
        activeEntitlements: Object.keys(customerInfo.customerInfo.entitlements.active),
        hasActiveSubscriptions: Object.keys(customerInfo.customerInfo.entitlements.active).length > 0,
        customerInfoCreated: customerInfo.created
      });

      // Log webhook-related info
      console.log('📡 RevenueCat Webhook Integration Info:');
      console.log('  - User ID for webhook:', user.id);
      console.log('  - App User ID (should match):', customerInfo.customerInfo.originalAppUserId);
      console.log('  - This will be sent as app_user_id in webhook events');
      
    } catch (error) {
      console.error('❌ RevenueCat login failed:', error);
      Alert.alert(
        'Setup Error',
        'Failed to initialize subscription system. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      // Always load offerings regardless of login success/failure
      await loadOfferings();
    }
  };

  const loadOfferings = async () => {
    try {
      console.log('🔍 Platform:', Platform.OS);
      console.log('🔍 Environment:', process.env.EXPO_PUBLIC_ENVIRONMENT || 'production');
      console.log('🔍 Getting offerings...');
      
      const offerings = await Purchases.getOfferings();
      console.log('📦 All offerings:', offerings);
      console.log('📦 Current offering:', offerings.current);
      console.log('📦 Platform-specific offering keys:', Object.keys(offerings.all));
      
      if (offerings.current !== null) {
        console.log('📦 Available packages:', offerings.current.availablePackages);
        console.log('📦 Package details:');
        offerings.current.availablePackages.forEach((pkg, index) => {
          console.log(`  Package ${index + 1}:`, {
            identifier: pkg.identifier,
            packageType: pkg.packageType,
            product: {
              identifier: pkg.product.identifier,
              price: pkg.product.price,
              priceString: pkg.product.priceString,
              currencyCode: pkg.product.currencyCode,
              title: pkg.product.title,
              description: pkg.product.description
            }
          });
        });
        setOfferings(offerings.current);
      } else {
        console.log('⚠️ No offerings available');
        console.log('💡 This might be because:');
        console.log('   1. Products not configured in RevenueCat dashboard');
        console.log('   2. Products not configured in Google Play Console');
        console.log('   3. App not published/uploaded to Google Play Console');
        console.log('   4. RevenueCat API keys not properly configured');
        
        const isTestingBuild = process.env.EXPO_PUBLIC_ENVIRONMENT === 'testing';
        
        Alert.alert(
          'No Subscriptions Found', 
          Platform.OS === 'android' 
            ? isTestingBuild
              ? 'Test subscriptions not available. Make sure:\n\n1. Products are configured in Google Play Console\n2. App is uploaded as Internal Testing\n3. You are added as a test user\n4. Test products are created and published'
              : 'Products may not be configured in Google Play Console. For testing on Android, ensure your app is uploaded to Google Play Console (even as draft) and products are created.'
            : 'Please configure your subscription offerings in RevenueCat dashboard first.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Error loading offerings:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        domain: error.domain,
        userInfo: error.userInfo
      });
      
      let errorMessage = 'Failed to load subscription plans.';
      if (Platform.OS === 'android') {
        if (error.message?.includes('BILLING_UNAVAILABLE')) {
          errorMessage = 'Google Play Billing is unavailable. Make sure Google Play Store is installed and up to date.';
        } else if (error.message?.includes('SERVICE_UNAVAILABLE')) {
          errorMessage = 'Google Play Store service is temporarily unavailable. Please try again later.';
        } else if (error.message?.includes('ITEM_UNAVAILABLE')) {
          errorMessage = 'Subscription products are not available. The app may need to be published to Google Play Console.';
        } else {
          errorMessage = `Android billing error: ${error.message || 'Unknown error'}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    if (!user?.id) {
      Alert.alert(
        'Login Required',
        'Please log in to subscribe to premium features.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setPurchasing(packageToPurchase.identifier);
      
      console.log('\n🛒 STARTING SUBSCRIPTION PURCHASE:');
      console.log('📦 Package:', {
        identifier: packageToPurchase.identifier,
        packageType: packageToPurchase.packageType,
        productId: packageToPurchase.product.identifier,
        price: packageToPurchase.product.priceString
      });
      console.log('👤 User ID:', user.id);
      console.log('🔗 This purchase will trigger RevenueCat webhook with:');
      console.log('  - event.type: INITIAL_PURCHASE');
      console.log('  - event.app_user_id:', user.id);
      console.log('  - event.product_id:', packageToPurchase.product.identifier);
      console.log('  - Backend will look for user with ID:', user.id);

      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('\n✅ PURCHASE COMPLETED:');
      console.log('📱 Product purchased:', productIdentifier);
      console.log('👤 Customer ID:', customerInfo.originalAppUserId);
      console.log('🎫 Active entitlements:', Object.keys(customerInfo.entitlements.active));
      console.log('📅 Latest expiration:', customerInfo.latestExpirationDate);
      console.log('🔔 Management URL:', customerInfo.managementURL);

      console.log('\n📡 WEBHOOK SHOULD BE TRIGGERED:');
      console.log('  - RevenueCat will send INITIAL_PURCHASE webhook to backend');
      console.log('  - Backend will find user by ID:', user.id);
      console.log('  - Backend will set user.is_certified = true');
      console.log('  - Backend will create subscription record with source: revenue_cat');
      
      // Check for premium entitlement or any active entitlements
      if (customerInfo.entitlements.active['premium'] || 
          Object.keys(customerInfo.entitlements.active).length > 0) {
        console.log('🎉 Entitlements active - subscription confirmed');
        Alert.alert(
          'Success!', 
          'You are now subscribed! Your account has been upgraded to premium. The backend will automatically sync your subscription status.',
          [{ text: 'OK', onPress: () => navigation?.goBack() }]
        );
      } else {
        console.log('⏳ No active entitlements yet - webhook may be processing');
        Alert.alert(
          'Purchase Complete', 
          'Your purchase was successful! Your premium features will be activated shortly via our backend webhook system.',
          [{ text: 'OK', onPress: () => navigation?.goBack() }]
        );
      }
    } catch (error: any) {
      console.error('\n❌ PURCHASE FAILED:', error);
      console.log('📋 Error details:', {
        message: error.message,
        userCancelled: error.userCancelled,
        code: error.code,
        domain: error.domain
      });
      
      if (!error.userCancelled) {
        Alert.alert(
          'Purchase Error', 
          error.message || 'Failed to complete purchase. Please try again.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('👤 User cancelled purchase');
      }
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (pkg: PurchasesPackage) => {
    return pkg.product.priceString;
  };

  const getPackageTitle = (pkg: PurchasesPackage) => {
    switch (pkg.packageType) {
      case 'MONTHLY':
        return '1 Month';
      case 'ANNUAL':
        return '1 Year';
      case 'THREE_MONTH':
        return '3 Months';
      case 'SIX_MONTH':
        return '6 Months';
      default:
        return pkg.product.title || 'Subscription';
    }
  };

  const getSavingsText = (pkg: PurchasesPackage) => {
    if (pkg.packageType === 'ANNUAL') {
      return 'Best Value - Save up to 50%';
    }
    return '';
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
          <Text className="text-2xl font-bold text-black">Get Subscribed</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="items-center px-6 pt-8">
          
          {/* Icon */}
          <View className="mb-8">
            <FIcon />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Get Subscribed
          </Text>
          
          {/* Testing Environment Indicator */}
          {process.env.EXPO_PUBLIC_ENVIRONMENT === 'testing' && (
            <View className="bg-yellow-100 border border-yellow-400 rounded-lg px-4 py-2 mb-4">
              <Text className="text-yellow-800 text-sm text-center font-medium">
                🧪 Testing Build - Google Play test accounts enabled
              </Text>
            </View>
          )}
          
          {/* Subtitle with lines */}
          <View className="flex-row items-center mb-8 w-full px-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-lg text-gray-600 px-4">
              Premium Features
            </Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Features List */}
          <View className="w-full mb-8">
            {features.map((feature, index) => (
              <View key={index} className="flex-row items-start mb-4">
                <View className="mr-3 mt-1">
                  <CheckIcon />
                </View>
                <Text className="flex-1 text-gray-700 text-base leading-6">
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Pricing Cards */}
          {loading ? (
            <View className="flex-row justify-center items-center py-8">
              <ActivityIndicator size="large" color="#44A27B" />
              <Text className="ml-3 text-gray-600">Loading subscription plans...</Text>
            </View>
          ) : offerings && offerings.availablePackages.length > 0 ? (
            <View className="w-full mb-8">
              {offerings.availablePackages.map((pkg) => {
                const isAnnual = pkg.packageType === 'ANNUAL';
                const savingsText = getSavingsText(pkg);
                const isPurchasing = purchasing === pkg.identifier;
                
                return (
                  <View 
                    key={pkg.identifier}
                    className={`w-full bg-[#FBFFF0] rounded-2xl p-6 mb-4 shadow-sm ${
                      isAnnual ? 'border-2 border-[#71DFB1]' : 'border border-[#71DFB1]'
                    }`}
                  >
                    {isAnnual && (
                      <View className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <View className="bg-[#44A27B] px-4 py-1 rounded-full">
                          <Text className="text-white text-sm font-semibold">Most Popular</Text>
                        </View>
                      </View>
                    )}
                    
                    <Text className="text-lg font-semibold text-gray-800 text-center mb-2">
                      {getPackageTitle(pkg)}
                    </Text>
                    <Text className="text-3xl font-bold text-gray-800 text-center mb-1">
                      {formatPrice(pkg)}
                    </Text>
                    {savingsText ? (
                      <Text className="text-sm text-green-600 text-center mb-6 font-semibold">
                        {savingsText}
                      </Text>
                    ) : (
                      <View className="mb-6" />
                    )}
                    
                    <TouchableOpacity 
                      className={`rounded-3xl py-3 ${isPurchasing ? 'bg-gray-400' : 'bg-[#44A27B]'}`}
                      onPress={() => handlePurchase(pkg)}
                      disabled={isPurchasing}
                    >
                      {isPurchasing ? (
                        <View className="flex-row justify-center items-center">
                          <ActivityIndicator size="small" color="white" />
                          <Text className="text-white text-center font-semibold ml-2">
                            Processing...
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-white text-center font-semibold">
                          Subscribe Now
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="w-full bg-[#FBFFF0] rounded-2xl p-6 mb-8 border border-gray-300">
              <Text className="text-center text-gray-600 mb-4">
                No subscription plans available at the moment.
              </Text>
              <TouchableOpacity 
                className="bg-gray-500 rounded-3xl py-3"
                onPress={loadOfferings}
              >
                <Text className="text-white text-center font-semibold">
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}