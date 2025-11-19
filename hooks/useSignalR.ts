import { useAuthStore } from '@/lib/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import { signalRService } from '../lib/services/signalRService';
import {
  ParameterNameLabels,
  SeverityLevel,
  WaterAlert,
} from '../lib/types/alert';
import { waterAlertKeys } from './useWaterAlert';

/**
 * Hook để quản lý WebSocket connection và nhận realtime alerts
 */
export function useSignalR() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const [connectionState, setConnectionState] = useState<
    'Connected' | 'Disconnected' | 'Reconnecting'
  >('Disconnected');
  const isConnectingRef = useRef(false);
  const hasSetupRef = useRef(false);

  /**
   * Handle khi nhận alert mới
   */
  const handleAlert = useCallback(
    (alert: WaterAlert) => {
      queryClient.invalidateQueries({ queryKey: waterAlertKeys.all });
      queryClient.invalidateQueries({ queryKey: ['ponds'] });

      // Hiển thị Toast notification
      const parameterLabel =
        ParameterNameLabels[alert.ParameterName] || alert.ParameterName;

      // Chỉ hiển thị toast cho alerts quan trọng
      if (
        alert.Severity === SeverityLevel.High ||
        alert.Severity === SeverityLevel.Urgent
      ) {
        Toast.show({
          type: alert.Severity === SeverityLevel.Urgent ? 'error' : 'info',
          text1: `🚨 Cảnh báo ${parameterLabel}`,
          text2: alert.Message,
          position: 'top',
          visibilityTime: 6000,
          autoHide: true,
          topOffset: 50,
          onPress: () => {
            // Navigate đến chi tiết pond
            if (alert.PondId) {
              router.push(`/water/${alert.PondId}` as any);
            }
          },
        });
      }
    },
    [queryClient, router]
  );

  /**
   * Effect: Setup connection khi authenticated
   */
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Reset và disconnect nếu không authenticated
      signalRService.stop();
      setConnectionState('Disconnected');
      hasSetupRef.current = false;
      isConnectingRef.current = false;
      return;
    }

    // Chỉ setup một lần
    if (hasSetupRef.current) {
      return;
    }

    hasSetupRef.current = true;

    // Setup alert handler
    const unsubscribeAlert = signalRService.onAlert(handleAlert);

    // Setup state change handler
    const unsubscribeState = signalRService.onStateChange((state) => {
      setConnectionState(state);

      // Reset connecting flag khi đã connected hoặc disconnected
      if (state === 'Connected' || state === 'Disconnected') {
        isConnectingRef.current = false;
      }
    });

    // Connect nếu chưa connected và chưa đang connecting
    const currentState = signalRService.getState();
    if (currentState !== 'Connected' && !isConnectingRef.current) {
      isConnectingRef.current = true;
      console.log('[WEBSOCKET HOOK] Starting connection...');

      signalRService
        .start(token)
        .then(() => {
          console.log('[WEBSOCKET HOOK] Connection started successfully');
        })
        .catch((error) => {
          console.error('[WEBSOCKET] Failed to connect:', error);
          isConnectingRef.current = false;
        });
    }

    // Cleanup on unmount
    return () => {
      unsubscribeAlert();
      unsubscribeState();
      hasSetupRef.current = false;
    };
  }, [isAuthenticated, token, handleAlert]);

  /**
   * Retry connection manually
   */
  const retry = useCallback(() => {
    if (isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;

    signalRService.stop().then(() => {
      if (token) {
        signalRService.start(token).catch((error) => {
          console.error('[WEBSOCKET] Retry failed:', error);
          isConnectingRef.current = false;
        });
      } else {
        isConnectingRef.current = false;
      }
    });
  }, [token]);

  return {
    connectionState,
    isConnected: connectionState === 'Connected',
    isConnecting: isConnectingRef.current,
    retry,
  };
}
