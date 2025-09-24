import React from 'react';
import { View, Image, ImageBackground } from 'react-native';

export function SplashScreen() {
  return (
    <ImageBackground 
      source={require('../../assets/images/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <View className="flex-1 justify-center items-center">
        <Image 
          source={require('../../assets/images/logo.png')} 
          className="w-64 h-32"
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}