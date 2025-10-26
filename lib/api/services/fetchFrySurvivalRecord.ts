import apiService, { RequestParams } from '../apiClient';

export interface FrySurvivalRecord {
  id: number;
  fryFishId: number;
  dayNumber: number;
  survivalRate: number;
  countAlive: number;
  note: string | null;
  createdAt: string;
  initialCount: number | null;
}

export interface FrySurvivalRecordSearchParams {
  search?: string;
  fryFishId?: number;
  minDayNumber?: number;
  maxDayNumber?: number;
  minSurvivalRate?: number;
  maxSurvivalRate?: number;
  minCountAlive?: number;
  maxCountAlive?: number;
  success?: boolean;
  createdFrom?: string;
  createdTo?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface FrySurvivalRecordRequest {
  fryFishId: number;
  countAlive: number;
  note: string;
  success: boolean;
}

export interface FrySurvivalRecordPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: FrySurvivalRecord[];
}

export interface FrySurvivalRecordListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: FrySurvivalRecordPagination;
}

export interface FrySurvivalRecordResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: FrySurvivalRecord;
}

// Convert FrySurvivalRecordSearchParams to RequestParams
export const convertFrySurvivalRecordFilter = (
  filters?: FrySurvivalRecordSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.fryFishId) params.fryFishId = filters.fryFishId;
  if (filters.minDayNumber) params.minDayNumber = filters.minDayNumber;
  if (filters.maxDayNumber) params.maxDayNumber = filters.maxDayNumber;
  if (filters.minSurvivalRate) params.minSurvivalRate = filters.minSurvivalRate;
  if (filters.maxSurvivalRate) params.maxSurvivalRate = filters.maxSurvivalRate;
  if (filters.minCountAlive) params.minCountAlive = filters.minCountAlive;
  if (filters.maxCountAlive) params.maxCountAlive = filters.maxCountAlive;
  if (filters.success !== undefined) params.success = filters.success;
  if (filters.createdFrom) params.createdFrom = filters.createdFrom;
  if (filters.createdTo) params.createdTo = filters.createdTo;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const frySurvivalRecordServices = {
  // Get all fry survival records with pagination
  getAllFrySurvivalRecords: async (
    filters?: FrySurvivalRecordSearchParams
  ): Promise<FrySurvivalRecordListResponse> => {
    const params = convertFrySurvivalRecordFilter(filters);

    const response = await apiService.get<FrySurvivalRecordListResponse>(
      `/api/frysurvivalrecord`,
      params
    );
    return response.data;
  },

  // Get fry survival record by ID
  getFrySurvivalRecordById: async (
    id: number
  ): Promise<FrySurvivalRecordResponse> => {
    const response = await apiService.get<FrySurvivalRecordResponse>(
      `/api/frysurvivalrecord/${id}`
    );
    return response.data;
  },

  // Create new fry survival record
  createFrySurvivalRecord: async (
    data: FrySurvivalRecordRequest
  ): Promise<FrySurvivalRecordResponse> => {
    const response = await apiService.post<
      FrySurvivalRecordResponse,
      FrySurvivalRecordRequest
    >('/api/frysurvivalrecord', data);
    return response.data;
  },

  // Update existing fry survival record
  updateFrySurvivalRecord: async (
    id: number,
    data: FrySurvivalRecordRequest
  ): Promise<FrySurvivalRecordResponse> => {
    const response = await apiService.put<
      FrySurvivalRecordResponse,
      FrySurvivalRecordRequest
    >(`/api/frysurvivalrecord/${id}`, data);
    return response.data;
  },

  // Delete fry survival record by ID
  deleteFrySurvivalRecord: async (
    id: number
  ): Promise<FrySurvivalRecordResponse> => {
    const response = await apiService.delete<FrySurvivalRecordResponse>(
      `/api/frysurvivalrecord/${id}`
    );
    return response.data;
  },
};
