import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';

// Auth
export const useLogin = () => {
  return useMutation({
    mutationFn: (data) => api.post('/auth/login/', data).then((r) => r.data),
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me/').then((r) => r.data),
    retry: false,
  });
};

// Production Stats
export const useProductionStats = () =>
  useQuery({
    queryKey: ['production-stats'],
    queryFn: () => api.get('/projects/stats/').then((r) => r.data),
  });

// Projects
export const useProjects = (params = {}) =>
  useQuery({
    queryKey: ['projects', params],
    queryFn: () => api.get('/projects/', { params }).then((r) => r.data),
  });

export const useProject = (id) =>
  useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/projects/${id}/`, data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['project', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useArchiveProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/projects/${id}/archive/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useActivateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/projects/${id}/activate/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

// Shoots
export const useShoots = (params = {}) =>
  useQuery({
    queryKey: ['shoots', params],
    queryFn: () => api.get('/projects/shoots/', { params }).then((r) => r.data),
  });

export const useShoot = (id) =>
  useQuery({
    queryKey: ['shoot', id],
    queryFn: () => api.get(`/projects/shoots/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateShoot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects/shoots/', data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['shoots'] });
      qc.invalidateQueries({ queryKey: ['project', String(vars.project)] });
    },
  });
};

export const useUpdateShoot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/projects/shoots/${id}/`, data).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['shoots'] });
      qc.invalidateQueries({ queryKey: ['shoot', String(data.id)] });
    },
  });
};

export const useDeleteShoot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/shoots/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shoots'] }),
  });
};

export const useShootAvailability = (params) =>
  useQuery({
    queryKey: ['shoot-availability', params],
    queryFn: () => api.get('/projects/shoots/availability/', { params }).then((r) => r.data),
    enabled: !!(params?.start_date && params?.end_date),
  });

// ── Document Generator: Call Sheets ──

export const useCallSheets = (params = {}) =>
  useQuery({
    queryKey: ['call-sheets', params],
    queryFn: () => api.get('/projects/call-sheets/', { params }).then((r) => r.data),
  });

export const useCallSheet = (id) =>
  useQuery({
    queryKey: ['call-sheet', id],
    queryFn: () => api.get(`/projects/call-sheets/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateCallSheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects/call-sheets/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['call-sheets'] }),
  });
};

export const useUpdateCallSheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/projects/call-sheets/${id}/`, data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['call-sheet', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['call-sheets'] });
    },
  });
};

export const useDeleteCallSheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/call-sheets/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['call-sheets'] }),
  });
};

export const useAddCallSheetEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ callSheetId, ...data }) =>
      api.post(`/projects/call-sheets/${callSheetId}/add_entry/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['call-sheet'] });
      qc.invalidateQueries({ queryKey: ['call-sheets'] });
    },
  });
};

export const useRemoveCallSheetEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ callSheetId, entryId }) =>
      api.delete(`/projects/call-sheets/${callSheetId}/entries/${entryId}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['call-sheet'] });
      qc.invalidateQueries({ queryKey: ['call-sheets'] });
    },
  });
};

export const useGenerateCallSheetFromShoot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (callSheetId) =>
      api.post(`/projects/call-sheets/${callSheetId}/generate_from_shoot/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['call-sheet'] });
      qc.invalidateQueries({ queryKey: ['call-sheets'] });
    },
  });
};

export const useSendCallSheet = () =>
  useMutation({
    mutationFn: ({ id, talent_profile_ids, crew_profile_ids }) =>
      api.post(`/projects/call-sheets/${id}/send/`, { talent_profile_ids, crew_profile_ids }).then((r) => r.data),
  });

// ── Document Generator: Checklists ──

export const useChecklists = (params = {}) =>
  useQuery({
    queryKey: ['checklists', params],
    queryFn: () => api.get('/projects/checklists/', { params }).then((r) => r.data),
  });

export const useChecklist = (id) =>
  useQuery({
    queryKey: ['checklist', id],
    queryFn: () => api.get(`/projects/checklists/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateChecklist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects/checklists/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklists'] }),
  });
};

export const useDeleteChecklist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/checklists/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklists'] }),
  });
};

export const useAddChecklistItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, ...data }) =>
      api.post(`/projects/checklists/${checklistId}/add_item/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist'] });
      qc.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
};

export const useToggleChecklistItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, itemId }) =>
      api.post(`/projects/checklists/${checklistId}/items/${itemId}/toggle/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist'] });
      qc.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
};

export const useRemoveChecklistItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, itemId }) =>
      api.delete(`/projects/checklists/${checklistId}/items/${itemId}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist'] });
      qc.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
};

