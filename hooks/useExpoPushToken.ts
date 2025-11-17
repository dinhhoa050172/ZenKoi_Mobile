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
      console.log('[EXPO_TOKEN] Sending token to backend...');
      console.log(
        '[EXPO_TOKEN] Token:',
        expoPushToken.substring(0, 30) + '...'
      );

      const res = await authServices.sendExpoPushToken(expoPushToken);

      console.log('[EXPO_TOKEN] Backend response:', {
        isSuccess: res.isSuccess,
        message: res.message,
      });

      return res;
    },
    onSuccess: (data: ExpoPushTokenResponse) => {
      if (data.isSuccess) {
        console.log(
          '[EXPO_TOKEN] ✅ Expo push token sent successfully to backend'
        );
      } else {
        console.warn(
          '[EXPO_TOKEN] ⚠️ Failed to save expo push token:',
          data.message
        );
        Toast.show({
          type: 'error',
          text1: 'Không thể lưu thông tin thông báo',
          text2: data.message || 'Vui lòng thử lại sau',
          position: 'top',
        });
      }
    },
    onError: (error: Error) => {
      console.error('[EXPO_TOKEN] ❌ Error sending expo push token:', error);
      if (error instanceof Error) {
        console.error('[EXPO_TOKEN] Error message:', error.message);
      }
      Toast.show({
        type: 'error',
        text1: 'Không thể gửi thông tin thông báo',
        text2: error.message || 'Vui lòng thử lại sau',
        position: 'top',
      });
    },
  });
}
