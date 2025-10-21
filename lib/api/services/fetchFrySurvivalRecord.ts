import apiService from '../apiClient';

export interface FrySurvivalRecord {
  id: number;
  fryFishId: number;
  dayNumber: number;
  survivalRate: number;
  countAlive: number;
  note: string;
  createdAt: string;
}

export interface FrySurvivalRecordRequest {
  fryFishId: number;
  dayNumber: number;
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

export const frySurvivalRecordServices = {
  // Get all fry survival records with pagination
  getAllFrySurvivalRecords: async (
    pageIndex: number,
    pageSize: number
  ): Promise<FrySurvivalRecordListResponse> => {
    const response = await apiService.get<FrySurvivalRecordListResponse>(
      `/api/frysurvivalrecord?pageIndex=${pageIndex}&pageSize=${pageSize}`
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
