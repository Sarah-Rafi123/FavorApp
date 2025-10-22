export interface User {
  id: string;
  firstName: string;
  email: string;
}

export interface RegistrationData {
  user: {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone_no_call: string;
    phone_no_text: string;
    date_of_birth: string;
    years_of_experience: string;
    about_me?: string;
    heard_about_us?: string;
    birth_day: string;
    birth_month: string;
    birth_year: string;
    terms_of_service: string;
    skills: string[];
    other_skills?: string;
    address_attributes: {
      full_address: string;
      city: string;
      state: string;
    };
  };
}

export interface CountryCode {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export interface SkillsResponse {
  success: boolean;
  data: {
    skills: string[];
    description: string;
  };
  message: string | null;
}

export interface OtpVerificationData {
  email: string;
  otp_code: string;
}

export interface OtpVerificationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      middle_name?: string;
      full_name: string;
      phone_no_call: string;
      phone_no_text: string;
      date_of_birth: string;
      age: number;
      years_of_experience: number;
      about_me: string;
      skills: string[];
      other_skills?: string;
      raw_skills: string[];
      member_since: string;
      is_active: boolean;
      is_certified?: boolean;
      address: {
        city: string;
        state: string;
        full_address: string;
      };
      created_at: string;
      updated_at: string;
    };
    token: string;
    refresh_token: string;
    expires_at: string;
  };
}

export interface ResendOtpData {
  email: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface VerifyResetOtpData {
  email: string;
  otp_code: string;
}

export interface VerifyResetOtpResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ResetPasswordData {
  email: string;
  reset_token: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: any;
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
  'auth-screen': any;
  'forgot-password-screen': any;
  'otp-verification-screen': { email: string };
  'new-password-screen': { email: string; resetToken: string };
  'signup-otp-screen': { email: string };
  'create-profile-screen': any;
  'location-permission-screen': any;

  // Home Stack
  'HomeMain': any;
  'FilterScreen': any;

  // Provide Favor Stack
  'ProvideFavorMain': any;
  'AskFavorScreen': any;

  // Shared screens
  'NotificationsScreen': any;

};

export interface ProfileAddress {
  id: number;
  city: string;
  state: string;
  full_address: string;
}

export interface Profile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  full_name: string;
  phone_no_call: string;
  phone_no_text: string;
  date_of_birth: string;
  age: number;
  years_of_experience: number;
  about_me: string;
  skills: string[];
  other_skills: string | null;
  member_since: string;
  is_active: boolean;
  is_certified: boolean | null;
  has_payment_method: boolean;
  has_stripe_account: boolean;
  address: ProfileAddress;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    profile: Profile;
  };
  message: string | null;
}
