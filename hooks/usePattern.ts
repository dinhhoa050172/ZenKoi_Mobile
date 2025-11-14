import {
  Pattern,
  PatternAssignRequest,
  PatternPagination,
  PatternRequest,
  patternServices,
} from '@/lib/api/services/fetchPattern';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const patternKeys = {
  all: ['pattern'] as const,
  lists: () => [...patternKeys.all, 'list'] as const,
  list: (params: { pageIndex?: number; pageSize?: number } = {}) =>
    [...patternKeys.lists(), params] as const,
  details: () => [...patternKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...patternKeys.details(), id] as const,
  byVariety: (varietyId: number | string) =>
    [...patternKeys.all, 'byVariety', varietyId] as const,
};

/**
 * Hook to get list of Patterns with pagination
 */
/**
 * Non-infinite hook to get a single page of Patterns
 * @param pageIndex page to fetch (1-based)
 * @param pageSize items per page
 * @param enabled whether the query is enabled
 */
export function useGetPatterns(pageIndex = 1, pageSize = 30, enabled = true) {
  return useQuery({
    queryKey: patternKeys.list({ pageIndex, pageSize }),
    queryFn: async (): Promise<PatternPagination> => {
      const resp = await patternServices.getAllPatterns(pageIndex, pageSize);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách hoa văn');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Infinite hook to get Patterns with pagination (useInfiniteQuery)
 * @param enabled whether the query is enabled
 * @param pageSize items per page
 */
export function useGetPatternsInfinite(enabled = true, pageSize = 30) {
  const iq = useInfiniteQuery<any, Error>({
    queryKey: patternKeys.list({ pageSize }),
    queryFn: async (ctx) => {
      const pageParam = (ctx?.pageParam as number) ?? 1;
      const resp = await patternServices.getAllPatterns(pageParam, pageSize);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải danh sách hoa văn');
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

  const merged: PatternPagination | undefined = iq.data
    ? ((): PatternPagination => {
        const pages = (iq.data as any).pages as PatternPagination[];
        const last = pages[pages.length - 1] ?? ({} as PatternPagination);
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
  } as any;
}

/**
 * Hook to get Pattern by ID
 */
export function useGetPatternById(id: number, enabled = true) {
  return useQuery({
    queryKey: patternKeys.detail(id),
    queryFn: async (): Promise<Pattern> => {
      const resp = await patternServices.getPatternById(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin hoa văn');
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to create a new Pattern
 */
export function useCreatePattern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PatternRequest) => {
      const resp = await patternServices.createPattern(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo hoa văn');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patternKeys.lists() });
      qc.invalidateQueries({ queryKey: patternKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo hoa văn thành công',
        position: 'top',
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Tạo hoa văn thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/**
 * Hook to update an existing Pattern
 */
export function useUpdatePattern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PatternRequest }) => {
      const resp = await patternServices.updatePattern(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật hoa văn');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật hoa văn thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: patternKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: patternKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: patternKeys.lists() });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật hoa văn thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/**
 * Hook to delete a Pattern
 */
export function useDeletePattern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await patternServices.deletePattern(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa hoa văn');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Xóa hoa văn thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: patternKeys.lists() });
      qc.invalidateQueries({ queryKey: patternKeys.all });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Xóa hoa văn thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/**
 * Prefetch helpers
 */
export function usePrefetchPatternById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: patternKeys.detail(id),
      queryFn: async (): Promise<Pattern> => {
        const resp = await patternServices.getPatternById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function usePrefetchPatterns() {
  const qc = useQueryClient();
  return (pageSize = 30) =>
    qc.prefetchQuery({
      queryKey: patternKeys.list({ pageSize }),
      queryFn: async (): Promise<PatternPagination> => {
        const resp = await patternServices.getAllPatterns(1, pageSize);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}

/**
 * Get pattern assigned to a variety
 */
export function useGetPatternByVarietyId(varietyId: number, enabled = true) {
  return useQuery({
    queryKey: patternKeys.byVariety(varietyId),
    queryFn: async (): Promise<PatternPagination> => {
      const resp = await patternServices.getPatternByVarietyId(varietyId);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thông tin hoa văn');
      return resp.result;
    },
    enabled: enabled && !!varietyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Assign pattern to a variety
 */
export function useAssignPatternToVariety() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PatternAssignRequest) => {
      const resp = await patternServices.assignPatternToVariety(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể gán hoa văn');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Gán hoa văn thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: patternKeys.lists() });
      if (vars?.varietyId)
        qc.invalidateQueries({
          queryKey: patternKeys.byVariety(vars.varietyId),
        });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Gán hoa văn thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/**
 * Remove pattern from a variety
 */
export function useRemovePatternFromVariety() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PatternAssignRequest) => {
      const resp = await patternServices.removePatternFromVariety(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể bỏ gán hoa văn');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Bỏ gán hoa văn thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: patternKeys.lists() });
      if (vars?.varietyId)
        qc.invalidateQueries({
          queryKey: patternKeys.byVariety(vars.varietyId),
        });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Bỏ gán hoa văn thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}
