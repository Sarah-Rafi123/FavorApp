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
          <Text className="text-sm text-gray-500 mb-4">Effective date: February 14, 2025</Text>
          
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Thank you for visiting the www.favorapp.net web site. This privacy policy describes you how we use personal information collected at this site. Please read this privacy policy before using the site or submitting any personal information. By using the site, you are accepting the practices described in this privacy policy. These practices may be changed, but any changes will be posted and changes will only apply to activities and information on a going forward, not retroactive basis. You are encouraged to review the privacy policy whenever you visit the site to make sure that you understand how any personal information you provide will be used.
          </Text>

          <Text className="text-base text-gray-700 leading-6 mb-6">
            Note: the privacy practices set forth in this privacy policy are for the www.favorapp.net web site only. If you link to other web sites, please review the privacy policies posted at those sites.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Collection of Information</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            We collect personally identifiable information limited to only your email address, and general location (county and postal code), when voluntarily submitted by our visitors upon registration for a personal profile account on the www.favorapp.net website. The email you provide is used to verify that the account registration is from an actual person with verifiable contact, and also used to send activity notifications (which you can optionally choose not to receive in your profile settings), and newsletters and updates from the www.favorapp.net website only. Your email is NEVER made visible or available to any other users of the website, advertisers, or any third party. The general location information you provide is only used to display content on the website relevant to your area.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Publicly Posted Information</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            As www.favorapp.net is a social network, we provide many areas for users to voluntarily post information visible to other users of the website, including but not limited to your profile page, blogs, forums, photo albums, etc. Any information, including but not limited to text, photographs, images, etc., posted in these areas will be visible to other members and/or unregistered visitors of the www.favorapp.net website. We STRONGLY encourage you to never post any personal identifiable information in these areas such as your full name, phone number, address, etc.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Cookie/Tracking Technology</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            The FavorApp Website may use cookie and tracking technology depending on the features offered. Cookie and tracking technology are useful for gathering information such as browser type and operating system, tracking the number of visitors to the FavorApp Website, and understanding how visitors use the FavorApp Website. Cookies can also help customize the FavorApp Website for visitors. Personal information cannot be collected via cookies and other tracking technology, however, if you previously provided personally identifiable information, cookies may be tied to such information.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Distribution of Information</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Your confidential personal information will NEVER be sold, shared, or given to any third party without your permission, and will NEVER be made publicly visible or available on the FavorApp website. We may share information with governmental agencies or other companies assisting us in fraud prevention or investigation. We may do so when: (1) permitted or required by law; or, (2) trying to protect against or prevent actual or potential fraud or unauthorized transactions; or, (3) investigating fraud which has already taken place. The information is not provided to these companies for marketing purposes.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Commitment to Data Security</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Your personally identifiable information is kept secure. Only authorized employees, agents and contractors (who have agreed to keep information secure and confidential) have access to this information.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Privacy Contact Information</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            If you have any questions, concerns, or comments about the FavorApp Website privacy policy you may contact us at www.favorapp.net.
          </Text>

          <Text className="text-base text-gray-700 leading-6 mb-6">
            We reserve the right to make changes to this policy without notice to you. Any changes to this policy will be posted.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}