import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Service để quản lý Expo Notifications
 * - Request permissions
 * - Get push token
 * - Setup notification handlers
 */

// Cấu hình notification handler mặc định
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationToken {
  token: string;
  platform: string;
}

/**
 * Kiểm tra xem có đang chạy trên Expo Go không
 */
function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Request notification permissions từ user
 * @returns true nếu permission được granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('[NOTIFICATION] Not running on physical device');
    return false;
  }

  if (isRunningInExpoGo()) {
    console.warn(
      '[NOTIFICATION] Push notifications không hoạt động trên Expo Go. Vui lòng build development build.'
    );
    return false;
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[NOTIFICATION] Permission not granted');
      return false;
    }

    // Android specific: create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0A3D62',
      });
    }

    console.log('[NOTIFICATION] Permission granted');
    return true;
  } catch (error) {
    console.error('[NOTIFICATION] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Lấy Expo Push Token
 * @returns NotificationToken object hoặc null nếu thất bại
 */
export async function getExpoPushToken(): Promise<NotificationToken | null> {
  // FOR TESTING: Generate a mock token to test backend integration without real device
  // ⚠️ Set to false when deploying to production APK
  const TESTING_MODE = false;

  if (TESTING_MODE) {
    const mockToken: NotificationToken = {
      token: `ExponentPushToken[TEST-${Date.now()}-${Math.random().toString(36).substring(7)}]`,
      platform: Platform.OS,
    };
    console.log('[NOTIFICATION] 🧪 TESTING MODE: Using mock token');
    console.log('[NOTIFICATION] Mock token:', mockToken.token);
    return mockToken;
  }

  // Skip device check if running in Expo Go (development)
  if (isRunningInExpoGo()) {
    console.warn(
      '[NOTIFICATION] Push notifications không hoạt động trên Expo Go. Vui lòng build development build hoặc bật TESTING_MODE.'
    );
    return null;
  }

  // On real device or production build, get real token
  if (!Device.isDevice) {
    console.warn(
      '[NOTIFICATION] Cannot get push token on simulator/emulator. Token sẽ chỉ hoạt động trên thiết bị thật.'
    );
    return null;
  }

  try {
    console.log('[NOTIFICATION] Requesting push token from Expo...');
    console.log('[NOTIFICATION] Device info:', {
      isDevice: Device.isDevice,
      deviceName: Device.deviceName,
      platform: Platform.OS,
    });

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'aabc20fa-376a-48f1-bb96-56f98f6f9630',
    });

    const token: NotificationToken = {
      token: tokenData.data,
      platform: Platform.OS,
    };

    console.log('[NOTIFICATION] ✅ Push token obtained successfully');
    console.log(
      '[NOTIFICATION] Token format:',
      token.token.substring(0, 30) + '...'
    );
    console.log('[NOTIFICATION] Platform:', token.platform);

    // Validate token format
    if (!token.token.startsWith('ExponentPushToken[')) {
      console.error(
        '[NOTIFICATION] ⚠️ WARNING: Token does not have expected format!'
      );
      console.error('[NOTIFICATION] Expected: ExponentPushToken[...]');
      console.error('[NOTIFICATION] Got:', token.token);
    }

    return token;
  } catch (error) {
    console.error('[NOTIFICATION] ❌ Error getting push token:', error);
    if (error instanceof Error) {
      console.error('[NOTIFICATION] Error message:', error.message);
      console.error('[NOTIFICATION] Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Đăng ký notification listeners
 * @param onNotificationReceived - Callback khi nhận notification (foreground)
 * @param onNotificationTapped - Callback khi user tap notification
 * @returns Cleanup function để remove listeners
 */
export function registerNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('[NOTIFICATION] Received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[NOTIFICATION] Tapped:', response);
      onNotificationTapped?.(response);
    });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Đăng ký listener cho token updates (hiếm khi xảy ra)
 * @param onTokenUpdate - Callback khi token thay đổi
 * @returns Cleanup function
 */
export function registerPushTokenListener(
  onTokenUpdate: (token: string) => void
): () => void {
  const subscription = Notifications.addPushTokenListener((tokenData) => {
    console.log('[NOTIFICATION] Token updated:', tokenData.data);
    onTokenUpdate(tokenData.data);
  });

  return () => {
    subscription.remove();
  };
}
