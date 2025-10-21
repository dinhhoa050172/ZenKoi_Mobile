import apiService from '../apiClient';

export interface ClassificationRecord {
  id: number;
  classificationStageId: number;
  highQualifiedCount: number;
  qualifiedCount: number;
  unqualifiedCount: number;
  notes: string;
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

export const classificationRecordServices = {
  // Get all classification records with pagination
  getAllClassificationRecords: async (
    pageIndex: number,
    pageSize: number
  ): Promise<ClassificationRecordListResponse> => {
    const response = await apiService.get<ClassificationRecordListResponse>(
      `/api/classificationrecord?pageIndex=${pageIndex}&pageSize=${pageSize}`
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