// ── Document Generator: Production Logs ──

export const useProductionLogs = (params = {}) =>
  useQuery({
    queryKey: ['production-logs', params],
    queryFn: () => api.get('/projects/logs/', { params }).then((r) => r.data),
  });

export const useCreateProductionLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects/logs/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['production-logs'] }),
  });
};

export const useUpdateProductionLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/projects/logs/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['production-logs'] }),
  });
};

export const useDeleteProductionLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/logs/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['production-logs'] }),
  });
};

// Talent
export const useTalentProfiles = (params = {}) =>
  useQuery({
    queryKey: ['talent-profiles', params],
    queryFn: () => api.get('/talent/profiles/', { params }).then((r) => r.data),
  });

export const useMyTalentProfile = () =>
  useQuery({
    queryKey: ['my-talent-profile'],
    queryFn: () => api.get('/talent/profiles/mine/').then((r) => r.data),
  });

export const useBookings = (params = {}) =>
  useQuery({
    queryKey: ['bookings', params],
    queryFn: () => api.get('/talent/bookings/', { params }).then((r) => r.data),
  });

export const useAcceptBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/talent/bookings/${id}/accept/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useDeclineBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/talent/bookings/${id}/decline/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useBooking = (id) =>
  useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.get(`/talent/bookings/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useTalentProfile = (id) =>
  useQuery({
    queryKey: ['talent-profile', id],
    queryFn: () => api.get(`/talent/profiles/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useUpdateTalentProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/talent/profiles/${id}/`, data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['talent-profile', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['talent-profiles'] });
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
    },
  });
};

export const useSubmitProfileForReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/talent/profiles/${id}/submit_for_review/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-profiles'] });
      qc.invalidateQueries({ queryKey: ['talent-profile'] });
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
    },
  });
};

export const useApproveTalentProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, admin_notes }) =>
      api.post(`/talent/profiles/${id}/approve/`, { admin_notes }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-profiles'] });
      qc.invalidateQueries({ queryKey: ['talent-profile'] });
    },
  });
};

export const useRejectTalentProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, admin_notes }) =>
      api.post(`/talent/profiles/${id}/reject/`, { admin_notes }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-profiles'] });
      qc.invalidateQueries({ queryKey: ['talent-profile'] });
    },
  });
};

export const useUploadTalentPhoto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, image, caption, is_primary }) => {
      const fd = new FormData();
      fd.append('image', image);
      if (caption) fd.append('caption', caption);
      if (is_primary) fd.append('is_primary', 'true');
      return api
        .post(`/talent/profiles/${profileId}/upload_photo/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-profiles'] });
      qc.invalidateQueries({ queryKey: ['talent-profile'] });
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
    },
  });
};

export const useSetPrimaryTalentPhoto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, photoId }) =>
      api
        .post(`/talent/profiles/${profileId}/photos/${photoId}/set_primary/`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-profiles'] });
      qc.invalidateQueries({ queryKey: ['talent-profile'] });
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
    },
  });
};

