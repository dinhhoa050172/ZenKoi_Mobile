import {
  BreedingProcess,
  BreedingProcessPagination,
  BreedingProcessRequest,
  breedingProcessServices,
  InbreedingLevel,
} from '@/lib/api/services/fetchBreedingProcess';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const breedingProcessKeys = {
  all: ['breedingProcesses'] as const,
  lists: () => [...breedingProcessKeys.all, 'list'] as const,
  list: (params: { pageIndex: number; pageSize: number }) =>
    [...breedingProcessKeys.lists(), params] as const,
  details: () => [...breedingProcessKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...breedingProcessKeys.details(), id] as const,
};

/*
 * Hook to get list of Breeding Processes with pagination
 */
export function useGetBreedingProcesses(
  pageIndex = 1,
  pageSize = 20,
  enabled = true
) {
  return useQuery({
    queryKey: breedingProcessKeys.list({ pageIndex, pageSize }),
    queryFn: async (): Promise<BreedingProcessPagination> => {
      const res = await breedingProcessServices.getAllBreedingProcesses(
        pageIndex,
        pageSize
      );
      if (!res.isSuccess)
        throw new Error(
          res.message || 'Không thể tải danh sách quy trình sinh sản'
        );
      return res.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
export function usePrefetchBreedingProcesses(pageIndex = 1, pageSize = 20) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: breedingProcessKeys.list({ pageIndex, pageSize }),
      queryFn: async (): Promise<BreedingProcessPagination> => {
        const resp = await breedingProcessServices.getAllBreedingProcesses(
          pageIndex,
          pageSize
        );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
