import {
  authServices,
  ExpoPushTokenResponse,
} from '@/lib/api/services/fetchAuth';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

/**
 * Hook to send the device's Expo push token to backend
 * Usage: const mutation = useSendExpoPushToken(); mutation.mutateAsync(token)
 */
export function useSendExpoPushToken() {
  return useMutation<ExpoPushTokenResponse, Error, string>({
    mutationFn: async (
      expoPushToken: string
    ): Promise<ExpoPushTokenResponse> => {
      const res = await authServices.sendExpoPushToken(expoPushToken);
      return res;
    },
    onSuccess: (data: ExpoPushTokenResponse) => {
      if (data.isSuccess) {
        console.log('Expo push token sent successfully');
      } else {
        console.warn('Failed to save expo push token', data.message);
      }
    },
    onError: (error: Error) => {
      console.warn('Error sending expo push token', error);
      Toast.show({
        type: 'error',
        text1: 'Không thể gửi thông tin thông báo',
        text2: error.message || 'Vui lòng thử lại sau',
        position: 'top',
      });
    },
  });
}
