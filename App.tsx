import Navigator from './src';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/configs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SetupIntentProvider } from './src/components/auth/SetupIntentProvider';
import './global.css';

// Polyfill for crypto.getRandomValues() required by react-native-google-places-autocomplete
if (typeof global.crypto !== 'object') {
  global.crypto = {} as any;
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = function(array: any) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SetupIntentProvider>
        <Navigator />
        <Toast config={toastConfig} />
      </SetupIntentProvider>
    </QueryClientProvider>
  );
}