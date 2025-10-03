import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen, ProvideFavorScreen, ProfileScreen, SettingsScreen, FilterScreen, AskFavorScreen } from '../../screens';
import { GetCertifiedScreen } from '../../screens/getCertifiedScreen/GetCertifiedScreen';
import { PaymentMethodScreen } from '../../screens/paymentMethodScreen/PaymentMethodScreen';
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
      <Stack.Screen 
        name="FilterScreen" 
        component={FilterScreen}
      />
    </Stack.Navigator>
  );
}

// Provide Favor Stack that includes Ask Favor screen
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
    </Stack.Navigator>
  );
}

// Settings Stack that includes Get Certified and Change Password screens
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
        name="PaymentMethodScreen" 
        component={PaymentMethodScreen}
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

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2D3748', // Dark background matching the image
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 25,
          paddingTop: 15,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
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
        component={ProvideFavorScreen}
        options={{
          tabBarIcon: () => (
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#44A27B',
              borderWidth: 3,
              borderColor: '#2D3748',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -25,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#44A27B',
                borderWidth: 2,
                borderColor: '#2D5A44',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <CenterSvg />
              </View>
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
  );
}