import { useSendExpoPushToken } from '@/hooks/useExpoPushToken';
import {
  getExpoPushToken,
  registerNotificationListeners,
  registerPushTokenListener,
  requestNotificationPermissions,
} from '@/lib/services/notificationService';
import { useAuthStore } from '@/lib/store/authStore';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';

/**
 * Hook để quản lý notification lifecycle
 * - Tự động request permissions khi authenticated
 * - Lấy và gửi push token lên backend
 * - Setup notification handlers (foreground/tap)
 * - Cleanup khi logout
 */
export function useNotifications() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sendTokenMutation = useSendExpoPushToken();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Track if we've already registered to avoid duplicate calls
  const hasRegisteredRef = useRef(false);
  const cleanupFnsRef = useRef<(() => void)[]>([]);

  /**
   * Register token với backend
   */
  const registerToken = useCallback(
    async (token: string) => {
      try {
        console.log('[NOTIFICATIONS] Registering token with backend...');
        await sendTokenMutation.mutateAsync(token);
        setCurrentToken(token);
        console.log('[NOTIFICATIONS] Token registered successfully');
      } catch (error) {
        console.error('[NOTIFICATIONS] Failed to register token:', error);
      }
    },
    [sendTokenMutation]
  );

  /**
   * Handle notification received (foreground)
   */
  const handleNotificationReceived = useCallback(
    (notification: Notifications.Notification) => {
      const data = notification.request.content.data as any;
      const title = notification.request.content.title || 'Thông báo';
      const body = notification.request.content.body || '';

      // Hiển thị toast
      Toast.show({
        type: 'info',
        text1: title,
        text2: body,
        position: 'top',
        visibilityTime: 4000,
        onPress: () => {
          // Navigate nếu có alertId
          if (data?.alertId) {
            router.push(`/water/${data.alertId}` as any);
          }
        },
      });

      // TODO: Invalidate queries nếu cần
      // queryClient.invalidateQueries(['alerts']);
    },
    [router]
  );

  /**
   * Handle notification tapped (user interaction)
   */
  const handleNotificationTapped = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as any;

      // Navigate đến chi tiết alert
      if (data?.alertId) {
        router.push(`/water/${data.alertId}` as any);
      } else if (data?.screen) {
        // Fallback: navigate theo screen name từ data
        router.push(data.screen as any);
      }
    },
    [router]
  );

  /**
   * Initialize notifications
   */
  const initializeNotifications = useCallback(async () => {
    if (hasRegisteredRef.current) {
      console.log('[NOTIFICATIONS] Already registered, skipping...');
      return;
    }

    console.log('[NOTIFICATIONS] Initializing...');

    // Step 1: Request permissions
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);

    if (!granted) {
      console.warn('[NOTIFICATIONS] Permission not granted');
      return;
    }

    // Step 2: Get push token
    const tokenData = await getExpoPushToken();
    if (!tokenData) {
      console.warn('[NOTIFICATIONS] Failed to get push token');
      return;
    }

    // Step 3: Register token với backend
    await registerToken(tokenData.token);

    // Step 4: Setup notification listeners
    const cleanupListeners = registerNotificationListeners(
      handleNotificationReceived,
      handleNotificationTapped
    );
    cleanupFnsRef.current.push(cleanupListeners);

    // Step 5: Listen for token updates (rare)
    const cleanupTokenListener = registerPushTokenListener((newToken) => {
      console.log('[NOTIFICATIONS] Token updated, re-registering...');
      registerToken(newToken);
    });
    cleanupFnsRef.current.push(cleanupTokenListener);

    hasRegisteredRef.current = true;
    console.log('[NOTIFICATIONS] Initialization complete');
  }, [registerToken, handleNotificationReceived, handleNotificationTapped]);

  /**
   * Cleanup notifications
   */
  const cleanupNotifications = useCallback(() => {
    console.log('[NOTIFICATIONS] Cleaning up...');
    cleanupFnsRef.current.forEach((cleanup) => cleanup());
    cleanupFnsRef.current = [];
    hasRegisteredRef.current = false;
    setCurrentToken(null);
  }, []);

  /**
   * Effect: Initialize khi authenticated, cleanup khi logout
   */
  useEffect(() => {
    if (isAuthenticated) {
      initializeNotifications();
    } else {
      cleanupNotifications();
    }

    // Cleanup on unmount
    return () => {
      cleanupNotifications();
    };
  }, [isAuthenticated, initializeNotifications, cleanupNotifications]);

  return {
    permissionGranted,
    currentToken,
    isRegistering: sendTokenMutation.isPending,
  };
}
