import {
  Incident,
  IncidentPagination,
  IncidentResolutionRequest,
  IncidentSearchParams,
  incidentServices,
  KoiIncident,
  PondIncident,
  RequestIncident,
} from '@/lib/api/services/fetchIncident';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: (params: IncidentSearchParams) =>
    [...incidentKeys.lists(), params] as const,
  details: () => [...incidentKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...incidentKeys.details(), id] as const,
};

/*
 * Hook to get list of Incidents with pagination
 */
export function useGetIncidents(
  enabled = true,
  filters?: IncidentSearchParams
) {
  return useQuery({
    queryKey: incidentKeys.list(filters || {}),
    queryFn: async (): Promise<IncidentPagination> => {
      const resp = await incidentServices.getAllIncidents(filters || {});
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách sự cố');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Incident by ID
 */
export function useGetIncidentById(id: number, enabled = true) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: async (): Promise<Incident> => {
      const resp = await incidentServices.getIncidentById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin sự cố');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Incident
 */
export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: RequestIncident) => {
      const resp = await incidentServices.createIncident(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo sự cố');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo sự cố thành công',
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
 * Hook to update an Incident
 */
export function useUpdateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RequestIncident }) => {
      const resp = await incidentServices.updateIncident(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật sự cố');
      return resp.result;
    },
    onSuccess: async (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });

      // Invalidate and refetch all incident queries
      await qc.invalidateQueries({ queryKey: incidentKeys.all });

      // Refetch specific detail if available
      if (vars?.id) {
        await qc.refetchQueries({ queryKey: incidentKeys.detail(vars.id) });
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
 * Hook to delete an Incident
 */
export function useDeleteIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await incidentServices.deleteIncident(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa sự cố');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.all });
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
 * Hook to prefetch Incident by ID
 */
export function usePrefetchIncidentById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: incidentKeys.detail(id),
      queryFn: async (): Promise<Incident> => {
        const resp = await incidentServices.getIncidentById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to create a new Incident with Koi
 */
export function useCreateIncidentWithKoi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      Id,
      koiIncident,
    }: {
      Id: number;
      koiIncident: Omit<KoiIncident, 'id'>;
    }) => {
      const resp = await incidentServices.createIncidentWithKoi(
        Id,
        koiIncident
      );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo sự cố cho cá');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo sự cố cho cá thành công',
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
 * Hook to create a new Incident with Pond
 */
export function useCreateIncidentWithPond() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      Id,
      pondIncident,
    }: {
      Id: number;
      pondIncident: Omit<PondIncident, 'id'>;
    }) => {
      const resp = await incidentServices.createIncidentWithPond(
        Id,
        pondIncident
      );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo sự cố cho ao');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo sự cố cho ao thành công',
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
 * Hook to update Incident status
 */
export function useUpdateIncidentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      IncidentResolutionRequest,
    }: {
      id: number;
      IncidentResolutionRequest: IncidentResolutionRequest;
    }) => {
      const resp = await incidentServices.updateIncidentStatus(
        id,
        IncidentResolutionRequest
      );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật trạng thái sự cố');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật trạng thái thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: incidentKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: incidentKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật trạng thái thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to delete KoiIncident from an Incident
 */
export function useDeleteKoiIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (koiIncidentId: number) => {
      const resp = await incidentServices.deleteKoiIncident(koiIncidentId);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa sự cố của cá');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Xóa sự cố của cá thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.all });
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
 * Hook to delete PondIncident from an Incident
 */
export function useDeletePondIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pondIncidentId: number) => {
      const resp = await incidentServices.deletePondIncident(pondIncidentId);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa sự cố của ao');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Xóa sự cố của ao thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.all });
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
