import apiService, { RequestParams } from '../apiClient';
import { FrySurvivalRecord } from './fetchFrySurvivalRecord';

export enum FryFishStatus {
  HATCHED = 'Hatched', // Vừa nở
  GROWING = 'Growing', // Đang phát triển
  SELECTING = 'Selecting', // Đang chọn lọc
  COMPLETED = 'Completed', // Hoàn thành giai đoạn ương
  DEAD = 'Dead',
}

export interface FryFish {
  id: number;
  breedingProcessId: number;
  initialCount: number;
  status: FryFishStatus;
  currentSurvivalRate: number;
  frySurvivalRecords: FrySurvivalRecord[];
}

export interface FryFishSearchParams {
  search?: string;
  breedingProcessId?: number;
  pondId?: number;
  status?: FryFishStatus;
  minInitialCount?: number;
  maxInitialCount?: number;
  minCurrentSurvivalRate?: number;
  maxCurrentSurvivalRate?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface FryFishRequest {
  breedingProcessId: number;
  pondId: number;
}

export interface FryFishPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: FryFish[];
}

export interface FryFishListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: FryFishPagination;
}

export interface FryFishResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: FryFish;
}

// Convert FryFishSearchParams to RequestParams
export const convertFryFishFilter = (
  filters?: FryFishSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.breedingProcessId)
    params.breedingProcessId = filters.breedingProcessId;
  if (filters.pondId) params.pondId = filters.pondId;
  if (filters.status) params.status = filters.status;
  if (filters.minInitialCount) params.minInitialCount = filters.minInitialCount;
  if (filters.maxInitialCount) params.maxInitialCount = filters.maxInitialCount;
  if (filters.minCurrentSurvivalRate)
    params.minCurrentSurvivalRate = filters.minCurrentSurvivalRate;
  if (filters.maxCurrentSurvivalRate)
    params.maxCurrentSurvivalRate = filters.maxCurrentSurvivalRate;
  if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
  if (filters.startDateTo) params.startDateTo = filters.startDateTo;
  if (filters.endDateFrom) params.endDateFrom = filters.endDateFrom;
  if (filters.endDateTo) params.endDateTo = filters.endDateTo;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const fryFishServices = {
  // Get all fry fish with pagination
  getAllFryFish: async (
    filters?: FryFishSearchParams
  ): Promise<FryFishListResponse> => {
    const params = convertFryFishFilter(filters);

    const response = await apiService.get<FryFishListResponse>(
      `/api/fryfish`,
      params
    );
    return response.data;
  },

  // Get fry fish by ID
  getFryFishById: async (id: number): Promise<FryFishResponse> => {
    const response = await apiService.get<FryFishResponse>(
      `/api/fryfish/${id}`
    );
    return response.data;
  },

  // Get fry fish by breeding process ID
  getFryFishByBreedingProcessId: async (
    breedingProcessId: number
  ): Promise<FryFishResponse> => {
    const response = await apiService.get<FryFishResponse>(
      `/api/fryfish/by-breeding/${breedingProcessId}`
    );
    return response.data;
  },

  // Create new fry fish
  createFryFish: async (data: FryFishRequest): Promise<FryFishResponse> => {
    const response = await apiService.post<FryFishResponse, FryFishRequest>(
      '/api/fryfish',
      data
    );
    return response.data;
  },

  // Update existing fry fish
  updateFryFish: async (
    id: number,
    data: FryFishRequest
  ): Promise<FryFishResponse> => {
    const response = await apiService.put<FryFishResponse, FryFishRequest>(
      `/api/fryfish/${id}`,
      data
    );
    return response.data;
  },

  // Delete fry fish by ID
  deleteFryFish: async (id: number): Promise<FryFishResponse> => {
    const response = await apiService.delete<FryFishResponse>(
      `/api/fryfish/${id}`
    );
    return response.data;
  },
};
