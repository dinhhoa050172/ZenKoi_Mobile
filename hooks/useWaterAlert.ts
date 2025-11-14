import {
  WaterAlert,
  WaterAlertPagination,
  WaterAlertPaginationResponse,
  WaterAlertResponse,
  WaterAlertSearchParams,
  waterAlertServices,
} from '@/lib/api/services/fetchWaterAlert';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { pondKeys } from './usePond';

// Query keys
export const waterAlertKeys = {
  all: ['waterAlerts'] as const,
  lists: () => [...waterAlertKeys.all, 'list'] as const,
  list: (params?: WaterAlertSearchParams) =>
    [...waterAlertKeys.lists(), params ?? {}] as const,
  details: () => [...waterAlertKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...waterAlertKeys.details(), id] as const,
};

/**
 * Get list of water alerts with optional filters
 */
export function useGetWaterAlerts(
  filters?: WaterAlertSearchParams,
  enabled = true
) {
  return useQuery({
    queryKey: waterAlertKeys.list(filters || {}),
    queryFn: async (): Promise<WaterAlertPagination> => {
      const resp: WaterAlertPaginationResponse =
        await waterAlertServices.getAllWaterAlerts(filters);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải cảnh báo');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Get water alert detail by id
 */
export function useGetWaterAlertById(id: number, enabled = true) {
  return useQuery({
    queryKey: waterAlertKeys.detail(id),
    queryFn: async (): Promise<WaterAlert> => {
      const resp: WaterAlertResponse =
        await waterAlertServices.getWaterAlertById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải chi tiết cảnh báo');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Resolve a water alert (mark as resolved)
 */
export function useResolveWaterAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await waterAlertServices.resolveWaterAlert(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xác nhận cảnh báo');
      return resp.result;
    },
    onSuccess: (_data, id) => {
      Toast.show({
        type: 'success',
        text1: 'Đã đánh dấu cảnh báo là đã xử lý',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: waterAlertKeys.lists() });
      qc.invalidateQueries({ queryKey: waterAlertKeys.detail(id) });
      qc.invalidateQueries({ queryKey: pondKeys.all });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Xử lý thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/**
 * Delete a water alert
 */
export function useDeleteWaterAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await waterAlertServices.deleteWaterAlert(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa cảnh báo');
      return resp.result;
    },
    onSuccess: (_data, id) => {
      Toast.show({
        type: 'success',
        text1: 'Xóa cảnh báo thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: waterAlertKeys.lists() });
      qc.invalidateQueries({ queryKey: waterAlertKeys.detail(id) });
      qc.invalidateQueries({ queryKey: pondKeys.all });
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

/**
 * Prefetch helpers
 */
export function usePrefetchWaterAlertById(id: number) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: waterAlertKeys.detail(id),
      queryFn: async (): Promise<WaterAlert> => {
        const resp = await waterAlertServices.getWaterAlertById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}

export function usePrefetchWaterAlerts(filters?: WaterAlertSearchParams) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: waterAlertKeys.list(filters || {}),
      queryFn: async (): Promise<WaterAlertPagination> => {
        const resp = await waterAlertServices.getAllWaterAlerts(filters);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}

export default waterAlertServices;
