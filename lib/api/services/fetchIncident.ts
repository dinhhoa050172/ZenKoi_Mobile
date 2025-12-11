import apiService, { RequestParams } from '../apiClient';

export enum IncidentSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export enum IncidentStatus {
  Reported = 'Reported',
  Investigating = 'Investigating',
  Resolved = 'Resolved',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
}

export enum KoiAffectedStatus {
  HEALTHY = 'Healthy',
  WARNING = 'Warning',
  WEAK = 'Weak',
  SICK = 'Sick',
  DEAD = 'Dead',
}

export interface KoiIncident {
  id: number;
  koiFishId: number;
  koiFishRFID: string;
  affectedStatus: KoiAffectedStatus;
  specificSymptoms: string;
  requiresTreatment: boolean;
  isIsolated: boolean;
  treatmentNotes: string;
  affectedFrom: string;
}

export interface KoiIncidentRequest {
  koiFishId: number;
  affectedStatus: KoiAffectedStatus;
  specificSymptoms: string;
  requiresTreatment: boolean;
  isIsolated: boolean;
  affectedFrom: string;
  treatmentNotes: string;
}

export interface PondIncident {
  id: number;
  pondId: number;
  pondName: string;
  environmentalChanges: string;
  requiresWaterChange: boolean;
  fishDiedCount: number;
  correctiveActions: string;
  notes: string;
}

export interface PondIncidentRequest {
  pondId: number;
  environmentalChanges: string;
  requiresWaterChange: boolean;
  fishDiedCount: number;
  correctiveActions: string;
  notes: string;
}

export interface IncidentType {
  id: number;
  name: string;
  description: string;
  defaultSeverity: IncidentSeverity;
  affectsBreeding: boolean;
}

export interface Incident {
  id: number;
  incidentType: IncidentType;
  incidentTitle: string;
  description: string;
  // severity: IncidentSeverity;
  reportImages: string[];
  status: IncidentStatus;
  occurredAt: string;
  createdAt: string;
  updatedAt: string | null;
  resolvedAt: string | null;
  reportedByUserId: number;
  reportedByUserName: string;
  resolvedByUserId: number | null;
  resolvedByUserName: string | null;
  resolutionNotes: string | null;
  resolutionImages: string[];
  koiIncidents: KoiIncident[];
  pondIncidents: PondIncident[];
}

export interface IncidentSearchParams {
  Search?: string;
  IncidentTypeId?: number;
  Status?: IncidentStatus;
  OccurredFrom?: string;
  OccurredTo?: string;
  // Severity?: IncidentSeverity;
  PondId?: number;
  KoiFishId?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface IncidentPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: Incident[];
}

export interface IncidentListResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: IncidentPagination;
}

export interface IncidentResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Incident;
}

export interface RequestIncident {
  incidentTypeId: number;
  incidentTitle: string;
  description: string;
  reportImages: string[];
  occurredAt: string;
  status?: string;
  resolutionNotes?: string;
  affectedKoiFish?: KoiIncidentRequest[];
  affectedPonds?: PondIncidentRequest[];
}

export interface IncidentResolutionRequest {
  status: string;
  resolutionNotes: string;
  resolutionImages: string[];
}

// Convert IncidentSearchParams to RequestParams
export const convertIncidentFilter = (
  filters?: IncidentSearchParams
): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Basic parameters
  if (filters.Search) params.search = filters.Search;
  if (filters.Status) params.status = filters.Status;
  if (filters.IncidentTypeId) params.incidentTypeId = filters.IncidentTypeId;
  // if (filters.Severity) params.severity = filters.Severity;
  if (filters.OccurredFrom) params.occurredFrom = filters.OccurredFrom;
  if (filters.OccurredTo) params.occurredTo = filters.OccurredTo;
  if (filters.PondId) params.pondId = filters.PondId;
  if (filters.KoiFishId) params.koiFishId = filters.KoiFishId;
  if (filters.pageIndex) params.pageIndex = filters.pageIndex;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
};

export const incidentServices = {
  // Get all incidents with pagination
  getAllIncidents: async (
    filters?: IncidentSearchParams
  ): Promise<IncidentListResponse> => {
    const params = convertIncidentFilter(filters);

    const response = await apiService.get<IncidentListResponse>(
      `/api/Incident`,
      params
    );
    return response.data;
  },

  // Get incident by ID
  getIncidentById: async (id: number): Promise<IncidentResponse> => {
    const response = await apiService.get<IncidentResponse>(
      `/api/Incident/${id}`
    );
    return response.data;
  },

  // Create a new incident
  createIncident: async (
    incident: RequestIncident
  ): Promise<IncidentResponse> => {
    const response = await apiService.post<IncidentResponse, RequestIncident>(
      '/api/Incident',
      incident
    );
    return response.data;
  },

  //Create a new incident KoiId
  createIncidentWithKoi: async (
    id: number,
    koiIncident: Omit<KoiIncident, 'id'>
  ): Promise<IncidentResponse> => {
    const response = await apiService.post<
      IncidentResponse,
      Omit<KoiIncident, 'id'>
    >(`/api/Incident/${id}/koi`, koiIncident);
    return response.data;
  },

  //Create a new incident PondId
  createIncidentWithPond: async (
    id: number,
    pondIncident: Omit<PondIncident, 'id'>
  ): Promise<IncidentResponse> => {
    const response = await apiService.post<
      IncidentResponse,
      Omit<PondIncident, 'id'>
    >(`/api/Incident/${id}/pond`, pondIncident);
    return response.data;
  },

  // Update an existing incident
  updateIncident: async (
    id: number,
    incident: RequestIncident
  ): Promise<IncidentResponse> => {
    const response = await apiService.put<IncidentResponse, RequestIncident>(
      `/api/Incident/${id}`,
      incident
    );
    return response.data;
  },

  //Update incident status
  updateIncidentStatus: async (
    id: number,
    IncidentResolutionRequest: IncidentResolutionRequest
  ): Promise<IncidentResponse> => {
    const response = await apiService.patch<
      IncidentResponse,
      IncidentResolutionRequest
    >(`/api/Incident/${id}/status`, IncidentResolutionRequest);
    return response.data;
  },

  // Delete an incident
  deleteIncident: async (id: number): Promise<IncidentResponse> => {
    const response = await apiService.delete<IncidentResponse>(
      `/api/Incident/${id}`
    );
    return response.data;
  },

  //Delete KoiIncident from an incident
  deleteKoiIncident: async (
    koiIncidentId: number
  ): Promise<IncidentResponse> => {
    const response = await apiService.delete<IncidentResponse>(
      `/api/Incident/koi/${koiIncidentId}`
    );
    return response.data;
  },

  //Delete PondIncident from an incident
  deletePondIncident: async (
    pondIncidentId: number
  ): Promise<IncidentResponse> => {
    const response = await apiService.delete<IncidentResponse>(
      `/api/Incident/pond/${pondIncidentId}`
    );
    return response.data;
  },

  // Get incident types
  getIncidentTypes: async (): Promise<{
    statusCode: number;
    isSuccess: boolean;
    message: string;
    result: {
      id: number;
      incidentTypeName: string;
      description?: string;
    }[];
  }> => {
    const response = await apiService.get<{
      statusCode: number;
      isSuccess: boolean;
      message: string;
      result: {
        id: number;
        incidentTypeName: string;
        description?: string;
      }[];
    }>(`/api/IncidentType`);
    return response.data;
  },
};
