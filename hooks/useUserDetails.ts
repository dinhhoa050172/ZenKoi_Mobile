import {
  UpdateProfileRequest,
  UpdateUserDetails,
  UserMeProfile,
  userServices,
} from '@/lib/api/services/fetchUser';
import { useAuthStore } from '@/lib/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import Toast from 'react-native-toast-message';

// Query keys for user data
export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

/*
 * Hook to get current user profile
 */
export function useGetUserProfile(enabled = true) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async (): Promise<UserMeProfile> => {
      const resp = await userServices.getMe();
      if (!resp.isSuccess) {
        throw new Error(resp.message || 'Không thể tải thông tin người dùng');
      }
      return resp.result;
    },
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (
        error?.message?.includes('401') ||
        error?.message?.includes('Unauthorized')
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/*
 * Hook to update user profile
 */
export function useUpdateUserProfile() {
  const qc = useQueryClient();
  const { syncUserFromProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (profileData: UpdateProfileRequest) => {
      const resp = await userServices.updateProfile(profileData);
      if (!resp.isSuccess) {
        throw new Error(
          resp.message || 'Không thể cập nhật thông tin người dùng'
        );
      }
      return resp.result;
    },
    onSuccess: async (updatedProfile) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        text2: 'Thông tin cá nhân đã được cập nhật',
        position: 'top',
      });

      // Update cache
      qc.setQueryData(userKeys.me(), updatedProfile);

      // Sync updated profile to auth store
      await syncUserFromProfile({
        id: updatedProfile.id,
        userName: updatedProfile.fullName,
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
      });

      // Invalidate related queries
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật thất bại',
        text2: err?.message || 'Đã xảy ra lỗi khi cập nhật thông tin',
        position: 'top',
      });
    },
  });
}

/*
 * Hook to update user detail (create/update user detail endpoint)
 */
export function useUpdateUserDetail() {
  const qc = useQueryClient();
  const { syncUserFromProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (userDetail: UpdateUserDetails) => {
      const resp = await userServices.updateUserDetail(userDetail);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể cập nhật thông tin chi tiết người dùng'
        );
      return resp.result;
    },
    onSuccess: async (updatedProfile) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật chi tiết thành công',
        position: 'top',
      });
      qc.setQueryData(userKeys.me(), updatedProfile);
      await syncUserFromProfile({
        id: updatedProfile.id,
        userName: updatedProfile.fullName,
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
      });
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật thất bại',
        text2: err?.message || 'Đã xảy ra lỗi khi cập nhật thông tin chi tiết',
        position: 'top',
      });
    },
  });
}

/*
 * Hook to update user avatar
 */
export function useUpdateAvatar() {
  const qc = useQueryClient();
  const { syncUserFromProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (avatarURL: string) => {
      const resp = await userServices.updateAvatar(avatarURL);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật avatar');
      return resp.result as UserMeProfile;
    },
    onSuccess: async (updatedProfile) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật avatar thành công',
        position: 'top',
      });
      qc.setQueryData(userKeys.me(), updatedProfile);
      await syncUserFromProfile({
        id: updatedProfile.id,
        userName: updatedProfile.fullName,
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
      });
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật avatar thất bại',
        text2: err?.message || String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to update user profile (full profile endpoint)
 */
export function useUpdateProfile() {
  // reuse logic from useUpdateUserProfile but keep a dedicated hook name
  return useUpdateUserProfile();
}

/*
 * Hook to sync user profile to auth store
 */
export function useSyncUserToAuthStore() {
  const { syncUserFromProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (profile: UserMeProfile) => {
      await syncUserFromProfile({
        id: profile.id,
        userName: profile.fullName,
        fullName: profile.fullName,
        email: profile.email,
      });
      return profile;
    },
    onSuccess: () => {
      console.log('✅ [USER SYNC] User profile synced to auth store');
    },
    onError: (error) => {
      console.error('❌ [USER SYNC] Failed to sync user profile:', error);
    },
  });
}

/*
 * Hook to prefetch user profile
 */
export function usePrefetchUserProfile() {
  const qc = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return () => {
    if (isAuthenticated) {
      qc.prefetchQuery({
        queryKey: userKeys.me(),
        queryFn: async (): Promise<UserMeProfile> => {
          const resp = await userServices.getMe();
          return resp.result;
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  };
}

/*
 * Combined hook for user data management
 */
export function useUserDetails(options?: {
  autoSync?: boolean;
  enabled?: boolean;
}) {
  const { autoSync = true, enabled = true } = options || {};

  const userProfileQuery = useGetUserProfile(enabled);
  const syncMutation = useSyncUserToAuthStore();
  const updateMutation = useUpdateUserProfile();

  // Auto-sync user profile to auth store when data is loaded.
  // Guard against repeated calls by remembering last synced profile id.
  const lastSyncedId = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!autoSync || !userProfileQuery.data || !userProfileQuery.isSuccess)
      return;

    const id = userProfileQuery.data?.id;
    if (typeof id === 'number' && lastSyncedId.current === id) return;

    // mark as synced for this id and call the mutation
    if (typeof id === 'number') lastSyncedId.current = id;
    // use mutate (stable) to sync profile into auth store
    syncMutation.mutate(userProfileQuery.data);
    // NOTE: if multiple components mount and call this hook, this prevents
    // repeated syncs for the same profile id.
  }, [
    userProfileQuery.data,
    userProfileQuery.data?.id,
    userProfileQuery.isSuccess,
    autoSync,
    syncMutation,
  ]);

  return {
    // Query data
    profile: userProfileQuery.data,
    isLoading: userProfileQuery.isLoading,
    isError: userProfileQuery.isError,
    error: userProfileQuery.error,
    refetch: userProfileQuery.refetch,

    // Mutations
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    // Sync functionality
    syncToAuthStore: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
}
