import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { getTabBarHeight, getTabBarBottomPadding } from '../../utils/systemUI';
import { HomeScreen, ProvideFavorScreen, ProfileScreen, SettingsScreen, FilterScreen, AskFavorScreen, EditFavorScreen, FavorDetailsScreen, UserProfileScreen, ProvideFavorDetailsScreen } from '../../screens';
import { NotificationsScreen } from '../../screens/notificationsScreen/NotificationsScreen';
import { CreateFavorScreen } from '../../screens/createFavorScreen/CreateFavorScreen';
import { GetCertifiedScreen } from '../../screens/getCertifiedScreen/GetCertifiedScreen';
import { SubscriptionsScreen } from '../../screens/subscriptionsScreen/SubscriptionsScreen';
import { PaymentMethodScreen } from '../../screens/paymentMethodScreen/PaymentMethodScreen';
import { PaymentMethodsScreen } from '../../screens/paymentMethodsScreen/PaymentMethodsScreen';
import { StripePaymentScreen } from '../../screens/stripePaymentScreen/StripePaymentScreen';
import { ChangePasswordScreen } from '../../screens/changePasswordScreen/ChangePasswordScreen';
import { HelpSupportScreen } from '../../screens/helpSupportScreen/HelpSupportScreen';
import { FAQScreen } from '../../screens/faqScreen/FAQScreen';
import { DeleteAccountScreen } from '../../screens/deleteAccountScreen/DeleteAccountScreen';
import { AboutAppScreen } from '../../screens/aboutAppScreen/AboutAppScreen';
import { PrivacyPolicyScreen } from '../../screens/privacyPolicyScreen/PrivacyPolicyScreen';
import { TermsConditionsScreen } from '../../screens/termsConditionsScreen/TermsConditionsScreen';
import HomeSvg from '../../assets/icons/Home';
import ProvideFavorSvg from '../../assets/icons/ProvideFavor';
import CenterSvg from '../../assets/icons/Center';
import UserSvg from '../../assets/icons/User';
import SettingsSvg from '../../assets/icons/Settings';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

// Icon components with focus state
const CustomHomeIcon = ({ focused }: { focused: boolean }) => <HomeSvg focused={focused} />;
const CustomProvideFavorIcon = ({ focused }: { focused: boolean }) => <ProvideFavorSvg focused={focused} />;
const CustomUserIcon = ({ focused }: { focused: boolean }) => <UserSvg focused={focused} />;
const CustomSettingsIcon = ({ focused }: { focused: boolean }) => <SettingsSvg focused={focused} />;

// Home Stack that includes Filter screen
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
      />
    </Stack.Navigator>
  );
}

// Provide Favor Stack that includes Ask Favor screen, Favor Details screen, and Filter screen
function ProvideFavorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="ProvideFavorMain" 
        component={ProvideFavorScreen}
      />
      <Stack.Screen 
        name="AskFavorScreen" 
        component={AskFavorScreen}
      />
      <Stack.Screen 
        name="FavorDetailsScreen" 
        component={FavorDetailsScreen}
      />
      <Stack.Screen 
        name="ProvideFavorDetailsScreen" 
        component={ProvideFavorDetailsScreen}
      />
      <Stack.Screen 
        name="UserProfileScreen" 
        component={UserProfileScreen}
      />
    </Stack.Navigator>
  );
}

// Create Favor Stack that includes Ask Favor and Favor Details screens
function CreateFavorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="CreateFavorMain" 
        component={CreateFavorScreen}
      />
      <Stack.Screen 
        name="AskFavorScreen" 
        component={AskFavorScreen}
      />
      <Stack.Screen 
        name="EditFavorScreen" 
        component={EditFavorScreen}
      />
      <Stack.Screen 
        name="FavorDetailsScreen" 
        component={FavorDetailsScreen}
      />
      <Stack.Screen 
        name="UserProfileScreen" 
        component={UserProfileScreen}
      />
    </Stack.Navigator>
  );
}

// Settings Stack that includes Get Certified and  word screens
function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen}
      />
      <Stack.Screen 
        name="GetCertifiedScreen" 
        component={GetCertifiedScreen}
      />
      <Stack.Screen 
        name="SubscriptionsScreen" 
        component={SubscriptionsScreen}
      />
      <Stack.Screen 
        name="PaymentMethodScreen" 
        component={PaymentMethodScreen}
      />
      <Stack.Screen 
        name="PaymentMethodsScreen" 
        component={PaymentMethodsScreen}
      />
      <Stack.Screen 
        name="StripePaymentScreen" 
        component={StripePaymentScreen}
      />
      <Stack.Screen 
        name="ChangePasswordScreen" 
        component={ChangePasswordScreen}
      />
      <Stack.Screen 
        name="HelpSupportScreen" 
        component={HelpSupportScreen}
      />
      <Stack.Screen 
        name="FAQScreen" 
        component={FAQScreen}
      />
      <Stack.Screen 
        name="DeleteAccountScreen" 
        component={DeleteAccountScreen}
      />
      <Stack.Screen 
        name="AboutAppScreen" 
        component={AboutAppScreen}
      />
      <Stack.Screen 
        name="PrivacyPolicyScreen" 
        component={PrivacyPolicyScreen}
      />
      <Stack.Screen 
        name="TermsConditionsScreen" 
        component={TermsConditionsScreen}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  
  // Use utility functions for proper system UI handling
  const tabBarHeight = getTabBarHeight(insets.bottom);
  const paddingBottom = getTabBarBottomPadding(insets.bottom);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1C2013', // Dark background matching the image
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? tabBarHeight : tabBarHeight + (insets.bottom || 0),
            paddingBottom: Platform.OS === 'ios' ? paddingBottom : paddingBottom + (insets.bottom || 0),
            paddingTop: 15,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
          },
          tabBarActiveTintColor: '#44A27B',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '400',
            marginTop: 5,
          },
          tabBarItemStyle: {
            paddingVertical: 5,
          },
        }}
      >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => <CustomHomeIcon focused={focused} />,
        }}
      />
      
      <Tab.Screen
        name="Provide Favor"
        component={ProvideFavorStack}
        options={{
          tabBarIcon: ({ focused }) => <CustomProvideFavorIcon focused={focused} />,
        }}
      />
      
      <Tab.Screen
        name="Add"
        component={CreateFavorStack}
        options={{
          tabBarIcon: () => (
            <View style={{
              width: 90,
              height: 90,
              borderRadius: 80,
              backgroundColor: '#2E8862',
              borderWidth: 5,
              borderColor: '#95D7BB',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -25,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
              <CenterSvg />
            </View>
          ),
          tabBarLabel: '',
          tabBarIconStyle: {
            marginTop: 0, // Reset since we handle margin in the custom component
          },
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <CustomUserIcon focused={focused} />,
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ focused }) => <CustomSettingsIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
    </View>
  );
}

export function MainTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C2013' }} edges={[]}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen 
          name="MainTabs" 
          component={TabNavigator}
        />
        <RootStack.Screen 
          name="NotificationsScreen" 
          component={NotificationsScreen}
        />
        <RootStack.Screen 
          name="PaymentMethodScreen" 
          component={PaymentMethodScreen}
        />
        <RootStack.Screen 
          name="FilterScreen" 
          component={FilterScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'vertical',
            animationTypeForReplace: 'push',
          }}
        />
      </RootStack.Navigator>
    </SafeAreaView>
  );
}