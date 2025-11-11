import {
  IncidentType,
  IncidentTypePagination,
  IncidentTypeSearchParams,
  incidentTypeServices,
} from '@/lib/api/services/fetchIncidentType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const incidentTypeKeys = {
  all: ['incidentTypes'] as const,
  lists: () => [...incidentTypeKeys.all, 'list'] as const,
  list: (params: IncidentTypeSearchParams) =>
    [...incidentTypeKeys.lists(), params] as const,
  details: () => [...incidentTypeKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...incidentTypeKeys.details(), id] as const,
};

/*
 * Hook to get list of Incident Types with pagination
 */
export function useGetIncidentTypes(
  enabled = true,
  filters?: IncidentTypeSearchParams
) {
  return useQuery({
    queryKey: incidentTypeKeys.list(filters || {}),
    queryFn: async (): Promise<IncidentTypePagination> => {
      const resp = await incidentTypeServices.getAllIncidentTypes(
        filters || {}
      );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách loại sự cố');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Incident Type by ID
 */
export function useGetIncidentTypeById(id: number, enabled = true) {
  return useQuery({
    queryKey: incidentTypeKeys.detail(id),
    queryFn: async (): Promise<IncidentType> => {
      const resp = await incidentTypeServices.getIncidentTypeById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin loại sự cố');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Incident Type
 */
export function useCreateIncidentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<IncidentType, 'id'>) => {
      const resp = await incidentTypeServices.createIncidentType(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo loại sự cố');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incidentTypeKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentTypeKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo loại sự cố thành công',
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
 * Hook to update an Incident Type
 */
export function useUpdateIncidentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Omit<IncidentType, 'id'>;
    }) => {
      const resp = await incidentTypeServices.updateIncidentType(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật loại sự cố');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: incidentTypeKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: incidentTypeKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: incidentTypeKeys.lists() });
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
 * Hook to delete an Incident Type
 */
export function useDeleteIncidentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await incidentTypeServices.deleteIncidentType(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa loại sự cố');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: incidentTypeKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentTypeKeys.all });
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
 * Hook to prefetch Incident Type by ID
 */
export function usePrefetchIncidentTypeById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: incidentTypeKeys.detail(id),
      queryFn: async (): Promise<IncidentType> => {
        const resp = await incidentTypeServices.getIncidentTypeById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Incident Types
 */
export function usePrefetchIncidentTypes(filters?: IncidentTypeSearchParams) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: incidentTypeKeys.list(filters || {}),
      queryFn: async (): Promise<IncidentTypePagination> => {
        const resp = await incidentTypeServices.getAllIncidentTypes(
          filters || {}
        );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
