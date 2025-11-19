import {
  staffDashboard,
  StaffDashboardStatisticsData,
  StaffFarmDashboardQickStatsData,
} from '@/lib/api/services/fetchFarmDashboard';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys for farm dashboard
export const farmDashboardKeys = {
  all: ['farmDashboard'] as const,
  statistics: () => [...farmDashboardKeys.all, 'statistics'] as const,
  quickStats: () => [...farmDashboardKeys.all, 'quick-stats'] as const,
};

/**
 * Hook to get farm/staff dashboard overall statistics (result object)
 */
export function useGetFarmStatistics(enabled = true) {
  return useQuery({
    queryKey: farmDashboardKeys.statistics(),
    queryFn: async (): Promise<StaffDashboardStatisticsData['result']> => {
      const resp = await staffDashboard.fetchStatistics();
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải thống kê');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get farm quick stats used on staff dashboards
 */
export function useGetFarmQuickStats(enabled = true) {
  return useQuery({
    queryKey: farmDashboardKeys.quickStats(),
    queryFn: async (): Promise<StaffFarmDashboardQickStatsData['result']> => {
      const resp = await staffDashboard.fetchFarmQuickStats();
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải quick-stats');
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Prefetch helpers */
export function usePrefetchFarmDashboard() {
  const qc = useQueryClient();
  return async () => {
    await qc.prefetchQuery({
      queryKey: farmDashboardKeys.statistics(),
      queryFn: async () => {
        const resp = await staffDashboard.fetchStatistics();
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
    await qc.prefetchQuery({
      queryKey: farmDashboardKeys.quickStats(),
      queryFn: async () => {
        const resp = await staffDashboard.fetchFarmQuickStats();
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
