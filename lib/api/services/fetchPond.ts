import apiService from '../apiClient';

export enum PondStatus {
  Empty,
  Active,
  Maintenance,
}

export interface Pond {
  id: number;
  pondName: string;
  location: string;
  pondStatus: PondStatus;
  capacityLiters: number;
  depthMeters: number;
  lengthMeters: number;
  widthMeters: number;
  createdAt: string;
  pondTypeId: number;
  // pondTypeName: string;
  areaId: number;
  // areaName: string;
}

export interface PondRequest {
  areaId: number;
  pondName: string;
  pondTypeId: number;
  location: string;
  pondStatus: PondStatus;
  capacityLiters: number;
  depthMeters: number;
  lengthMeters: number;
  widthMeters: number;
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

export const pondServices = {
  // Get all ponds with pagination
  getAllPonds: async (
    pageIndex: number,
    pageSize: number
  ): Promise<PondListResponse> => {
    const response = await apiService.get<PondListResponse>(
      `/api/pond?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
    return response.data;
  },

  // Get pond by ID
  getPondById: async (id: number): Promise<PondResponse> => {
    const response = await apiService.get<PondResponse>(`/api/pond/${id}`);
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