export const useDeleteTalentPhoto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, photoId }) =>
      api.delete(`/talent/profiles/${profileId}/photos/${photoId}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-profiles'] });
      qc.invalidateQueries({ queryKey: ['talent-profile'] });
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
    },
  });
};

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/talent/bookings/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useDeleteBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/talent/bookings/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['shoot'] });
    },
  });
};

// Performance Records
export const usePerformanceRecords = (params = {}) =>
  useQuery({
    queryKey: ['performance-records', params],
    queryFn: () => api.get('/talent/performances/', { params }).then((r) => r.data),
  });

export const useCreatePerformanceRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/talent/performances/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performance-records'] }),
  });
};

export const useUpdatePerformanceRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/talent/performances/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performance-records'] }),
  });
};

// Talent Time Logs
export const useTalentTimeLogs = (params = {}) =>
  useQuery({
    queryKey: ['talent-timelogs', params],
    queryFn: () => api.get('/talent/timelogs/', { params }).then((r) => r.data),
  });

export const useCreateTalentTimeLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/talent/timelogs/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-timelogs'] });
      qc.invalidateQueries({ queryKey: ['talent-payment-summary'] });
    },
  });
};

export const useApproveTimeLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/talent/timelogs/${id}/approve/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['talent-timelogs'] }),
  });
};

export const useRejectTimeLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/talent/timelogs/${id}/reject/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['talent-timelogs'] }),
  });
};

export const useUpdateTalentTimeLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/talent/timelogs/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['talent-timelogs'] }),
  });
};

// Talent Payments
export const useTalentPayments = (params = {}) =>
  useQuery({
    queryKey: ['talent-payments', params],
    queryFn: () => api.get('/talent/payments/', { params }).then((r) => r.data),
  });

export const useCreateTalentPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/talent/payments/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-payments'] });
      qc.invalidateQueries({ queryKey: ['talent-payment-summary'] });
    },
  });
};

export const useMarkTalentPaymentPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payment_reference }) =>
      api.post(`/talent/payments/${id}/mark_paid/`, { payment_reference }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-payments'] });
      qc.invalidateQueries({ queryKey: ['talent-payment-summary'] });
    },
  });
};

export const useTalentPaymentSummary = (params = {}) =>
  useQuery({
    queryKey: ['talent-payment-summary', params],
    queryFn: () => api.get('/talent/payments/summary/', { params }).then((r) => r.data),
  });

// Crew
export const useCrewStats = () =>
  useQuery({
    queryKey: ['crew-stats'],
    queryFn: () => api.get('/crew/stats/').then((r) => r.data),
  });

export const useCrewProfiles = (params = {}) =>
  useQuery({
    queryKey: ['crew-profiles', params],
    queryFn: () => api.get('/crew/profiles/', { params }).then((r) => r.data),
  });

export const useMyCrewProfile = () =>
  useQuery({
    queryKey: ['my-crew-profile'],
    queryFn: () => api.get('/crew/profiles/mine/').then((r) => r.data),
  });

export const useCrewAssignments = (params = {}) =>
  useQuery({
    queryKey: ['crew-assignments', params],
    queryFn: () => api.get('/crew/assignments/', { params }).then((r) => r.data),
  });

export const useCreateCrewAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/crew/assignments/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-assignments'] }),
  });
};

export const useDeleteCrewAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/crew/assignments/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-assignments'] }),
  });
};

export const useAcceptAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/crew/assignments/${id}/accept/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-assignments'] }),
  });
};

export const useDeclineAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/crew/assignments/${id}/decline/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-assignments'] }),
  });
};

export const useCrewProfile = (id) =>
  useQuery({
    queryKey: ['crew-profile', id],
    queryFn: () => api.get(`/crew/profiles/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useUpdateCrewProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/crew/profiles/${id}/`, data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['crew-profile', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['crew-profiles'] });
      qc.invalidateQueries({ queryKey: ['my-crew-profile'] });
    },
  });
};

export const useUploadCrewPhoto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, photo }) => {
      const fd = new FormData();
      fd.append('photo', photo);
      return api
        .post(`/crew/profiles/${profileId}/upload_photo/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crew-profiles'] });
      qc.invalidateQueries({ queryKey: ['crew-profile'] });
    },
  });
};

// Crew Availability
export const useCrewAvailability = (params = {}) =>
  useQuery({
    queryKey: ['crew-availability', params],
    queryFn: () => api.get('/crew/availability/', { params }).then((r) => r.data),
  });

export const useCreateCrewAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/crew/availability/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-availability'] }),
  });
};

export const useUpdateCrewAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/crew/availability/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-availability'] }),
  });
};

export const useDeleteCrewAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/crew/availability/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-availability'] }),
  });
};

export const useBulkUpdateCrewAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post('/crew/availability/bulk_update/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-availability'] }),
  });
};

// Talent Availability
export const useTalentAvailability = (params = {}) =>
  useQuery({
    queryKey: ['talent-availability', params],
    queryFn: () => api.get('/talent/availability/', { params }).then((r) => r.data),
  });

export const useBulkUpdateTalentAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post('/talent/availability/bulk_update/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['talent-availability'] }),
  });
};

// Users (admin-only)
export const useUsers = (params = {}) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => api.get('/auth/users/', { params }).then((r) => r.data),
  });

export const useCreateClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/auth/users/create-client/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

// Talent Roster Shares
export const useTalentRosterShares = (params = {}) =>
  useQuery({
    queryKey: ['talent-roster-shares', params],
    queryFn: () => api.get('/clientportal/talent-roster-shares/', { params }).then((r) => r.data),
  });

export const useSendTalentRoster = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post('/clientportal/talent-roster-shares/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['talent-roster-shares'] }),
  });
};

