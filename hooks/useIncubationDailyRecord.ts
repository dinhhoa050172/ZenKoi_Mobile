import {
  IncubationDailyRecord,
  IncubationDailyRecordPagination,
  IncubationDailyRecordRequest,
  IncubationDailyRecordRequestV2,
  incubationDailyRecordServices,
  IncubationDailyRecordSummary,
  UpdateIncubationDailyRecordRequest,
  UpdateIncubationDailyRecordRequestV2,
} from '@/lib/api/services/fetchIncubationDailyRecord';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const incubationDailyRecordKeys = {
  all: ['incubationDailyRecords'] as const,
  lists: () => [...incubationDailyRecordKeys.all, 'list'] as const,
  list: (params: {
    pageIndex: number;
    pageSize: number;
    eggBatchId?: number;
  }) => [...incubationDailyRecordKeys.lists(), params] as const,
  details: () => [...incubationDailyRecordKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...incubationDailyRecordKeys.details(), id] as const,
};

/*
 * Hook to get list of Incubation Daily Records with pagination
 */
export function useGetIncubationDailyRecords(
  pageIndex = 1,
  pageSize = 20,
  eggBatchId?: number,
  enabled = true
) {
  return useQuery({
    queryKey: incubationDailyRecordKeys.list({
      pageIndex,
      pageSize,
      eggBatchId,
    }),
    queryFn: async (): Promise<IncubationDailyRecordPagination> => {
      if (!eggBatchId) throw new Error('Thông tin không hợp lệ');
      const resp =
        await incubationDailyRecordServices.getAllIncubationDailyRecords(
          pageIndex,
          pageSize,
          eggBatchId
        );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách bản ghi ương');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Incubation Daily Record by ID
 */
export function useGetIncubationDailyRecordById(id: number, enabled = true) {
  return useQuery({
    queryKey: incubationDailyRecordKeys.detail(id),
    queryFn: async (): Promise<IncubationDailyRecord> => {
      const resp =
        await incubationDailyRecordServices.getIncubationDailyRecordById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải bản ghi ương');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Get incubation daily record summary by egg batch ID
 */
export function useGetIncubationDailyRecordSummaryByEggBatchId(
  eggBatchId: number,
  enabled = true
) {
  return useQuery({
    queryKey: ['incubationDailyRecordSummary', eggBatchId],
    queryFn: async (): Promise<IncubationDailyRecordSummary> => {
      const resp =
        await incubationDailyRecordServices.getIncubationDailyRecordSummaryByEggBatchId(
          eggBatchId
        );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải tóm tắt bản ghi ương');
      return resp.result;
    },
    enabled: enabled && !!eggBatchId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Incubation Daily Record
 */
export function useCreateIncubationDailyRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: IncubationDailyRecordRequest) => {
      const resp =
        await incubationDailyRecordServices.createIncubationDailyRecord(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo bản ghi');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.all });
      qc.invalidateQueries({ queryKey: ['incubationDailyRecordSummary'] });
      qc.invalidateQueries({ queryKey: ['breedingProcesses'] });
      qc.invalidateQueries({ queryKey: ['eggBatch'] });
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
 * Hook to create a new Incubation Daily Record V2
 */
export function useCreateIncubationDailyRecordV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: IncubationDailyRecordRequestV2) => {
      const resp =
        await incubationDailyRecordServices.createIncubationDailyRecordV2(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo bản ghi');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.all });
      qc.invalidateQueries({ queryKey: ['incubationDailyRecordSummary'] });
      qc.invalidateQueries({ queryKey: ['breedingProcesses'] });
      qc.invalidateQueries({ queryKey: ['eggBatch'] });
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
 * Hook to update an existing Incubation Daily Record
 */
export function useUpdateIncubationDailyRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateIncubationDailyRecordRequest;
    }) => {
      const resp =
        await incubationDailyRecordServices.updateIncubationDailyRecord(
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
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({
          queryKey: incubationDailyRecordKeys.detail(vars.id),
        });
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.lists() });
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
 * Hook to update an existing Incubation Daily Record V2
 */
export function useUpdateIncubationDailyRecordV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateIncubationDailyRecordRequestV2;
    }) => {
      const resp =
        await incubationDailyRecordServices.updateIncubationDailyRecordV2(
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
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({
          queryKey: incubationDailyRecordKeys.detail(vars.id),
        });
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.lists() });
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
 * Hook to delete an Incubation Daily Record
 */
export function useDeleteIncubationDailyRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp =
        await incubationDailyRecordServices.deleteIncubationDailyRecord(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa bản ghi');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: incubationDailyRecordKeys.all });
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
 * Hook to prefetch Incubation Daily Record by ID
 */
export function usePrefetchIncubationDailyRecordById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: incubationDailyRecordKeys.detail(id),
      queryFn: async (): Promise<IncubationDailyRecord> => {
        const resp =
          await incubationDailyRecordServices.getIncubationDailyRecordById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch Incubation Daily Records list
 */
export function usePrefetchIncubationDailyRecords(
  pageIndex = 1,
  pageSize = 20,
  eggBatchId: number
) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: incubationDailyRecordKeys.list({
        pageIndex,
        pageSize,
        eggBatchId,
      }),
      queryFn: async (): Promise<IncubationDailyRecordPagination> => {
        const resp =
          await incubationDailyRecordServices.getAllIncubationDailyRecords(
            pageIndex,
            pageSize,
            eggBatchId
          );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
