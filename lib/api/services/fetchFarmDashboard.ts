import apiService from '../apiClient';

export interface StaffDashboardStatisticsData {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: {
    totalKoi: {
      current: number;
      changePercent: number;
    };
    activeAccounts: {
      current: number;
      changePercent: number;
    };
    pondsInUse: {
      current: number;
      changePercent: number;
    };
    farmMonthlyRevenue: {
      current: number;
      changePercent: number;
    };
  };
}

export interface StaffFarmDashboardQickStatsData {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: {
    healthyKoiPercent: number;
    activePonds: {
      current: number;
      total: number;
    };
    activeStaff: {
      current: number;
      total: number;
    };
    activeBreedingProcesses: number;
  };
}

export const staffDashboard = {
  // Fetch overall statistics for staff dashboard
  fetchStatistics: async (): Promise<StaffDashboardStatisticsData> => {
    const response = await apiService.get<StaffDashboardStatisticsData>(
      '/api/FarmDashboard/statistics'
    );
    return response.data;
  },

  // Fetch quick stats for staff farm dashboard
  fetchFarmQuickStats: async (): Promise<StaffFarmDashboardQickStatsData> => {
    const response = await apiService.get<StaffFarmDashboardQickStatsData>(
      '/api/FarmDashboard/quick-stats'
    );
    return response.data;
  },
};
