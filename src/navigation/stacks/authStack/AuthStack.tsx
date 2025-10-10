import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthScreen, ForgotPasswordScreen, OtpVerificationScreen, NewPasswordScreen, SignupOtpScreen, CreateProfileScreen, LocationPermissionScreen } from '../../../screens';
import { AppRoutes } from '../../../types';

const Stack = createStackNavigator<AppRoutes>();

import useAuthStore from '../../../store/useAuthStore';

export function AuthStack() {
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = () => {
    // Set user state to trigger navigation to MainTabs
    setUser({
      id: '1',
      firstName: 'John',
      email: 'user@example.com',
    });
  };

  return (
    <Stack.Navigator initialRouteName="auth-screen">
      <Stack.Screen
        name="auth-screen"
        options={{
          headerShown: false,
        }}
      >
        {({ navigation }) => (
          <AuthScreen 
            onLogin={handleLogin}
            onForgotPassword={() => navigation.navigate('forgot-password-screen')}
            onSignup={(email: string) => navigation.navigate('signup-otp-screen', { email })}
            onCreateProfile={() => navigation.navigate('create-profile-screen')}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen
        name="forgot-password-screen"
        options={{
          headerShown: false,
        }}
      >
        {({ navigation }) => (
          <ForgotPasswordScreen 
            onBackToLogin={() => navigation.navigate('auth-screen')}
            onContinue={(email: string) => {
              navigation.navigate('otp-verification-screen', { email });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="otp-verification-screen"
        options={{
          headerShown: false,
        }}
      >
        {({ navigation, route }) => (
          <OtpVerificationScreen 
            onBack={() => navigation.navigate('forgot-password-screen')}
            onVerifySuccess={(resetToken) => navigation.navigate('new-password-screen', { 
              email: (route.params as any)?.email || 'user@example.com',
              resetToken: resetToken || ''
            })}
            email={(route.params as any)?.email || 'user@example.com'}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="new-password-screen"
        options={{
          headerShown: false,
        }}
      >
        {({ navigation, route }) => (
          <NewPasswordScreen 
            onPasswordReset={() => navigation.navigate('auth-screen')}
            email={(route.params as any)?.email || 'user@example.com'}
            resetToken={(route.params as any)?.resetToken || ''}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="signup-otp-screen"
        options={{
          headerShown: false,
        }}
      >
        {({ navigation, route }) => (
          <SignupOtpScreen 
            onBack={() => navigation.navigate('auth-screen')}
            onVerifySuccess={handleLogin}
            email={(route.params as any)?.email || 'user@example.com'}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="create-profile-screen"
        options={{
          headerShown: false,
        }}
      >
        {({ navigation }) => (
          <CreateProfileScreen 
            onProfileComplete={handleLogin}
            onNavigateToOtp={(email: string) => navigation.navigate('signup-otp-screen', { email })}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="location-permission-screen"
        options={{
          headerShown: false,
        }}
      >
        {({ navigation }) => (
          <LocationPermissionScreen 
            onLocationGranted={handleLogin}
            onSkip={handleLogin}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}