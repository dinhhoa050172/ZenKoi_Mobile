import apiService from '../apiClient';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum HealthStatus {
  HEALTHY = 'Healthy',
  WARNING = 'Warning',
  SICK = 'Sick',
  DEAD = 'Dead',
}

export enum FishSize {
  UNDER10CM = 'Under10cm', // Dưới 10 cm
  FROM10TO20CM = 'From10To20cm', // 10 - 20 cm
  FROM21TO30CM = 'From21To30cm', // 21 - 30 cm
  FROM31TO40CM = 'From31To40cm', // 31 - 40 cm
  OVER40CM = 'Over40cm', // Trên 40 cm
}

export interface KoiFish {
  id: number;
  rfid: string;
  size: FishSize;
  birthDate: string;
  gender: Gender;
  healthStatus: HealthStatus;
  imagesVideos: string[];
  sellingPrice: number;
  bodyShape: string;
  description: string;
  createdAt: string;
  pond: {
    id: number;
    pondName: string;
  };
  variety: {
    id: number;
    varietyName: string;
  };
}

export interface KoiFishRequest {
  pondId: number;
  varietyId: number;
  breedingProcessId: number | null;
  rfid: string;
  size: FishSize;
  birthDate: string;
  gender: Gender;
  healthStatus: HealthStatus;
  imagesVideos: string[];
  sellingPrice: number;
  bodyShape: string;
  description: string;
}

export interface KoiFishPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: KoiFish[];
}

export interface KoiFishListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: KoiFishPagination;
}

export interface KoiFishResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: KoiFish;
}

export const koiFishServices = {
  // Get all koi fish with pagination
  getAllKoiFish: async (
    pageIndex: number,
    pageSize: number
  ): Promise<KoiFishListResponse> => {
    const response = await apiService.get<KoiFishListResponse>(
      `/api/koifish?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
    return response.data;
  },

  // Get koi fish by ID
  getKoiFishById: async (id: number): Promise<KoiFishResponse> => {
    const response = await apiService.get<KoiFishResponse>(
      `/api/koifish/${id}`
    );
    return response.data;
  },

  // Create a new koi fish
  createKoiFish: async (data: KoiFishRequest): Promise<KoiFishResponse> => {
    const response = await apiService.post<KoiFishResponse, KoiFishRequest>(
      '/api/koifish',
      data
    );
    return response.data;
  },

  // Update an existing koi fish
  updateKoiFish: async (
    id: number,
    data: KoiFishRequest
  ): Promise<KoiFishResponse> => {
    const response = await apiService.put<KoiFishResponse, KoiFishRequest>(
      `/api/koifish/${id}`,
      data
    );
    return response.data;
  },

  // Delete a koi fish
  deleteKoiFish: async (id: number): Promise<KoiFishResponse> => {
    const response = await apiService.delete<KoiFishResponse>(
      `/api/koifish/${id}`
    );
    return response.data;
  },
};
