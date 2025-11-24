import Navigator from './src';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/configs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SetupIntentProvider } from './src/components/auth/SetupIntentProvider';
import { StripeProvider } from '@stripe/stripe-react-native';
import { NotificationProvider } from './src/context/NotificationContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useAuthStore from './src/store/useAuthStore';
import { useEffect } from 'react';
import './global.css';
import { Platform } from 'react-native';
import Purchases, {LOG_LEVEL} from 'react-native-purchases';
// Polyfill for crypto.getRandomValues() required by react-native-google-places-autocomplete
if (typeof global.crypto !== 'object') {
  global.crypto = {} as any;
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = function(array: any) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

const queryClient = new QueryClient();

export default function App() {
  const setQueryClient = useAuthStore((state) => state.setQueryClient);
  
  // HARDCODED for testing - remove after fixing env variables
  const stripePublishableKey = 'pk_test_51Q7dmgB0ebyuNLiRFS67rDTvorE6TiCaf5cXjofD1MUKOUtoT7xDl8LKMkbEhthWmzZtDc5cbwotic3Fv0KjosJ600I9SOjcpj';
  
  // Set the query client in auth store for cache management
  useEffect(() => {
    console.log('🔧 Setting QueryClient in auth store for cache management');
    setQueryClient(queryClient);
  }, [setQueryClient]);
  
  console.log('🔍 Stripe Publishable Key in App.tsx (HARDCODED):', {
    hasKey: !!stripePublishableKey,
    keyLength: stripePublishableKey.length,
    keyStart: stripePublishableKey.substring(0, 25) + '...',
    keyEnd: '...' + stripePublishableKey.substring(stripePublishableKey.length - 10),
    isTestKey: stripePublishableKey.startsWith('pk_test_'),
    isLiveKey: stripePublishableKey.startsWith('pk_live_'),
    hasExtraSpaces: stripePublishableKey.includes(' ')
  });
   useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    
    if (Platform.OS === 'ios') {
       Purchases.configure({
         apiKey: "appl_IWbQrglUqqvMAVfsxJOynJvxdQV"
       });
    } else if (Platform.OS === 'android') {
       Purchases.configure({
         apiKey: "goog_njtAypPNxFIYcZOcwxmshnJeyyb"
       });
    }
    getCustomerInfo();
  }, []);

async function getCustomerInfo() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      console.log("💰 RevenueCat Customer Info:", customerInfo);
      
      // Also get offerings to test configuration
      const offerings = await Purchases.getOfferings();
      console.log("📦 RevenueCat Offerings:", offerings);
      console.log("🔍 Available offering identifiers:", Object.keys(offerings.all));
      
      if (offerings.current) {
        console.log("✅ Current offering found:", offerings.current.identifier);
        console.log("📱 Available packages:", offerings.current.availablePackages.length);
      } else {
        console.log("⚠️ No current offering available");
      }
    } catch (e) {
      console.log("❌ Error fetching RevenueCat data:", e);
    }
}
  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={stripePublishableKey}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <SetupIntentProvider>
              <Navigator />
              <Toast config={toastConfig} />
            </SetupIntentProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
