import apiService, { RequestParams } from '../apiClient';

export interface Variety {
  id: number;
  varietyName: string;
  characteristic: string;
  originCountry: string;
}

export interface VarietySearchParams {
  search?: string;
  originCountry?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface VarietyRequest {
  varietyName: string;
  characteristic: string;
  originCountry: string;
}

export interface VarietyPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: Variety[];
}

export interface VarietyListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: VarietyPagination;
}

export interface VarietyResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Variety;
}

// Convert VarietySearchParams to RequestParams
export const convertVarietyFilter = (
  filters?: VarietySearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.originCountry) params.originCountry = filters.originCountry;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const varietyServices = {
  // Get all varieties with pagination
  getAllVarieties: async (
    filters: VarietySearchParams
  ): Promise<VarietyListResponse> => {
    const params = convertVarietyFilter(filters);

    const response = await apiService.get<VarietyListResponse>(
      `/api/variety`,
      params
    );
    return response.data;
  },

  // Get variety by ID
  getVarietyById: async (id: number): Promise<VarietyResponse> => {
    const response = await apiService.get<VarietyResponse>(
      `/api/variety/${id}`
    );
    return response.data;
  },

  // Create a new variety
  createVariety: async (variety: VarietyRequest): Promise<VarietyResponse> => {
    const response = await apiService.post<VarietyResponse, VarietyRequest>(
      `/api/variety`,
      variety
    );
    return response.data;
  },

  // Update an existing variety
  updateVariety: async (
    id: number,
    variety: VarietyRequest
  ): Promise<VarietyResponse> => {
    const response = await apiService.put<VarietyResponse, VarietyRequest>(
      `/api/variety/${id}`,
      variety
    );
    return response.data;
  },

  // Delete a variety by ID
  deleteVariety: async (id: number): Promise<VarietyResponse> => {
    const response = await apiService.delete<VarietyResponse>(
      `/api/variety/${id}`
    );
    return response.data;
  },
};
