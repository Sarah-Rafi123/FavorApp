import { useMutation } from "@tanstack/react-query";
import { 
  StripeConnectApis, 
  StripeConnectAccountResponse,
  StripeConnectSetupResponse,
  StripeConnectAccountStatusResponse,
  StripeConnectBalanceResponse
} from "../apis/StripeConnectApis";

export const useCreateStripeConnectAccount = () => {
  return useMutation<StripeConnectAccountResponse, Error>({
    mutationFn: () => StripeConnectApis.createConnectAccount(),
  });
};

export const useStripeConnectSetup = () => {
  return useMutation<StripeConnectSetupResponse, Error, { returnUrl?: string; refreshUrl?: string }>({
    mutationFn: ({ returnUrl, refreshUrl }) => StripeConnectApis.setup(returnUrl, refreshUrl),
    onSuccess: (data) => {
      console.log('🎉 Stripe Connect Setup Mutation Success!');
      console.log('📄 Setup Response:', JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      console.error('❌ Stripe Connect Setup Mutation Failed!');
      console.error('📄 Setup Error:', error);
    }
  });
};

export const useStripeConnectAccountStatus = () => {
  return useMutation<StripeConnectAccountStatusResponse, Error>({
    mutationFn: () => StripeConnectApis.getAccountStatus(),
    onSuccess: (data) => {
      console.log('🎉 Stripe Connect Account Status Mutation Success!');
      console.log('📄 Account Status Response:', JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      console.error('❌ Stripe Connect Account Status Mutation Failed!');
      console.error('📄 Account Status Error:', error);
    }
  });
};

export const useStripeConnectBalance = () => {
  return useMutation<StripeConnectBalanceResponse, Error>({
    mutationFn: () => StripeConnectApis.getBalance(),
    onSuccess: (data) => {
      console.log('🎉 Stripe Connect Balance Mutation Success!');
      console.log('📄 Balance Response:', JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      console.error('❌ Stripe Connect Balance Mutation Failed!');
      console.error('📄 Balance Error:', error);
    }
  });
};