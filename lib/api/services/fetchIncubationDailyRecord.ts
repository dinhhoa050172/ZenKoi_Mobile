import apiService from '../apiClient';

export interface IncubationDailyRecord {
  id: number;
  eggBatchId: number;
  dayNumber: number;
  healthyEggs: number;
  rottenEggs: number;
  hatchedEggs: number;
  success: boolean;
}

export interface IncubationDailyRecordSummary {
  eggBatchId: number;
  fertilizationRate: number;
  totalRottenEggs: number;
  totalHatchedEggs: number;
}

export interface IncubationDailyRecordRequest {
  eggBatchId: number;
  healthyEggs: number;
  hatchedEggs: number;
  success: boolean;
}

export interface IncubationDailyRecordRequestV2 {
  eggBatchId: number;
  hatchedEggs: number;
  success: boolean;
}

export interface IncubationDailyRecordPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: IncubationDailyRecord[];
}

export interface IncubationDailyRecordListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: IncubationDailyRecordPagination;
}

export interface IncubationDailyRecordResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: IncubationDailyRecord;
}

export interface IncubationDailyRecordSummaryResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: IncubationDailyRecordSummary;
}

export const incubationDailyRecordServices = {
  // Get all incubation daily records with pagination
  getAllIncubationDailyRecords: async (
    pageIndex: number,
    pageSize: number,
    eggBatchId: number
  ): Promise<IncubationDailyRecordListResponse> => {
    const response = await apiService.get<IncubationDailyRecordListResponse>(
      `/api/incubationdailyrecord/eggbatch/${eggBatchId}?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
    return response.data;
  },

  // Get incubation daily record by ID
  getIncubationDailyRecordById: async (
    id: number
  ): Promise<IncubationDailyRecordResponse> => {
    const response = await apiService.get<IncubationDailyRecordResponse>(
      `/api/incubationdailyrecord/${id}`
    );
    return response.data;
  },

  // Get incubation daily record summary by egg batch ID
  getIncubationDailyRecordSummaryByEggBatchId: async (
    eggBatchId: number
  ): Promise<IncubationDailyRecordSummaryResponse> => {
    const response = await apiService.get<IncubationDailyRecordSummaryResponse>(
      `/api/incubationdailyrecord/egg-batch/${eggBatchId}/summary`
    );
    return response.data;
  },

  // Create a new incubation daily record
  createIncubationDailyRecord: async (
    data: IncubationDailyRecordRequest
  ): Promise<IncubationDailyRecordResponse> => {
    const response = await apiService.post<
      IncubationDailyRecordResponse,
      IncubationDailyRecordRequest
    >('/api/incubationdailyrecord', data);
    return response.data;
  },

  // Create a new incubation daily record V2
  createIncubationDailyRecordV2: async (
    data: IncubationDailyRecordRequestV2
  ): Promise<IncubationDailyRecordResponse> => {
    const response = await apiService.post<
      IncubationDailyRecordResponse,
      IncubationDailyRecordRequestV2
    >('/api/incubationdailyrecord/v2', data);
    return response.data;
  },

  // Update an existing incubation daily record
  updateIncubationDailyRecord: async (
    id: number,
    data: IncubationDailyRecordRequest
  ): Promise<IncubationDailyRecordResponse> => {
    const response = await apiService.put<
      IncubationDailyRecordResponse,
      IncubationDailyRecordRequest
    >(`/api/incubationdailyrecord/${id}`, data);
    return response.data;
  },

  // Delete an incubation daily record
  deleteIncubationDailyRecord: async (
    id: number
  ): Promise<IncubationDailyRecordResponse> => {
    const response = await apiService.delete<IncubationDailyRecordResponse>(
      `/api/incubationdailyrecord/${id}`
    );
    return response.data;
  },
};
