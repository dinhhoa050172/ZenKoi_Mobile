import apiService from '../apiClient';

export interface Variety {
  id: number;
  varietyName: string;
  characteristic: string;
  originCountry: string;
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

export const varietyServices = {
  // Get all varieties with pagination
  getAllVarieties: async (
    pageIndex: number,
    pageSize: number
  ): Promise<VarietyListResponse> => {
    const response = await apiService.get<VarietyListResponse>(
      `/variety?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
    return response.data;
  },

  // Get variety by ID
  getVarietyById: async (id: number): Promise<VarietyResponse> => {
    const response = await apiService.get<VarietyResponse>(`/variety/${id}`);
    return response.data;
  },

  // Create a new variety
  createVariety: async (variety: VarietyRequest): Promise<VarietyResponse> => {
    const response = await apiService.post<VarietyResponse, VarietyRequest>(
      '/variety',
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
      `/variety/${id}`,
      variety
    );
    return response.data;
  },

  // Delete a variety by ID
  deleteVariety: async (id: number): Promise<VarietyResponse> => {
    const response = await apiService.delete<VarietyResponse>(`/variety/${id}`);
    return response.data;
  },
};
