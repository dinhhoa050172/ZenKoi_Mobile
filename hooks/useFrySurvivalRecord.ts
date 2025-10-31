import {
  FrySurvivalRecord,
  FrySurvivalRecordPagination,
  FrySurvivalRecordRequest,
  FrySurvivalRecordSearchParams,
  frySurvivalRecordServices,
} from '@/lib/api/services/fetchFrySurvivalRecord';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const frySurvivalRecordKeys = {
  all: ['frySurvivalRecords'] as const,
  lists: () => [...frySurvivalRecordKeys.all, 'list'] as const,
  list: (params: FrySurvivalRecordSearchParams) =>
    [...frySurvivalRecordKeys.lists(), params] as const,
  details: () => [...frySurvivalRecordKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...frySurvivalRecordKeys.details(), id] as const,
};

/*
 * Hook to get list of Fry Survival Records with pagination
 */
export function useGetFrySurvivalRecords(
  filters?: FrySurvivalRecordSearchParams,
  enabled = true
) {
  return useQuery({
    queryKey: frySurvivalRecordKeys.list(filters || {}),
    queryFn: async (): Promise<FrySurvivalRecordPagination> => {
      const resp = await frySurvivalRecordServices.getAllFrySurvivalRecords(
        filters || {}
      );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách bản ghi sống sót'
        );
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Fry Survival Record by ID
 */
export function useGetFrySurvivalRecordById(id: number, enabled = true) {
  return useQuery({
    queryKey: frySurvivalRecordKeys.detail(id),
    queryFn: async (): Promise<FrySurvivalRecord> => {
      const resp = await frySurvivalRecordServices.getFrySurvivalRecordById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải bản ghi sống sót');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Fry Survival Record
 */
export function useCreateFrySurvivalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: FrySurvivalRecordRequest) => {
      const resp =
        await frySurvivalRecordServices.createFrySurvivalRecord(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo bản ghi');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: frySurvivalRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: frySurvivalRecordKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo bản ghi thành công',
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
 * Hook to update a Fry Survival Record
 */
export function useUpdateFrySurvivalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: FrySurvivalRecordRequest;
    }) => {
      const resp = await frySurvivalRecordServices.updateFrySurvivalRecord(
        id,
        data
      );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật bản ghi');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: frySurvivalRecordKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({
          queryKey: frySurvivalRecordKeys.detail(vars.id),
        });
      qc.invalidateQueries({ queryKey: frySurvivalRecordKeys.lists() });
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
 * Hook to delete a Fry Survival Record
 */
export function useDeleteFrySurvivalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await frySurvivalRecordServices.deleteFrySurvivalRecord(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa bản ghi');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: frySurvivalRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: frySurvivalRecordKeys.all });
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
 * Hook to prefetch Fry Survival Record by ID
 */
export function usePrefetchFrySurvivalRecordById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: frySurvivalRecordKeys.detail(id),
      queryFn: async (): Promise<FrySurvivalRecord> => {
        const resp =
          await frySurvivalRecordServices.getFrySurvivalRecordById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Fry Survival Records with pagination
 */
export function usePrefetchFrySurvivalRecords(
  filters?: FrySurvivalRecordSearchParams
) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: frySurvivalRecordKeys.list(filters || {}),
      queryFn: async (): Promise<FrySurvivalRecordPagination> => {
        const resp = await frySurvivalRecordServices.getAllFrySurvivalRecords(
          filters || {}
        );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
