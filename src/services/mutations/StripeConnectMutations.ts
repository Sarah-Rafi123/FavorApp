import { useMutation } from "@tanstack/react-query";
import { StripeConnectApis, StripeConnectAccountResponse } from "../apis/StripeConnectApis";

export const useCreateStripeConnectAccount = () => {
  return useMutation<StripeConnectAccountResponse, Error>({
    mutationFn: () => StripeConnectApis.createConnectAccount(),
  });
};