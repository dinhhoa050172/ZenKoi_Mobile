import apiService from '../apiClient';

export enum BreedingStatus {
  PAIRING = 'Pairing',
  SPAWNED = 'Spawned',
  EGG_BATCH = 'EggBatch',
  FRY_FISH = 'FryFish',
  CLASSIFICATION = 'Classification',
  COMPLETE = 'Complete',
  FAILED = 'Failed',
}

export enum BreedingResult {
  UNKNOWN = 'Unknown',
  SUCCESS = 'Success',
  FAILED = 'Failed',
  PARTIAL_SUCCESS = 'PartialSuccess',
}

export interface BreedingProcess {
  id: number;
  maleKoiId: number;
  maleKoiName: string;
  femaleKoiId: number;
  femaleKoiName: string;
  pondId: number;
  pondName: string;
  startDate: string;
  status: BreedingStatus;
  result: BreedingResult;
  koiFishes: number[];
}

export interface BreedingProcessRequest {
  maleKoiId: number;
  femaleKoiId: number;
  pondId: number;
}

export interface BreedingProcessPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: BreedingProcess[];
}

export interface BreedingProcessListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: BreedingProcessPagination;
}

export interface BreedingProcessResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: BreedingProcess;
}

export interface InbreedingLevel {
  maleKoiId: number;
  femaleKoiId: number;
  inbreedingCoefficient: number;
}

export interface InbreedingLevelResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: InbreedingLevel;
}

export const breedingProcessServices = {
  // Get all breeding processes
  getAllBreedingProcesses: async (
    pageIndex: number,
    pageSize: number
  ): Promise<BreedingProcessListResponse> => {
    const response = await apiService.get<BreedingProcessListResponse>(
      `/api/breedingprocess?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
    return response.data;
  },

  // Get breeding process by ID
  getBreedingProcessById: async (
    id: number
  ): Promise<BreedingProcessResponse> => {
    const response = await apiService.get<BreedingProcessResponse>(
      `/api/breedingprocess/${id}`
    );
    return response.data;
  },

  // Create a new breeding process
  createBreedingProcess: async (
    breedingProcess: BreedingProcessRequest
  ): Promise<BreedingProcessResponse> => {
    const response = await apiService.post<
      BreedingProcessResponse,
      BreedingProcessRequest
    >('/api/breedingprocess', breedingProcess);
    return response.data;
  },

  // Check the inbreeding level of a Koi pair
  checkInbreedingLevel: async (
    maleId: number,
    femaleId: number
  ): Promise<InbreedingLevelResponse> => {
    const response = await apiService.get<InbreedingLevelResponse>(
      `/api/breedingprocess/offspring?maleId=${maleId}&femaleId=${femaleId}`
    );
    return response.data;
  },
};
