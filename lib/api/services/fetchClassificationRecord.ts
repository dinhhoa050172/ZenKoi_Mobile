import apiService, { RequestParams } from '../apiClient';

export interface ClassificationRecord {
  id: number;
  classificationStageId: number;
  stageName: string | null;
  highQualifiedCount: number;
  qualifiedCount: number;
  unqualifiedCount: number;
  notes: string | null;
}

export interface ClassificationRecordSearchParams {
  search?: string;
  classificationStageId?: number;
  minStageNumber?: number;
  maxStageNumber?: number;
  minHighQualifiedCount?: number;
  maxHighQualifiedCount?: number;
  minQualifiedCount?: number;
  maxQualifiedCount?: number;
  minUnqualifiedCount?: number;
  maxUnqualifiedCount?: number;
  createdFrom?: string;
  createdTo?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface ClassificationRecordRequest {
  classificationStageId: number;
  highQualifiedCount: number;
  qualifiedCount: number;
  unqualifiedCount: number;
  notes: string;
}

export interface ClassificationRecordPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: ClassificationRecord[];
}

export interface ClassificationRecordListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: ClassificationRecordPagination;
}

export interface ClassificationRecordResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: ClassificationRecord;
}

// Convert ClassificationRecordSearchParams to RequestParams
export const convertClassificationRecordFilter = (
  filters?: ClassificationRecordSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.classificationStageId)
    params.classificationStageId = filters.classificationStageId;
  if (filters.minStageNumber) params.minStageNumber = filters.minStageNumber;
  if (filters.maxStageNumber) params.maxStageNumber = filters.maxStageNumber;
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
  if (filters.createdFrom) params.createdFrom = filters.createdFrom;
  if (filters.createdTo) params.createdTo = filters.createdTo;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const classificationRecordServices = {
  // Get all classification records with pagination
  getAllClassificationRecords: async (
    filters?: ClassificationRecordSearchParams
  ): Promise<ClassificationRecordListResponse> => {
    const params = convertClassificationRecordFilter(filters);

    const response = await apiService.get<ClassificationRecordListResponse>(
      `/api/classificationrecord`,
      params
    );
    return response.data;
  },

  // Get classification record by ID
  getClassificationRecordById: async (
    id: number
  ): Promise<ClassificationRecordResponse> => {
    const response = await apiService.get<ClassificationRecordResponse>(
      `/api/classificationrecord/${id}`
    );
    return response.data;
  },

  // Create new classification record
  createClassificationRecord: async (
    data: ClassificationRecordRequest
  ): Promise<ClassificationRecordResponse> => {
    const response = await apiService.post<
      ClassificationRecordResponse,
      ClassificationRecordRequest
    >('/api/classificationrecord', data);
    return response.data;
  },

  // Update existing classification record
  updateClassificationRecord: async (
    id: number,
    data: ClassificationRecordRequest
  ): Promise<ClassificationRecordResponse> => {
    const response = await apiService.put<
      ClassificationRecordResponse,
      ClassificationRecordRequest
    >(`/api/classificationrecord/${id}`, data);
    return response.data;
  },

  // Delete classification record by ID
  deleteClassificationRecord: async (
    id: number
  ): Promise<ClassificationRecordResponse> => {
    const response = await apiService.delete<ClassificationRecordResponse>(
      `/api/classificationrecord/${id}`
    );
    return response.data;
  },
};
