import apiService, { RequestParams } from '../apiClient';
import { ClassificationStatus } from './fetchClassificationStage';
import { EggBatchStatus } from './fetchEggBatch';
import { FryFishStatus } from './fetchFryFish';
import { KoiFish } from './fetchKoiFish';

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
  code: string;
  maleKoiId: number;
  maleKoiRFID: string;
  maleKoiVariety: string;
  femaleKoiId: number;
  femaleKoiRFID: string;
  femaleKoiVariety: string;
  pondId: number;
  pondName: string;
  startDate: string;
  endDate: string | null;
  status: BreedingStatus;
  result: BreedingResult;
  note: string | null;
  totalFishQualified: number;
  totalPackage: number;
  totalEggs: number;
  fertilizationRate: number;
  currentSurvivalRate: number | null;
  koiFishes: number[];
}

export interface BreedingProcessSearchParams {
  search?: string;
  maleKoiId?: number;
  femaleKoiId?: number;
  pondId?: number;
  code?: string;
  status?: BreedingStatus;
  result?: BreedingResult;
  minTotalFishQualified?: number;
  maxTotalFishQualified?: number;
  minTotalPackage?: number;
  maxTotalPackage?: number;
  minTotalEggs?: number;
  maxTotalEggs?: number;
  minFertilizationRate?: number;
  maxFertilizationRate?: number;
  minCurrentSurvivalRate?: number;
  maxCurrentSurvivalRate?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  pageIndex?: number;
  pageSize?: number;
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

export interface IncubationDailyReordBreeding {
  id: number;
  eggBatchId: number;
  dayNumber: string;
  healthyEggs: number;
  rottenEggs: number;
  hatchedEggs: number;
  success: boolean;
}

export interface EggBatchBreeding {
  id: number;
  breedingProcessId: number;
  quantity: number;
  fertilizationRate: number;
  status: EggBatchStatus;
  hatchingTime: string | null;
  spawnDate: string;
  endDate?: string;
  incubationDailyRecords: IncubationDailyReordBreeding[];
}

export interface FrySurvivalRecordsBreeding {
  id: number;
  fryFishId: number;
  dayNumber: string;
  survivalRate: number;
  countAlive: number;
  note: string | null;
  initialCount: number | null;
  createdAt: string;
}

export interface FryFishBreeding {
  id: number;
  breedingProcessId: number;
  initialCount: number;
  status: FryFishStatus;
  currentSurvivalRate: number;
  startDate: string;
  endDate?: string;
  frySurvivalRecords: FrySurvivalRecordsBreeding[];
}

export interface ClassificationRecordBreeding {
  id: number;
  classificationStageId: number;
  stageNumber: string | null;
  highQualifiedCount: number | null;
  showQualifiedCount: number | null;
  pondQualifiedCount: number | null;
  cullQualifiedCount: number | null;
  notes: string | null;
}

export interface ClassificationStageBreeding {
  id: number;
  breedingProcessId: number;
  totalCount: number;
  status: ClassificationStatus;
  highQualifiedCount: number | null;
  showQualifiedCount: number | null;
  pondQualifiedCount: number | null;
  cullQualifiedCount: number | null;
  notes: string | null;
  startDate: string;
  endDate?: string;
  classificationRecords: ClassificationRecordBreeding[];
}

export interface BreedingProcessDetail {
  id: number;
  code: string;
  maleKoiId: number;
  maleKoiRFID: string;
  maleKoiVariety: string;
  femaleKoiId: number;
  femaleKoiRFID: string;
  femaleKoiVariety: string;
  pondId: number;
  pondName: string;
  startDate: string;
  endDate: string | null;
  status: BreedingStatus;
  result: BreedingResult;
  note: string;
  totalFishQualified: number;
  totalPackage: number;
  totalEggs: number;
  fertilizationRate: number;
  currentSurvivalRate: number | null;
  koiFishes: KoiFish[];
  batch: EggBatchBreeding | null;
  fryFish: FryFishBreeding | null;
  classificationStage: ClassificationStageBreeding | null;
}

export interface BreedingProcessDetailResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: BreedingProcessDetail;
}

export interface ListKoiFishByBreedingProcessResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: KoiFish[];
}

// Convert BreedingProcessSearchParams to RequestParams
export const convertBreedingProcessFilter = (
  filters?: BreedingProcessSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.maleKoiId) params.maleKoiId = filters.maleKoiId;
  if (filters.femaleKoiId) params.femaleKoiId = filters.femaleKoiId;
  if (filters.pondId) params.pondId = filters.pondId;
  if (filters.code) params.code = filters.code;
  if (filters.status) params.status = filters.status;
  if (filters.result) params.result = filters.result;
  if (filters.minTotalFishQualified)
    params.minTotalFishQualified = filters.minTotalFishQualified;
  if (filters.maxTotalFishQualified)
    params.maxTotalFishQualified = filters.maxTotalFishQualified;
  if (filters.minTotalPackage) params.minTotalPackage = filters.minTotalPackage;
  if (filters.maxTotalPackage) params.maxTotalPackage = filters.maxTotalPackage;
  if (filters.minTotalEggs) params.minTotalEggs = filters.minTotalEggs;
  if (filters.maxTotalEggs) params.maxTotalEggs = filters.maxTotalEggs;
  if (filters.minFertilizationRate)
    params.minFertilizationRate = filters.minFertilizationRate;
  if (filters.maxFertilizationRate)
    params.maxFertilizationRate = filters.maxFertilizationRate;
  if (filters.minCurrentSurvivalRate)
    params.minCurrentSurvivalRate = filters.minCurrentSurvivalRate;
  if (filters.maxCurrentSurvivalRate)
    params.maxCurrentSurvivalRate = filters.maxCurrentSurvivalRate;
  if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
  if (filters.startDateTo) params.startDateTo = filters.startDateTo;
  if (filters.endDateFrom) params.endDateFrom = filters.endDateFrom;
  if (filters.endDateTo) params.endDateTo = filters.endDateTo;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const breedingProcessServices = {
  // Get all breeding processes
  getAllBreedingProcesses: async (
    filters?: BreedingProcessSearchParams
  ): Promise<BreedingProcessListResponse> => {
    const params = convertBreedingProcessFilter(filters);

    const response = await apiService.get<BreedingProcessListResponse>(
      `/api/breedingprocess`,
      params
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

  // Get breeding process detail all information by ID
  getBreedingProcessDetailById: async (
    id: number
  ): Promise<BreedingProcessDetailResponse> => {
    const response = await apiService.get<BreedingProcessDetailResponse>(
      `/api/breedingprocess/detail/${id}`
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

  // Change breeding process status from Pairing to Spawned
  markAsSpawned: async (id: number): Promise<BreedingProcessResponse> => {
    const response = await apiService.put<BreedingProcessResponse>(
      `/api/breedingprocess/spawned/${id}`
    );
    return response.data;
  },

  // Change breeding process status to Cancel
  markAsCancelled: async (id: number): Promise<BreedingProcessResponse> => {
    const response = await apiService.put<BreedingProcessResponse>(
      `/api/breedingprocess/cancel/${id}`
    );
    return response.data;
  },

  // Get list of Koi fish by breeding process ID
  getKoiFishByBreedingProcessId: async (
    breedingProcessId: number
  ): Promise<ListKoiFishByBreedingProcessResponse> => {
    const response = await apiService.get<ListKoiFishByBreedingProcessResponse>(
      `/api/breedingprocess/${breedingProcessId}/koi-fishes`
    );
    return response.data;
  },
};
