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
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path, Circle } from 'react-native-svg';
// Using main app logo for consistency
import BackSvg from '../../assets/icons/Back';
import FIcon from '../../assets/icons/FIcon';

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

  const features = [
    "Unlock premium subscription features",
    "Priority support for your favor requests", 
    "Access to exclusive subscriber benefits"
  ];

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      console.log('📦 All offerings:', offerings);
      console.log('📦 Current offering:', offerings.current);
      
      if (offerings.current !== null) {
        console.log('📦 Available packages:', offerings.current.availablePackages);
        setOfferings(offerings.current);
      } else {
        console.log('⚠️ No offerings available');
        // For development, show a message about offerings setup
        Alert.alert(
          'No Subscriptions Found', 
          'Please configure your subscription offerings in RevenueCat dashboard first.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(packageToPurchase.identifier);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // Check for premium entitlement or any active entitlements
      if (customerInfo.entitlements.active['premium'] || 
          Object.keys(customerInfo.entitlements.active).length > 0) {
        Alert.alert(
          'Success!', 
          'You are now subscribed! Enjoy your premium features.',
          [{ text: 'OK', onPress: () => navigation?.goBack() }]
        );
      } else {
        Alert.alert(
          'Purchase Complete', 
          'Your purchase was successful! Premium features will be activated shortly.',
          [{ text: 'OK', onPress: () => navigation?.goBack() }]
        );
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (!error.userCancelled) {
        Alert.alert('Purchase Error', error.message || 'Failed to complete purchase');
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