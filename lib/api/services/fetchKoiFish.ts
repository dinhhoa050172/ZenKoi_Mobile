import apiService, { RequestParams } from '../apiClient';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum HealthStatus {
  HEALTHY = 'Healthy',
  WARNING = 'Warning',
  WEAK = 'Weak',
  SICK = 'Sick',
  DEAD = 'Dead',
}

export enum FishSize {
  UNDER10CM = 'Under10cm', // Dưới 10 cm
  FROM10TO20CM = 'From10To20cm', // 10 - 20 cm
  FROM21TO25CM = 'From21To25cm', // 21 - 25 cm
  FROM26TO30CM = 'From26To30cm', // 26 - 30 cm
  FROM31TO40CM = 'From31To40cm', // 31 - 40 cm
  FROM41TO45CM = 'From41To45cm', // 41 - 45 cm
  FROM46TO50CM = 'From46To50cm', // 46 - 50 cm
  OVER50CM = 'Over50cm', // Trên 50 cm
}

// export enum KoiPatternType {
//   NONE = 'None', // Không xác định
//   TANCHO = 'Tancho', // Đốm đỏ giữa đầu
//   MARUTEN = 'Maruten', // Đốm đầu + thân
//   NIDAN = 'Nidan', // 2 đốm đỏ
//   SANDAN = 'Sandan', // 3 đốm đỏ
//   INAZUMA = 'Inazuma', // Dải đỏ hình tia sét
//   STRAIGHT_HI = 'StraightHi', // Dải đỏ liền thân
//   MENKABURI = 'Menkaburi', // Đầu đỏ toàn phần
//   BOZU = 'Bozu', // Đầu trắng
// }

export enum KoiType {
  HIGH = 'High',
  SHOW = 'Show',
}

export enum SaleStatus {
  NOT_FOR_SALE = 'NotForSale', // Không bán
  AVAILABLE = 'Available', // Có sẵn
  SOLD = 'Sold', // Đã bán
}

// export enum MutationType {
//   NONE = 'None',
//   DOITSU = 'Doitsu', // Koi không vảy
//   GINRIN = 'GinRin', // Vảy ánh kim
//   HIRENAGA = 'Hirenaga', // Đuôi dài (Butterfly Koi)
//   METALLIC = 'Metallic', // Ánh kim toàn thân
// }

export interface KoiFishSearchParams {
  search?: string;
  gender?: Gender;
  health?: HealthStatus;
  varietyId?: number;
  minSize?: number;
  maxSize?: number;
  saleStatus?: SaleStatus;
  pondId?: number;
  origin?: string;
  minPrice?: number;
  maxPrice?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface BreedingProcess {
  id: number;
  code: string;
}

export interface KoiFish {
  id: number;
  rfid: string;
  size: string;
  type: KoiType;
  birthDate: string;
  gender: Gender;
  healthStatus: HealthStatus;
  pattern: string | null;
  saleStatus: SaleStatus;
  images: string[];
  videos: string[];
  sellingPrice: number;
  description: string;
  origin: string | null;
  isMutated: boolean;
  mutationType: string | null;
  mutationRate: number;
  createdAt: string;
  updatedAt: string | null;
  pond: {
    id: number;
    pondName: string;
  };
  variety: {
    id: number;
    varietyName: string;
    characteristic: string;
    originCountry: string;
  };
  breedingProcess: BreedingProcess | null;
}

export interface KoiFishHealth {
  id: number;
  incidentId: number;
  koiFishId: number;
  koiFishRFID: string;
  affectedStatus: HealthStatus;
  specificSymptoms: string;
  requiresTreatment: boolean;
  isIsolated: boolean;
  affectedFrom: string;
  recoveredAt: string | null;
  treatmentNotes: string;
}

export interface KoiFishRequest {
  pondId: number;
  varietyId: number;
  breedingProcessId: number | null;
  rfid: string;
  size: number;
  type: KoiType;
  pattern: string | null;
  birthDate: string;
  gender: Gender;
  healthStatus: HealthStatus;
  saleStatus: SaleStatus;
  origin: string;
  images: string[];
  videos: string[];
  sellingPrice: number;
  description: string;
  isMutated: boolean;
  mutationType: string | null;
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

export interface KoiFishFamily {
  id: number;
  rfid: string;
  varietyName: string;
  gender: Gender;
  father: string | null;
  mother: string | null;
}

export interface KoiFishFamilyResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: KoiFishFamily;
}

export interface KoiFishHealthResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: KoiFishHealth[];
}

// Convert KoiFishSearchParams to RequestParams
export const convertKoiFishFilter = (
  filters?: KoiFishSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.gender) params.gender = filters.gender;
  if (filters.health) params.health = filters.health;
  if (filters.varietyId) params.varietyId = filters.varietyId;
  if (filters.minSize) params.minSize = filters.minSize;
  if (filters.maxSize) params.maxSize = filters.maxSize;
  if (filters.saleStatus) params.saleStatus = filters.saleStatus;
  if (filters.pondId) params.pondId = filters.pondId;
  if (filters.origin) params.origin = filters.origin;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const koiFishServices = {
  // Get all koi fish with pagination
  getAllKoiFish: async (
    filters?: KoiFishSearchParams
  ): Promise<KoiFishListResponse> => {
    const params = convertKoiFishFilter(filters);

    const response = await apiService.get<KoiFishListResponse>(
      `/api/koifish`,
      params
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

  // Get Koi Fish by RFID
  getKoiFishByRFID: async (rfid: string): Promise<KoiFishResponse> => {
    const response = await apiService.get<KoiFishResponse>(
      `/api/koifish/scan-rfid/${rfid}`
    );
    return response.data;
  },

  // Get koi fish family by ID
  getKoiFishFamilyById: async (id: number): Promise<KoiFishFamilyResponse> => {
    const response = await apiService.get<KoiFishFamilyResponse>(
      `/api/koifish/family/${id}`
    );
    return response.data;
  },

  // Get koi fish health records by koi fish ID
  getKoiFishHealthByKoiId: async (
    koiFishId: number
  ): Promise<KoiFishHealthResponse> => {
    const response = await apiService.get<KoiFishHealthResponse>(
      `/api/incident/koi/${koiFishId}/history`
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

  // Change pond of a koi fish
  changeKoiFishPond: async (
    id: number,
    pondId: number
  ): Promise<KoiFishResponse> => {
    const response = await apiService.put<KoiFishResponse>(
      `/api/koifish/${id}/transfer/${pondId}`
    );
    return response.data;
  },
};
