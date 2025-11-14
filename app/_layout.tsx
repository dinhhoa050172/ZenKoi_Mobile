import Loading from '@/components/Loading';
import { initializeAuth, useAuthStore } from '@/lib/store/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 1. Import thêm useRootNavigationState
import { Stack, useRouter, useRootNavigationState } from 'expo-router'; // <--- THAY ĐỔI
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import '../global.css';

// Create a single QueryClient for the app
const queryClient = new QueryClient();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  // 2. Lấy trạng thái của navigation gốc
  const rootNavigationState = useRootNavigationState(); // <--- THAY ĐỔI

  useEffect(() => {
    // 3. Chỉ chạy logic khi navigation đã sẵn sàng (có key)
    if (!rootNavigationState?.key) {
      return;
    }

    const checkAuth = async () => {
      try {
        console.log('🔧 [ROOT LAYOUT] Initializing authentication...');

        // Initialize auth from secure storage
        await initializeAuth();

        // Sync auth state
        const { syncAuthState } = useAuthStore.getState();
        await syncAuthState();

        // Get current auth state
        const state = useAuthStore.getState();

        console.log('🔧 [ROOT LAYOUT] Auth state:', {
          isAuthenticated: state.isAuthenticated,
          hasToken: !!state.token,
          hasUser: !!state.user,
        });

        // 4. Bây giờ điều hướng đã an toàn
        if (state.isAuthenticated && state.token) {
          router.replace('/(home)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (err) {
        console.error('❌ [ROOT LAYOUT] Error loading auth:', err);
        router.replace('/(auth)/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootNavigationState?.key]); // 5. Thêm dependency vào đây <--- THAY ĐỔI

  // Logic render của bạn đã tốt
  // Nó sẽ hiển thị <Stack> VÀ một lớp loading overlay
  // useEffect sẽ chờ <Stack> mount (có key), sau đó mới chạy
  // auth, điều hướng, và cuối cùng là tắt overlay.
  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />

        {isLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backgroundColor: '#fff',
            }}
          >
            <Loading />
          </View>
        )}
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
