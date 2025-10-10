import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';
import Svg, { Path, Circle } from 'react-native-svg';
import FIcon from '../../assets/icons/FIcon';
import BackSvg from '../../assets/icons/Back';

interface GetCertifiedScreenProps {
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

export function GetCertifiedScreen({ navigation }: GetCertifiedScreenProps) {
  const features = [
    "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
  ];

  const handleBuyNow = (plan: string) => {
    navigation?.navigate('PaymentMethodScreen', { plan });
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
          <Text className="text-2xl font-bold text-black">Get Certified</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="items-center px-6 pt-8">
          
          {/* Icon */}
          <View className="mb-8">
            <FIcon />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Get Certified
          </Text>
          
          {/* Subtitle with lines */}
          <View className="flex-row items-center mb-8 w-full px-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-lg text-gray-600 px-4">
              Key Feature
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
          <View className="flex-row w-full gap-x-4 mb-8">
            
            {/* 1 Year Plan */}
            <View className="flex-1 bg-[#FBFFF0] rounded-2xl p-6 border-2 border-[#71DFB1] shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 text-center mb-2">
                1 Year
              </Text>
              <Text className="text-3xl font-bold text-gray-800 text-center mb-1">
                $ 30
              </Text>
              <Text className="text-sm text-gray-600 text-center mb-6">
                saving up to 10%
              </Text>
              <TouchableOpacity 
                className="bg-green-500 rounded-3xl py-3"
                onPress={() => handleBuyNow('1 Year')}
              >
                <Text className="text-white text-center font-semibold">
                  Buy Now
                </Text>
              </TouchableOpacity>
            </View>

            {/* 1 Month Plan */}
            <View className="flex-1 bg-[#FBFFF0] rounded-2xl p-6 border border-[#71DFB1] shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 text-center mb-2">
                1 Month
              </Text>
              <Text className="text-3xl font-bold text-gray-800 text-center mb-1">
                $ 4.99
              </Text>
              <Text className="text-sm text-gray-600 text-center mb-6">
                {/* Empty space for alignment */}
              </Text>
              <TouchableOpacity 
                className="bg-green-500 rounded-3xl py-3"
                onPress={() => handleBuyNow('1 Month')}
              >
                <Text className="text-white text-center font-semibold">
                  Buy Now
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}