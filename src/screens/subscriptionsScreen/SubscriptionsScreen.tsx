import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import Svg, { Path, Circle } from 'react-native-svg';
import { getCertificationStatus, CertificationStatusData } from '../../services/apis/CertificationApis';
import { useLifetimeSlots } from '../../services/queries/LifetimeSlotsQueries';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    type: 'monthly' | 'annual' | null;
    expirationDate: string | null;
    productId: string | null;
  }>({ type: null, expirationDate: null, productId: null });
  const [backendSubscriptionData, setBackendSubscriptionData] = useState<CertificationStatusData | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  
  // Fetch lifetime slots availability
  const { 
    data: lifetimeSlots, 
    isLoading: lifetimeSlotsLoading, 
    error: lifetimeSlotsError,
    refetch: refetchLifetimeSlots 
  } = useLifetimeSlots();

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        initializeRevenueCat(),
        refetchLifetimeSlots()
      ]);
    } catch (error) {
      console.error('Error refreshing subscription data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const features = [
    "No Admin or Extra Fees",
    "Free Verification", 
    "Ask or Do Paid Favors",
  ];

  useEffect(() => {
    initializeRevenueCat();
  }, [user]);

  // Refetch subscription status every time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id && isInitialized) {
        console.log('🔄 Screen focused - refreshing subscription data...');
        initializeRevenueCat();
        refetchLifetimeSlots();
      }
    }, [user?.id, isInitialized, refetchLifetimeSlots])
  );

  const initializeRevenueCat = async () => {
    if (!user?.id) {
      console.warn('⚠️ No user ID available for RevenueCat login');
      setIsInitialized(true);
      return;
    }

    try {
      // Fetch backend subscription data first
      console.log('🌐 Fetching subscription data from backend...');
      const backendData = await getCertificationStatus();
      setBackendSubscriptionData(backendData.data);
      
      console.log('✅ Backend subscription data:', {
        is_certified: backendData.data.is_certified,
        subscription_source: backendData.data.subscription_source,
        active_subscription: backendData.data.active_subscription
      });

      // Determine subscription status from backend data
      const hasBackendSubscription = backendData.data.is_certified && Boolean(backendData.data.active_subscription?.active);
      setHasActiveSubscription(hasBackendSubscription);

      // If user has backend subscription, get detailed info
      if (hasBackendSubscription && backendData.data.active_subscription) {
        const backendDetails = {
          type: backendData.data.active_subscription.plan.interval === 'month' ? 'monthly' as const : 'annual' as const,
          expirationDate: null, // Backend doesn't provide expiration date yet
          productId: backendData.data.active_subscription.plan.stripe_price_id || backendData.data.active_subscription.transaction_id
        };
        setSubscriptionDetails(backendDetails);
      }

      // Log in user to RevenueCat with their user ID
      console.log('🔗 Logging in to RevenueCat with user ID:', user.id);
      const customerInfo = await Purchases.logIn(user.id);
      
      const activeEntitlements = Object.keys(customerInfo.customerInfo.entitlements.active);
      
      // Check for cancelled subscription - if premium entitlement exists but won't renew, it's cancelled
      const allEntitlements = customerInfo.customerInfo.entitlements.all;
      const premiumEntitlement = customerInfo.customerInfo.entitlements.active['premium'] || allEntitlements['premium'];
      
      // More accurate RevenueCat subscription check
      const hasRevenueCatSubscription = activeEntitlements.length > 0 && 
        (!premiumEntitlement || (premiumEntitlement.willRenew && !premiumEntitlement.billingIssueDetectedAt && !premiumEntitlement.unsubscribeDetectedAt));
      
      console.log('✅ RevenueCat login successful:', {
        originalAppUserId: customerInfo.customerInfo.originalAppUserId,
        isAnonymous: customerInfo.customerInfo.originalAppUserId.startsWith('$RCAnonymousID'),
        activeEntitlements: activeEntitlements,
        hasActiveSubscriptions: hasRevenueCatSubscription,
        customerInfoCreated: customerInfo.created,
        premiumWillRenew: premiumEntitlement?.willRenew,
        premiumBillingIssue: !!premiumEntitlement?.billingIssueDetectedAt,
        premiumUnsubscribed: !!premiumEntitlement?.unsubscribeDetectedAt,
        premiumExpirationDate: premiumEntitlement?.expirationDate
      });

      // If RevenueCat has subscription but backend doesn't, prioritize backend
      // This handles cases where backend is the source of truth
      if (!hasBackendSubscription && hasRevenueCatSubscription) {
        console.log('🔄 RevenueCat subscription found, but backend shows no active subscription');
        // Still set as subscribed and get RevenueCat details
        setHasActiveSubscription(hasRevenueCatSubscription);
        const details = getSubscriptionDetails(customerInfo.customerInfo);
        setSubscriptionDetails(details);
      } else if (hasRevenueCatSubscription && hasBackendSubscription) {
        // Both have subscription - get expiration date from RevenueCat
        const revenueCatDetails = getSubscriptionDetails(customerInfo.customerInfo);
        setSubscriptionDetails(prev => ({
          ...prev,
          expirationDate: revenueCatDetails.expirationDate
        }));
      }

      // Load offerings for potential upgrades
      console.log('🛒 Loading RevenueCat offerings...');
      const offerings = await Purchases.getOfferings();
      
      console.log('📦 Offerings loaded:', {
        hasCurrentOffering: !!offerings.current,
        offeringsCount: Object.keys(offerings.all).length,
        currentOfferingId: offerings.current?.identifier,
        packagesCount: offerings.current?.availablePackages?.length || 0
      });
      
      if (offerings.current) {
        setOfferings(offerings.current);
        console.log('✅ Offerings set successfully:', {
          identifier: offerings.current.identifier,
          packages: offerings.current.availablePackages.map(pkg => ({
            identifier: pkg.product.identifier,
            packageType: pkg.packageType,
            price: pkg.product.priceString
          }))
        });
      } else {
        console.log('⚠️ No current offering found');
        setOfferings(null);
      }

      // Log webhook-related info
      console.log('📡 RevenueCat Webhook Integration Info:');
      console.log('  - User ID for webhook:', user.id);
      console.log('  - App User ID (should match):', customerInfo.customerInfo.originalAppUserId);
      console.log('  - This will be sent as app_user_id in webhook events');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      Alert.alert(
        'Setup Error',
        'Failed to initialize subscription system. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsInitialized(true);
    }
  };

  const getSubscriptionDetails = (customerInfo: CustomerInfo) => {
    const activeSubscriptions = customerInfo.activeSubscriptions;
    const entitlements = customerInfo.entitlements.active;
    
    // Check if subscription is actually cancelled (will renew = false)
    const allEntitlements = customerInfo.entitlements.all;
    const premiumEntitlement = entitlements['premium'] || allEntitlements['premium'];
    
    console.log('🔍 Detailed subscription check:', {
      activeSubscriptions: activeSubscriptions.length,
      activeEntitlements: Object.keys(entitlements).length,
      willRenew: premiumEntitlement?.willRenew,
      isActive: premiumEntitlement?.isActive,
      expirationDate: premiumEntitlement?.expirationDate,
      billingIssueDetectedAt: premiumEntitlement?.billingIssueDetectedAt,
      unsubscribeDetectedAt: premiumEntitlement?.unsubscribeDetectedAt
    });
    
    // If subscription is cancelled (willRenew = false) or has billing issues, don't count as active
    if (premiumEntitlement && (!premiumEntitlement.willRenew || premiumEntitlement.billingIssueDetectedAt || premiumEntitlement.unsubscribeDetectedAt)) {
      console.log('⚠️ Subscription cancelled or has billing issues - treating as inactive');
      return { type: null, expirationDate: null, productId: null };
    }
    
    // Get the first active subscription
    const firstActiveSubscription = activeSubscriptions[0];
    if (!firstActiveSubscription) {
      return { type: null, expirationDate: null, productId: null };
    }

    // Determine subscription type based on product ID
    let subscriptionType: 'monthly' | 'annual' | null = null;
    if (firstActiveSubscription.includes('monthly') || firstActiveSubscription.includes('month')) {
      subscriptionType = 'monthly';
    } else if (firstActiveSubscription.includes('annual') || firstActiveSubscription.includes('year')) {
      subscriptionType = 'annual';
    }

    // Get expiration date from entitlements
    const expirationDate = premiumEntitlement?.expirationDate || customerInfo.latestExpirationDate;

    console.log('📊 Subscription details:', {
      productId: firstActiveSubscription,
      type: subscriptionType,
      expirationDate: expirationDate,
      willRenew: premiumEntitlement?.willRenew
    });

    return {
      type: subscriptionType,
      expirationDate: expirationDate,
      productId: firstActiveSubscription
    };
  };

  const handleRevenueCatError = (error: any) => {
    console.error('❌ RevenueCat error details:', {
      message: error.message,
      code: error.code,
      underlyingErrorMessage: error.underlyingErrorMessage,
      domain: error.domain,
      userInfo: error.userInfo
    });

    // Handle account conflict scenarios
    if (error.code === 7 || error.message?.includes('already associated') || 
        error.message?.includes('store account') || error.code === 'PURCHASE_NOT_ALLOWED') {
      Alert.alert(
        'Account Conflict',
        'Your device\'s app store account is already linked to a different app account. Would you like to restore your existing purchases or continue with a different store account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Restore Purchases', 
            onPress: handleRestorePurchases 
          },
          { 
            text: 'Use Different Account', 
            onPress: () => {
              Alert.alert(
                'Switch Store Account',
                'To subscribe with a different store account:\n\n1. Sign out of your current Google Play/App Store account\n2. Sign in with a different account\n3. Return to the app and try subscribing again\n\nOr contact support if you need help transferring your subscription.',
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
      return;
    }

    // Handle other RevenueCat specific errors
    if (error.code === 1 || error.message?.includes('cancelled')) {
      console.log('👤 User cancelled purchase');
      return;
    }

    if (error.code === 3 || error.message?.includes('network')) {
      Alert.alert(
        'Network Error',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (error.code === 4 || error.message?.includes('invalid')) {
      Alert.alert(
        'Subscription Error',
        'The subscription option is not available. Please try again later or contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Generic error fallback
    Alert.alert(
      'Subscription Error',
      error.message || 'Failed to process subscription. Please try again or contact support.',
      [{ text: 'OK' }]
    );
  };

  const handleRestorePurchases = async () => {
    try {
      console.log('🔄 Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      
      console.log('✅ Restore completed:', {
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        activeSubscriptions: customerInfo.activeSubscriptions
      });

      const hasRestoredSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasRestoredSubscription) {
        // Update local state
        setHasActiveSubscription(true);
        const details = getSubscriptionDetails(customerInfo);
        setSubscriptionDetails(details);
        
        // Refresh backend data
        setTimeout(() => {
          initializeRevenueCat();
        }, 1000);

        Alert.alert(
          'Success!',
          'Your subscription has been restored successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No active subscriptions were found to restore. If you believe this is an error, please contact support.',
          [{ text: 'OK' }]
        );
      }
    } catch (restoreError: any) {
      console.error('❌ Restore failed:', restoreError);
      Alert.alert(
        'Restore Failed',
        'Failed to restore purchases. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    }
  };

  const openSubscriptionModal = async () => {
    try {
      console.log('🛒 Opening RevenueCat Subscription Modal...');
      
      // Check lifetime slots before opening modal
      if (lifetimeSlots && lifetimeSlots.slots_remaining > 0) {
        console.log(`🎫 ${lifetimeSlots.slots_remaining} lifetime slots remaining`);
      }
      
      await RevenueCatUI.presentPaywall();
      
      // Refresh subscription status and lifetime slots after modal closes
      setTimeout(() => {
        console.log('🔄 Refreshing subscription data and lifetime slots after modal close...');
        Promise.all([
          initializeRevenueCat(),
          refetchLifetimeSlots()
        ]);
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error opening subscription modal:', error);
      handleRevenueCatError(error);
    }
  };

  const openCustomerCenterModal = async () => {
    try {
      console.log('🛠️ Opening RevenueCat Customer Center Modal...');
      await RevenueCatUI.presentCustomerCenter();
      
      // Check if subscription was cancelled and show plans
      setTimeout(async () => {
        console.log('🔄 Checking subscription status after Customer Center...');
        await initializeRevenueCat();
        
        // If user cancelled subscription, show them the subscription plans again
        if (!hasActiveSubscription) {
          console.log('📱 Subscription cancelled, showing plans...');
          setTimeout(() => {
            openSubscriptionModal();
          }, 1000);
        }
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error opening Customer Center:', error);
      Alert.alert(
        'Customer Support',
        'For subscription management, please contact support@favorapp.com',
        [{ text: 'OK' }]
      );
    }
  };

  const getSubscriptionPlatform = () => {
    // Check backend subscription source first
    if (backendSubscriptionData?.subscription_source === 'stripe') {
      return 'web';
    } else if (backendSubscriptionData?.subscription_source === 'revenue_cat') {
      return 'mobile';
    }
    
    // Fallback to checking product ID patterns
    const productId = subscriptionDetails.productId;
    if (productId?.includes('google') || productId?.includes('play')) {
      return 'android';
    } else if (productId?.includes('apple') || productId?.includes('ios')) {
      return 'ios';
    } else if (productId?.includes('stripe') || productId?.includes('price_')) {
      return 'web';
    }
    
    return 'unknown';
  };

  const getStoreName = () => {
    const platform = getSubscriptionPlatform();
    switch (platform) {
      case 'web':
        return 'Web (Stripe)';
      case 'android':
        return 'Google Play Store';
      case 'ios':
        return 'Apple App Store';
      case 'mobile':
        return Platform.OS === 'android' ? 'Google Play Store' : 'Apple App Store';
      default:
        return 'Unknown Store';
    }
  };

  const getStoreIcon = () => {
    const platform = getSubscriptionPlatform();
    switch (platform) {
      case 'web':
        return '🌐';
      case 'android':
        return '🤖';
      case 'ios':
        return '🍎';
      case 'mobile':
        return Platform.OS === 'android' ? '🤖' : '🍎';
      default:
        return '🏪';
    }
  };

  const canUpgradeOnCurrentPlatform = () => {
    const subscriptionPlatform = getSubscriptionPlatform();
    const currentPlatform = Platform.OS;
    
    console.log('🔍 Platform upgrade check:', {
      subscriptionPlatform,
      currentPlatform,
      backendSource: backendSubscriptionData?.subscription_source,
      productId: subscriptionDetails.productId
    });
    
    // If subscription is from web (Stripe), they can't upgrade on mobile
    if (subscriptionPlatform === 'web') {
      return false;
    }
    
    // If subscription is from mobile platforms, they should upgrade on the same platform
    if (subscriptionPlatform === 'android' && currentPlatform !== 'android') {
      return false;
    }
    
    if (subscriptionPlatform === 'ios' && currentPlatform !== 'ios') {
      return false;
    }
    
    // If subscription is from RevenueCat mobile, allow upgrade on mobile platforms
    if (subscriptionPlatform === 'mobile') {
      return currentPlatform === 'android' || currentPlatform === 'ios';
    }
    
    // If platform is unknown or same platform, allow upgrade
    if (subscriptionPlatform === 'unknown' || subscriptionPlatform === currentPlatform) {
      return true;
    }
    
    return true;
  };

  const getUpgradeRestrictionMessage = () => {
    const subscriptionPlatform = getSubscriptionPlatform();
    const currentPlatform = Platform.OS;
    
    if (subscriptionPlatform === 'web') {
      return 'You subscribed through our website. Please visit our web app to manage your subscription and upgrade to the annual plan.';
    }
    
    if (subscriptionPlatform === 'android' && currentPlatform === 'ios') {
      return 'You originally subscribed through Google Play Store. Please open the app on your Android device to upgrade to the annual plan.';
    }
    
    if (subscriptionPlatform === 'ios' && currentPlatform === 'android') {
      return 'You originally subscribed through Apple App Store. Please open the app on your iOS device to upgrade to the annual plan.';
    }
    
    return 'Please upgrade your subscription from the same platform where you originally subscribed.';
  };

  const upgradeToAnnual = async () => {
    console.log('🚀 Upgrade to annual plan initiated');
    console.log('📊 Current state:', {
      hasActiveSubscription,
      subscriptionType: subscriptionDetails.type,
      currentPlatform: Platform.OS,
      subscriptionPlatform: getSubscriptionPlatform(),
      canUpgrade: canUpgradeOnCurrentPlatform(),
      offeringsAvailable: !!offerings,
      availablePackagesCount: offerings?.availablePackages?.length || 0
    });

    if (!canUpgradeOnCurrentPlatform()) {
      console.log('❌ Platform restriction blocking upgrade');
      Alert.alert(
        'Platform Restriction',
        getUpgradeRestrictionMessage(),
        [{ text: 'OK' }]
      );
      return;
    }

    if (!offerings || !user?.id) {
      console.log('❌ Missing offerings or user ID:', { offerings: !!offerings, userId: !!user?.id });
      Alert.alert('Error', 'Unable to load upgrade options. Please try again.');
      return;
    }

    try {
      setIsUpgrading(true);
      
      // Debug available packages
      console.log('📦 Available packages:', offerings.availablePackages.map(pkg => ({
        identifier: pkg.product.identifier,
        packageType: pkg.packageType,
        title: pkg.product.title,
        description: pkg.product.description,
        price: pkg.product.priceString
      })));
      
      // Find the annual package with more comprehensive search
      let annualPackage = offerings.availablePackages.find(
        pkg => pkg.packageType === 'ANNUAL'
      );

      if (!annualPackage) {
        annualPackage = offerings.availablePackages.find(
          pkg => pkg.product.identifier.toLowerCase().includes('annual') || 
                 pkg.product.identifier.toLowerCase().includes('year') ||
                 pkg.product.title.toLowerCase().includes('annual') ||
                 pkg.product.title.toLowerCase().includes('year')
        );
      }

      if (!annualPackage) {
        console.log('❌ No annual package found');
        Alert.alert(
          'Annual Plan Not Available', 
          'The annual subscription option is not currently available. Please try refreshing or contact support.',
          [
            { text: 'Refresh', onPress: () => initializeRevenueCat() },
            { text: 'OK' }
          ]
        );
        return;
      }

      console.log('🔄 Starting upgrade to annual subscription:', {
        fromProduct: subscriptionDetails.productId,
        toPackage: {
          identifier: annualPackage.product.identifier,
          packageType: annualPackage.packageType,
          price: annualPackage.product.priceString
        },
        userId: user.id,
        subscriptionPlatform: getSubscriptionPlatform(),
        currentPlatform: Platform.OS
      });

      // Purchase the annual package (RevenueCat handles the upgrade automatically)
      const { customerInfo } = await Purchases.purchasePackage(annualPackage);

      console.log('✅ Upgrade successful:', {
        newProductId: annualPackage.product.identifier,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        expirationDate: customerInfo.latestExpirationDate
      });

      // Update local state with new subscription details
      const newDetails = getSubscriptionDetails(customerInfo);
      setSubscriptionDetails(newDetails);

      // Refresh backend data after upgrade
      setTimeout(() => {
        initializeRevenueCat();
      }, 2000);

      Alert.alert(
        'Upgrade Successful!',
        'You have successfully upgraded to the annual subscription. Your new billing cycle starts now.',
        [{ text: 'OK' }]
      );

    } catch (error: any) {
      console.error('❌ Upgrade failed:', error);
      console.error('❌ Upgrade error details:', {
        message: error.message,
        code: error.code,
        domain: error.domain,
        userInfo: error.userInfo
      });
      handleRevenueCatError(error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const openAndroidUpgradeModal = async () => {
    try {
      console.log('🤖 Opening Android upgrade options...');
      
      // Check lifetime slots availability for Android users
      if (lifetimeSlots && lifetimeSlots.slots_remaining > 0) {
        console.log(`🎫 ${lifetimeSlots.slots_remaining} lifetime slots available for Android users`);
      }
      
      await RevenueCatUI.presentPaywall();
      
      // Refresh subscription status and lifetime slots after modal closes
      setTimeout(() => {
        console.log('🔄 Refreshing data after Android upgrade modal close...');
        Promise.all([
          initializeRevenueCat(),
          refetchLifetimeSlots()
        ]);
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error opening Android upgrade modal:', error);
      handleRevenueCatError(error);
    }
  };

  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isInitialized) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Initializing...</Text>
      </View>
    );
  }

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
            onPress={() => {
              // Navigate back to SettingsMain within the SettingsStack
              navigation?.navigate('SettingsMain');
            }}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">
            {hasActiveSubscription ? 'Manage Subscription' : 'Get Subscribed'}
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#44A27B']}
            tintColor="#44A27B"
            title="Pull to refresh"
            titleColor="#44A27B"
          />
        }
      >
        <View className="items-center px-6 pt-8">
          
          {/* Icon */}
          <View className="mb-8">
            <FIcon />
          </View>

          {/* Title */}
          <Text className="text-4xl font-bold text-gray-800 mb-2 text-center">
            {hasActiveSubscription ? 'FavorApp Pro' : 'Get FavorApp Pro'}
          </Text>
          
          {/* Subtitle with lines */}
          <View className="flex-row items-center mb-8 w-full px-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-xl text-gray-600 px-4">
              {hasActiveSubscription ? 'Your Benefits' : 'Premium Features'}
            </Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Features List */}
          <View className="w-full mb-8 items-center px-6">
            <View className="w-full max-w-xs">
              {features.map((feature, index) => (
                <View key={index} className="flex-row items-center mb-4">
                  <View className="w-6 mr-3 items-center">
                    <CheckIcon />
                  </View>
                  <Text className="text-gray-700 text-lg leading-6 flex-1">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Lifetime Slots Scarcity Alert */}
          {!hasActiveSubscription && !lifetimeSlotsLoading && lifetimeSlots && lifetimeSlots.slots_remaining <= 20 && lifetimeSlots.slots_remaining > 0 && (
            <View className="w-full mb-4 bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <Text className="text-orange-800 text-center font-semibold text-lg mb-1">
                🎫 Limited Time Offer!
              </Text>
              <Text className="text-orange-700 text-center text-base">
                Only {lifetimeSlots.slots_remaining} of {lifetimeSlots.total_slots} Lifetime Plan slots remaining
              </Text>
            </View>
          )}
          
          {/* Lifetime Slots Sold Out Alert */}
          {!hasActiveSubscription && !lifetimeSlotsLoading && lifetimeSlots && lifetimeSlots.slots_remaining === 0 && (
            <View className="w-full mb-4 bg-red-50 border border-red-200 rounded-2xl p-4">
              <Text className="text-red-800 text-center font-semibold text-lg mb-1">
                🚫 Lifetime Plan Sold Out
              </Text>
              <Text className="text-red-700 text-center text-base">
                All {lifetimeSlots.total_slots} Lifetime Plan slots have been taken. Monthly and annual plans are still available.
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {!hasActiveSubscription ? (
            <View className="w-full mb-8">
              <TouchableOpacity 
                className="w-full bg-[#44A27B] rounded-3xl py-4 mb-4 shadow-sm"
                onPress={openSubscriptionModal}
              >
                <Text className="text-white text-center font-bold text-xl">
                  View Subscription Plans
                </Text>
              </TouchableOpacity>
              
              {/* Android-specific Upgrade Plan Button */}
              {/* {Platform.OS === 'android' && (
                <TouchableOpacity 
                  className="w-full bg-blue-600 rounded-3xl py-4 mb-4 shadow-sm"
                  onPress={openAndroidUpgradeModal}
                >
                  <Text className="text-white text-center font-bold text-lg">
                    🤖 Upgrade Plan (Android)
                  </Text>
                </TouchableOpacity>
              )} */}
              
              {/* Restore Purchases Button */}
              <TouchableOpacity 
                className="w-full bg-gray-100 border border-gray-300 rounded-3xl py-3 shadow-sm"
                onPress={handleRestorePurchases}
              >
                <Text className="text-gray-700 text-center font-medium text-lg">
                  Restore Purchases
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="w-full mb-8">
              {/* Subscription Details Card */}
              <View className="w-full bg-[#DCFBCC] rounded-2xl p-6 mb-4 border border-green-600">
                <Text className="text-center text-green-600 font-semibold mb-3 text-lg">
                  ✅ Premium Member
                </Text>
                
                {(subscriptionDetails.type || backendSubscriptionData?.active_subscription) && (
                  <View className=" rounded-lg p-4 mb-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-700 font-medium text-lg">Plan:</Text>
                      <Text className="text-green-800 font-semibold capitalize text-lg">
                        {backendSubscriptionData?.active_subscription?.plan.name || 
                         (subscriptionDetails.type === 'monthly' ? 'Monthly' : 'Annual') + ' Subscription'}
                      </Text>
                    </View>
                    
                    {backendSubscriptionData?.active_subscription && (
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-700 font-medium text-lg">Price:</Text>
                        <Text className="text-gray-600 text-base">
                          ${(backendSubscriptionData.active_subscription.plan.price_cents / 100).toFixed(2)}/{backendSubscriptionData.active_subscription.plan.interval}
                        </Text>
                      </View>
                    )}

                    {backendSubscriptionData?.subscription_source && (
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-700 font-medium text-lg">Source:</Text>
                        <Text className="text-gray-600 text-base capitalize">
                          {backendSubscriptionData.subscription_source === 'revenue_cat' ? 'RevenueCat' : 'Stripe'}
                        </Text>
                      </View>
                    )}

                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-700 font-medium text-lg">Store:</Text>
                      <Text className="text-gray-600 text-base">
                        {getStoreIcon()} {getStoreName()}
                      </Text>
                    </View>

                    {backendSubscriptionData?.active_subscription?.status && (
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-700 font-medium text-lg">Status:</Text>
                        <Text className={`text-base font-medium ${
                          backendSubscriptionData.active_subscription.status === 'paid' ? 'text-green-600' : 'text-green-600'
                        }`}>
                          {backendSubscriptionData.active_subscription.status.charAt(0).toUpperCase() + 
                           backendSubscriptionData.active_subscription.status.slice(1)}
                        </Text>
                      </View>
                    )}
                    
                    {subscriptionDetails.expirationDate && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-700 font-medium text-lg">Renews:</Text>
                        <Text className="text-gray-600 text-base">
                          {formatExpirationDate(subscriptionDetails.expirationDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <Text className="text-center text-green-700 text-base">
                  Enjoy all premium features and benefits
                </Text>
              </View>

              {/* Upgrade Section for Monthly Subscribers */}
              {(subscriptionDetails.type === 'monthly' || backendSubscriptionData?.active_subscription?.plan.interval === 'month') && 
               offerings?.availablePackages?.some(pkg => 
                 pkg.packageType === 'ANNUAL' || 
                 pkg.product.identifier.includes('annual') || 
                 pkg.product.identifier.includes('year')
               ) && (
                <View className={`w-full rounded-2xl p-6 border ${
                  canUpgradeOnCurrentPlatform() 
                    ? 'bg-[#DCFBCC] border-green-600' 
                    : 'bg-orange-50 border-orange-300'
                }`}>
                  <Text className={`text-center font-semibold mb-2 text-lg ${
                    canUpgradeOnCurrentPlatform() ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {canUpgradeOnCurrentPlatform() ? '💰 Save with Annual Plan' : '⚠️ Platform Restriction'}
                  </Text>
                  
                  <Text className={`text-center text-base mb-4 ${
                    canUpgradeOnCurrentPlatform() ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {canUpgradeOnCurrentPlatform() 
                      ? 'Upgrade to annual billing and save up to 50%'
                      : getUpgradeRestrictionMessage()
                    }
                  </Text>
                  
                  {canUpgradeOnCurrentPlatform() ? (
                    <TouchableOpacity 
                      className={`rounded-3xl py-3 ${isUpgrading ? 'bg-gray-400' : 'bg-green-600'}`}
                      onPress={upgradeToAnnual}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? (
                        <View className="flex-row justify-center items-center">
                          <ActivityIndicator size="small" color="white" />
                          <Text className="text-white text-center font-semibold ml-2 text-lg">
                            Upgrading...
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-white text-center font-semibold text-lg">
                          Upgrade to Annual Plan
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      className="bg-gray-300 rounded-3xl py-3"
                      onPress={() => {
                        Alert.alert(
                          'Platform Restriction',
                          getUpgradeRestrictionMessage(),
                          [{ text: 'OK' }]
                        );
                      }}
                    >
                      <Text className="text-gray-600 text-center font-semibold text-lg">
                        Cannot Upgrade Here
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Android-specific Upgrade Button for existing subscribers */}
          {/* {hasActiveSubscription && Platform.OS === 'android' && (
            <View className="w-full mb-6">
              <TouchableOpacity 
                className="w-full bg-blue-600 rounded-3xl py-4 shadow-sm"
                onPress={openAndroidUpgradeModal}
              >
                <Text className="text-white text-center font-bold text-lg">
                  🤖 Explore Upgrade Options (Android)
                </Text>
              </TouchableOpacity>
              <Text className="text-gray-500 text-center text-sm mt-2">
                View available plan upgrades and lifetime options
              </Text>
            </View>
          )} */}

          {/* Customer Support Section */}
          <View className="w-full mt-6">
            <View className="flex-row items-center mb-4 w-full px-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="text-base text-gray-500 px-4">
                {hasActiveSubscription ? 'Manage' : 'Need Help?'}
              </Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            <TouchableOpacity 
              className="w-full bg-white border border-gray-300 rounded-2xl p-4 shadow-sm"
              onPress={openCustomerCenterModal}
            >
              <Text className="text-center text-gray-700 font-medium text-lg">
                🛠️ Customer Center
              </Text>
              <Text className="text-center text-gray-500 text-base mt-1">
                {hasActiveSubscription ? 'Manage subscription and billing' : 'Get support and manage subscription'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}