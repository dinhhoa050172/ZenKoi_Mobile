import {
  PondPacketFish,
  PondPacketFishPagination,
  PondPacketFishRequest,
  PondPacketFishSearchParams,
  PondPacketFishUpdateTransferRequest,
  pondPacketFishServices,
} from '@/lib/api/services/fetchPondPacketFish';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const pondPacketFishKeys = {
  all: ['pondPacketFishes'] as const,
  lists: () => [...pondPacketFishKeys.all, 'list'] as const,
  list: (params: PondPacketFishSearchParams) =>
    [...pondPacketFishKeys.lists(), params] as const,
  details: () => [...pondPacketFishKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...pondPacketFishKeys.details(), id] as const,
};

/*
 * Hook to get list of Pond Packet Fishes with pagination
 */
export function useGetPondPacketFishes(
  filters?: PondPacketFishSearchParams,
  enabled = true
) {
  return useQuery({
    queryKey: pondPacketFishKeys.list(filters || {}),
    queryFn: async (): Promise<PondPacketFishPagination> => {
      const resp = await pondPacketFishServices.getAllPondPacketFishes(
        filters || {}
      );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách lô cá trong ao'
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
 * Hook to get list of Pond Packet Fishes with infinite scroll
 */
export function useGetPondPacketFishesInfinite(
  filters?: Omit<PondPacketFishSearchParams, 'pageIndex'>,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [...pondPacketFishKeys.lists(), 'infinite', filters || {}],
    queryFn: async ({ pageParam = 1 }): Promise<PondPacketFishPagination> => {
      const resp = await pondPacketFishServices.getAllPondPacketFishes({
        ...filters,
        pageIndex: pageParam,
        pageSize: filters?.pageSize || 20,
      });
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách lô cá trong ao'
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
 * Hook to get Pond Packet Fish by ID
 */
export function useGetPondPacketFishById(id: number, enabled = true) {
  return useQuery({
    queryKey: pondPacketFishKeys.detail(id),
    queryFn: async (): Promise<PondPacketFish> => {
      const resp = await pondPacketFishServices.getPondPacketFishById(id);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải thông tin lô cá trong ao'
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
 * Hook to create a new Pond Packet Fish
 */
export function useCreatePondPacketFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PondPacketFishRequest) => {
      const resp = await pondPacketFishServices.createPondPacketFish(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo lô cá trong ao');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pondPacketFishKeys.lists() });
      qc.invalidateQueries({ queryKey: pondPacketFishKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo lô cá thành công',
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
 * Hook to update/transfer a Pond Packet Fish
 */
export function useUpdatePondPacketFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: PondPacketFishUpdateTransferRequest;
    }) => {
      const resp = await pondPacketFishServices.updatePondPacketFish(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể chuyển lô cá');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Chuyển lô cá thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: pondPacketFishKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({
          queryKey: pondPacketFishKeys.detail(vars.id),
        });
      qc.invalidateQueries({ queryKey: pondPacketFishKeys.lists() });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Chuyển lô cá thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to delete a Pond Packet Fish
 */
export function useDeletePondPacketFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await pondPacketFishServices.deletePondPacketFish(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa lô cá trong ao');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Xóa thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: pondPacketFishKeys.lists() });
      qc.invalidateQueries({ queryKey: pondPacketFishKeys.all });
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
 * Hook to prefetch Pond Packet Fish by ID
 */
export function usePrefetchPondPacketFishById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: pondPacketFishKeys.detail(id),
      queryFn: async (): Promise<PondPacketFish> => {
        const resp = await pondPacketFishServices.getPondPacketFishById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Pond Packet Fishes
 */
export function usePrefetchPondPacketFishes(
  filters?: PondPacketFishSearchParams
) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: pondPacketFishKeys.list(filters || {}),
      queryFn: async (): Promise<PondPacketFishPagination> => {
        const resp = await pondPacketFishServices.getAllPondPacketFishes(
          filters || {}
        );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
