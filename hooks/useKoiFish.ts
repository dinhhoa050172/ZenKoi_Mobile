import {
  KoiFish,
  KoiFishPagination,
  KoiFishRequest,
  koiFishServices,
} from '@/lib/api/services/fetchKoiFish';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const koiFishKeys = {
  all: ['koiFish'] as const,
  lists: () => [...koiFishKeys.all, 'list'] as const,
  list: (params: { pageIndex: number; pageSize: number }) =>
    [...koiFishKeys.lists(), params] as const,
  details: () => [...koiFishKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...koiFishKeys.details(), id] as const,
};

/*
 * Hook to get list of Koi Fish with pagination
 */
export function useGetKoiFish(pageIndex = 1, pageSize = 20, enabled = true) {
  return useQuery({
    queryKey: koiFishKeys.list({ pageIndex, pageSize }),
    queryFn: async (): Promise<KoiFishPagination> => {
      const resp = await koiFishServices.getAllKoiFish(pageIndex, pageSize);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách cá koi');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Koi Fish by ID
 */
export function useGetKoiFishById(id: number, enabled = true) {
  return useQuery({
    queryKey: koiFishKeys.detail(id),
    queryFn: async (): Promise<KoiFish> => {
      const resp = await koiFishServices.getKoiFishById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin cá');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Koi Fish
 */
export function useCreateKoiFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: KoiFishRequest) => {
      const resp = await koiFishServices.createKoiFish(data);
      if (!resp.isSuccess) throw new Error(resp.message || 'Không thể tạo cá');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: koiFishKeys.lists() });
      qc.invalidateQueries({ queryKey: koiFishKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo cá thành công',
        position: 'top',
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Tạo thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to update an existing Koi Fish
 */
export function useUpdateKoiFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: KoiFishRequest }) => {
      const resp = await koiFishServices.updateKoiFish(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật cá');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: koiFishKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: koiFishKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: koiFishKeys.lists() });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to delete a Koi Fish
 */
export function useDeleteKoiFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await koiFishServices.deleteKoiFish(id);
      if (!resp.isSuccess) throw new Error(resp.message || 'Không thể xóa cá');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: koiFishKeys.lists() });
      qc.invalidateQueries({ queryKey: koiFishKeys.all });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Xóa thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to prefetch Koi Fish by ID
 */
export function usePrefetchKoiFishById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: koiFishKeys.detail(id),
      queryFn: async (): Promise<KoiFish> => {
        const resp = await koiFishServices.getKoiFishById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Koi Fish with pagination
 */
export function usePrefetchKoiFish(pageIndex = 1, pageSize = 20) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: koiFishKeys.list({ pageIndex, pageSize }),
      queryFn: async (): Promise<KoiFishPagination> => {
        const resp = await koiFishServices.getAllKoiFish(pageIndex, pageSize);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
