import apiService from '../apiClient';

export interface Area {
  id: number;
  name: string;
  totalAreaSQM: number;
  description: string;
}

export interface AreaRequest {
  name: string;
  totalAreaSQM: number;
  description: string;
}

export interface AreaListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Area[];
}

export interface AreaResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Area;
}

export const areaServices = {
  // Fetch all areas
  getAllAreas: async (): Promise<AreaListResponse> => {
    const response = await apiService.get<AreaListResponse>('/api/area');
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
