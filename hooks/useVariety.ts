import {
  Variety,
  VarietyPagination,
  VarietyRequest,
  varietyServices,
} from '@/lib/api/services/fetchVariety';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query Keys
export const varietyKeys = {
  all: ['varieties'] as const,
  lists: () => [...varietyKeys.all, 'list'] as const,
  list: (params: { pageIndex: number; pageSize: number }) =>
    [...varietyKeys.lists(), params] as const,
  details: () => [...varietyKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...varietyKeys.details(), id] as const,
};

/*
 * Hook to get list of Varieties with pagination
 */
export function useGetVarieties(pageIndex = 1, pageSize = 20, enabled = true) {
  return useQuery({
    queryKey: varietyKeys.list({ pageIndex, pageSize }),
    queryFn: async (): Promise<VarietyPagination> => {
      const resp = await varietyServices.getAllVarieties(pageIndex, pageSize);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách giống');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Variety by ID
 */
export function useGetVarietyById(id: number, enabled = true) {
  return useQuery({
    queryKey: varietyKeys.detail(id),
    queryFn: async (): Promise<Variety> => {
      const resp = await varietyServices.getVarietyById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải giống');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Variety
 */
export function useCreateVariety() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: VarietyRequest) => {
      const resp = await varietyServices.createVariety(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo giống');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: varietyKeys.lists() });
      qc.invalidateQueries({ queryKey: varietyKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo giống thành công',
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
 * Hook to update an existing Variety
 */
export function useUpdateVariety() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VarietyRequest }) => {
      const resp = await varietyServices.updateVariety(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật giống');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: varietyKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: varietyKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: varietyKeys.lists() });
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
 * Hook to delete a Variety
 */
export function useDeleteVariety() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await varietyServices.deleteVariety(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa giống');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: varietyKeys.lists() });
      qc.invalidateQueries({ queryKey: varietyKeys.all });
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
 * Hook to prefetch Variety by ID
 */
export function usePrefetchVarietyById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: varietyKeys.detail(id),
      queryFn: async (): Promise<Variety> => {
        const resp = await varietyServices.getVarietyById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Varieties
 */
export function usePrefetchVarieties(pageIndex = 1, pageSize = 20) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: varietyKeys.list({ pageIndex, pageSize }),
      queryFn: async (): Promise<VarietyPagination> => {
        const resp = await varietyServices.getAllVarieties(pageIndex, pageSize);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
