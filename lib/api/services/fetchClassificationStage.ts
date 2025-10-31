import apiService, { RequestParams } from '../apiClient';
import { ClassificationRecord } from './fetchClassificationRecord';

export enum ClassificationStatus {
  PREPARING = 'Preparing',
  STAGE1 = 'Stage1',
  STAGE2 = 'Stage2',
  STAGE3 = 'Stage3',
  STAGE4 = 'Stage4',
  SUCCESS = 'Success',
}

export interface ClassificationStage {
  id: number;
  breedingProcessId: number;
  totalCount: number;
  status: ClassificationStatus;
  highQualifiedCount: number;
  qualifiedCount: number;
  unqualifiedCount: number;
  notes: string;
  classificationRecords: ClassificationRecord[];
}

export interface ClassificationStageSearchParams {
  search?: string;
  breedingProcessId?: number;
  pondId?: number;
  status?: ClassificationStatus;
  minTitalCount?: number;
  maxTitalCount?: number;
  minHighQualifiedCount?: number;
  maxHighQualifiedCount?: number;
  minQualifiedCount?: number;
  maxQualifiedCount?: number;
  minUnqualifiedCount?: number;
  maxUnqualifiedCount?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface ClassificationStageRequest {
  breedingProcessId: number;
  pondId: number;
  notes: string;
}

export interface ClassificationStagePagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: ClassificationStage[];
}

export interface ClassificationStageListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: ClassificationStagePagination;
}

export interface ClassificationStageResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: ClassificationStage;
}

// Convert ClassificationStageSearchParams to RequestParams
export const convertClassificationStageFilter = (
  filters?: ClassificationStageSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.breedingProcessId)
    params.breedingProcessId = filters.breedingProcessId;
  if (filters.pondId) params.pondId = filters.pondId;
  if (filters.status) params.status = filters.status;
  if (filters.minTitalCount) params.minTitalCount = filters.minTitalCount;
  if (filters.maxTitalCount) params.maxTitalCount = filters.maxTitalCount;
  if (filters.minHighQualifiedCount)
    params.minHighQualifiedCount = filters.minHighQualifiedCount;
  if (filters.maxHighQualifiedCount)
    params.maxHighQualifiedCount = filters.maxHighQualifiedCount;
  if (filters.minQualifiedCount)
    params.minQualifiedCount = filters.minQualifiedCount;
  if (filters.maxQualifiedCount)
    params.maxQualifiedCount = filters.maxQualifiedCount;
  if (filters.minUnqualifiedCount)
    params.minUnqualifiedCount = filters.minUnqualifiedCount;
  if (filters.maxUnqualifiedCount)
    params.maxUnqualifiedCount = filters.maxUnqualifiedCount;
  if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
  if (filters.startDateTo) params.startDateTo = filters.startDateTo;
  if (filters.endDateFrom) params.endDateFrom = filters.endDateFrom;
  if (filters.endDateTo) params.endDateTo = filters.endDateTo;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const classificationStageServices = {
  // Get all classification stages with pagination
  getAllClassificationStages: async (
    filters?: ClassificationStageSearchParams
  ): Promise<ClassificationStageListResponse> => {
    const params = convertClassificationStageFilter(filters);

    const response = await apiService.get<ClassificationStageListResponse>(
      `/api/classificationstage`,
      params
    );
    return response.data;
  },

  // Get classification stage by ID
  getClassificationStageById: async (
    id: number
  ): Promise<ClassificationStageResponse> => {
    const response = await apiService.get<ClassificationStageResponse>(
      `/api/classificationstage/${id}`
    );
    return response.data;
  },

  // Get classification stage by breeding process ID
  getClassificationStageByBreedingProcessId: async (
    breedingProcessId: number
  ): Promise<ClassificationStageResponse> => {
    const response = await apiService.get<ClassificationStageResponse>(
      `/api/classificationstage/by-breeding/${breedingProcessId}`
    );
    return response.data;
  },

  // Create new classification stage
  createClassificationStage: async (
    data: ClassificationStageRequest
  ): Promise<ClassificationStageResponse> => {
    const response = await apiService.post<
      ClassificationStageResponse,
      ClassificationStageRequest
    >('/api/classificationstage', data);
    return response.data;
  },

  // Update existing classification stage
  updateClassificationStage: async (
    id: number,
    data: ClassificationStageRequest
  ): Promise<ClassificationStageResponse> => {
    const response = await apiService.put<
      ClassificationStageResponse,
      ClassificationStageRequest
    >(`/api/classificationstage/${id}`, data);
    return response.data;
  },

  // Delete classification stage by ID
  deleteClassificationStage: async (
    id: number
  ): Promise<ClassificationStageResponse> => {
    const response = await apiService.delete<ClassificationStageResponse>(
      `/api/classificationstage/${id}`
    );
    return response.data;
  },

  // Change classification stage status to completed
  completeClassificationStage: async (
    id: number
  ): Promise<ClassificationStageResponse> => {
    const response = await apiService.post<ClassificationStageResponse>(
      `/api/classificationstage/complete/${id}`
    );
    return response.data;
  },
};
