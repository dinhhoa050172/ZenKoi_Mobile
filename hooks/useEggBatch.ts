import {
  EggBatch,
  EggBatchPagination,
  EggBatchRequest,
  EggBatchSearchParams,
  eggBatchServices,
} from '@/lib/api/services/fetchEggBatch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { breedingProcessKeys } from './useBreedingProcess';

// Query keys
export const eggBatchKeys = {
  all: ['eggBatches'] as const,
  lists: () => [...eggBatchKeys.all, 'list'] as const,
  list: (params: EggBatchSearchParams) =>
    [...eggBatchKeys.lists(), params] as const,
  details: () => [...eggBatchKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...eggBatchKeys.details(), id] as const,
};

/*
 * Hook to get list of Egg Batches with pagination
 */
export function useGetEggBatches(
  filters?: EggBatchSearchParams,
  enabled = true
) {
  return useQuery({
    queryKey: eggBatchKeys.list(filters || {}),
    queryFn: async (): Promise<EggBatchPagination> => {
      const resp = await eggBatchServices.getAllEggBatches(filters || {});
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách lô trứng');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Egg Batch by ID
 */
export function useGetEggBatchById(id: number, enabled = true) {
  return useQuery({
    queryKey: eggBatchKeys.detail(id),
    queryFn: async (): Promise<EggBatch> => {
      const resp = await eggBatchServices.getEggBatchById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải lô trứng');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Get Egg Batch by Breeding Process ID
 */
export function useGetEggBatchByBreedingProcessId(
  breedingProcessId: number,
  enabled = true
) {
  return useQuery({
    queryKey: ['eggBatch', 'by-breeding-process', breedingProcessId],
    queryFn: async (): Promise<EggBatch> => {
      const resp =
        await eggBatchServices.getEggBatchByBreedingProcessId(
          breedingProcessId
        );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải lô trứng cho quy trình này'
        );
      return resp.result;
    },
    enabled: enabled && !!breedingProcessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Egg Batch
 */
export function useCreateEggBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: EggBatchRequest) => {
      const resp = await eggBatchServices.createEggBatch(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo lô trứng');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eggBatchKeys.lists() });
      qc.invalidateQueries({ queryKey: eggBatchKeys.all });
      qc.invalidateQueries({ queryKey: breedingProcessKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo lô trứng thành công',
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
 * Hook to update an existing Egg Batch
 */
export function useUpdateEggBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EggBatchRequest }) => {
      const resp = await eggBatchServices.updateEggBatch(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật lô trứng');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật lô trứng thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: eggBatchKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: eggBatchKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: eggBatchKeys.lists() });
      qc.invalidateQueries({ queryKey: breedingProcessKeys.lists() });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật lô trứng thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to delete an Egg Batch
 */
export function useDeleteEggBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await eggBatchServices.deleteEggBatch(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa lô trứng');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Xóa lô trứng thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: eggBatchKeys.lists() });
      qc.invalidateQueries({ queryKey: eggBatchKeys.all });
      qc.invalidateQueries({ queryKey: breedingProcessKeys.lists() });
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
 * Hook to prefetch Egg Batch by ID
 */
export function usePrefetchEggBatchById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: eggBatchKeys.detail(id),
      queryFn: async (): Promise<EggBatch> => {
        const resp = await eggBatchServices.getEggBatchById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Egg Batches
 */
export function usePrefetchEggBatches(filters?: EggBatchSearchParams) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: eggBatchKeys.list(filters || {}),
      queryFn: async (): Promise<EggBatchPagination> => {
        const resp = await eggBatchServices.getAllEggBatches(filters || {});
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
