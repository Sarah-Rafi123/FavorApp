import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { submitSupportRequest, SupportRequest, SupportResponse } from '../apis/SupportApis';

export const useSubmitSupportRequest = () => {
  return useMutation<SupportResponse, Error, SupportRequest>({
    mutationFn: submitSupportRequest,
    onSuccess: (data) => {
      console.log('✅ Support request submitted successfully:', data);
      
      // Show success toast with formatted message
      const message = data.message || 'Thank you. We will get back to you soon.';
      const formattedMessage = message.includes('.') 
        ? message.replace('. ', '.\n') 
        : message;
      
      Toast.show({
        type: 'success',
        text1: 'Support Request Sent',
        text2: formattedMessage,
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 80,
      });
    },
    onError: (error) => {
      console.error('❌ Support request submission failed:', error.message);
      
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.message || 'Failed to submit support request. Please try again.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 80,
      });
    },
  });
};