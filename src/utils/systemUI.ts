import { Platform } from 'react-native';

/**
 * System UI Configuration Utilities
 * 
 * Handles Android system navigation bar and status bar configuration
 * to ensure the app content doesn't overlap with system UI elements.
 */

export interface SystemUIConfig {
  hideNavigationBar?: boolean;
  immersiveMode?: boolean;
  statusBarTranslucent?: boolean;
}

/**
 * Gets the recommended system UI configuration for Android
 */
export const getAndroidSystemUIConfig = (): SystemUIConfig => {
  if (Platform.OS !== 'android') {
    return {};
  }

  return {
    hideNavigationBar: true,
    immersiveMode: true,
    statusBarTranslucent: true,
  };
};

/**
 * Calculates the bottom safe area adjustment needed for Android devices
 * with system navigation bars
 */
export const getBottomSafeAreaAdjustment = (insetBottom: number): number => {
  if (Platform.OS !== 'android') {
    return 0;
  }

  // For gesture navigation (insetBottom > 0), use minimal padding
  if (insetBottom > 0) {
    return Math.min(10, insetBottom);
  }

  // For traditional navigation buttons (insetBottom === 0), add padding
  // But be more conservative - only add if really needed
  return 24; // Reduced from 48 to be less aggressive
};

/**
 * Gets the appropriate tab bar height for the platform
 */
export const getTabBarHeight = (insetBottom: number): number => {
  const baseHeight = 90;
  
  if (Platform.OS === 'android') {
    // For gesture navigation, keep base height, insets handle spacing
    if (insetBottom > 0) {
      return baseHeight;
    }
    // For button navigation, add minimal height to avoid overlap
    return baseHeight + 20;
  }
  
  return baseHeight;
};

/**
 * Gets the appropriate tab bar bottom padding for the platform
 */
export const getTabBarBottomPadding = (insetBottom: number): number => {
  const basePadding = 25;
  
  if (Platform.OS === 'android') {
    // For gesture navigation, use the inset value directly with base padding
    if (insetBottom > 0) {
      return Math.max(basePadding, insetBottom + 5);
    }
    // For button navigation, add minimal extra padding
    return basePadding + 15; // Reduced from getBottomSafeAreaAdjustment
  }
  
  return Math.max(basePadding, insetBottom + 10);
};