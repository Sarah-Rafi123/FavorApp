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
          <Text className="text-xl font-bold text-gray-800 mb-2">FavorApp Terms of Use Agreement</Text>
          <Text className="text-sm text-gray-500 mb-6">Updated February 18, 2025</Text>
          
          <Text className="text-base text-gray-700 leading-6 mb-6">
            The services offered by FavorApp LLC ("we," "us" or "our") include the www.favorapp.net website (the "Website"), the www.favorapp.net Internet messaging service, and any other features, content, or application offered from time to time by www.favorapp.net in connection with the FavorApp LLC Website (collectively, "FavorApp"). FavorApp is privately owned and hosted in the United States. FavorApp is a social networking service that allows Members to create unique personal profiles online in order to find and communicate with other users on the FavorApp website to provide services.
          </Text>

          <Text className="text-base text-gray-700 leading-6 mb-6">
            This Terms of Use Agreement ("Agreement") sets forth the legally binding terms for your use of FavorApp. By using FavorApp, you agree to be bound by this Agreement, whether you are a "Visitor" (which means that you simply browse the Website) or you are a "Member" (which means that you have registered with www.favorapp.net). The term "User" refers to a Visitor or a Member. You are only authorized to use FavorApp (regardless of whether your access or use is intended) if you agree to abide by all applicable laws and to this Agreement. Please read this Agreement carefully and save it. If you do not agree with it, you should leave the FavorApp Website and discontinue use of FavorApp immediately.
          </Text>

          <Text className="text-base text-gray-700 leading-6 mb-6">
            This Agreement includes our policy for acceptable use of FavorApp and Content posted on the Website, your rights, obligations and restrictions regarding your use of FavorApp and www.favorapp.net's Privacy Policy.
          </Text>

          <Text className="text-base text-gray-700 leading-6 mb-6">
            We may modify this Agreement from time to time, and such modification shall be effective upon posting by www.favorapp.net on the Website. You agree to be bound to any changes to this Agreement when you use FavorApp after any such modification is posted. It is therefore important that you review this Agreement regularly to ensure you are updated as to any changes.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Content Guidelines</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Please choose carefully the information you post on FavorApp and that you provide to other Users. Your FavorApp profile may not include any photographs containing nudity, or obscene, lewd, excessively violent, harassing, sexually explicit or otherwise objectionable subject matter. Despite this prohibition, information provided by other FavorApp Members may contain inaccurate, inappropriate, offensive or sexually explicit material, and we assume no responsibility or liability for this material.
          </Text>

          <Text className="text-base text-gray-700 leading-6 mb-6">
            We reserve the right, in our sole and absolute discretion, to reject, refuse to post or remove any posting by you, or to restrict, suspend, or terminate your access to all or any part of FavorApp at any time, for any or no reason, with or without prior notice, and without liability.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Eligibility</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            Use of and Membership in FavorApp is void where prohibited. By using FavorApp, you represent and warrant that (a) all registration information you submit is truthful and accurate; (b) you will maintain the accuracy of such information; (c) you are 18 years of age or older; and (d) your use of FavorApp does not violate any applicable law or regulation. Your profile may be deleted and your Membership may be terminated without warning, if we believe that you are less than 18 years of age.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Fees</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            A fifteen percent (15%) fee is charged to any user who creates a paid favor. FavorApp may offer enhancements and features which can be added to personal accounts for a fee when selecting such upgrade option. As security is our top priority, there is a $5.00 monthly maintenance fee for identification verification for use on the FavorApp LLC website.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Password Security</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            When you sign up to become a Member, you will be asked to choose a password. You are entirely responsible for maintaining the confidentiality of your password. You agree not to use the account, username, or password of another Member at any time or to disclose your password to any third party. You are solely responsible for any and all use of your account.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Classified Posting</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            You are completely responsible for the legality of the services you are providing, or the services you are agreeing to receive. You agree that FavorApp is in no way liable whatsoever in any purchase, sale, transfer, or the like involving any product or service. You understand that FavorApp does not become involved in transactions between parties and does not certify, investigate, or in any way guarantee the legal capacity of any party to transact.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Prohibited Content and Activity</Text>
          <Text className="text-base text-gray-700 leading-6 mb-4">
            The following types of content and activities are prohibited on FavorApp:
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-6">
            • Content that is patently offensive, promotes racism, bigotry, hatred or physical harm{'\n'}
            • Harassment or advocacy of harassment{'\n'}
            • Nudity, violence, or offensive subject matter{'\n'}
            • False or misleading information{'\n'}
            • Illegal activities{'\n'}
            • Commercial activities without prior written consent{'\n'}
            • Automated use of the system{'\n'}
            • Impersonating another person{'\n'}
            • Selling or transferring your profile
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Disclaimers</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            FavorApp is provided "AS-IS" and as available. We are not responsible for incorrect or inaccurate content, third-party websites, advertisements, technical malfunctions, or any loss or damage resulting from use of FavorApp. We expressly disclaim any warranty of fitness for a particular purpose or non-infringement.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Limitation on Liability</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            IN NO EVENT SHALL WE BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES. OUR LIABILITY TO YOU WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID BY YOU TO US FOR FAVORAPP DURING THE TERM OF MEMBERSHIP.
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-3">Governing Law</Text>
          <Text className="text-base text-gray-700 leading-6 mb-6">
            If there is any dispute about or involving FavorApp, you agree that the dispute shall be governed by the laws of the State of Wyoming, USA, and you agree to exclusive personal jurisdiction and venue in the state and federal courts located in the State of Wyoming.
          </Text>

          <Text className="text-base text-gray-700 leading-6 mb-6 font-semibold">
            YOUR USE OF THE WEBSITE OR REGISTRATION ON THE WEBSITE AFFIRMS THAT YOU HAVE READ THIS AGREEMENT AND AGREE TO ALL OF THE PROVISIONS CONTAINED ABOVE.
          </Text>

          <Text className="text-sm text-gray-500 text-center mb-6">
            FavorApp, LLC. A privately owned company in the State of Wyoming, USA.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}