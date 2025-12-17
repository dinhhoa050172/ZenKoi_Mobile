import {
  authServices,
  LoginCredentials,
  LoginResponse,
} from '@/lib/api/services/fetchAuth';
import { userServices } from '@/lib/api/services/fetchUser';
import { useAuthStore } from '@/lib/store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
export function useLogin() {
  const queryClient = useQueryClient();
  const { login: authStoreLogin } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: async (
      credentials: LoginCredentials
    ): Promise<LoginResponse> => {
      const response = await authServices.login(credentials);

      if (!response.isSuccess) {
        throw response;
      }

      return response;
    },
    onSuccess: async (data: LoginResponse) => {
      if (
        data.isSuccess &&
        data.result?.accessToken &&
        data.result.refreshToken
      ) {
        // Decode JWT to read role claims
        try {
          const tokenParts = data.result.accessToken.split('.');
          const payload = JSON.parse(
            atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/'))
          );
          const roleClaim =
            payload.role ||
            payload.Role ||
            payload.roles ||
            payload.Roles ||
            payload[
              'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
            ];
          const allowed = ['FarmStaff'];
          const hasRole = Array.isArray(roleClaim)
            ? roleClaim.some((r: string) => allowed.includes(r))
            : typeof roleClaim === 'string'
              ? allowed.includes(roleClaim)
              : false;

          if (!hasRole) {
            // Reject login for unauthorized roles
            Toast.show({
              type: 'error',
              text1: 'Tài khoản không được phép truy cập ứng dụng',
              position: 'top',
            });
            setError('Tài khoản không được phép truy cập ứng dụng');
            return;
          }
        } catch (err) {
          console.warn('Failed to decode token for role check', err);
          Toast.show({
            type: 'error',
            text1: 'Không thể xác thực vai trò người dùng',
            position: 'top',
          });
          setError('Không thể xác thực vai trò người dùng');
          return;
        }

        try {
          // Step 1: Save tokens to auth store first
          console.log('🔧 [LOGIN] Step 1: Saving tokens to auth store:', {
            hasAccessToken: !!data.result.accessToken,
            hasRefreshToken: !!data.result.refreshToken,
          });

          await authStoreLogin(data.result);

          console.log(
            '🔧 [LOGIN] Step 1 completed, basic user from token:',
            useAuthStore.getState().user
          );

          // Step 2: Fetch detailed user profile with the new token
          console.log('🔧 [LOGIN] Step 2: Fetching user profile from API...');

          try {
            const userProfileResponse = await userServices.getMe();

            if (userProfileResponse.isSuccess && userProfileResponse.result) {
              console.log(
                '🔧 [LOGIN] User profile fetched successfully:',
                userProfileResponse.result
              );

              // Step 3: Sync the detailed profile to auth store
              const { syncUserFromProfile } = useAuthStore.getState();
              await syncUserFromProfile({
                id: userProfileResponse.result.id,
                userName: userProfileResponse.result.fullName,
                fullName: userProfileResponse.result.fullName,
                email: userProfileResponse.result.email,
                // Add additional fields from profile
                phoneNumber: userProfileResponse.result.phoneNumber,
                role: userProfileResponse.result.role as any,
              });

              console.log(
                '🔧 [LOGIN] Step 3 completed, final user in store:',
                useAuthStore.getState().user
              );
            } else {
              console.warn(
                '🔧 [LOGIN] Failed to fetch user profile, continuing with token data'
              );
            }
          } catch (profileError) {
            console.warn(
              '🔧 [LOGIN] Error fetching user profile, continuing with token data:',
              profileError
            );
            // Don't fail the login if profile fetch fails
          }

          // Step 4: Complete login process
          queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
          queryClient.invalidateQueries({ queryKey: ['user'] }); // Also invalidate user queries
          router.replace('/(home)');
          setError(null);
          Toast.show({
            type: 'success',
            text1: 'Đăng nhập thành công',
            position: 'top',
            visibilityTime: 2000,
          });
        } catch (err) {
          console.warn('Failed to process login', err);
          Toast.show({
            type: 'error',
            text1: 'Không thể xử lý đăng nhập',
            position: 'top',
          });
          setError('Không thể xử lý đăng nhập');
          return;
        }
      }
    },
    onError: (error: LoginResponse) => {
      setError(error.message || 'Đăng nhập thất bại');
      Toast.show({
        type: 'error',
        text1: error.message || 'Đăng nhập thất bại',
        position: 'top',
        visibilityTime: 2000,
      });
    },
  });

  return { login, isLoading, error };
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      // Try to read stored refresh token and pass it (store signature requires string)
      const refresh =
        (await SecureStore.getItemAsync('auth-refresh-token')) || '';
      await useAuthStore.getState().logout(refresh);
      queryClient.clear();
      router.replace('/login');
      Toast.show({
        type: 'success',
        text1: 'Đăng xuất thành công',
        position: 'top',
        visibilityTime: 1500,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Đăng xuất thất bại',
        position: 'top',
        visibilityTime: 1500,
      });
    }
  }, [queryClient, router]);

  return { logout };
}

export function useRenewToken() {
  const [isRenewing, setIsRenewing] = useState(false);

  const renew = useCallback(async () => {
    setIsRenewing(true);
    try {
      const ok = await useAuthStore.getState().renewAccessToken();
      return ok;
    } catch {
      return false;
    } finally {
      setIsRenewing(false);
    }
  }, []);

  return { renew, isRenewing };
}

export function useAuthState() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  return { user, isAuthenticated, isLoading };
}