// Evaluations
export const useEvaluations = (params = {}) =>
  useQuery({
    queryKey: ['evaluations', params],
    queryFn: () => api.get('/crew/evaluations/', { params }).then((r) => r.data),
  });

export const useCreateEvaluation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/crew/evaluations/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluations'] }),
  });
};

export const useUpdateEvaluation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/crew/evaluations/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluations'] }),
  });
};

export const useDeleteEvaluation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/crew/evaluations/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluations'] }),
  });
};

// Deliverables
export const useDeliverables = (params = {}) =>
  useQuery({
    queryKey: ['deliverables', params],
    queryFn: () => api.get('/deliverables/items/', { params }).then((r) => r.data),
  });

export const useApproveDeliverable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.post(`/deliverables/items/${id}/approve/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliverables'] }),
  });
};

export const useUploadDeliverable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      return api
        .post(`/deliverables/items/${id}/upload/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliverables'] }),
  });
};

export const useCreateDeliverable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) formData.append(key, val);
      });
      return api
        .post('/deliverables/items/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliverables'] }),
  });
};

// Contracts
export const useContracts = (params = {}) =>
  useQuery({
    queryKey: ['contracts', params],
    queryFn: () => api.get('/deliverables/contracts/', { params }).then((r) => r.data),
  });

export const useCreateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const hasFile = data.file instanceof File;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v != null && v !== '') fd.append(k, v);
        });
        return api
          .post('/deliverables/contracts/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          .then((r) => r.data);
      }
      return api.post('/deliverables/contracts/', data).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
};

export const useUpdateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => {
      const hasFile = data.file instanceof File;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v != null && v !== '') fd.append(k, v);
        });
        return api
          .patch(`/deliverables/contracts/${id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          .then((r) => r.data);
      }
      return api.patch(`/deliverables/contracts/${id}/`, data).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
};

export const useDeleteContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/deliverables/contracts/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
};

export const useSendContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/deliverables/contracts/${id}/send/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
};

// Finance
export const useExpenses = (params = {}) =>
  useQuery({
    queryKey: ['expenses', params],
    queryFn: () => api.get('/finance/expenses/', { params }).then((r) => r.data),
  });

export const useEarnings = (params = {}) =>
  useQuery({
    queryKey: ['earnings', params],
    queryFn: () => api.get('/finance/earnings/', { params }).then((r) => r.data),
  });

export const useProjectFinancials = (projectId) =>
  useQuery({
    queryKey: ['project-financials', projectId],
    queryFn: () => api.get(`/finance/project/${projectId}/`).then((r) => r.data),
    enabled: !!projectId,
  });

export const useRevenueAnalysis = () =>
  useQuery({
    queryKey: ['revenue-analysis'],
    queryFn: () => api.get('/finance/revenue-analysis/').then((r) => r.data),
  });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v != null && v !== '') fd.append(k, v);
      });
      return api
        .post('/finance/expenses/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['project-financials', String(vars.project)] });
      qc.invalidateQueries({ queryKey: ['revenue-analysis'] });
    },
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/finance/expenses/${id}/`),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['project-financials', String(vars.projectId)] });
      qc.invalidateQueries({ queryKey: ['revenue-analysis'] });
    },
  });
};

export const useUpdateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => {
      const hasFile = data.reimbursement_proof instanceof File || data.receipt instanceof File;

      if (!hasFile) {
        return api.patch(`/finance/expenses/${id}/`, data).then((r) => r.data);
      }

      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        if (typeof v === 'boolean') {
          fd.append(k, v ? 'true' : 'false');
          return;
        }
        fd.append(k, v);
      });
      return api
        .patch(`/finance/expenses/${id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['project-financials'] });
      qc.invalidateQueries({ queryKey: ['revenue-analysis'] });
    },
  });
};

export const useBudgetAllocations = (projectId) =>
  useQuery({
    queryKey: ['budget-allocations', projectId],
    queryFn: () =>
      api
        .get('/finance/budget-allocations/', { params: { project: projectId } })
        .then((r) => r.data?.results || r.data || []),
    enabled: !!projectId,
  });

export const useUpsertBudgetAllocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      id
        ? api.patch(`/finance/budget-allocations/${id}/`, data).then((r) => r.data)
        : api.post('/finance/budget-allocations/', data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['budget-allocations', String(vars.project)] });
    },
  });
};

// ── Client Portal: Project Requests ──

export const useProjectRequests = (params = {}) =>
  useQuery({
    queryKey: ['project-requests', params],
    queryFn: () => api.get('/clientportal/requests/', { params }).then((r) => r.data),
  });

export const useProjectRequest = (id) =>
  useQuery({
    queryKey: ['project-request', id],
    queryFn: () => api.get(`/clientportal/requests/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateProjectRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/clientportal/requests/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project-requests'] }),
  });
};

