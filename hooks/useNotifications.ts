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

    console.log('[NOTIFICATIONS] Token obtained:', tokenData.token);

    // Step 3: Register token với backend
    try {
      console.log('[NOTIFICATIONS] Registering token with backend...');
      await sendTokenMutation.mutateAsync(tokenData.token);
      setCurrentToken(tokenData.token);
      console.log('[NOTIFICATIONS] Token registered successfully with backend');
    } catch (error) {
      console.error(
        '[NOTIFICATIONS] Failed to register token with backend:',
        error
      );
      // Don't block initialization if backend fails
    }

    // Step 4: Setup notification listeners
    const cleanupListeners = registerNotificationListeners(
      handleNotificationReceived,
      handleNotificationTapped
    );
    cleanupFnsRef.current.push(cleanupListeners);

    // Step 5: Listen for token updates (rare)
    const cleanupTokenListener = registerPushTokenListener((newToken) => {
      console.log('[NOTIFICATIONS] Token updated, re-registering...');
      // Register new token directly
      sendTokenMutation
        .mutateAsync(newToken)
        .then(() => {
          setCurrentToken(newToken);
          console.log('[NOTIFICATIONS] Updated token registered with backend');
        })
        .catch((err) => {
          console.error(
            '[NOTIFICATIONS] Failed to register updated token:',
            err
          );
        });
    });
    cleanupFnsRef.current.push(cleanupTokenListener);

    hasRegisteredRef.current = true;
    console.log('[NOTIFICATIONS] Initialization complete');
  }, [sendTokenMutation, handleNotificationReceived, handleNotificationTapped]);

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
      // Initialize notifications when authenticated
      // Note: Token registration is already handled in useAuth after login,
      // but we still need to set up listeners and handle app restarts
      if (!hasRegisteredRef.current) {
        console.log('[NOTIFICATIONS] Auth detected, initializing...');
        initializeNotifications();
      }
    } else {
      cleanupNotifications();
    }

    // Cleanup on unmount
    return () => {
      cleanupNotifications();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only depend on isAuthenticated to avoid re-render loops

  return {
    permissionGranted,
    currentToken,
    isRegistering: sendTokenMutation.isPending,
  };
}
