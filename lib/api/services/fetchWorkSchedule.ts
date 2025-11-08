import apiService, { RequestParams } from '../apiClient';

export enum WorkScheduleStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  IN_COMPLETE = 'Incomplete',
  CANCELLED = 'Cancelled',
}

export interface TaskTemplate {
  id: number;
  taskName: string;
  description: string;
  defaultDuration: number;
  isRecurring: boolean;
  recurrenceRule: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface StaffAssignment {
  workScheduleId: number;
  staffId: number;
  staffName: string;
  completionNotes: string | null;
  completedAt: string | null;
}

export interface PondAssignment {
  workScheduleId: number;
  pondId: number;
  pondName: string;
}

export interface WorkSchedule {
  id: number;
  taskTemplateId: number;
  taskTemplateName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: WorkScheduleStatus;
  notes: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string | null;
  taskTemplate: TaskTemplate;
  staffAssignments: StaffAssignment[];
  pondAssignments: PondAssignment[];
}

export interface WorkScheduleSearchParams {
  search?: string;
  status?: WorkScheduleStatus;
  staffId?: number;
  pondId?: number;
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
  taskTemplateId?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface WorkScheduleRequest {
  taskTemplateId: number;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: WorkScheduleStatus;
  notes: string;
  staffIds: number[];
  pondIds: number[];
}

export interface WorkSchedulePagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: WorkSchedule[];
}

export interface WorkScheduleListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: WorkSchedulePagination;
}

export interface WorkScheduleResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: WorkSchedule;
}

// Convert WorkScheduleSearchParams to RequestParams
export const convertWorkScheduleFilter = (
  filters?: WorkScheduleSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.staffId) params.staffId = filters.staffId;
  if (filters.pondId) params.pondId = filters.pondId;
  if (filters.scheduledDateFrom)
    params.scheduledDateFrom = filters.scheduledDateFrom;
  if (filters.scheduledDateTo) params.scheduledDateTo = filters.scheduledDateTo;
  if (filters.taskTemplateId) params.taskTemplateId = filters.taskTemplateId;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const workScheduleServices = {
  // Get all work schedules with pagination
  getAllWorkSchedules: async (
    filters?: WorkScheduleSearchParams
  ): Promise<WorkScheduleListResponse> => {
    const params = convertWorkScheduleFilter(filters);

    const response = await apiService.get<WorkScheduleListResponse>(
      `/api/work-schedule`,
      params
    );
    return response.data;
  },

  //get work schedules by self
  getSelfWorkSchedules: async (
    filters?: WorkScheduleSearchParams
  ): Promise<WorkScheduleListResponse> => {
    const params = convertWorkScheduleFilter(filters);
    const response = await apiService.get<WorkScheduleListResponse>(
      `/api/WorkSchedule/me`,
      params
    );
    return response.data;
  },
  // Get work schedules by staff ID
  getWorkSchedulesByStaffId: async (
    staffId: number,
    filters?: WorkScheduleSearchParams
  ): Promise<WorkScheduleListResponse> => {
    const params = convertWorkScheduleFilter({ ...filters, staffId });

    const response = await apiService.get<WorkScheduleListResponse>(
      `/api/WorkSchedule/staff/${staffId}`,
      params
    );
    return response.data;
  },

  // Get work schedules by pond ID
  getWorkSchedulesByPondId: async (
    pondId: number,
    filters?: WorkScheduleSearchParams
  ): Promise<WorkScheduleListResponse> => {
    const params = convertWorkScheduleFilter({ ...filters, pondId });

    const response = await apiService.get<WorkScheduleListResponse>(
      `/api/WorkSchedule/pond/${pondId}`,
      params
    );
    return response.data;
  },

  // Get work schedule by ID
  getWorkScheduleById: async (id: number): Promise<WorkScheduleResponse> => {
    const response = await apiService.get<WorkScheduleResponse>(
      `/api/WorkSchedule/${id}`
    );
    return response.data;
  },

  // Create a new work schedule
  createWorkSchedule: async (
    workSchedule: WorkScheduleRequest
  ): Promise<WorkScheduleResponse> => {
    const response = await apiService.post<
      WorkScheduleResponse,
      WorkScheduleRequest
    >('/api/WorkSchedule', workSchedule);
    return response.data;
  },

  // Update an existing work schedule
  updateWorkSchedule: async (
    id: number,
    workSchedule: WorkScheduleRequest
  ): Promise<WorkScheduleResponse> => {
    const response = await apiService.put<
      WorkScheduleResponse,
      WorkScheduleRequest
    >(`/api/WorkSchedule/${id}`, workSchedule);
    return response.data;
  },

  // Update work schedule status
  updateWorkScheduleStatus: async (
    id: number,
    status: WorkScheduleStatus,
    notes?: string
  ): Promise<WorkScheduleResponse> => {
    const response = await apiService.patch<
      WorkScheduleResponse,
      { status: WorkScheduleStatus; notes?: string }
    >(`/api/WorkSchedule/${id}/status`, { status, notes });
    return response.data;
  },

  // Complete work schedule task for staff
  completeStaffTask: async (
    workScheduleId: number,
    staffId: number,
    completionNotes: string
  ): Promise<WorkScheduleResponse> => {
    const response = await apiService.post<
      WorkScheduleResponse,
      { completionNotes: string }
    >(`/api/WorkSchedule/${workScheduleId}/staff/${staffId}/complete`, {
      completionNotes,
    });
    return response.data;
  },

  // Delete a work schedule
  deleteWorkSchedule: async (id: number): Promise<WorkScheduleResponse> => {
    const response = await apiService.delete<WorkScheduleResponse>(
      `/api/WorkSchedule/${id}`
    );
    return response.data;
  },
};