export const useUpdateProjectRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/clientportal/requests/${id}/`, data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['project-request', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['project-requests'] });
    },
  });
};

export const useUploadContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, file }) => {
      const fd = new FormData();
      fd.append('file', file);
      return api
        .post(`/clientportal/requests/${requestId}/upload_contract/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-requests'] });
      qc.invalidateQueries({ queryKey: ['project-request'] });
    },
  });
};

export const useCommentContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, contractId, comment }) =>
      api
        .post(`/clientportal/requests/${requestId}/contracts/${contractId}/comment/`, { comment })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-requests'] });
      qc.invalidateQueries({ queryKey: ['project-request'] });
    },
  });
};

export const useSignContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, contractId, signatureBlob }) => {
      const fd = new FormData();
      fd.append('signature', signatureBlob, 'signature.png');
      return api
        .post(`/clientportal/requests/${requestId}/contracts/${contractId}/sign/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-requests'] });
      qc.invalidateQueries({ queryKey: ['project-request'] });
    },
  });
};

export const useCreateProjectFromRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId) =>
      api.post(`/clientportal/requests/${requestId}/create-project/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-requests'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// ── Client Portal: Milestones ──

export const useMilestones = (params = {}) =>
  useQuery({
    queryKey: ['milestones', params],
    queryFn: () => api.get('/clientportal/milestones/', { params }).then((r) => r.data),
  });

export const useCreateMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/clientportal/milestones/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['milestones'] }),
  });
};

export const useUpdateMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/clientportal/milestones/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['milestones'] }),
  });
};

export const useDeleteMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/clientportal/milestones/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['milestones'] }),
  });
};

// ── Client Portal: Deliverable Reviews ──

export const useDeliverableReviews = (params = {}) =>
  useQuery({
    queryKey: ['deliverable-reviews', params],
    queryFn: () => api.get('/clientportal/reviews/', { params }).then((r) => r.data),
  });

export const useCreateDeliverableReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/clientportal/reviews/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliverable-reviews'] });
      qc.invalidateQueries({ queryKey: ['deliverables'] });
    },
  });
};

// ── Client Portal: Messages ──

export const useMessages = (params = {}) =>
  useQuery({
    queryKey: ['messages', params],
    queryFn: () => api.get('/clientportal/messages/', { params }).then((r) => r.data),
  });

