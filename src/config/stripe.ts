export const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  merchantId: 'merchant.com.bobeveleth.tsarn', // Updated to match your app.json
  urlScheme: 'favorapp', // Replace with your app's URL scheme
};

export const isStripeConfigValid = () => {
  return Boolean(STRIPE_CONFIG.publishableKey);
};

if (!STRIPE_CONFIG.publishableKey) {
  console.warn('Stripe publishable key is missing. Stripe functionality will be disabled.');
}