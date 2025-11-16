import Loading from '@/components/Loading';
import { useNotifications } from '@/hooks/useNotifications';
import { useSignalR } from '@/hooks/useSignalR';
import { initializeAuth, useAuthStore } from '@/lib/store/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 1. Import thêm useRootNavigationState
import { Stack, useRootNavigationState, useRouter } from 'expo-router'; // <--- THAY ĐỔI
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import '../global.css';

// Create a single QueryClient for the app
const queryClient = new QueryClient();

// Component wrapper để gọi hooks sau khi QueryClientProvider đã mount
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  // Initialize notifications (phải gọi sau QueryClientProvider)
  useNotifications();

  // Initialize SignalR for realtime alerts
  useSignalR();

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
  }, [rootNavigationState?.key]);

  return (
    <>
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
    </>
  );
}

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
