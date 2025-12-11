import {
  WorkSchedule,
  WorkScheduleCompleteAssignment,
  WorkScheduleListResponseWithoutPagination,
  WorkSchedulePagination,
  WorkScheduleRequest,
  WorkScheduleSearchParams,
  WorkScheduleStatus,
  workScheduleServices,
} from '@/lib/api/services/fetchWorkSchedule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Query keys
export const workScheduleKeys = {
  all: ['workSchedules'] as const,
  lists: () => [...workScheduleKeys.all, 'list'] as const,
  list: (params: WorkScheduleSearchParams) =>
    [...workScheduleKeys.lists(), params] as const,
  details: () => [...workScheduleKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...workScheduleKeys.details(), id] as const,
  self: () => [...workScheduleKeys.all, 'self'] as const,
  staff: (staffId: number) =>
    [...workScheduleKeys.all, 'staff', staffId] as const,
  pond: (pondId: number) => [...workScheduleKeys.all, 'pond', pondId] as const,
};

/*
 * Hook to get list of Work Schedules with pagination
 */
export function useGetWorkSchedules(
  enabled = true,
  filters?: WorkScheduleSearchParams
) {
  return useQuery({
    queryKey: workScheduleKeys.list(filters || {}),
    queryFn: async (): Promise<WorkSchedulePagination> => {
      const resp = await workScheduleServices.getAllWorkSchedules(
        filters || {}
      );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải danh sách lịch làm việc'
        );
      return resp.result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Work Schedules by Self
 */
export function useGetWorkSchedulesBySelf(
  enabled = true,
  filters?: WorkScheduleSearchParams
) {
  return useQuery({
    queryKey: [...workScheduleKeys.self(), filters || {}],
    queryFn: async (): Promise<WorkScheduleListResponseWithoutPagination> => {
      const resp = await workScheduleServices.getSelfWorkSchedules(
        filters || {}
      );

      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải lịch làm việc của bạn');

      return resp; // Return the full response object, not just resp.result
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Work Schedules by Staff ID
 */
export function useGetWorkSchedulesByStaffId(
  staffId: number,
  enabled = true,
  filters?: Omit<WorkScheduleSearchParams, 'staffId'>
) {
  return useQuery({
    queryKey: [...workScheduleKeys.staff(staffId), filters || {}],
    queryFn: async (): Promise<WorkSchedulePagination> => {
      const resp = await workScheduleServices.getWorkSchedulesByStaffId(
        staffId,
        filters || {}
      );
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải lịch làm việc của nhân viên'
        );
      return resp.result;
    },
    enabled: enabled && !!staffId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Work Schedules by Pond ID
 */
export function useGetWorkSchedulesByPondId(
  pondId: number,
  enabled = true,
  filters?: Omit<WorkScheduleSearchParams, 'pondId'>
) {
  return useQuery({
    queryKey: [...workScheduleKeys.pond(pondId), filters || {}],
    queryFn: async (): Promise<WorkSchedulePagination> => {
      const resp = await workScheduleServices.getWorkSchedulesByPondId(
        pondId,
        filters || {}
      );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tải lịch làm việc của hồ');
      return resp.result;
    },
    enabled: enabled && !!pondId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to get Work Schedule by ID
 */
export function useGetWorkScheduleById(id: number, enabled = true) {
  return useQuery({
    queryKey: workScheduleKeys.detail(id),
    queryFn: async (): Promise<WorkSchedule> => {
      const resp = await workScheduleServices.getWorkScheduleById(id);
      if (!resp.isSuccess)
        throw new Error(
          resp.message || 'Không thể tải thông tin lịch làm việc'
        );
      return resp.result;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/*
 * Hook to create a new Work Schedule
 */
export function useCreateWorkSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: WorkScheduleRequest) => {
      const resp = await workScheduleServices.createWorkSchedule(data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể tạo lịch làm việc');
      return resp.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workScheduleKeys.lists() });
      qc.invalidateQueries({ queryKey: workScheduleKeys.all });
      Toast.show({
        type: 'success',
        text1: 'Tạo lịch làm việc thành công',
        position: 'top',
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Tạo thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to update a Work Schedule
 */
export function useUpdateWorkSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: WorkScheduleRequest;
    }) => {
      const resp = await workScheduleServices.updateWorkSchedule(id, data);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật lịch làm việc');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: workScheduleKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: workScheduleKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: workScheduleKeys.lists() });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to update Work Schedule status
 */
export function useUpdateWorkScheduleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: WorkScheduleStatus;
      notes?: string;
    }) => {
      const resp = await workScheduleServices.updateWorkScheduleStatus(
        id,
        status,
        notes
      );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể cập nhật trạng thái');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Cập nhật trạng thái thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: workScheduleKeys.details() });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: workScheduleKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: workScheduleKeys.lists() });
      qc.invalidateQueries({ queryKey: workScheduleKeys.self() });
      qc.invalidateQueries({ queryKey: workScheduleKeys.all });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Cập nhật trạng thái thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to complete staff task
 */
export function useCompleteStaffTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workScheduleId,
      assignement,
    }: {
      workScheduleId: number;
      assignement: WorkScheduleCompleteAssignment;
    }) => {
      const resp = await workScheduleServices.completeAssignmentTask(
        workScheduleId,
        assignement
      );
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể hoàn thành nhiệm vụ');
      return resp.result;
    },
    onSuccess: (_, vars) => {
      Toast.show({
        type: 'success',
        text1: 'Hoàn thành nhiệm vụ thành công',
        position: 'top',
      });
      qc.invalidateQueries({ queryKey: workScheduleKeys.details() });
      if (vars?.workScheduleId)
        qc.invalidateQueries({
          queryKey: workScheduleKeys.detail(vars.workScheduleId),
        });
      qc.invalidateQueries({ queryKey: workScheduleKeys.lists() });
      // Invalidate all self queries regardless of filters
      qc.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'workSchedules' && query.queryKey[1] === 'self',
      });
      qc.invalidateQueries({ queryKey: workScheduleKeys.all });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Hoàn thành nhiệm vụ thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to delete a Work Schedule
 */
export function useDeleteWorkSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const resp = await workScheduleServices.deleteWorkSchedule(id);
      if (!resp.isSuccess)
        throw new Error(resp.message || 'Không thể xóa lịch làm việc');
      return resp.result;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Xóa thành công', position: 'top' });
      qc.invalidateQueries({ queryKey: workScheduleKeys.lists() });
      qc.invalidateQueries({ queryKey: workScheduleKeys.all });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Xóa thất bại',
        text2: err?.message ?? String(err),
        position: 'top',
      });
    },
  });
}

/*
 * Hook to prefetch Work Schedule by ID
 */
export function usePrefetchWorkScheduleById(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.prefetchQuery({
      queryKey: workScheduleKeys.detail(id),
      queryFn: async (): Promise<WorkSchedule> => {
        const resp = await workScheduleServices.getWorkScheduleById(id);
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/*
 * Hook to prefetch list of Work Schedules
 */
export function usePrefetchWorkSchedules(filters?: WorkScheduleSearchParams) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: workScheduleKeys.list(filters || {}),
      queryFn: async (): Promise<WorkSchedulePagination> => {
        const resp = await workScheduleServices.getAllWorkSchedules(
          filters || {}
        );
        return resp.result;
      },
      staleTime: 5 * 60 * 1000,
    });
}
