import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
} from 'react-native';
import BackSvg from '../../assets/icons/Back';
import { BlurredText, BlurredEmail, BlurredPhone, BlurredSensitive } from '../../components/common';

interface BlurDemoScreenProps {
  navigation?: any;
}

export function BlurDemoScreen({ navigation }: BlurDemoScreenProps) {
  const sampleData = {
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    sensitiveText: 'Confidential Information',
    longText: 'This is a longer piece of sensitive text that should be blurred'
  };

  const DemoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <Text className="text-lg font-semibold text-gray-800 mb-4">{title}</Text>
      {children}
    </View>
  );

  const DemoItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <Text className="text-gray-600 flex-1">{label}</Text>
      <View className="flex-2 items-end">
        {children}
      </View>
    </View>
  );

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
          <Text className="text-2xl font-bold text-black">Blur Effects Demo</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Email Blur Demo */}
        <DemoSection title="📧 Email Blurring">
          <DemoItem label="Original:">
            <Text className="text-gray-800">{sampleData.email}</Text>
          </DemoItem>
          <DemoItem label="BlurredEmail:">
            <BlurredEmail>{sampleData.email}</BlurredEmail>
          </DemoItem>
          <DemoItem label="Smart Blur:">
            <BlurredText blurType="smart">{sampleData.email}</BlurredText>
          </DemoItem>
        </DemoSection>

        {/* Phone Blur Demo */}
        <DemoSection title="📱 Phone Number Blurring">
          <DemoItem label="Original:">
            <Text className="text-gray-800">{sampleData.phone}</Text>
          </DemoItem>
          <DemoItem label="BlurredPhone:">
            <BlurredPhone>{sampleData.phone}</BlurredPhone>
          </DemoItem>
          <DemoItem label="Smart Blur:">
            <BlurredText blurType="smart">{sampleData.phone}</BlurredText>
          </DemoItem>
        </DemoSection>

        {/* Blur Intensities */}
        <DemoSection title="🎚️ Blur Intensities">
          <DemoItem label="Light Blur:">
            <BlurredText blurIntensity="light">{sampleData.sensitiveText}</BlurredText>
          </DemoItem>
          <DemoItem label="Medium Blur:">
            <BlurredText blurIntensity="medium">{sampleData.sensitiveText}</BlurredText>
          </DemoItem>
          <DemoItem label="Heavy Blur:">
            <BlurredText blurIntensity="heavy">{sampleData.sensitiveText}</BlurredText>
          </DemoItem>
        </DemoSection>

        {/* Blur Types */}
        <DemoSection title="🔧 Blur Types">
          <DemoItem label="Mask Type:">
            <BlurredText blurType="mask">{sampleData.sensitiveText}</BlurredText>
          </DemoItem>
          <DemoItem label="SVG Type:">
            <BlurredText blurType="svg">{sampleData.sensitiveText}</BlurredText>
          </DemoItem>
          <DemoItem label="Overlay Type:">
            <BlurredText blurType="overlay">{sampleData.sensitiveText}</BlurredText>
          </DemoItem>
          <DemoItem label="Smart Type:">
            <BlurredText blurType="smart">{sampleData.sensitiveText}</BlurredText>
          </DemoItem>
        </DemoSection>

        {/* Advanced Features */}
        <DemoSection title="✨ Advanced Features">
          <DemoItem label="Animated Blur:">
            <BlurredText animated={true} blurIntensity="medium">{sampleData.sensitiveText}</BlurredText>
          </DemoItem>
          <DemoItem label="Sensitive (Heavy):">
            <BlurredSensitive intensity="heavy">{sampleData.longText}</BlurredSensitive>
          </DemoItem>
          <DemoItem label="Partial Masking:">
            <BlurredText showPartial={true}>{sampleData.longText}</BlurredText>
          </DemoItem>
          <DemoItem label="Full Blur:">
            <BlurredText showPartial={false}>{sampleData.longText}</BlurredText>
          </DemoItem>
        </DemoSection>

        {/* Usage Examples */}
        <DemoSection title="💡 Real Usage Examples">
          <View className="space-y-4">
            <View>
              <Text className="text-gray-600 text-sm mb-2">User Email (Profile View)</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-700 mr-2">Email:</Text>
                <BlurredEmail style={{ fontSize: 16, color: '#374151' }}>
                  user@company.com
                </BlurredEmail>
              </View>
            </View>

            <View>
              <Text className="text-gray-600 text-sm mb-2">Phone Number (Contact Info)</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-700 mr-2">Call:</Text>
                <BlurredPhone style={{ fontSize: 16, color: '#374151' }}>
                  +1 (555) 987-6543
                </BlurredPhone>
              </View>
            </View>

            <View>
              <Text className="text-gray-600 text-sm mb-2">Sensitive Data (Security)</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-700 mr-2">ID:</Text>
                <BlurredSensitive style={{ fontSize: 16 }} intensity="heavy">
                  ABC-123-DEF-456
                </BlurredSensitive>
              </View>
            </View>
          </View>
        </DemoSection>

        {/* Performance Note */}
        <View className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <Text className="text-blue-800 font-semibold mb-2">📋 Performance Notes</Text>
          <Text className="text-blue-700 text-sm leading-5">
            • <Text className="font-medium">Smart</Text> type automatically chooses the best method{'\n'}
            • <Text className="font-medium">Mask</Text> type is fastest and most compatible{'\n'}
            • <Text className="font-medium">SVG</Text> type provides true blur but uses more resources{'\n'}
            • <Text className="font-medium">Overlay</Text> type is good for full text masking{'\n'}
            • <Text className="font-medium">Animated</Text> blur should be used sparingly
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}