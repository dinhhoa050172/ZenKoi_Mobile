import { FishSize } from '@/lib/api/services/fetchKoiFish';
import {
  PacketFish,
  PacketFishPagination,
  PacketFishRequest,
  PacketFishSearchParams,
  packetFishServices,
} from '@/lib/api/services/fetchPacketFish';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const packetFishKeys = {
  all: ['packetFishes'] as const,
  lists: () => [...packetFishKeys.all, 'list'] as const,
  list: (params: PacketFishSearchParams) =>
    [...packetFishKeys.lists(), params] as const,
  details: () => [...packetFishKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...packetFishKeys.details(), id] as const,
  available: () => [...packetFishKeys.all, 'available'] as const,
  bySize: (size: FishSize) => [...packetFishKeys.all, 'bySize', size] as const,
  byPriceRange: (minPrice: number, maxPrice: number) =>
    [...packetFishKeys.all, 'byPriceRange', minPrice, maxPrice] as const,
};

/*
 * Hook to get list of Packet Fishes with pagination
 */
export function useGetPacketFishes(
  filters?: PacketFishSearchParams,
  enabled = true
) {
  return useQuery({
    queryKey: packetFishKeys.list(filters || {}),
    queryFn: async (): Promise<PacketFishPagination> => {
      const resp = await packetFishServices.getPacketFishes(filters || {});
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách lô cá');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get list of Packet Fishes with infinite scroll
 */
export function useGetPacketFishesInfinite(
  filters?: Omit<PacketFishSearchParams, 'pageIndex'>,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [...packetFishKeys.lists(), 'infinite', filters || {}],
    queryFn: async ({ pageParam = 1 }): Promise<PacketFishPagination> => {
      const resp = await packetFishServices.getPacketFishes({
        ...filters,
        pageIndex: pageParam,
        pageSize: filters?.pageSize || 20,
      });
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách lô cá');
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
 * Hook to get Packet Fish by ID
 */
export function useGetPacketFishById(id: number, enabled = true) {
  return useQuery({
    queryKey: packetFishKeys.detail(id),
    queryFn: async (): Promise<PacketFish> => {
      const resp = await packetFishServices.getPacketFishById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin lô cá');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get available Packet Fishes (isAvailable = true)
 */
export function useGetPacketFishesAvailable(enabled = true) {
  return useQuery({
    queryKey: packetFishKeys.available(),
    queryFn: async (): Promise<PacketFishPagination> => {
      const resp = await packetFishServices.getPacketFishesAvailable();
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách lô cá khả dụng'
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
 * Hook to get Packet Fishes by size
 */
export function useGetPacketFishesBySize(size: FishSize, enabled = true) {
  return useQuery({
    queryKey: packetFishKeys.bySize(size),
    queryFn: async (): Promise<PacketFishPagination> => {
      const resp = await packetFishServices.getPacketFishesBySize(size);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách lô cá theo kích thước'
        );
      return resp.result;
    },
    enabled: enabled && !!size,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Packet Fishes by price range
 */
export function useGetPacketFishesByPriceRange(
  minPrice: number,
  maxPrice: number,
  enabled = true
) {
  return useQuery({
    queryKey: packetFishKeys.byPriceRange(minPrice, maxPrice),
    queryFn: async (): Promise<PacketFishPagination> => {
      const resp = await packetFishServices.getPacketFishesByPriceRange(
        minPrice,
        maxPrice
      );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách lô cá theo khoảng giá'
        );
      return resp.result;
    },
    enabled: enabled && minPrice !== undefined && maxPrice !== undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Packet Fish
 */
export function useCreatePacketFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PacketFishRequest) => {
      const resp = await packetFishServices.createPacketFish(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo lô cá');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: packetFishKeys.lists() });
      qc.invalidateQueries({ queryKey: packetFishKeys.all });
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
 * Hook to update a Packet Fish
 */
export function useUpdatePacketFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: PacketFishRequest;
    }) => {
      const resp = await packetFishServices.updatePacketFish(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật lô cá');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: packetFishKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: packetFishKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: packetFishKeys.lists() });
      qc.invalidateQueries({ queryKey: packetFishKeys.available() });
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
 * Hook to delete a Packet Fish
 */
export function useDeletePacketFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await packetFishServices.deletePacketFish(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa lô cá');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Xóa thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: packetFishKeys.lists() });
      qc.invalidateQueries({ queryKey: packetFishKeys.all });
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
 * Hook to prefetch Packet Fish by ID
 */
export function usePrefetchPacketFishById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: packetFishKeys.detail(id),
      queryFn: async (): Promise<PacketFish> => {
        const resp = await packetFishServices.getPacketFishById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Packet Fishes
 */
export function usePrefetchPacketFishes(filters?: PacketFishSearchParams) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: packetFishKeys.list(filters || {}),
      queryFn: async (): Promise<PacketFishPagination> => {
        const resp = await packetFishServices.getPacketFishes(filters || {});
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
