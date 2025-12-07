import apiService, { RequestParams } from '../apiClient';
import { FishSize } from './fetchKoiFish';

export interface PacketFishVariety {
  id: number;
  varietyId: string;
  varietyName: string;
  packetFishId: number;
  packetFishName: string;
}

export interface PacketFish {
  id: number;
  name: string;
  description: string;
  fishPerPacket: number;
  pricePerPacket: number;
  stockQuantity: number;
  size: string;
  ageMonths: number;
  images: string[];
  videos: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string | null;
  varietyPacketFishes: PacketFishVariety[];
}

export interface PacketFishSearchParams {
  search?: string;
  minSize?: number;
  maxSize?: number;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minAgeMonths?: number;
  maxAgeMonths?: number;
  minQuantity?: number;
  maxQuantity?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface PacketFishRequest {
  name: string;
  description: string;
  minSize: number;
  maxSize: number;
  fishPerPacket: number;
  pricePerPacket: number;
  birthDate: string;
  varietyIds: number[];
  images: string[];
  videos: string[];
  isAvailable: boolean;
}

export interface PacketFishPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: PacketFish[];
}

export interface PacketFishListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: PacketFishPagination;
}

export interface PacketFishResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: PacketFish;
}

// Convert PacketFishSearchParams to RequestParams
export const convertPacketFishFilter = (
  filters?: PacketFishSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.minSize) params.minSize = filters.minSize;
  if (filters.maxSize) params.maxSize = filters.maxSize;
  if (filters.isAvailable !== undefined)
    params.isAvailable = filters.isAvailable;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters.minAgeMonths) params.minAgeMonths = filters.minAgeMonths;
  if (filters.maxAgeMonths) params.maxAgeMonths = filters.maxAgeMonths;
  if (filters.minQuantity) params.minQuantity = filters.minQuantity;
  if (filters.maxQuantity) params.maxQuantity = filters.maxQuantity;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const packetFishServices = {
  // Get list of Packet Fish with filters
  getPacketFishes: async (
    filters?: PacketFishSearchParams
  ): Promise<PacketFishListResponse> => {
    const params = convertPacketFishFilter(filters);

    const response = await apiService.get<PacketFishListResponse>(
      `/api/packetfish`,
      params
    );
    return response.data;
  },

  // Get Packet Fish by ID
  getPacketFishById: async (id: number): Promise<PacketFishResponse> => {
    const response = await apiService.get<PacketFishResponse>(
      `/api/packetfish/${id}`
    );
    return response.data;
  },

  // Create a new Packet Fish
  createPacketFish: async (
    data: PacketFishRequest
  ): Promise<PacketFishResponse> => {
    const response = await apiService.post<
      PacketFishResponse,
      PacketFishRequest
    >(`/api/packetfish`, data);
    return response.data;
  },

  // Update an existing Packet Fish
  updatePacketFish: async (
    id: number,
    data: PacketFishRequest
  ): Promise<PacketFishResponse> => {
    const response = await apiService.put<
      PacketFishResponse,
      PacketFishRequest
    >(`/api/packetfish/${id}`, data);
    return response.data;
  },

  // Delete a Packet Fish by ID
  deletePacketFish: async (id: number): Promise<PacketFishResponse> => {
    const response = await apiService.delete<PacketFishResponse>(
      `/api/packetfish/${id}`
    );
    return response.data;
  },

  // Get all Packet Fish with isAvailable = true
  getPacketFishesAvailable: async (): Promise<PacketFishListResponse> => {
    const response = await apiService.get<PacketFishListResponse>(
      `/api/packetfish/available`
    );
    return response.data;
  },

  // Get Packet Fish by size
  getPacketFishesBySize: async (
    size: FishSize
  ): Promise<PacketFishListResponse> => {
    const response = await apiService.get<PacketFishListResponse>(
      `/api/packetfish/by-size/${size}`
    );
    return response.data;
  },

  // Get Packet Fish by price range
  getPacketFishesByPriceRange: async (
    minPrice: number,
    maxPrice: number
  ): Promise<PacketFishListResponse> => {
    const response = await apiService.get<PacketFishListResponse>(
      `/api/packetfish/by-price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`
    );
    return response.data;
  },
};
