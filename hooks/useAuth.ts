import {
  authServices,
  LoginCredentials,
  LoginResponse,
  RegisterRequest,
} from '@/lib/api/services/fetchAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
export function useLogin() {
  const queryClient = useQueryClient();
  const { setToken, setRefreshToken } = useAuthStore();
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
    onSuccess: (data: LoginResponse) => {
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
          const allowed = ['FarmStaff', 'Manager'];
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

        setToken(data.result.accessToken);
        setRefreshToken(data.result.refreshToken);
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        router.replace('/(home)');
        setError(null);
        Toast.show({
          type: 'success',
          text1: 'Đăng nhập thành công',
          position: 'top',
          visibilityTime: 2000,
        });
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

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { mutate: register, isPending: isLoading } = useMutation({
    mutationFn: async (request: RegisterRequest) => {
      const response = await authServices.register(request);
      if (!response.isSuccess) throw response;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      Toast.show({
        type: 'success',
        text1: 'Đăng ký thành công',
        position: 'top',
        visibilityTime: 2000,
      });
      // After register, navigate to login
      router.replace('/login');
      setError(null);
    },
    onError: (err: any) => {
      const message = err?.message || 'Đăng ký thất bại';
      setError(message);
      Toast.show({
        type: 'error',
        text1: message,
        position: 'top',
        visibilityTime: 2000,
      });
    },
  });

  return { register, isLoading, error };
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
