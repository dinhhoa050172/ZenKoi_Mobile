import apiService from '../apiClient';
import { ClassificationRecord } from './fetchClassificationRecord';

export enum ClassificationStatus {
  PREPARING = 'Preparing',
  STAGE1 = 'Stage1',
  STAGE2 = 'Stage2',
  STAGE3 = 'Stage3',
  SUCCESS = 'Success',
}

export interface ClassificationStage {
  id: number;
  breedingProcessId: number;
  pondId: number;
  pondName: string;
  totalCount: number;
  status: ClassificationStatus;
  notes: string;
  classificationRecords: ClassificationRecord[];
}

export interface ClassificationStageRequest {
  breedingProcessId: number;
  pondId: number;
  totalCount: number;
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

export const classificationStageServices = {
  // Get all classification stages with pagination
  getAllClassificationStages: async (
    pageIndex: number,
    pageSize: number
  ): Promise<ClassificationStageListResponse> => {
    const response = await apiService.get<ClassificationStageListResponse>(
      `/api/classificationstage?pageIndex=${pageIndex}&pageSize=${pageSize}`
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
};
