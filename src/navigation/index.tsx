import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './stacks';
import useAuthStore from '../store/useAuthStore';
import { StatusBar, View } from 'react-native';
import { SplashScreen as CustomSplashScreen, CarouselScreen } from '../screens';
import { MainTabs } from './tabs/MainTabs';
import { NotificationPopupRenderer } from '../context/NotificationContext';

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

// Expo splash screen removed - using custom splash only

export default function Navigator() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(false);
  const [carouselCompleted, setCarouselCompleted] = useState(false);
  const [shouldShowSplashCarousel, setShouldShowSplashCarousel] = useState(true);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Initialize auth tokens from storage
        await initializeAuth();
      } catch (e) {
        console.error('Failed to initialize auth:', e);
      } finally {
        setAppIsReady(true);
      }
    };

    prepare();
  }, [initializeAuth]);

  // Determine if splash and carousel should be shown based on auth state
  useEffect(() => {
    if (appIsReady) {
      // If user is already logged in, skip splash and carousel immediately
      if (user && accessToken) {
        console.log('✅ User logged in - skipping splash and carousel');
        setShouldShowSplashCarousel(false);
        setShowCustomSplash(false);
        setCarouselCompleted(true);
      } else {
        console.log('❌ User not logged in - skipping splash and carousel, going directly to auth');
        // Skip splash and carousel, go directly to AuthScreen
        setShouldShowSplashCarousel(false);
        setShowCustomSplash(false);
        setCarouselCompleted(true);
      }
    }
  }, [appIsReady, user, accessToken]);

  // Immediate response to auth state changes - highest priority
  useEffect(() => {
    if (user && accessToken) {
      console.log('🚀 User authenticated - immediate splash/carousel bypass');
      setShouldShowSplashCarousel(false);
      setShowCustomSplash(false);
      setCarouselCompleted(true);
    }
  }, [user, accessToken]);

  // Debug auth state
  useEffect(() => {
    console.log('🔍 Navigation Auth State:');
    console.log('User:', !!user, user?.firstName);
    console.log('Access Token:', !!accessToken);
    console.log('App Ready:', appIsReady);
    console.log('Should Show Splash/Carousel:', shouldShowSplashCarousel);
    console.log('Carousel Completed:', carouselCompleted);
  }, [user, accessToken, appIsReady, shouldShowSplashCarousel, carouselCompleted]);

  // Cleanup when component unmounts
  useEffect(()=>{
    return () => {
      
    }
  }, []);

  // Priority check: If user is authenticated, skip splash/carousel entirely
  if (appIsReady && user && accessToken) {
    return (
      <NavigationContainer>
        <StatusBar barStyle={'dark-content'} backgroundColor="transparent" translucent />
        <View className="flex-1">
          <MainTabs />
        </View>
        <NotificationPopupRenderer />
      </NavigationContainer>
    );
  }

  // Show custom splash screen for 2 seconds after expo splash (only for non-logged-in users)
  if (!appIsReady || (shouldShowSplashCarousel && showCustomSplash)) {
    return <CustomSplashScreen />;
  }

  // Show carousel after custom splash screen but before main navigation (only for non-logged-in users)
  if (shouldShowSplashCarousel && !carouselCompleted) {
    return (
      <>
        <StatusBar barStyle={'light-content'} backgroundColor="transparent" translucent />
        <CarouselScreen onComplete={() => setCarouselCompleted(true)} />
      </>
    );
  }

  // If we reach here, user is not authenticated, show auth flow
  return (
    <NavigationContainer>
      <StatusBar barStyle={'light-content'} backgroundColor="transparent" translucent />
      <AuthStack />
      <NotificationPopupRenderer />
    </NavigationContainer>
  );
}
