import {
  ClassificationRecord,
  ClassificationRecordPagination,
  ClassificationRecordSearchParams,
  ClassificationRecordSummary,
  ClassificationRecordV1Request,
  ClassificationRecordV2Request,
  ClassificationRecordV3Request,
  UpdateClassificationRecordRequest,
  classificationRecordServices,
} from '@/lib/api/services/fetchClassificationRecord';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const classificationRecordKeys = {
  all: ['classificationRecords'] as const,
  lists: () => [...classificationRecordKeys.all, 'list'] as const,
  list: (params: ClassificationRecordSearchParams) =>
    [...classificationRecordKeys.lists(), params] as const,
  details: () => [...classificationRecordKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...classificationRecordKeys.details(), id] as const,
  summaries: () => [...classificationRecordKeys.all, 'summary'] as const,
  summary: (classificationStageId: number) =>
    [...classificationRecordKeys.summaries(), classificationStageId] as const,
};

/*
 * Hook to get list of Classification Records with pagination
 */
export function useGetClassificationRecords(
  filters?: ClassificationRecordSearchParams,
  enabled = true
) {
  return useQuery({
    queryKey: classificationRecordKeys.list(filters || {}),
    queryFn: async (): Promise<ClassificationRecordPagination> => {
      const resp =
        await classificationRecordServices.getAllClassificationRecords(filters);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách bản ghi phân loại'
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
 * Hook to get Classification Record by ID
 */
export function useGetClassificationRecordById(id: number, enabled = true) {
  return useQuery({
    queryKey: classificationRecordKeys.detail(id),
    queryFn: async (): Promise<ClassificationRecord> => {
      const resp =
        await classificationRecordServices.getClassificationRecordById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải bản ghi phân loại');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Classification Record Summary by Classification Stage ID
 */
export function useGetClassificationRecordSummary(
  classificationStageId: number,
  enabled = true
) {
  return useQuery({
    queryKey: classificationRecordKeys.summary(classificationStageId),
    queryFn: async (): Promise<ClassificationRecordSummary> => {
      const resp =
        await classificationRecordServices.getClassificationRecordSummary(
          classificationStageId
        );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải thống kê bản ghi phân loại'
        );
      return resp.result;
    },
    enabled: enabled && !!classificationStageId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Classification Record - V1 (Cull stage)
 */
export function useCreateClassificationRecordV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClassificationRecordV1Request) => {
      const resp =
        await classificationRecordServices.createClassificationRecordV1(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo bản ghi phân loại');
      return resp.result;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: classificationRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: classificationRecordKeys.all });
      // Invalidate summary for this classification stage
      qc.invalidateQueries({
        queryKey: classificationRecordKeys.summary(
          variables.classificationStageId
        ),
      });
      Toast.show({
        type: 'success',
        text1: 'Tạo bản ghi phân loại thành công',
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
 * Hook to create a new Classification Record - V2 (High stage)
 */
export function useCreateClassificationRecordV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClassificationRecordV2Request) => {
      const resp =
        await classificationRecordServices.createClassificationRecordV2(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo bản ghi phân loại');
      return resp.result;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: classificationRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: classificationRecordKeys.all });
      // Invalidate summary for this classification stage
      qc.invalidateQueries({
        queryKey: classificationRecordKeys.summary(
          variables.classificationStageId
        ),
      });
      Toast.show({
        type: 'success',
        text1: 'Tạo bản ghi phân loại thành công',
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
 * Hook to create a new Classification Record - V3 (Show stage)
 */
export function useCreateClassificationRecordV3() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClassificationRecordV3Request) => {
      const resp =
        await classificationRecordServices.createClassificationRecordV3(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo bản ghi phân loại');
      return resp.result;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: classificationRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: classificationRecordKeys.all });
      // Invalidate summary for this classification stage
      qc.invalidateQueries({
        queryKey: classificationRecordKeys.summary(
          variables.classificationStageId
        ),
      });
      Toast.show({
        type: 'success',
        text1: 'Tạo bản ghi phân loại thành công',
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
 * Hook to update a Classification Record
 */
export function useUpdateClassificationRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateClassificationRecordRequest;
    }) => {
      const resp =
        await classificationRecordServices.updateClassificationRecord(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật bản ghi phân loại');
      return resp.result;
    },
    onSuccess: (result, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: classificationRecordKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({
          queryKey: classificationRecordKeys.detail(vars.id),
        });
      qc.invalidateQueries({ queryKey: classificationRecordKeys.lists() });
      // Invalidate summary for this classification stage
      if (result?.classificationStageId) {
        qc.invalidateQueries({
          queryKey: classificationRecordKeys.summary(
            result.classificationStageId
          ),
        });
      }
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
 * Hook to delete a Classification Record
 */
export function useDeleteClassificationRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp =
        await classificationRecordServices.deleteClassificationRecord(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa bản ghi phân loại');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: classificationRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: classificationRecordKeys.all });
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
 * Hook to prefetch Classification Record by ID
 */
export function usePrefetchClassificationRecordById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: classificationRecordKeys.detail(id),
      queryFn: async (): Promise<ClassificationRecord> => {
        const resp =
          await classificationRecordServices.getClassificationRecordById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Classification Records with pagination
 */
export function usePrefetchClassificationRecords(
  filters?: ClassificationRecordSearchParams
) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: classificationRecordKeys.list(filters || {}),
      queryFn: async (): Promise<ClassificationRecordPagination> => {
        const resp =
          await classificationRecordServices.getAllClassificationRecords(
            filters
          );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
