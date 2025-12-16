import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';

interface PrivacyPolicyScreenProps {
  navigation?: any;
}


export function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
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
          <Text className="text-2xl font-bold text-black">Privacy Policy</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 pt-6">
          <Text className="text-sm text-gray-500 mb-4">Effective Date: December 1, 2025</Text>
          
          <Text className="text-base text-gray-700 leading-6 mb-6">
            FavorApp LLC ("we," "us," "our," or "FavorApp") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and share information when you use our mobile application and related services (collectively, the "Service").
          </Text>

          <Text className="text-base text-gray-700 leading-6 mb-6">
            By using our Service, you consent to the collection and use of information in accordance with this policy. This policy applies to the FavorApp mobile application, website (favorapp.net), and all related services.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">1. Information We Collect</Text>
          
          <Text className="text-base font-semibold text-gray-800 mb-2">Personal Information You Provide:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-4">
            • Account information: Name, email address, phone number, password{'\n'}
            • Profile information: Photos, bio, preferences{'\n'}
            • Identity verification: Government-issued ID, facial recognition data via Shufti Pro{'\n'}
            • Payment information: Credit/debit cards, bank accounts processed through Stripe{'\n'}
            • Subscription information: Plan details, billing history, payment preferences{'\n'}
            • Communications: Messages between users, support inquiries
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">Information Collected Automatically:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-4">
            • Device information: Device type, OS version, unique identifiers{'\n'}
            • Usage data: App interactions, features used, time spent{'\n'}
            • Location data: GPS coordinates when you use location features{'\n'}
            • Technical data: IP address, browser type, crash logs{'\n'}
            • Cookies and tracking technologies for app functionality
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">Third-Party Information:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Social media profile information if you choose to link accounts{'\n'}
            • Identity verification data from Shufti Pro (KYC/AML compliance){'\n'}
            • Payment processing data from Stripe and app stores{'\n'}
            • Subscription management data from RevenueCat{'\n'}
            • Background check information (when applicable)
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">2. How We Use Your Information</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Provide and maintain our Service{'\n'}
            • Process payments, subscriptions, and transactions{'\n'}
            • Verify user identity through Shufti Pro and prevent fraud{'\n'}
            • Manage subscription billing and renewals{'\n'}
            • Send notifications about app activity, billing, and updates{'\n'}
            • Improve our Service through analytics{'\n'}
            • Comply with legal obligations and KYC/AML requirements{'\n'}
            • Protect user safety and security{'\n'}
            • Provide customer support and subscription management
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">3. Information Sharing and Disclosure</Text>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            We do not sell your personal information. We may share information in these situations:
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • With other users when you post public content{'\n'}
            • With service providers (Stripe, RevenueCat, Shufti Pro, push notification services){'\n'}
            • When required by law or to protect rights and safety{'\n'}
            • In connection with business transfers{'\n'}
            • With your consent for specific purposes{'\n'}
            • For fraud prevention, identity verification, and KYC/AML compliance{'\n'}
            • With subscription and billing partners for payment processing
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">4. Data Retention</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            We retain personal information as long as necessary to provide our Service, comply with legal obligations, resolve disputes, and enforce agreements. Account information is deleted within 30 days of account closure, except where retention is required by law.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">5. Data Security</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            We implement industry-standard security measures including encryption, secure servers, and access controls. However, no method of electronic storage or transmission is 100% secure. We regularly review and update our security practices.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">6. Your Privacy Rights</Text>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            Depending on your location, you may have the following rights:
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Access to your personal information{'\n'}
            • Correction of inaccurate information{'\n'}
            • Deletion of your information{'\n'}
            • Data portability{'\n'}
            • Objection to processing{'\n'}
            • Withdrawal of consent{'\n'}
            • Non-discrimination for exercising rights
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">7. Subscription Services and Billing</Text>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            For subscription services, we collect and process:
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Subscription plan preferences and history{'\n'}
            • Payment method information (processed by Stripe){'\n'}
            • Billing addresses and transaction records{'\n'}
            • Auto-renewal settings and cancellation requests{'\n'}
            • App store purchase receipts (Apple App Store, Google Play){'\n'}
            • RevenueCat subscriber data for cross-platform management{'\n'}
            • Promotional code usage and subscription modifications
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">8. Identity Verification through Shufti Pro</Text>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            To ensure platform safety and comply with regulations, we use Shufti Pro for identity verification:
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Government-issued ID documents (driver's license, passport, national ID){'\n'}
            • Facial recognition and biometric data for identity confirmation{'\n'}
            • Address verification documents when required{'\n'}
            • Real-time verification status and fraud prevention scores{'\n'}
            • KYC (Know Your Customer) and AML (Anti-Money Laundering) compliance data{'\n'}
            • Verification attempts, results, and timestamps{'\n'}
            • Document authenticity checks and risk assessment results
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">9. Location Services</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            We use location data to show nearby favors and relevant content. You can disable location services in your device settings, but some features may not work properly. We do not share your precise location with other users.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">10. International Data Transfers</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Our servers are located in the United States. If you access our Service from outside the US, your information may be transferred to, stored, and processed in the US where data protection laws may differ from your jurisdiction. Shufti Pro may process verification data in multiple jurisdictions for compliance purposes.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">11. Children's Privacy</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Our Service is not intended for children under 18. We do not knowingly collect personal information from children under 18. If we learn we have collected such information, we will delete it immediately.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">12. Changes to This Policy</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            We may update this Privacy Policy periodically. Material changes will be notified through the app or email. Continued use after changes constitutes acceptance of the updated policy.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">13. Contact Us</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            For privacy-related questions or to exercise your rights, contact us at:{'\n'}{'\n'}
            Email: privacy@favorapp.net{'\n'}
            Address: FavorApp LLC, Wyoming, USA{'\n'}
            App Settings: Data & Privacy section
          </Text>

          <Text className="text-sm text-gray-500 text-center mb-6">
            This policy complies with GDPR, CCPA, and mobile app store requirements.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}