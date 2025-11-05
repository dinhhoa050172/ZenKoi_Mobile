import apiService, { RequestParams } from '../apiClient';

export interface WaterParameterRecord {
  id: number;
  pondId: number;
  pondName: string;
  phLevel: number;
  temperatureCelsius: number;
  oxygenLevel: number;
  ammoniaLevel: number;
  nitriteLevel: number;
  nitrateLevel: number;
  carbonHardness: number;
  waterLevelMeters: number;
  recordedAt: string;
  recordedByUserId: number;
  recordedByUserName: string;
  notes: string;
}

export interface WaterParameterRecordSearchParams {
  pondId?: number;
  fromDate?: string;
  toDate?: string;
  recordedByUserId?: number;
  notesContains?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface WaterParameterRecordRequest {
  pondId: number;
  phLevel: number;
  temperatureCelsius: number;
  oxygenLevel: number;
  ammoniaLevel: number;
  nitriteLevel: number;
  nitrateLevel: number;
  carbonHardness: number;
  waterLevelMeters: number;
  recordedAt: string;
  notes: string;
}

export interface WaterParameterRecordPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: WaterParameterRecord[];
}

export interface WaterParameterRecordListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: WaterParameterRecordPagination;
}

export interface WaterParameterRecordResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: WaterParameterRecord;
}

// Convert WaterParameterRecordSearchParams to RequestParams
export const convertWaterParameterRecordFilter = (
  filters?: WaterParameterRecordSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.pondId) params.pondId = filters.pondId;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;
  if (filters.recordedByUserId)
    params.recordedByUserId = filters.recordedByUserId;
  if (filters.notesContains) params.notesContains = filters.notesContains;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const waterParameterRecordServices = {
  // Get list of WaterParameterRecords with filters
  getAllWaterParameterRecords: async (
    filters?: WaterParameterRecordSearchParams
  ): Promise<WaterParameterRecordListResponse> => {
    const params = convertWaterParameterRecordFilter(filters);

    const response = await apiService.get<WaterParameterRecordListResponse>(
      '/api/waterparameterrecord',
      params
    );
    return response.data;
  },

  // Get WaterParameterRecord by id
  getWaterParameterRecordById: async (
    id: number
  ): Promise<WaterParameterRecordResponse> => {
    const response = await apiService.get<WaterParameterRecordResponse>(
      `/api/waterparameterrecord/${id}`
    );
    return response.data;
  },

  // Create a new WaterParameterRecord
  createWaterParameterRecord: async (
    data: WaterParameterRecordRequest
  ): Promise<WaterParameterRecordResponse> => {
    const response = await apiService.post<
      WaterParameterRecordResponse,
      WaterParameterRecordRequest
    >('/api/waterparameterrecord', data);
    return response.data;
  },

  // Update an existing WaterParameterRecord
  updateWaterParameterRecord: async (
    id: number,
    data: WaterParameterRecordRequest
  ): Promise<WaterParameterRecordResponse> => {
    const response = await apiService.put<
      WaterParameterRecordResponse,
      WaterParameterRecordRequest
    >(`/api/waterparameterrecord/${id}`, data);
    return response.data;
  },

  // Delete a WaterParameterRecord by ID
  deleteWaterParameterRecord: async (
    id: number
  ): Promise<WaterParameterRecordResponse> => {
    const response = await apiService.delete<WaterParameterRecordResponse>(
      `/api/waterparameterrecord/${id}`
    );
    return response.data;
  },
};
