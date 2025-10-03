import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './stacks';
import * as SplashScreen from 'expo-splash-screen';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { StatusBar, View } from 'react-native';
import { SplashScreen as CustomSplashScreen, CarouselScreen } from '../screens';
import { MainTabs } from './tabs/MainTabs';

/**
 * Application Navigation Flow
 * 
 * This component manages the entire navigation flow of the app:
 * 
 * 1. App Initialization:
 *    - Keeps splash screen visible during initialization
 *    - Loads custom fonts
 *    - Checks for existing auth token
 *    - Fetches user details if token exists
 * 
 * 2. Authentication Flow:
 *    - Shows AuthStack if no user is authenticated
 *    - Shows MainTabs if user is authenticated
 * 
 */

SplashScreen.preventAutoHideAsync(); // keep native splash visible

export default function Navigator() {
  const theme = useThemeStore((state) => state.theme);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(false);
  const [carouselCompleted, setCarouselCompleted] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // const token = await retrieveTokenSecurely();
        // if (token) {
        //   setTimeout(() => {
        //     setUser({
        //       id: '1',
        //       firstName: 'John', 
        //       email: 'john@example.com'
        //     });
        //   }, 3000);
        // }
      } catch (e) {
        // await removeTokenSecurely();
      } finally {
        setAppIsReady(true);
      }
    };

    prepare();
  }, []);

  // Hide expo splash and show custom splash after app is ready
  useEffect(() => {
    if (appIsReady) {
      const hideExpoSplash = async () => {
        await SplashScreen.hideAsync();
        setShowCustomSplash(true);
        
        // Show custom splash for 2 seconds then move to carousel
        setTimeout(() => {
          setShowCustomSplash(false);
        }, 2000);
      };
      
      hideExpoSplash();
    }
  }, [appIsReady]);

  // Cleanup when component unmounts
  useEffect(()=>{
    return () => {
      
    }
  }, []);

  // Show custom splash screen for 2 seconds after expo splash
  if (!appIsReady || showCustomSplash) {
    return <CustomSplashScreen />;
  }

  // Show carousel after custom splash screen but before main navigation
  if (!carouselCompleted) {
    return (
      <>
        <StatusBar barStyle={'light-content'} backgroundColor="transparent" translucent />
        <CarouselScreen onComplete={() => setCarouselCompleted(true)} />
      </>
    );
  }

  return (
    <NavigationContainer>
      {
        user ? (
          <>
            <StatusBar barStyle={'dark-content'} backgroundColor="transparent" translucent />
            <View className="flex-1">
              <MainTabs />
            </View>
          </>
        ) : (
          <>
            <StatusBar barStyle={'light-content'} backgroundColor="transparent" translucent />
            <AuthStack />
          </>
        )
      }
    </NavigationContainer>
  );
}
