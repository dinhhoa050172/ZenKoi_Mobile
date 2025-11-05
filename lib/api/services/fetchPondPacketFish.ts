import apiService, { RequestParams } from '../apiClient';
import { PacketFish } from './fetchPacketFish';

export interface Pond {
  id: number;
  pondName: string;
}

export interface BreedingProcess {
  id: number;
  code: string;
}

export interface PondPacketFish {
  id: number;
  quantityPacket: number;
  quantityFish: number;
  pondId: number;
  packetFishId: number;
  breedingProcessId: number;
  pond: Pond;
  breedingProcess: BreedingProcess;
  packetFish: PacketFish;
}

export interface PondPacketFishSearchParams {
  breedingProcessId?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface PondPacketFishRequest {
  pondId: number;
  packetFishId: number;
  breedingProcessId: number;
}

export interface PondPacketFishUpdateTransferRequest {
  pondId: number;
}

export interface PondPacketFishPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: PondPacketFish[];
}

export interface PondPacketFishListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: PondPacketFishPagination;
}

export interface PondPacketFishResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: PondPacketFish;
}

// Convert PondPacketFishSearchParams to RequestParams
export const convertPondPacketFishFilter = (
  filters?: PondPacketFishSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.breedingProcessId)
    params.breedingProcessId = filters.breedingProcessId;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const pondPacketFishServices = {
  // Get list of PondPacketFish with filters
  getAllPondPacketFishes: async (
    filters?: PondPacketFishSearchParams
  ): Promise<PondPacketFishListResponse> => {
    const params = convertPondPacketFishFilter(filters);

    const response = await apiService.get<PondPacketFishListResponse>(
      `/api/pondpacketfish`,
      params
    );
    return response.data;
  },

  // Get PondPacketFish by ID
  getPondPacketFishById: async (
    id: number
  ): Promise<PondPacketFishResponse> => {
    const response = await apiService.get<PondPacketFishResponse>(
      `/api/pondpacketfish/${id}`
    );
    return response.data;
  },

  // Create a new PondPacketFish
  createPondPacketFish: async (
    data: PondPacketFishRequest
  ): Promise<PondPacketFishResponse> => {
    const response = await apiService.post<
      PondPacketFishResponse,
      PondPacketFishRequest
    >(`/api/pondpacketfish`, data);
    return response.data;
  },

  // Update an existing PondPacketFish
  updatePondPacketFish: async (
    id: number,
    data: PondPacketFishUpdateTransferRequest
  ): Promise<PondPacketFishResponse> => {
    const response = await apiService.put<
      PondPacketFishResponse,
      PondPacketFishUpdateTransferRequest
    >(`/api/pondpacketfish/${id}/transfer`, data);
    return response.data;
  },

  // Delete a PondPacketFish by ID
  deletePondPacketFish: async (id: number): Promise<PondPacketFishResponse> => {
    const response = await apiService.delete<PondPacketFishResponse>(
      `/api/pondpacketfish/${id}`
    );
    return response.data;
  },
};
