import {
  ClassificationStage,
  ClassificationStagePagination,
  ClassificationStageRequest,
  classificationStageServices,
} from '@/lib/api/services/fetchClassificationStage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const classificationStageKeys = {
  all: ['classificationStages'] as const,
  lists: () => [...classificationStageKeys.all, 'list'] as const,
  list: (params: { pageIndex: number; pageSize: number }) =>
    [...classificationStageKeys.lists(), params] as const,
  details: () => [...classificationStageKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...classificationStageKeys.details(), id] as const,
};

/*
 * Hook to get list of Classification Stages with pagination
 */
export function useGetClassificationStages(
  pageIndex = 1,
  pageSize = 20,
  enabled = true
) {
  return useQuery({
    queryKey: classificationStageKeys.list({ pageIndex, pageSize }),
    queryFn: async (): Promise<ClassificationStagePagination> => {
      const resp = await classificationStageServices.getAllClassificationStages(
        pageIndex,
        pageSize
      );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách giai đoạn phân loại'
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
 * Hook to get Classification Stage by ID
 */
export function useGetClassificationStageById(id: number, enabled = true) {
  return useQuery({
    queryKey: classificationStageKeys.detail(id),
    queryFn: async (): Promise<ClassificationStage> => {
      const resp =
        await classificationStageServices.getClassificationStageById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải giai đoạn phân loại');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Classification Stage
 */
export function useCreateClassificationStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClassificationStageRequest) => {
      const resp =
        await classificationStageServices.createClassificationStage(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo giai đoạn phân loại');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classificationStageKeys.lists() });
      qc.invalidateQueries({ queryKey: classificationStageKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo giai đoạn thành công',
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
 * Hook to update a Classification Stage
 */
export function useUpdateClassificationStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: ClassificationStageRequest;
    }) => {
      const resp = await classificationStageServices.updateClassificationStage(
        id,
        data
      );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể cập nhật giai đoạn phân loại'
        );
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: classificationStageKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({
          queryKey: classificationStageKeys.detail(vars.id),
        });
      qc.invalidateQueries({ queryKey: classificationStageKeys.lists() });
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
 * Hook to delete a Classification Stage
 */
export function useDeleteClassificationStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp =
        await classificationStageServices.deleteClassificationStage(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa giai đoạn phân loại');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: classificationStageKeys.lists() });
      qc.invalidateQueries({ queryKey: classificationStageKeys.all });
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
 * Hook to prefetch Classification Stage by ID
 */
export function usePrefetchClassificationStageById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: classificationStageKeys.detail(id),
      queryFn: async (): Promise<ClassificationStage> => {
        const resp =
          await classificationStageServices.getClassificationStageById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Classification Stages with pagination
 */
export function usePrefetchClassificationStages(pageIndex = 1, pageSize = 20) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: classificationStageKeys.list({ pageIndex, pageSize }),
      queryFn: async (): Promise<ClassificationStagePagination> => {
        const resp =
          await classificationStageServices.getAllClassificationStages(
            pageIndex,
            pageSize
          );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
