import apiService from '../apiClient';

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
  pondId: number;
  pondName: string;
  quantity: number;
  status: EggBatchStatus;
  spawnDate: string;
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

export const eggBatchServices = {
  // Get all egg batches with pagination
  getAllEggBatches: async (
    pageIndex: number,
    pageSize: number
  ): Promise<EggBatchListResponse> => {
    const response = await apiService.get<EggBatchListResponse>(
      `/api/eggbatch?pageIndex=${pageIndex}&pageSize=${pageSize}`
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
