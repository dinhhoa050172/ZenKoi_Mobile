import apiService, { RequestParams } from '../apiClient';

export enum TypeOfPond {
  PARING = 'Paring',
  EGG_BATCH = 'EggBatch',
  FRY_FISH = 'FryFish',
  CLASSIFICATION = 'Classification',
  MARKET_POND = 'MarketPond',
  BROOD_STOCK = 'BroodStock',
}

export interface PondType {
  id: number;
  typeName: string;
  description: string;
  type: TypeOfPond;
  recommendedQuantity: number;
}

export interface PondTypeSearchParams {
  search?: string;
  type?: TypeOfPond;
  minRecommendedQuantity?: number;
  maxRecommendedQuantity?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface PondTypeRequest {
  typeName: string;
  description: string;
  type: TypeOfPond;
  recommendedQuantity: number;
}

export interface PondTypePagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: PondType[];
}

export interface PondTypeListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: PondTypePagination;
}

export interface PondTypeResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: PondType;
}

// Convert PondTypeSearchParams to RequestParams
export const convertPondTypeFilter = (
  filters?: PondTypeSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.type) params.type = filters.type;
  if (filters.minRecommendedQuantity)
    params.minRecommendedQuantity = filters.minRecommendedQuantity;
  if (filters.maxRecommendedQuantity)
    params.maxRecommendedQuantity = filters.maxRecommendedQuantity;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const pondTypeServices = {
  // Get all pond types
  getAllPondType: async (
    filters?: PondTypeSearchParams
  ): Promise<PondTypeListResponse> => {
    const params = convertPondTypeFilter(filters);

    const response = await apiService.get<PondTypeListResponse>(
      '/api/pondtype',
      params
    );
    return response.data;
  },

  // Get pond type by ID
  getPondTypeById: async (id: number): Promise<PondTypeResponse> => {
    const response = await apiService.get<PondTypeResponse>(
      `/api/pondtype/${id}`
    );
    return response.data;
  },

  // Create a new pond type
  createPondType: async (
    pondType: PondTypeRequest
  ): Promise<PondTypeResponse> => {
    const response = await apiService.post<PondTypeResponse, PondTypeRequest>(
      '/api/pondtype',
      pondType
    );
    return response.data;
  },

  // Update an existing pond type
  updatePondType: async (
    id: number,
    pondType: PondTypeRequest
  ): Promise<PondTypeResponse> => {
    const response = await apiService.put<PondTypeResponse, PondTypeRequest>(
      `/api/pondtype/${id}`,
      pondType
    );
    return response.data;
  },

  // Delete a pond type
  deletePondType: async (id: number): Promise<PondTypeResponse> => {
    const response = await apiService.delete<PondTypeResponse>(
      `/api/pondtype/${id}`
    );
    return response.data;
  },
};
