import apiService, { RequestParams } from '../apiClient';

export interface Area {
  id: number;
  areaName: string;
  totalAreaSQM: number;
  description: string;
}

export interface AreaSearchParams {
  search?: string;
  minTotalAreaSQM?: number;
  maxTotalAreaSQM?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface AreaRequest {
  name: string;
  totalAreaSQM: number;
  description: string;
}

export interface AreaPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: Area[];
}

export interface AreaListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: AreaPagination;
}

export interface AreaResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Area;
}

// Convert AreaSearchParams to RequestParams
export const convertAreaFilter = (
  filters?: AreaSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.minTotalAreaSQM) params.minTotalAreaSQM = filters.minTotalAreaSQM;
  if (filters.maxTotalAreaSQM) params.maxTotalAreaSQM = filters.maxTotalAreaSQM;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const areaServices = {
  // Fetch all areas
  getAllAreas: async (
    filters?: AreaSearchParams
  ): Promise<AreaListResponse> => {
    const params = convertAreaFilter(filters);

    const response = await apiService.get<AreaListResponse>(
      '/api/area',
      params
    );
    return response.data;
  },

  // Fetch area by ID
  getAreaById: async (id: number): Promise<AreaResponse> => {
    const response = await apiService.get<AreaResponse>(`/api/area/${id}`);
    return response.data;
  },

  // Create a new area
  createArea: async (area: AreaRequest): Promise<AreaResponse> => {
    const response = await apiService.post<AreaResponse, AreaRequest>(
      '/api/area',
      area
    );
    return response.data;
  },

  // Update an existing area
  updateArea: async (id: number, area: AreaRequest): Promise<AreaResponse> => {
    const response = await apiService.put<AreaResponse, AreaRequest>(
      `/api/area/${id}`,
      area
    );
    return response.data;
  },

  // Delete an area
  deleteArea: async (id: number): Promise<AreaResponse> => {
    const response = await apiService.delete<AreaResponse>(`/api/area/${id}`);
    return response.data;
  },
};
