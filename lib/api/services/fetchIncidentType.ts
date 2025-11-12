import apiService, { RequestParams } from '../apiClient';

export enum IncidentSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface IncidentType {
  id: number;
  name: string;
  description: string;
  defaultSeverity: IncidentSeverity;
  requiresQuarantine: boolean;
  affectsBreeding: boolean;
}

export interface IncidentTypeSearchParams {
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface IncidentTypePagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: IncidentType[];
}

export interface IncidentTypeListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: IncidentTypePagination;
}

export interface IncidentTypeResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: IncidentType;
}

// Convert IncidentTypeSearchParams to RequestParams
export const convertIncidentTypeFilter = (
  filters?: IncidentTypeSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const incidentTypeServices = {
  // Get all incident types with pagination
  getAllIncidentTypes: async (
    filters?: IncidentTypeSearchParams
  ): Promise<IncidentTypeListResponse> => {
    const params = convertIncidentTypeFilter(filters);

    const response = await apiService.get<IncidentTypeListResponse>(
      `/api/IncidentType`,
      params
    );
    return response.data;
  },

  // Get incident type by ID
  getIncidentTypeById: async (id: number): Promise<IncidentTypeResponse> => {
    const response = await apiService.get<IncidentTypeResponse>(
      `/api/IncidentType/${id}`
    );
    return response.data;
  },

  // Create a new incident type
  createIncidentType: async (
    incidentType: Omit<IncidentType, 'id'>
  ): Promise<IncidentTypeResponse> => {
    const response = await apiService.post<
      IncidentTypeResponse,
      Omit<IncidentType, 'id'>
    >('/api/IncidentType', incidentType);
    return response.data;
  },

  // Update an existing incident type
  updateIncidentType: async (
    id: number,
    incidentType: Omit<IncidentType, 'id'>
  ): Promise<IncidentTypeResponse> => {
    const response = await apiService.put<
      IncidentTypeResponse,
      Omit<IncidentType, 'id'>
    >(`/api/IncidentType/${id}`, incidentType);
    return response.data;
  },

  // Delete an incident type
  deleteIncidentType: async (id: number): Promise<IncidentTypeResponse> => {
    const response = await apiService.delete<IncidentTypeResponse>(
      `/api/IncidentType/${id}`
    );
    return response.data;
  },
};
