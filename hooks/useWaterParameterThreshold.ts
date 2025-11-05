import {
  WaterParameterThreshold,
  WaterParameterThresholdPagination,
  WaterParameterThresholdRequest,
  WaterParameterThresholdSearchParams,
  waterparameterThresholdServices,
} from '@/lib/api/services/fetchWaterParameterThreshold';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const waterParameterThresholdKeys = {
  all: ['waterParameterThresholds'] as const,
  lists: () => [...waterParameterThresholdKeys.all, 'list'] as const,
  list: (params: WaterParameterThresholdSearchParams) =>
    [...waterParameterThresholdKeys.lists(), params] as const,
  details: () => [...waterParameterThresholdKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...waterParameterThresholdKeys.details(), id] as const,
};

/*
 * Hook to get list of Water Parameter Thresholds with pagination
 */
export function useGetWaterParameterThresholds(
  filters?: WaterParameterThresholdSearchParams,
  enabled = true
) {
  return useQuery({
    queryKey: waterParameterThresholdKeys.list(filters || {}),
    queryFn: async (): Promise<WaterParameterThresholdPagination> => {
      const resp =
        await waterparameterThresholdServices.getAllWaterParameterThresholds(
          filters || {}
        );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách ngưỡng thông số nước'
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
 * Hook to get list of Water Parameter Thresholds with infinite scroll
 */
export function useGetWaterParameterThresholdsInfinite(
  filters?: Omit<WaterParameterThresholdSearchParams, 'pageIndex'>,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [
      ...waterParameterThresholdKeys.lists(),
      'infinite',
      filters || {},
    ],
    queryFn: async ({
      pageParam = 1,
    }): Promise<WaterParameterThresholdPagination> => {
      const resp =
        await waterparameterThresholdServices.getAllWaterParameterThresholds({
          ...filters,
          pageIndex: pageParam,
          pageSize: filters?.pageSize || 20,
        });
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách ngưỡng thông số nước'
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
 * Hook to get Water Parameter Threshold by ID
 */
export function useGetWaterParameterThresholdById(id: number, enabled = true) {
  return useQuery({
    queryKey: waterParameterThresholdKeys.detail(id),
    queryFn: async (): Promise<WaterParameterThreshold> => {
      const resp =
        await waterparameterThresholdServices.getWaterParameterThreshold(id);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải thông tin ngưỡng thông số nước'
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
 * Hook to create a new Water Parameter Threshold
 */
export function useCreateWaterParameterThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: WaterParameterThresholdRequest) => {
      const resp =
        await waterparameterThresholdServices.createWaterParameterThreshold(
          data
        );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo ngưỡng thông số nước');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waterParameterThresholdKeys.lists() });
      qc.invalidateQueries({ queryKey: waterParameterThresholdKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo ngưỡng thành công',
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
 * Hook to update a Water Parameter Threshold
 */
export function useUpdateWaterParameterThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: WaterParameterThresholdRequest;
    }) => {
      const resp =
        await waterparameterThresholdServices.updateWaterParameterThreshold(
          id,
          data
        );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể cập nhật ngưỡng thông số nước'
        );
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({
        queryKey: waterParameterThresholdKeys.details(),
      });
      if (vars?.id)
        qc.invalidateQueries({
          queryKey: waterParameterThresholdKeys.detail(vars.id),
        });
      qc.invalidateQueries({ queryKey: waterParameterThresholdKeys.lists() });
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
 * Hook to delete a Water Parameter Threshold
 */
export function useDeleteWaterParameterThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp =
        await waterparameterThresholdServices.deleteWaterParameterThreshold(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa ngưỡng thông số nước');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Xóa thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: waterParameterThresholdKeys.lists() });
      qc.invalidateQueries({ queryKey: waterParameterThresholdKeys.all });
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
 * Hook to prefetch Water Parameter Threshold by ID
 */
export function usePrefetchWaterParameterThresholdById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: waterParameterThresholdKeys.detail(id),
      queryFn: async (): Promise<WaterParameterThreshold> => {
        const resp =
          await waterparameterThresholdServices.getWaterParameterThreshold(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Water Parameter Thresholds
 */
export function usePrefetchWaterParameterThresholds(
  filters?: WaterParameterThresholdSearchParams
) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: waterParameterThresholdKeys.list(filters || {}),
      queryFn: async (): Promise<WaterParameterThresholdPagination> => {
        const resp =
          await waterparameterThresholdServices.getAllWaterParameterThresholds(
            filters || {}
          );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
