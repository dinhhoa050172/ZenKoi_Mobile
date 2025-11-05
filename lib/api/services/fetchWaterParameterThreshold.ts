import apiService, { RequestParams } from '../apiClient';

export interface WaterParameterThreshold {
  id: number;
  parameterName: string;
  unit: string;
  minValue: number;
  maxValue: number;
  pondTypeId: number;
  pondTypeName: string;
}

export interface WaterParameterThresholdSearchParams {
  parameterName?: string;
  pondTypeId?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface WaterParameterThresholdRequest {
  parameterName: string;
  unit: string;
  minValue: number;
  maxValue: number;
  pondTypeId: number;
}

export interface WaterParameterThresholdPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: WaterParameterThreshold[];
}

export interface WaterParameterThresholdListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: WaterParameterThresholdPagination;
}

export interface WaterParameterThresholdResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: WaterParameterThreshold;
}

// Convert WaterParameterThresholdSearchParams to RequestParams
export const convertWaterParameterThresholdFilter = (
  filters?: WaterParameterThresholdSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.parameterName) params.parameterName = filters.parameterName;
  if (filters.pondTypeId) params.pondTypeId = filters.pondTypeId;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const waterparameterThresholdServices = {
  // Get list of WaterParameterThreshold with filters
  getAllWaterParameterThresholds: async (
    filters?: WaterParameterThresholdSearchParams
  ): Promise<WaterParameterThresholdListResponse> => {
    const params = convertWaterParameterThresholdFilter(filters);

    const response = await apiService.get<WaterParameterThresholdListResponse>(
      '/api/waterparameterthreshold',
      params
    );
    return response.data;
  },

  // Get WaterParameterThreshold by id
  getWaterParameterThreshold: async (
    id: number
  ): Promise<WaterParameterThresholdResponse> => {
    const response = await apiService.get<WaterParameterThresholdResponse>(
      `/api/waterparameterthreshold/${id}`
    );
    return response.data;
  },

  // Create a new WaterParameterThreshold
  createWaterParameterThreshold: async (
    data: WaterParameterThresholdRequest
  ): Promise<WaterParameterThresholdResponse> => {
    const response = await apiService.post<
      WaterParameterThresholdResponse,
      WaterParameterThresholdRequest
    >('/api/waterparameterthreshold', data);
    return response.data;
  },

  // Update an existing WaterParameterThreshold
  updateWaterParameterThreshold: async (
    id: number,
    data: WaterParameterThresholdRequest
  ): Promise<WaterParameterThresholdResponse> => {
    const response = await apiService.put<
      WaterParameterThresholdResponse,
      WaterParameterThresholdRequest
    >(`/api/waterparameterthreshold/${id}`, data);
    return response.data;
  },

  // Delete a WaterParameterThreshold by ID
  deleteWaterParameterThreshold: async (
    id: number
  ): Promise<WaterParameterThresholdResponse> => {
    const response = await apiService.delete<WaterParameterThresholdResponse>(
      `/api/waterparameterthreshold/${id}`
    );
    return response.data;
  },
};
