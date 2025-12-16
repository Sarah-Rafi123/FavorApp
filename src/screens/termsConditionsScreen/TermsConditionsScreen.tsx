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
            • Monthly ($9.99/month) and annual ($99.99/year) premium plans available{'\n'}
            • Subscriptions auto-renew unless cancelled 24 hours before renewal{'\n'}
            • Payments processed through Apple App Store, Google Play, and Stripe{'\n'}
            • Free trial periods may be offered for new subscribers{'\n'}
            • Cancellation effective at the end of the current billing period{'\n'}
            • Premium features include: priority support, enhanced matching, unlimited requests{'\n'}
            • Cross-platform subscription management via RevenueCat{'\n'}
            • Promotional pricing and discounts may apply
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">Refund Policy:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-4">
            • App store purchases subject to Apple/Google refund policies{'\n'}
            • Direct payments through Stripe may qualify for partial refunds{'\n'}
            • No refunds for partially used subscription periods{'\n'}
            • Disputed charges handled according to payment processor policies{'\n'}
            • Account termination may affect subscription refund eligibility
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">Service Fees:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Platform fee of 3% + $0.30 charged on completed paid transactions{'\n'}
            • Payment processing fees (typically 2.9% + $0.30) applied separately{'\n'}
            • Identity verification through Shufti Pro included in premium subscriptions{'\n'}
            • Additional verification attempts may incur fees{'\n'}
            • Currency conversion fees may apply for international transactions{'\n'}
            • All fees clearly disclosed before transaction completion
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

          <Text className="text-lg font-bold text-gray-800 mb-3">6. Identity Verification and Safety</Text>
          
          <Text className="text-base font-semibold text-gray-800 mb-2">Shufti Pro Identity Verification:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-4">
            • Government-issued ID verification required for premium features{'\n'}
            • Facial recognition and liveness detection for identity confirmation{'\n'}
            • Address verification documents may be required{'\n'}
            • Real-time fraud prevention and risk assessment{'\n'}
            • KYC (Know Your Customer) and AML (Anti-Money Laundering) compliance{'\n'}
            • Verification status affects account privileges and transaction limits{'\n'}
            • Multiple verification attempts may be required for accuracy{'\n'}
            • Failed verification may result in account restrictions
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">Safety Measures:</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Background checks may be conducted for high-value services{'\n'}
            • Users are responsible for their own safety during interactions{'\n'}
            • Report safety concerns, suspicious behavior, or fraud immediately{'\n'}
            • We provide safety guidelines, tips, and educational resources{'\n'}
            • Emergency contact information strongly recommended{'\n'}
            • In-app messaging system for secure communication{'\n'}
            • GPS tracking and location sharing features for safety
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">7. Privacy and Data Protection</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your information, including subscription data and identity verification through Shufti Pro. By using the Service, you consent to our data practices as described in the Privacy Policy and third-party processor terms.
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

          <Text className="text-lg font-bold text-gray-800 mb-3">13. Third-Party Services</Text>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            Our Service integrates with various third-party providers. By using our Service, you also agree to their respective terms:
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Stripe: Payment processing and subscription billing{'\n'}
            • RevenueCat: Cross-platform subscription management{'\n'}
            • Shufti Pro: Identity verification and KYC/AML compliance{'\n'}
            • Apple App Store / Google Play: App distribution and in-app purchases{'\n'}
            • Google Places API: Address and location services{'\n'}
            • Push notification services: App notifications and alerts{'\n'}
            • Analytics services: App performance and usage tracking
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">14. App Store Terms</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            If you downloaded the app from an app store (Apple App Store, Google Play), you also agree to that platform's terms. In case of conflict between these Terms and app store terms, the app store terms prevail for subscription management and refunds.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">15. International Users</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            The Service is operated from the United States. If you access the Service from other jurisdictions, you are responsible for compliance with local laws. Identity verification requirements may vary by country and region.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">16. Changes to Terms</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            We may update these Terms periodically. Material changes will be communicated through the app or email. Continued use after changes constitutes acceptance of the new Terms. Subscription terms changes will provide 30 days notice.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">17. Contact Information</Text>
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