import {
  Pond,
  PondPagination,
  PondRequest,
  pondServices,
} from '@/lib/api/services/fetchPond';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const pondKeys = {
  all: ['ponds'] as const,
  lists: () => [...pondKeys.all, 'list'] as const,
  list: (params: { pageIndex: number; pageSize: number }) =>
    [...pondKeys.lists(), params] as const,
  details: () => [...pondKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...pondKeys.details(), id] as const,
};

/*
 * Hook to get list of Ponds with pagination
 */
export function useGetPonds(pageIndex = 1, pageSize = 20, enabled = true) {
  return useQuery({
    queryKey: pondKeys.list({ pageIndex, pageSize }),
    queryFn: async (): Promise<PondPagination> => {
      const resp = await pondServices.getAllPonds(pageIndex, pageSize);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách ao');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Pond by ID
 */
export function useGetPondById(id: number, enabled = true) {
  return useQuery({
    queryKey: pondKeys.detail(id),
    queryFn: async (): Promise<Pond> => {
      const resp = await pondServices.getPondById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin ao');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Pond
 */
export function useCreatePond() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PondRequest) => {
      const resp = await pondServices.createPond(data);
      if (!resp.isSuccess) throw new Error(resp.message || 'Không thể tạo ao');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pondKeys.lists() });
      qc.invalidateQueries({ queryKey: pondKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo ao thành công',
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
 * Hook to update a Pond
 */
export function useUpdatePond() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PondRequest }) => {
      const resp = await pondServices.updatePond(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật ao');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: pondKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: pondKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: pondKeys.lists() });
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
 * Hook to delete a Pond
 */
export function useDeletePond() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await pondServices.deletePond(id);
      if (!resp.isSuccess) throw new Error(resp.message || 'Không thể xóa ao');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: pondKeys.lists() });
      qc.invalidateQueries({ queryKey: pondKeys.all });
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
 * Hook to prefetch Pond by ID
 */
export function usePrefetchPondById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: pondKeys.detail(id),
      queryFn: async (): Promise<Pond> => {
        const resp = await pondServices.getPondById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Ponds
 */
export function usePrefetchPonds(pageIndex = 1, pageSize = 20) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: pondKeys.list({ pageIndex, pageSize }),
      queryFn: async (): Promise<PondPagination> => {
        const resp = await pondServices.getAllPonds(pageIndex, pageSize);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
