import apiService, { RequestParams } from '../apiClient';
import { KoiFish } from './fetchKoiFish';
import { TypeOfPond } from './fetchPondType';

export enum PondStatus {
  EMPTY = 'Empty',
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
}

export interface Pond {
  id: number;
  pondName: string;
  location: string;
  pondStatus: PondStatus;
  maxFishCount: number | null;
  currentCount: number | null;
  currentCapacity: number | null;
  capacityLiters: number;
  depthMeters: number;
  lengthMeters: number;
  widthMeters: number;
  createdAt: string;
  pondTypeId: number;
  pondTypeName: string;
  areaId: number;
  areaName: string;
  record: WaterQualityRecord | null;
}

export interface PondSearchParams {
  search?: string;
  status?: PondStatus;
  areaId?: number;
  pondTypeId?: number;
  pondTypeEnum?: TypeOfPond;
  available?: boolean;
  minCapacityLiters?: number;
  maxCapacityLiters?: number;
  minDepthMeters?: number;
  maxDepthMeters?: number;
  createdFrom?: string;
  createdTo?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface WaterQualityRecord {
  phLevel: number;
  temperatureCelsius: number;
  oxygenLevel: number;
  ammoniaLevel: number;
  nitriteLevel: number;
  nitrateLevel: number;
  carbonHardness: number;
  waterLevelMeters: number;
  notes: string;
}

export interface PondRequest {
  pondTypeId: number;
  areaId: number;
  pondName: string;
  location: string;
  pondStatus: PondStatus;
  currentCapacity: number;
  depthMeters: number;
  lengthMeters: number;
  widthMeters: number;
  record: WaterQualityRecord;
}

export interface PondPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: Pond[];
}

export interface PondListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: PondPagination;
}

export interface PondResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Pond;
}

export interface FishOfPondResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: KoiFish[];
}

// Convert PondSearchParams to RequestParams
export const convertPondFilter = (
  filters?: PondSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.areaId) params.areaId = filters.areaId;
  if (filters.pondTypeId) params.pondTypeId = filters.pondTypeId;
  if (filters.pondTypeEnum) params.pondTypeEnum = filters.pondTypeEnum;
  if (filters.available) params.available = filters.available;
  if (filters.minCapacityLiters)
    params.minCapacityLiters = filters.minCapacityLiters;
  if (filters.maxCapacityLiters)
    params.maxCapacityLiters = filters.maxCapacityLiters;
  if (filters.minDepthMeters) params.minDepthMeters = filters.minDepthMeters;
  if (filters.maxDepthMeters) params.maxDepthMeters = filters.maxDepthMeters;
  if (filters.createdFrom) params.createdFrom = filters.createdFrom;
  if (filters.createdTo) params.createdTo = filters.createdTo;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const pondServices = {
  // Get all ponds with pagination
  getAllPonds: async (
    filters?: PondSearchParams
  ): Promise<PondListResponse> => {
    const params = convertPondFilter(filters);

    const response = await apiService.get<PondListResponse>(
      `/api/pond`,
      params
    );
    return response.data;
  },

  // Get pond by ID
  getPondById: async (id: number): Promise<PondResponse> => {
    const response = await apiService.get<PondResponse>(`/api/pond/${id}`);
    return response.data;
  },

  // Get fish in a pond
  getFishOfPond: async (pondId: number): Promise<FishOfPondResponse> => {
    const response = await apiService.get<FishOfPondResponse>(
      `/api/pond/${pondId}/koifish`
    );
    return response.data;
  },

  // Create a new pond
  createPond: async (pond: PondRequest): Promise<PondResponse> => {
    const response = await apiService.post<PondResponse, PondRequest>(
      '/api/pond',
      pond
    );
    return response.data;
  },

  // Update an existing pond
  updatePond: async (id: number, pond: PondRequest): Promise<PondResponse> => {
    const response = await apiService.put<PondResponse, PondRequest>(
      `/api/pond/${id}`,
      pond
    );
    return response.data;
  },

  // Delete a pond
  deletePond: async (id: number): Promise<PondResponse> => {
    const response = await apiService.delete<PondResponse>(`/api/pond/${id}`);
    return response.data;
  },
};