export const useMessage = (id) =>
  useQuery({
    queryKey: ['message', id],
    queryFn: () => api.get(`/clientportal/messages/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/clientportal/messages/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
};

export const useReplyMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) =>
      api.post(`/clientportal/messages/${id}/reply/`, { body }).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['message', String(vars.id)] });
    },
  });
};

// ── Invoices & Project Payments ──

export const useInvoices = (params = {}) =>
  useQuery({
    queryKey: ['invoices', params],
    queryFn: () => api.get('/payments/invoices/', { params }).then((r) => r.data),
  });

export const useInvoice = (id) =>
  useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.get(`/payments/invoices/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/payments/invoices/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

export const useUpdateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/payments/invoices/${id}/`, data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['invoice', String(vars.id)] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useAddInvoiceItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, ...data }) =>
      api.post(`/payments/invoices/${invoiceId}/add_item/`, data).then((r) => r.data),
    onSuccess: (data, variables) => {
      qc.setQueryData(['invoice', String(variables.invoiceId)], data);
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useRemoveInvoiceItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, itemId }) =>
      api.delete(`/payments/invoices/${invoiceId}/items/${itemId}/`).then((r) => r.data),
    onSuccess: (data, variables) => {
      qc.setQueryData(['invoice', String(variables.invoiceId)], data);
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useSendInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId) =>
      api.post(`/payments/invoices/${invoiceId}/send_invoice/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useMarkInvoicePaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId) =>
      api.post(`/payments/invoices/${invoiceId}/mark_paid/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useProjectPayments = (params = {}) =>
  useQuery({
    queryKey: ['project-payments', params],
    queryFn: () => api.get('/payments/payments/', { params }).then((r) => r.data),
  });

export const useCreateProjectPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      return api
        .post('/payments/payments/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice'] });
    },
  });
};

export const useVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, admin_notes }) =>
      api.post(`/payments/payments/${id}/verify/`, { admin_notes }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice'] });
    },
  });
};

export const useRejectPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, admin_notes }) =>
      api.post(`/payments/payments/${id}/reject/`, { admin_notes }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch('/auth/me/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

// ── Talent Requirements ────────────────────────────────────────────────────────
export const useTalentRequirements = (params = {}) =>
  useQuery({
    queryKey: ['talent-requirements', params],
    queryFn: () => api.get('/projects/talent-requirements/', { params }).then((r) => r.data),
    enabled: Object.values(params).some(Boolean),
  });

export const useCreateTalentRequirement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects/talent-requirements/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-requirements'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
};

export const useDeleteTalentRequirement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/talent-requirements/${id}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-requirements'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
};

// ── Crew Requirements ──────────────────────────────────────────────────────────
export const useCrewRequirements = (params = {}) =>
  useQuery({
    queryKey: ['crew-requirements', params],
    queryFn: () => api.get('/projects/crew-requirements/', { params }).then((r) => r.data),
    enabled: Object.values(params).some(Boolean),
  });

export const useCreateCrewRequirement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects/crew-requirements/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crew-requirements'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
};

export const useDeleteCrewRequirement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/crew-requirements/${id}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crew-requirements'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
};

// ── Talent Considerations ──────────────────────────────────────────────────────
export const useTalentConsiderations = (params = {}) =>
  useQuery({
    queryKey: ['talent-considerations', params],
    queryFn: () => api.get('/projects/talent-considerations/', { params }).then((r) => r.data),
    enabled: Object.values(params).some(Boolean),
  });

export const useAddTalentConsideration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects/talent-considerations/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-considerations'] });
    },
  });
};

export const useRemoveTalentConsideration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/talent-considerations/${id}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-considerations'] });
    },
  });
};

// ── Crew Considerations ────────────────────────────────────────────────────────
export const useCrewConsiderations = (params = {}) =>
  useQuery({
    queryKey: ['crew-considerations', params],
    queryFn: () => api.get('/projects/crew-considerations/', { params }).then((r) => r.data),
    enabled: Object.values(params).some(Boolean),
  });

export const useAddCrewConsideration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects/crew-considerations/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crew-considerations'] });
    },
  });
};

export const useRemoveCrewConsideration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/crew-considerations/${id}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crew-considerations'] });
    },
  });
};

// ── Stripe: Talent ────────────────────────────────────────────────────────────

export const useCreateTalentStripeAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profileId) =>
      api.post(`/talent/profiles/${profileId}/create_stripe_account/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['talent-profiles'] }),
  });
};

export const useTalentStripeAccountStatus = (profileId) =>
  useQuery({
    queryKey: ['talent-stripe-status', profileId],
    queryFn: () =>
      api.get(`/talent/profiles/${profileId}/stripe_account_status/`).then((r) => r.data),
    enabled: !!profileId,
  });

export const useInitiateTalentPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId) =>
      api.post(`/talent/payments/${paymentId}/initiate_stripe_payout/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['talent-payments'] });
      qc.invalidateQueries({ queryKey: ['talent-payment-summary'] });
    },
  });
};

// ── Crew Payments ─────────────────────────────────────────────────────────────

export const useCrewPayments = (params = {}) =>
  useQuery({
    queryKey: ['crew-payments', params],
    queryFn: () => api.get('/crew/payments/', { params }).then((r) => r.data),
  });

export const useCreateCrewPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/crew/payments/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-payments'] }),
  });
};

export const useMarkCrewPaymentPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payment_reference }) =>
      api.post(`/crew/payments/${id}/mark_paid/`, { payment_reference }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-payments'] }),
  });
};

// ── Stripe: Crew ──────────────────────────────────────────────────────────────

export const useCreateCrewStripeAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profileId) =>
      api.post(`/crew/profiles/${profileId}/create_stripe_account/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-profiles'] }),
  });
};

export const useCrewStripeAccountStatus = (profileId) =>
  useQuery({
    queryKey: ['crew-stripe-status', profileId],
    queryFn: () =>
      api.get(`/crew/profiles/${profileId}/stripe_account_status/`).then((r) => r.data),
    enabled: !!profileId,
  });

export const useInitiateCrewPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId) =>
      api.post(`/crew/payments/${paymentId}/initiate_stripe_payout/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew-payments'] }),
  });
};
