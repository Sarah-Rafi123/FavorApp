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

interface TermsConditionsScreenProps {
  navigation?: any;
}


export function TermsConditionsScreen({ navigation }: TermsConditionsScreenProps) {
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
          <Text className="text-2xl font-bold text-black">Terms and Conditions</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 pt-6">
          <Text className="text-xl font-bold text-gray-800 mb-2">Terms of Service</Text>
          <Text className="text-sm text-gray-500 mb-6">Effective Date: December 1, 2025</Text>
          
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Welcome to FavorApp! These Terms of Service ("Terms") govern your use of the FavorApp mobile application and related services (the "Service") operated by FavorApp LLC ("we," "us," or "our"). By downloading, installing, or using our Service, you agree to be bound by these Terms.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">1. Acceptance of Terms</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            By accessing or using FavorApp, you confirm that you are at least 18 years old and have the legal capacity to enter into these Terms. If you disagree with any part of these Terms, you may not use our Service.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">2. Description of Service</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            FavorApp is a mobile platform that connects users who need services ("requesters") with users who can provide those services ("providers"). The platform facilitates the discovery, coordination, and payment for various services and tasks.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">3. User Accounts and Registration</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • You must provide accurate and complete information{'\n'}
            • You are responsible for maintaining account security{'\n'}
            • One account per person; no sharing accounts{'\n'}
            • You must verify your identity through our KYC process{'\n'}
            • We reserve the right to suspend or terminate accounts{'\n'}
            • Account usernames must be appropriate and non-offensive
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">4. Subscription Services and Payments</Text>
          
          <Text className="text-base font-semibold text-gray-800 mb-2">Premium Subscriptions:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-4">
            • Monthly and annual premium plans available{'\n'}
            • Subscriptions auto-renew unless cancelled{'\n'}
            • Payments processed through app stores and Stripe{'\n'}
            • Refunds subject to app store policies{'\n'}
            • Premium features include priority support and enhanced functionality
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">Service Fees:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Platform fee of 15% charged on completed transactions{'\n'}
            • Payment processing fees may apply{'\n'}
            • KYC verification may require additional fees{'\n'}
            • All fees clearly disclosed before transactions
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">5. User Conduct and Content</Text>
          
          <Text className="text-base font-semibold text-gray-800 mb-2">Acceptable Use:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-4">
            • Use the Service only for lawful purposes{'\n'}
            • Respect other users and their property{'\n'}
            • Provide accurate service descriptions and pricing{'\n'}
            • Complete transactions in good faith{'\n'}
            • Report suspicious or inappropriate behavior
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">Prohibited Activities:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Illegal activities or services{'\n'}
            • Adult, sexual, or inappropriate content{'\n'}
            • Harassment, threats, or abusive behavior{'\n'}
            • Spam, fraud, or deceptive practices{'\n'}
            • Unauthorized commercial promotion{'\n'}
            • Violating others' intellectual property{'\n'}
            • Circumventing platform safety measures{'\n'}
            • Creating fake profiles or reviews
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">6. Safety and Verification</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Identity verification required for certain features{'\n'}
            • Background checks may be conducted{'\n'}
            • Users are responsible for their own safety{'\n'}
            • Report safety concerns immediately{'\n'}
            • We provide safety guidelines and resources{'\n'}
            • Emergency contact information recommended
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">7. Privacy and Data</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your information. By using the Service, you consent to our data practices as described in the Privacy Policy.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">8. Intellectual Property</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            The Service and its content are owned by FavorApp LLC and protected by intellectual property laws. You grant us a license to use content you post on the platform. You retain ownership of your content but must not infringe on others' rights.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">9. Disclaimers and Limitation of Liability</Text>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            The Service is provided "AS IS" without warranties of any kind. We disclaim all warranties, including:
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-4">
            • Merchantability and fitness for a particular purpose{'\n'}
            • Accuracy or reliability of user content{'\n'}
            • Uninterrupted or error-free service{'\n'}
            • Security or privacy of data transmission
          </Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Our liability is limited to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">10. Indemnification</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            You agree to indemnify and hold harmless FavorApp LLC from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of any rights.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">11. Termination</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Either party may terminate these Terms at any time. Upon termination, your right to use the Service ends immediately. We may suspend or terminate your account for violations of these Terms.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">12. Dispute Resolution</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Disputes will be resolved through binding arbitration in Wyoming, USA, except where prohibited by law. You waive the right to participate in class-action lawsuits against us.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">13. App Store Terms</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            If you downloaded the app from an app store (Apple App Store, Google Play), you also agree to that platform's terms. In case of conflict between these Terms and app store terms, the app store terms prevail.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">14. International Users</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            The Service is operated from the United States. If you access the Service from other jurisdictions, you are responsible for compliance with local laws.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">15. Changes to Terms</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            We may update these Terms periodically. Material changes will be communicated through the app. Continued use after changes constitutes acceptance of the new Terms.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">16. Contact Information</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Questions about these Terms? Contact us at:{'\n'}{'\n'}
            Email: legal@favorapp.net{'\n'}
            Address: FavorApp LLC, Wyoming, USA{'\n'}
            App Support: Help & Support section
          </Text>

          <Text className="text-base text-gray-700 leading-6 mb-6 font-semibold">
            BY USING FAVORAPP, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
          </Text>

          <Text className="text-sm text-gray-500 text-center mb-6">
            FavorApp LLC - Licensed and operating in Wyoming, USA
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}