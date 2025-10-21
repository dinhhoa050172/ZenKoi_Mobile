import {
  ClassificationRecord,
  ClassificationRecordPagination,
  ClassificationRecordRequest,
  classificationRecordServices,
} from '@/lib/api/services/fetchClassificationRecord';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const classificationRecordKeys = {
  all: ['classificationRecords'] as const,
  lists: () => [...classificationRecordKeys.all, 'list'] as const,
  list: (params: { pageIndex: number; pageSize: number }) =>
    [...classificationRecordKeys.lists(), params] as const,
  details: () => [...classificationRecordKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...classificationRecordKeys.details(), id] as const,
};

/*
 * Hook to get list of Classification Records with pagination
 */
export function useGetClassificationRecords(
  pageIndex = 1,
  pageSize = 20,
  enabled = true
) {
  return useQuery({
    queryKey: classificationRecordKeys.list({ pageIndex, pageSize }),
    queryFn: async (): Promise<ClassificationRecordPagination> => {
      const resp =
        await classificationRecordServices.getAllClassificationRecords(
          pageIndex,
          pageSize
        );
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
 * Hook to create a new Classification Record
 */
export function useCreateClassificationRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClassificationRecordRequest) => {
      const resp =
        await classificationRecordServices.createClassificationRecord(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo bản ghi phân loại');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classificationRecordKeys.lists() });
      qc.invalidateQueries({ queryKey: classificationRecordKeys.all });
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
      data: ClassificationRecordRequest;
    }) => {
      const resp =
        await classificationRecordServices.updateClassificationRecord(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật bản ghi phân loại');
      return resp.result;
    },
    onSuccess: (_, vars) => {
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
export function usePrefetchClassificationRecords(pageIndex = 1, pageSize = 20) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: classificationRecordKeys.list({ pageIndex, pageSize }),
      queryFn: async (): Promise<ClassificationRecordPagination> => {
        const resp =
          await classificationRecordServices.getAllClassificationRecords(
            pageIndex,
            pageSize
          );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
