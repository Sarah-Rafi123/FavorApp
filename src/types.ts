export interface User {
  id: string;
  firstName: string;
  email: string;
}

// Routes
export type AppRoutes = {
  // Tabs
  'Home': any;
  'Provide Favor': any;
  'Add': any;
  'Profile': any;
  'Settings': any;

  // Root Stack
  'splash-screen': any;
  'auth-screen': any;
  'forgot-password-screen': any;
  'otp-verification-screen': any;
  'new-password-screen': any;
  'signup-otp-screen': { email: string };
  'create-profile-screen': any;
  'location-permission-screen': any;

  // Home Stack
  'HomeMain': any;
  'FilterScreen': any;

  // Provide Favor Stack
  'ProvideFavorMain': any;
  'AskFavorScreen': any;

};
