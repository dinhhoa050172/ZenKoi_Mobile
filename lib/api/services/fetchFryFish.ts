import apiService from '../apiClient';
import { BreedingProcess } from './fetchBreedingProcess';

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
  pondId: number;
  initialCount: number;
  status: FryFishStatus;
  breedingProcess: BreedingProcess;
  pond: {
    id: number;
    pondName: string;
  };
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

export const fryFishServices = {
  // Get all fry fish with pagination
  getAllFryFish: async (
    pageIndex: number,
    pageSize: number
  ): Promise<FryFishListResponse> => {
    const response = await apiService.get<FryFishListResponse>(
      `/api/fryfish?pageIndex=${pageIndex}&pageSize=${pageSize}`
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
