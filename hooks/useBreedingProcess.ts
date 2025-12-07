import {
  BreedingProcess,
  BreedingProcessDetail,
  BreedingProcessPagination,
  BreedingProcessRequest,
  BreedingProcessSearchParams,
  breedingProcessServices,
  InbreedingLevel,
} from '@/lib/api/services/fetchBreedingProcess';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const breedingProcessKeys = {
  all: ['breedingProcesses'] as const,
  lists: () => [...breedingProcessKeys.all, 'list'] as const,
  list: (params: BreedingProcessSearchParams) =>
    [...breedingProcessKeys.lists(), params] as const,
  details: () => [...breedingProcessKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...breedingProcessKeys.details(), id] as const,
};

/*
 * Hook to get list of Breeding Processes with pagination
 */
export function useGetBreedingProcesses(
  filters?: BreedingProcessSearchParams,
  enabled = true
) {
  // create a stable key based on filters except pagination fields
  const filterKey = { ...(filters || {}) };
  delete filterKey.pageIndex;
  delete filterKey.pageSize;

  return useInfiniteQuery<BreedingProcessPagination, Error>({
    queryKey: breedingProcessKeys.list(filterKey || {}),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }): Promise<BreedingProcessPagination> => {
      const f: BreedingProcessSearchParams = { ...(filters || {}) };
      f.pageIndex = Number(pageParam) || 1;
      if (!f.pageSize) f.pageSize = 50;
      const res = await breedingProcessServices.getAllBreedingProcesses(f);
      if (!res.isSuccess)
        throw new Error(
          res.message || 'Không thể tải danh sách quy trình sinh sản'
        );
      return res.result;
    },
    enabled,
    getNextPageParam: (lastPage) => {
      const current = Number(lastPage.pageIndex ?? 1);
      const totalPages = Number(lastPage.totalPages ?? 0);
      if (totalPages && current < totalPages) return current + 1;
      if (lastPage.hasNextPage) return current + 1;
      return undefined;
    },
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

/*
 * Hook to get Breeding Process by ID
 */
export function useGetBreedingProcessById(id: number, enabled = true) {
  return useQuery({
    queryKey: breedingProcessKeys.detail(id),
    queryFn: async (): Promise<BreedingProcess> => {
      const res = await breedingProcessServices.getBreedingProcessById(id);
      if (!res.isSuccess)
        throw new Error(res.message || 'Không thể tải quy trình sinh sản');
      return res.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Breeding Process detail full information by ID
 */
export function useGetBreedingProcessDetailById(id: number, enabled = true) {
  return useQuery({
    queryKey: breedingProcessKeys.detail(id),
    queryFn: async (): Promise<BreedingProcessDetail> => {
      const res =
        await breedingProcessServices.getBreedingProcessDetailById(id);
      if (!res.isSuccess)
        throw new Error(res.message || 'Không thể tải quy trình sinh sản');
      return res.result;
    },
    enabled: enabled && !!id,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

/*
 * Hook to create a new Breeding Process
 */
export function useCreateBreedingProcess() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BreedingProcessRequest) => {
      const res = await breedingProcessServices.createBreedingProcess(payload);
      if (!res.isSuccess)
        throw new Error(res.message || 'Không thể tạo quy trình');
      return res.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: breedingProcessKeys.lists() });
      qc.invalidateQueries({ queryKey: breedingProcessKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo quy trình thành công',
        position: 'top',
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Tạo quy trình thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to check inbreeding level between two Koi Fish
 */
export function useCheckInbreedingLevel() {
  return useMutation({
    mutationFn: async ({
      maleId,
      femaleId,
    }: {
      maleId: number;
      femaleId: number;
    }): Promise<InbreedingLevel> => {
      const res = await breedingProcessServices.checkInbreedingLevel(
        maleId,
        femaleId
      );
      if (!res.isSuccess)
        throw new Error(res.message || 'Không thể kiểm tra mức độ đồng huyết');
      return res.result;
    },
  });
}

/*
 * Hook to update processing status to Spawned
 */
export function useMarkBreedingProcessAsSpawned() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await breedingProcessServices.markAsSpawned(id);
      if (!res.isSuccess)
        throw new Error(
          res.message || 'Không thể chuyển trạng thái sang Đã đẻ'
        );
      return res.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: breedingProcessKeys.lists() });
      qc.invalidateQueries({ queryKey: breedingProcessKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Chuyển trạng thái sang Đã đẻ thành công',
        position: 'top',
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Chuyển trạng thái sang Đã đẻ thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to update processing status to Cancelled
 */
export function useMarkBreedingProcessAsCancelled() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await breedingProcessServices.markAsCancelled(id);
      if (!res.isSuccess)
        throw new Error(res.message || 'Không thể hủy quy trình sinh sản');
      return res.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: breedingProcessKeys.lists() });
      qc.invalidateQueries({ queryKey: breedingProcessKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Hủy quy trình sinh sản thành công',
        position: 'top',
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Hủy quy trình sinh sản thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to get all Koi Fish by Breeding Process ID
 */
export function useGetKoiFishByBreedingProcessId(
  breedingProcessId: number,
  enabled = true
) {
  return useQuery({
    queryKey: ['breedingProcess', breedingProcessId, 'koiFishes'],
    queryFn: async () => {
      const res =
        await breedingProcessServices.getKoiFishByBreedingProcessId(
          breedingProcessId
        );
      if (!res.isSuccess)
        throw new Error(res.message || 'Không thể tải danh sách cá Koi');
      return res.result;
    },
    enabled: enabled && !!breedingProcessId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Prefetch Breeding Process by ID
 */
export function usePrefetchBreedingProcessById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: breedingProcessKeys.detail(id),
      queryFn: async (): Promise<BreedingProcess> => {
        const resp = await breedingProcessServices.getBreedingProcessById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Prefetch Breeding Processes with pagination
 */
export function usePrefetchBreedingProcesses(
  filters?: BreedingProcessSearchParams
) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: breedingProcessKeys.list(filters || {}),
      queryFn: async (): Promise<BreedingProcessPagination> => {
        const resp = await breedingProcessServices.getAllBreedingProcesses(
          filters || {}
        );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
