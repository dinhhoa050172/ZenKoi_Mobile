import {
  PondType,
  PondTypeRequest,
  pondTypeServices,
} from '@/lib/api/services/fetchPondType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const pondTypeKeys = {
  all: ['pondTypes'] as const,
  lists: () => [...pondTypeKeys.all, 'list'] as const,
  list: () => [...pondTypeKeys.lists(), 'all'] as const,
  details: () => [...pondTypeKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...pondTypeKeys.details(), id] as const,
};

/*
 * Hook to get list of Pond Types
 */
export function useGetPondTypes(enabled = true) {
  return useQuery({
    queryKey: pondTypeKeys.lists(),
    queryFn: async (): Promise<PondType[]> => {
      const resp = await pondTypeServices.getAllPondType();
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách loại ao');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Pond Type by ID
 */
export function useGetPondTypeById(id: number, enabled = true) {
  return useQuery({
    queryKey: pondTypeKeys.detail(id),
    queryFn: async (): Promise<PondType> => {
      const resp = await pondTypeServices.getPondTypeById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải loại ao');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Pond Type
 */
export function useCreatePondType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PondTypeRequest) => {
      const resp = await pondTypeServices.createPondType(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo loại ao');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pondTypeKeys.lists() });
      qc.invalidateQueries({ queryKey: pondTypeKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo loại ao thành công',
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
 * Hook to update a Pond Type
 */
export function useUpdatePondType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PondTypeRequest }) => {
      const resp = await pondTypeServices.updatePondType(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật loại ao');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: pondTypeKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: pondTypeKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: pondTypeKeys.lists() });
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
 * Hook to delete a Pond Type
 */
export function useDeletePondType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await pondTypeServices.deletePondType(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa loại ao');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: pondTypeKeys.lists() });
      qc.invalidateQueries({ queryKey: pondTypeKeys.all });
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
 * Hook to prefetch Pond Type by ID
 */
export function usePrefetchPondTypeById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: pondTypeKeys.detail(id),
      queryFn: async (): Promise<PondType> => {
        const resp = await pondTypeServices.getPondTypeById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch all Pond Types
 */
export function usePrefetchPondTypes() {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: pondTypeKeys.lists(),
      queryFn: async (): Promise<PondType[]> => {
        const resp = await pondTypeServices.getAllPondType();
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
