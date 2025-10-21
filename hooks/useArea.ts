import { Area, AreaRequest, areaServices } from '@/lib/api/services/fetchArea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const areaKeys = {
  all: ['areas'] as const,
  lists: () => [...areaKeys.all, 'list'] as const,
  list: () => [...areaKeys.lists(), 'all'] as const,
  details: () => [...areaKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...areaKeys.details(), id] as const,
};

/**
 * Hook to fetch all areas
 */
export function useGetAreas(enabled = true) {
  return useQuery({
    queryKey: areaKeys.lists(),
    queryFn: async (): Promise<Area[]> => {
      const resp = await areaServices.getAllAreas();
      if (!resp.isSuccess) {
        throw new Error(resp.message || 'Không thể tải danh sách khu vực');
      }
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single area by id
 */
export function useGetAreaById(id: number, enabled = true) {
  return useQuery({
    queryKey: areaKeys.detail(id),
    queryFn: async (): Promise<Area> => {
      const resp = await areaServices.getAreaById(id);
      if (!resp.isSuccess) {
        throw new Error(resp.message || 'Không thể tải thông tin khu vực');
      }
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to create a new area
 */
export function useCreateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (area: AreaRequest) => {
      const resp = await areaServices.createArea(area);
      if (!resp.isSuccess) {
        throw new Error(resp.message || 'Không thể tạo khu vực');
      }
      return resp;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Tạo khu vực thành công',
        position: 'top',
      });
      queryClient.invalidateQueries({ queryKey: areaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: areaKeys.all });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: error.message || 'Tạo khu vực thất bại',
        position: 'top',
      });
    },
  });
}

/**
 * Hook to update an area
 */
export function useUpdateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AreaRequest }) => {
      const resp = await areaServices.updateArea(id, data);
      if (!resp.isSuccess) {
        throw new Error(resp.message || 'Không thể cập nhật khu vực');
      }
      return resp;
    },
    onSuccess: (_, variables) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật khu vực thành công',
        position: 'top',
      });
      queryClient.invalidateQueries({ queryKey: areaKeys.details() });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: areaKeys.detail(variables.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: areaKeys.lists() });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: error.message || 'Cập nhật khu vực thất bại',
        position: 'top',
      });
    },
  });
}

/**
 * Hook to delete an area
 */
export function useDeleteArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await areaServices.deleteArea(id);
      if (!resp.isSuccess) {
        throw new Error(resp.message || 'Không thể xóa khu vực');
      }
      return resp;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Xóa khu vực thành công',
        position: 'top',
      });
      queryClient.invalidateQueries({ queryKey: areaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: areaKeys.all });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: error.message || 'Xóa khu vực thất bại',
        position: 'top',
      });
    },
  });
}

/**
 * Prefetch helpers
 */
export function usePrefetchAreaById(id: number) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: areaKeys.detail(id),
      queryFn: async (): Promise<Area> => {
        const resp = await areaServices.getAreaById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function usePrefetchAreas() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: areaKeys.lists(),
      queryFn: async (): Promise<Area[]> => {
        const resp = await areaServices.getAllAreas();
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
