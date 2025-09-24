import Navigator from './src';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/configs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './global.css';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navigator />
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}