import apiService, { RequestParams } from '../apiClient';

export interface ClassificationRecord {
  id: number;
  classificationStageId: number;
  stageNumber: string | null;
  highQualifiedCount: number | null;
  showQualifiedCount: number | null;
  pondQualifiedCount: number | null;
  cullQualifiedCount: number | null;
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

export interface UpdateClassificationRecordRequest {
  highQualifiedCount: number;
  showQualifiedCount: number;
  pondQualifiedCount: number;
  cullQualifiedCount: number;
  notes: string;
}

export interface ClassificationRecordV1Request {
  classificationStageId: number;
  cullQualifiedCount: number;
  notes: string;
}

export interface ClassificationRecordV2Request {
  classificationStageId: number;
  highQualifiedCount: number;
  notes: string;
}

export interface ClassificationRecordV3Request {
  classificationStageId: number;
  showQualifiedCount: number;
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

export interface ClassificationRecordSummary {
  classificationStageId: number;
  currentFish: number;
  totalHighQualified: number;
  totalShowQualified: number;
  totalPondQualified: number;
  totalCullQualified: number;
}

export interface ClassificationRecordSummaryResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: ClassificationRecordSummary;
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

  // Get classification record summary
  getClassificationRecordSummary: async (
    classificationStageId: number
  ): Promise<ClassificationRecordSummaryResponse> => {
    const response = await apiService.get<ClassificationRecordSummaryResponse>(
      `/api/classificationrecord/summary/${classificationStageId}`
    );
    return response.data;
  },

  // Create new classification record - V1
  createClassificationRecordV1: async (
    data: ClassificationRecordV1Request
  ): Promise<ClassificationRecordResponse> => {
    const response = await apiService.post<
      ClassificationRecordResponse,
      ClassificationRecordV1Request
    >('/api/classificationrecord/create-v1', data);
    return response.data;
  },

  // Create new classification record - V2
  createClassificationRecordV2: async (
    data: ClassificationRecordV2Request
  ): Promise<ClassificationRecordResponse> => {
    const response = await apiService.post<
      ClassificationRecordResponse,
      ClassificationRecordV2Request
    >('/api/classificationrecord/create-v2', data);
    return response.data;
  },

  // Create new classification record - V3
  createClassificationRecordV3: async (
    data: ClassificationRecordV3Request
  ): Promise<ClassificationRecordResponse> => {
    const response = await apiService.post<
      ClassificationRecordResponse,
      ClassificationRecordV3Request
    >('/api/classificationrecord/create-v3', data);
    return response.data;
  },

  // Update existing classification record
  updateClassificationRecord: async (
    id: number,
    data: UpdateClassificationRecordRequest
  ): Promise<ClassificationRecordResponse> => {
    const response = await apiService.put<
      ClassificationRecordResponse,
      UpdateClassificationRecordRequest
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
