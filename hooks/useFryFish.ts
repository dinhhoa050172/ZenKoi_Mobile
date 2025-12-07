import {
  FryFish,
  FryFishPagination,
  FryFishRequest,
  FryFishSearchParams,
  FryFishSummary,
  fryFishServices,
} from '@/lib/api/services/fetchFryFish';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const fryFishKeys = {
  all: ['fryFish'] as const,
  lists: () => [...fryFishKeys.all, 'list'] as const,
  list: (params: FryFishSearchParams) =>
    [...fryFishKeys.lists(), params] as const,
  details: () => [...fryFishKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...fryFishKeys.details(), id] as const,
};

/*
 * Hook to get list of Fry Fish with pagination
 */
export function useGetFryFish(filters?: FryFishSearchParams, enabled = true) {
  return useQuery({
    queryKey: fryFishKeys.list(filters || {}),
    queryFn: async (): Promise<FryFishPagination> => {
      const resp = await fryFishServices.getAllFryFish(filters || {});
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách cá bột');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Fry Fish by ID
 */
export function useGetFryFishById(id: number, enabled = true) {
  return useQuery({
    queryKey: fryFishKeys.detail(id),
    queryFn: async (): Promise<FryFish> => {
      const resp = await fryFishServices.getFryFishById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin cá bột');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Get Fry Fish by Breeding Process ID
 */
export function useGetFryFishByBreedingProcessId(
  breedingProcessId: number,
  enabled = true
) {
  return useQuery({
    queryKey: ['fryFish', 'by-breeding-process', breedingProcessId],
    queryFn: async (): Promise<FryFish> => {
      const resp =
        await fryFishServices.getFryFishByBreedingProcessId(breedingProcessId);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách cá bột cho quy trình này'
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
 * Hook to get Fry Fish Summary by Fry Fish ID
 */
export function useGetFryFishSummaryByFryFishId(
  fryFishId: number,
  enabled = true
) {
  return useQuery({
    queryKey: ['fryFish', 'summary', fryFishId],
    queryFn: async (): Promise<FryFishSummary> => {
      const resp =
        await fryFishServices.getFryFishSummaryByFryFishId(fryFishId);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải tóm tắt cá bột cho cá bột này'
        );
      return resp.result;
    },
    enabled: enabled && !!fryFishId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Fry Fish
 */
export function useCreateFryFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: FryFishRequest) => {
      const resp = await fryFishServices.createFryFish(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo cá bột');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fryFishKeys.lists() });
      qc.invalidateQueries({ queryKey: fryFishKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Chuyển sang nuôi cá bột thành công',
        position: 'top',
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Chuyển sang nuôi cá bột thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to update an existing Fry Fish
 */
export function useUpdateFryFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FryFishRequest }) => {
      const resp = await fryFishServices.updateFryFish(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật cá bột');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: fryFishKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: fryFishKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: fryFishKeys.lists() });
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
 * Hook to delete a Fry Fish
 */
export function useDeleteFryFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await fryFishServices.deleteFryFish(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa cá bột');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: fryFishKeys.lists() });
      qc.invalidateQueries({ queryKey: fryFishKeys.all });
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
 * Hook to prefetch Fry Fish by ID
 */
export function usePrefetchFryFishById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: fryFishKeys.detail(id),
      queryFn: async (): Promise<FryFish> => {
        const resp = await fryFishServices.getFryFishById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Fry Fish with pagination
 */
export function usePrefetchFryFish(filters?: FryFishSearchParams) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: fryFishKeys.list(filters || {}),
      queryFn: async (): Promise<FryFishPagination> => {
        const resp = await fryFishServices.getAllFryFish(filters || {});
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
