import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  ImageBackground,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import useAuthStore from '../../store/useAuthStore';
import { LogoutModal } from '../../components/overlays';
import FilterSvg from '../../assets/icons/Filter';
import BellSvg from '../../assets/icons/Bell';
import GetCertifiedSvg from '../../assets/icons/GetCertified';
import PaymentSvg from '../../assets/icons/Payment';
import ChangePasswordSvg from '../../assets/icons/ChangePassword';
import NotificationsSvg from '../../assets/icons/Notifications';
import HelpandSupportSvg from '../../assets/icons/HelpandSupport';
import FaqSvg from '../../assets/icons/Faq';
import AboutAppSvg from '../../assets/icons/AboutApp';
import PrivacyPolicySvg from '../../assets/icons/PrivacyPolicy';
import TermsansConditionsSvg from '../../assets/icons/TermsansConditions';
import DeleteAccountSvg from '../../assets/icons/DeleteAccount';
import LogoutIconSvg from '../../assets/icons/LogoutIcon';
import BlackArrowSvg from '../../assets/icons/BlackArrow';


interface SettingsScreenProps {
  navigation?: any;
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { removeUser } = useAuthStore();

  const handleLogOut = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    removeUser(); // This will trigger navigation back to AuthScreen
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const SettingItem = ({ 
    icon, 
    title, 
    hasChevron = true, 
    hasSwitch = false, 
    switchValue = false, 
    onSwitchChange, 
    onPress,
    hideBorder = false
  }: {
    icon: React.ReactNode;
    title: string;
    hasChevron?: boolean;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    onPress?: () => void;
    hideBorder?: boolean;
  }) => (
    <TouchableOpacity 
      className={`flex-row items-center py-5 px-6 bg-transparent ${hideBorder ? '' : 'border-b border-gray-200'}`}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View className="mr-4">
        {icon}
      </View>
      <Text className="flex-1 text-lg text-black">{title}</Text>
      {hasSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E5E7EB', true: '#44A27B' }}
          thumbColor={switchValue ? '#FFFFFF' : '#FFFFFF'}
        />
      )}
      {hasChevron && !hasSwitch && <BlackArrowSvg />}
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-4 px-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-black">Settings</Text>
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              className="items-center justify-center"
              onPress={() => navigation?.navigate('FilterScreen')}
            >
              <FilterSvg />
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center justify-center"
              onPress={() => navigation?.navigate('NotificationsScreen')}
            >
              <BellSvg />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="">
          
          <SettingItem
            icon={<GetCertifiedSvg />}
            title="Get Certified"
            onPress={() => navigation?.navigate('GetCertifiedScreen')}
          />

          <SettingItem
            icon={<PaymentSvg />}
            title="Payment Methods"
            onPress={() => navigation?.navigate('PaymentMethodScreen', {
              amount: 1000, // $10.00 example
              currency: 'usd',
              title: 'Test Payment',
              description: 'Complete your test payment with Stripe'
            })}
          />

          <SettingItem
            icon={<ChangePasswordSvg />}
            title="Change Password"
            onPress={() => navigation?.navigate('ChangePasswordScreen')}
          />

          <SettingItem
            icon={<NotificationsSvg />}
            title="Notifications"
            hasChevron={false}
            hasSwitch={true}
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
          />

          <SettingItem
            icon={<HelpandSupportSvg />}
            title="Help & Support"
            onPress={() => navigation?.navigate('HelpSupportScreen')}
          />

          <SettingItem
            icon={<FaqSvg />}
            title="FAQ"
            onPress={() => navigation?.navigate('FAQScreen')}
          />

          <SettingItem
            icon={<AboutAppSvg />}
            title="About App"
            onPress={() => navigation?.navigate('AboutAppScreen')}
          />

          <SettingItem
            icon={<PrivacyPolicySvg />}
            title="Privacy Policy"
            onPress={() => navigation?.navigate('PrivacyPolicyScreen')}
          />

          <SettingItem
            icon={<TermsansConditionsSvg />}
            title="Terms and conditions"
            onPress={() => navigation?.navigate('TermsConditionsScreen')}
          />

          <SettingItem
            icon={<DeleteAccountSvg />}
            title="Delete Account"
            onPress={() => navigation?.navigate('DeleteAccountScreen')}
          />

          <SettingItem
            icon={<LogoutIconSvg />}
            title="Log Out"
            onPress={handleLogOut}
            hideBorder={true}
          />

        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
      />
    </ImageBackground>
  );
}