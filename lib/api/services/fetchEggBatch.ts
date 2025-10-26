import apiService, { RequestParams } from '../apiClient';
import { IncubationDailyRecord } from './fetchIncubationDailyRecord';

export enum EggBatchStatus {
  COLLECTED = 'Collected', // Lô trứng vừa được thu từ quá trình sinh sản
  INCUBATING = 'Incubating', // Đang được ấp
  PARTIALLY_HATCHED = 'PartiallyHatched', // Một phần trứng đã nở
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

export interface EggBatch {
  id: number;
  breedingProcessId: number;
  quantity: number;
  fertilizationRate: number;
  status: EggBatchStatus;
  hatchingTime: string;
  spawnDate: string;
  incubationDailyRecords: IncubationDailyRecord[];
}

export interface EggBatchSearchParams {
  search?: string;
  breedingProcessId?: number;
  pondId?: number;
  status?: EggBatchStatus;
  minQuantity?: number;
  maxQuantity?: number;
  minFertilizationRate?: number;
  maxFertilizationRate?: number;
  spawnDateFrom?: string;
  spawnDateTo?: string;
  hatchingTimeFrom?: string;
  hatchingTimeTo?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface EggBatchRequest {
  breedingProcessId: number;
  pondId: number;
  quantity: number;
}

export interface EggBatchPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: EggBatch[];
}

export interface EggBatchListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: EggBatchPagination;
}

export interface EggBatchResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: EggBatch;
}

// Convert EggBatchSearchParams to RequestParams
export const convertEggBatchFilter = (
  filters?: EggBatchSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.breedingProcessId)
    params.breedingProcessId = filters.breedingProcessId;
  if (filters.pondId) params.pondId = filters.pondId;
  if (filters.status) params.status = filters.status;
  if (filters.minQuantity) params.minQuantity = filters.minQuantity;
  if (filters.maxQuantity) params.maxQuantity = filters.maxQuantity;
  if (filters.minFertilizationRate)
    params.minFertilizationRate = filters.minFertilizationRate;
  if (filters.maxFertilizationRate)
    params.maxFertilizationRate = filters.maxFertilizationRate;
  if (filters.spawnDateFrom) params.spawnDateFrom = filters.spawnDateFrom;
  if (filters.spawnDateTo) params.spawnDateTo = filters.spawnDateTo;
  if (filters.hatchingTimeFrom)
    params.hatchingTimeFrom = filters.hatchingTimeFrom;
  if (filters.hatchingTimeTo) params.hatchingTimeTo = filters.hatchingTimeTo;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const eggBatchServices = {
  // Get all egg batches with pagination
  getAllEggBatches: async (
    filters?: EggBatchSearchParams
  ): Promise<EggBatchListResponse> => {
    const params = convertEggBatchFilter(filters);

    const response = await apiService.get<EggBatchListResponse>(
      `/api/eggbatch`,
      params
    );
    return response.data;
  },

  // Get egg batch by ID
  getEggBatchById: async (id: number): Promise<EggBatchResponse> => {
    const response = await apiService.get<EggBatchResponse>(
      `/api/eggbatch/${id}`
    );
    return response.data;
  },

  // Get egg batch by breeding process ID
  getEggBatchByBreedingProcessId: async (
    breedingProcessId: number
  ): Promise<EggBatchResponse> => {
    const response = await apiService.get<EggBatchResponse>(
      `/api/eggbatch/by-breeding/${breedingProcessId}`
    );
    return response.data;
  },

  // Create a new egg batch
  createEggBatch: async (data: EggBatchRequest): Promise<EggBatchResponse> => {
    const response = await apiService.post<EggBatchResponse, EggBatchRequest>(
      '/api/eggbatch',
      data
    );
    return response.data;
  },

  // Update an existing egg batch
  updateEggBatch: async (
    id: number,
    data: EggBatchRequest
  ): Promise<EggBatchResponse> => {
    const response = await apiService.put<EggBatchResponse, EggBatchRequest>(
      `/api/eggbatch/${id}`,
      data
    );
    return response.data;
  },

  // Delete an egg batch
  deleteEggBatch: async (id: number): Promise<EggBatchResponse> => {
    const response = await apiService.delete<EggBatchResponse>(
      `/api/eggbatch/${id}`
    );
    return response.data;
  },
};
