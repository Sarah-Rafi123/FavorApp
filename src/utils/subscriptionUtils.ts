import { getCertificationStatus } from '../services/apis/CertificationApis';

export interface SubscriptionCheckResult {
  hasActiveSubscription: boolean;
  isCertified: boolean;
  subscriptionData?: any;
}

/**
 * Checks if user has an active subscription
 * @returns Promise<SubscriptionCheckResult>
 */
export const checkSubscriptionStatus = async (): Promise<SubscriptionCheckResult> => {
  try {
    console.log('🔍 Checking subscription status...');
    
    const response = await getCertificationStatus();
    const { is_certified, active_subscription } = response.data;
    
    const hasActiveSubscription = is_certified && Boolean(active_subscription?.active);
    
    console.log('✅ Subscription status checked:', {
      is_certified,
      hasActiveSubscription,
      subscription_source: response.data.subscription_source,
      subscription_active: active_subscription?.active
    });
    
    return {
      hasActiveSubscription,
      isCertified: is_certified,
      subscriptionData: response.data
    };
  } catch (error) {
    console.error('❌ Failed to check subscription status:', error);
    
    // In case of error, assume no subscription to be safe
    return {
      hasActiveSubscription: false,
      isCertified: false,
      subscriptionData: null
    };
  }
};

/**
 * Navigation helper that checks subscription status before navigating to GetCertifiedScreen
 * If no active subscription, navigates to SubscriptionsScreen first
 * @param navigation - React Navigation object
 * @param onSubscriptionConfirmed - Optional callback when subscription is confirmed
 */
export const navigateToGetCertifiedWithSubscriptionCheck = async (
  navigation: any,
  onSubscriptionConfirmed?: () => void
) => {
  try {
    // Check if navigation object exists
    if (!navigation) {
      console.error('❌ Navigation object is null or undefined');
      return;
    }

    const { hasActiveSubscription } = await checkSubscriptionStatus();
    
    if (hasActiveSubscription) {
      console.log('✅ User has active subscription - navigating to GetCertifiedScreen');
      navigation.navigate('Settings', { screen: 'GetCertifiedScreen' });
      onSubscriptionConfirmed?.();
    } else {
      console.log('⚠️ User has no active subscription - navigating to SubscriptionsScreen');
      navigation.navigate('Settings', { screen: 'SubscriptionsScreen' });
    }
  } catch (error) {
    console.error('❌ Error during subscription check navigation:', error);
    
    // Check again if navigation exists before error fallback
    if (navigation) {
      navigation.navigate('Settings', { screen: 'SubscriptionsScreen' });
    } else {
      console.error('❌ Cannot navigate - navigation object is null');
    }
  }
};