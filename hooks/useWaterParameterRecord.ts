import {
  WaterParameterRecord,
  WaterParameterRecordPagination,
  WaterParameterRecordRequest,
  WaterParameterRecordSearchParams,
  waterParameterRecordServices,
} from '@/lib/api/services/fetchWaterParameterRecord';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const waterParameterRecordKeys = {
  all: ['waterParameterRecords'] as const,
  lists: () => [...waterParameterRecordKeys.all, 'list'] as const,
  list: (params: WaterParameterRecordSearchParams) =>
    [...waterParameterRecordKeys.lists(), params] as const,
  details: () => [...waterParameterRecordKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...waterParameterRecordKeys.details(), id] as const,
};

/*
 * Hook to get list of Water Parameter Records with pagination
 */
export function useGetWaterParameterRecords(
  filters?: WaterParameterRecordSearchParams,
  enabled = true
) {
  return useQuery({
    queryKey: waterParameterRecordKeys.list(filters || {}),
    queryFn: async (): Promise<WaterParameterRecordPagination> => {
      const resp =
        await waterParameterRecordServices.getAllWaterParameterRecords(filters);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách bản ghi thông số nước'
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
 * Hook to get list of Water Parameter Records with infinite scroll
 */
export function useGetWaterParameterRecordsInfinite(
  filters?: Omit<WaterParameterRecordSearchParams, 'pageIndex'>,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [...waterParameterRecordKeys.lists(), 'infinite', filters || {}],
    queryFn: async ({
      pageParam = 1,
    }): Promise<WaterParameterRecordPagination> => {
      const resp =
        await waterParameterRecordServices.getAllWaterParameterRecords({
          ...filters,
          pageIndex: pageParam,
          pageSize: filters?.pageSize || 20,
        });
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách bản ghi thông số nước'
        );
      return resp.result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = lastPage.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/*
 * Hook to get Water Parameter Record by ID
 */
export function useGetWaterParameterRecordById(id: number, enabled = true) {
  return useQuery({
    queryKey: waterParameterRecordKeys.detail(id),
    queryFn: async (): Promise<WaterParameterRecord> => {
      const resp =
        await waterParameterRecordServices.getWaterParameterRecordById(id);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải thông tin bản ghi thông số nước'
        );
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Water Parameter Record
 */
export function useCreateWaterParameterRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: WaterParameterRecordRequest) => {
      const resp =
        await waterParameterRecordServices.createWaterParameterRecord(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo bản ghi thông số nước');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waterParameterRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: waterParameterRecordKeys.all });
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
 * Hook to update a Water Parameter Record
 */
export function useUpdateWaterParameterRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: WaterParameterRecordRequest;
    }) => {
      const resp =
        await waterParameterRecordServices.updateWaterParameterRecord(id, data);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể cập nhật bản ghi thông số nước'
        );
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: waterParameterRecordKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({
          queryKey: waterParameterRecordKeys.detail(vars.id),
        });
      qc.invalidateQueries({ queryKey: waterParameterRecordKeys.lists() });
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
 * Hook to delete a Water Parameter Record
 */
export function useDeleteWaterParameterRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp =
        await waterParameterRecordServices.deleteWaterParameterRecord(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa bản ghi thông số nước');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Xóa thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: waterParameterRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: waterParameterRecordKeys.all });
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
 * Hook to prefetch Water Parameter Record by ID
 */
export function usePrefetchWaterParameterRecordById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: waterParameterRecordKeys.detail(id),
      queryFn: async (): Promise<WaterParameterRecord> => {
        const resp =
          await waterParameterRecordServices.getWaterParameterRecordById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Water Parameter Records
 */
export function usePrefetchWaterParameterRecords(
  filters?: WaterParameterRecordSearchParams
) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: waterParameterRecordKeys.list(filters || {}),
      queryFn: async (): Promise<WaterParameterRecordPagination> => {
        const resp =
          await waterParameterRecordServices.getAllWaterParameterRecords(
            filters
          );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
