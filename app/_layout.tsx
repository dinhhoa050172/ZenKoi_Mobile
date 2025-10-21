import Loading from '@/components/Loading';
import { initializeAuth, useAuthStore } from '@/lib/store/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import '../global.css';

// Create a single QueryClient for the app
const queryClient = new QueryClient();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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

        // Navigate based on auth state
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
      {isLoading && <Loading />}
      <Toast />
    </QueryClientProvider>
  );
}
