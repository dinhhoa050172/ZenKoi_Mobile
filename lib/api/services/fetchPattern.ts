import apiService from '../apiClient';

export interface Pattern {
  id: number;
  patternName: string;
  description: string;
}

export interface PatternRequest {
  patternName: string;
  description: string;
}

export interface PatternAssignRequest {
  patternId: number;
  varietyId: number;
}

export interface PatternPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: Pattern[];
}

export interface PatternPaginationResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: PatternPagination;
}

export interface PatternResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Pattern;
}

export const patternServices = {
  // Get list of patterns with pagination
  getAllPatterns: async (
    pageIndex: number,
    pageSize: number
  ): Promise<PatternPaginationResponse> => {
    const response = await apiService.get<PatternPaginationResponse>(
      `/api/pattern?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
    return response.data;
  },

  // Get pattern by ID
  getPatternById: async (id: number): Promise<PatternResponse> => {
    const response = await apiService.get<PatternResponse>(
      `/api/pattern/${id}`
    );
    return response.data;
  },

  // Get pattern by variety ID
  getPatternByVarietyId: async (
    varietyId: number
  ): Promise<PatternPaginationResponse> => {
    const response = await apiService.get<PatternPaginationResponse>(
      `/api/pattern/by-variety/${varietyId}`
    );
    return response.data;
  },

  // Create a new pattern
  createPattern: async (data: PatternRequest): Promise<PatternResponse> => {
    const response = await apiService.post<PatternResponse, PatternRequest>(
      '/api/pattern',
      data
    );
    return response.data;
  },

  // Update an existing pattern
  updatePattern: async (
    id: number,
    data: PatternRequest
  ): Promise<PatternResponse> => {
    const response = await apiService.put<PatternResponse, PatternRequest>(
      `/api/pattern/${id}`,
      data
    );
    return response.data;
  },

  // Delete a pattern
  deletePattern: async (id: number): Promise<PatternResponse> => {
    const response = await apiService.delete<PatternResponse>(
      `/api/pattern/${id}`
    );
    return response.data;
  },

  // Assign pattern to variety
  assignPatternToVariety: async (
    data: PatternAssignRequest
  ): Promise<PatternResponse> => {
    const response = await apiService.post<
      PatternResponse,
      PatternAssignRequest
    >(`/api/pattern/assign`, data);
    return response.data;
  },

  // Remove pattern from variety
  removePatternFromVariety: async (
    data: PatternAssignRequest
  ): Promise<PatternResponse> => {
    const response = await apiService.delete<
      PatternResponse,
      PatternAssignRequest
    >(`/api/pattern/remove`, data);
    return response.data;
  },
};
