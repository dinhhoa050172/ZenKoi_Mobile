import apiService, { RequestParams } from '../apiClient';
import { WaterParameterType } from './fetchWaterParameterThreshold';

export enum AlertType {
  HIGH = 'High',
  LOW = 'Low',
  RAPID_CHANGE = 'RapidChange',
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

// export enum WaterParameterType {
//   PH_LEVEL = 'PHLevel', // Độ pH
//   TEMPERATURE_CELSIUS = 'TemperatureCelsius', // Nhiệt độ (°C)
//   OXYGEN_LEVEL = 'OxygenLevel', // Hàm lượng Oxy hòa tan (mg/L)
//   AMMONIA_LEVEL = 'AmmoniaLevel', // Nồng độ Amoniac (mg/L)
//   NITRITE_LEVEL = 'NitriteLevel', // Nồng độ Nitrit (mg/L)
//   NITRATE_LEVEL = 'NitrateLevel', // Nồng độ Nitrat (mg/L)
//   CARBON_HARDNESS = 'CarbonHardness', // Độ cứng cacbonat (°dH)
//   WATER_LEVEL_METERS = 'WaterLevelMeters', // Mực nước (m)
// }

export interface WaterAlert {
  id: number;
  pondId: number;
  pondName: string;
  parameterName: WaterParameterType;
  measuredValue: number;
  alertType: AlertType;
  severity: Severity;
  message: string;
  seen: boolean;
  createdAt: string;
  isResolved: boolean;
  resolvedByUserId: number | null;
  resolvedByUserName: string | null;
}

export interface WaterAlertSearchParams {
  pondId?: number;
  isResolved?: boolean;
  isSeen?: boolean;
  alertType?: AlertType;
  severity?: Severity;
  pageIndex?: number;
  pageSize?: number;
}

export interface WaterAlertPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: WaterAlert[];
}

export interface WaterAlertPaginationResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: WaterAlertPagination;
}

export interface WaterAlertResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: WaterAlert;
}

// Convert WaterAlertSearchParams to RequestParams
export const convertWaterAlertFilter = (
  filters?: WaterAlertSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.pondId) params.pondId = filters.pondId;
  if (filters.isResolved !== undefined) params.isResolved = filters.isResolved;
  if (filters.isSeen !== undefined) params.isSeen = filters.isSeen;
  if (filters.alertType) params.alertType = filters.alertType;
  if (filters.severity) params.severity = filters.severity;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const waterAlertServices = {
  // Get water alerts with filters
  getAllWaterAlerts: async (
    filters?: WaterAlertSearchParams
  ): Promise<WaterAlertPaginationResponse> => {
    const params = convertWaterAlertFilter(filters);

    const response = await apiService.get<WaterAlertPaginationResponse>(
      `/api/wateralert`,
      params
    );
    return response.data;
  },

  // Get water alert by ID
  getWaterAlertById: async (id: number): Promise<WaterAlertResponse> => {
    const response = await apiService.get<WaterAlertResponse>(
      `/api/wateralert/${id}`
    );
    return response.data;
  },

  // Resolve a water alert
  resolveWaterAlert: async (id: number): Promise<WaterAlertResponse> => {
    const response = await apiService.put<WaterAlertResponse>(
      `/api/wateralert/${id}/resolve`
    );
    return response.data;
  },

  // Delete a water alert by ID
  deleteWaterAlert: async (id: number): Promise<WaterAlertResponse> => {
    const response = await apiService.delete<WaterAlertResponse>(
      `/api/wateralert/${id}`
    );
    return response.data;
  },

  // Seen all water alerts
  seenAllWaterAlerts: async (): Promise<WaterAlertPaginationResponse> => {
    const response = await apiService.put<WaterAlertPaginationResponse>(
      `/api/wateralert/seen-all`
    );
    return response.data;
  },
};
