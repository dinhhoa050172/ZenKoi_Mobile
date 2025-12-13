import {
  KoiBreedingResult,
  KoiFish,
  KoiFishFamily,
  KoiFishHealth,
  KoiFishPagination,
  KoiFishRequest,
  KoiFishSearchParams,
  KoiReID,
  KoiReIDIdentifyResult,
  KoiReIDRequest,
  koiFishServices,
} from '@/lib/api/services/fetchKoiFish';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const koiFishKeys = {
  all: ['koiFish'] as const,
  lists: () => [...koiFishKeys.all, 'list'] as const,
  list: (params: KoiFishSearchParams) =>
    [...koiFishKeys.lists(), params] as const,
  details: () => [...koiFishKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...koiFishKeys.details(), id] as const,
};

/*
 * Hook to get list of Koi Fish with pagination
 */
export function useGetKoiFish(
  filters?: KoiFishSearchParams,
  enabled = true,
  pageSize = 100
) {
  const iq = useInfiniteQuery<KoiFishPagination, Error>({
    queryKey: koiFishKeys.list(filters || {}),
    queryFn: async (ctx) => {
      const pageParam = (ctx?.pageParam as number) ?? 1;
      const resp = await koiFishServices.getAllKoiFish({
        ...(filters || {}),
        pageIndex: pageParam,
        pageSize,
      });
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách cá koi');
      return resp.result;
    },
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.pageIndex + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const merged: KoiFishPagination | undefined = iq.data
    ? ((): KoiFishPagination => {
        const pages = iq.data.pages;
        const last = pages[pages.length - 1] ?? ({} as KoiFishPagination);
        return {
          pageIndex: last.pageIndex ?? 1,
          totalPages: last.totalPages ?? 1,
          totalItems: last.totalItems ?? 0,
          hasNextPage: !!iq.hasNextPage,
          hasPreviousPage: (pages[0]?.pageIndex ?? 1) > 1,
          data: pages.flatMap((p) => p.data ?? []),
        };
      })()
    : undefined;

  return {
    ...iq,
    data: merged,
  };
}

/*
 * Hook to get Koi Fish by ID
 */
export function useGetKoiFishById(id: number, enabled = true) {
  return useQuery({
    queryKey: koiFishKeys.detail(id),
    queryFn: async (): Promise<KoiFish> => {
      const resp = await koiFishServices.getKoiFishById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin cá');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Koi Fish by RFID
 */
export function useGetKoiFishByRFID(rfid: string, enabled = true) {
  return useQuery({
    queryKey: koiFishKeys.detail(`rfid-${rfid}`),
    queryFn: async (): Promise<KoiFish> => {
      const resp = await koiFishServices.getKoiFishByRFID(rfid);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin cá');
      return resp.result;
    },
    enabled: enabled && !!rfid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Get Koi Fish Family by ID
 */
export function useGetKoiFishFamilyById(id: number, enabled = true) {
  return useQuery({
    queryKey: koiFishKeys.detail(`family-${id}`),
    queryFn: async (): Promise<KoiFishFamily> => {
      const resp = await koiFishServices.getKoiFishFamilyById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin gia phả cá');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Koi Fish health history by koi fish ID
 */
export function useGetKoiFishHealthByKoiId(id: number, enabled = true) {
  return useQuery({
    queryKey: koiFishKeys.detail(`health-${id}`),
    queryFn: async (): Promise<KoiFishHealth[]> => {
      const resp = await koiFishServices.getKoiFishHealthByKoiId(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải lịch sử sức khỏe cá');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get breeding history / result of a koi fish
 */
export function useGetKoiBreedingHistory(id: number, enabled = true) {
  return useQuery({
    queryKey: koiFishKeys.detail(`breeding-${id}`),
    queryFn: async (): Promise<KoiBreedingResult> => {
      const resp = await koiFishServices.getKoiBreedingHistory(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải lịch sử sinh sản');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Koi Fish
 */
export function useCreateKoiFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: KoiFishRequest) => {
      const resp = await koiFishServices.createKoiFish(data);
      if (!resp.isSuccess) throw new Error(resp.message || 'Không thể tạo cá');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: koiFishKeys.lists() });
      qc.invalidateQueries({ queryKey: koiFishKeys.all });
      // Toast.show({
      //   type: 'success',
      //   text1: 'Tạo cá thành công',
      //   position: 'top',
      // });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Tạo thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
      console.error('Create Koi Fish Error:', err);
    },
  });
}

/*
 * Hook to update an existing Koi Fish
 */
export function useUpdateKoiFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: KoiFishRequest }) => {
      const resp = await koiFishServices.updateKoiFish(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật cá');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      // Toast.show({
      //   type: 'success',
      //   text1: 'Cập nhật thành công',
      //   position: 'top',
      // });
      qc.invalidateQueries({ queryKey: koiFishKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: koiFishKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: koiFishKeys.lists() });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật thất bại',
        position: 'top',
      });
      console.error('Update Koi Fish Error:', err);
    },
  });
}

/*
 * Hook to change pond of a koi fish
 */
export function useChangeKoiFishPond() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pondId }: { id: number; pondId: number }) => {
      const resp = await koiFishServices.changeKoiFishPond(id, pondId);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể chuyển ao cho cá');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Chuyển ao thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: koiFishKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: koiFishKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: koiFishKeys.lists() });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Chuyển ao thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to delete a Koi Fish
 */
export function useDeleteKoiFish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await koiFishServices.deleteKoiFish(id);
      if (!resp.isSuccess) throw new Error(resp.message || 'Không thể xóa cá');
      return resp.result;
    },
    onSuccess: () => {
      // Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: koiFishKeys.lists() });
      qc.invalidateQueries({ queryKey: koiFishKeys.all });
    },
    onError: (err: any) => {
      // Toast.show({
      //   type: 'error',
      //   text1: 'Xóa thất bại',
      //   text2: err?.message ?? String(err),
      //   position: 'top',
      // });
      console.error('Delete Koi Fish Error:', err);
    },
  });
}

/*
 * Hook to prefetch Koi Fish by ID
 */
export function usePrefetchKoiFishById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: koiFishKeys.detail(id),
      queryFn: async (): Promise<KoiFish> => {
        const resp = await koiFishServices.getKoiFishById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Koi Fish with pagination
 */
export function usePrefetchKoiFish(filters?: KoiFishSearchParams) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: koiFishKeys.list(filters || {}),
      queryFn: async (): Promise<KoiFishPagination> => {
        const resp = await koiFishServices.getAllKoiFish(filters || {});
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}

/*
 * Hook to enroll Koi Re-ID
 */
export function useEnrollKoiReID() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: KoiReIDRequest): Promise<KoiReID> => {
      const resp = await koiFishServices.enrollKoiReID(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể đăng ký Re-ID cho cá');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      // Toast.show({
      //   type: 'success',
      //   text1: 'Đăng ký Re-ID thành công',
      //   position: 'top',
      // });
      // Invalidate detail of the koi fish
      if (vars?.koiFishId) {
        qc.invalidateQueries({ queryKey: koiFishKeys.detail(vars.koiFishId) });
      }
    },
    onError: (err: any) => {
      // Toast.show({
      //   type: 'error',
      //   text1: 'Đăng ký Re-ID thất bại',
      //   text2: err?.message ?? String(err),
      //   position: 'top',
      // });
      console.error('Enroll Koi Re-ID Error:', err);
    },
  });
}

/*
 * Hook to identify Koi Re-ID
 */
export function useIdentifyKoiReID() {
  return useMutation({
    mutationFn: async (imageUrl: string): Promise<KoiReIDIdentifyResult> => {
      const resp = await koiFishServices.identifyKoiReID(imageUrl);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể nhận diện cá');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Nhận diện thành công',
        position: 'top',
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Nhận diện thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}
