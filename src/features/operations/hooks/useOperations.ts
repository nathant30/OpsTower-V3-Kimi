/**
 * useOperations Hook
 * React Query hooks for Operations management functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  operationsService,
  type Shift,
  type OperationTask,
  type OperationsCalendarEvent,
  type EquipmentIssue,
  type HandoverNote,
  type OperationsMetrics,
  type OperationsReport,
  type TaskStatus,
  type EquipmentStatus,
  type ShiftType,
  generateMockShifts,
  generateMockTasks,
  generateMockCalendarEvents,
  generateMockEquipmentIssues,
  generateMockHandoverNotes,
  generateMockMetrics,
} from '@/services/operations/operations.service';

// ============ Query Keys ============

const operationsKeys = {
  all: ['operations'] as const,
  shifts: (filters?: { startDate?: string; endDate?: string }) =>
    [...operationsKeys.all, 'shifts', filters] as const,
  activeShifts: () => [...operationsKeys.all, 'shifts', 'active'] as const,
  tasks: (filters?: { status?: TaskStatus; shiftId?: string }) =>
    [...operationsKeys.all, 'tasks', filters] as const,
  checklist: (shiftId?: string) => [...operationsKeys.all, 'checklist', shiftId] as const,
  calendar: (range?: { start: string; end: string }) =>
    [...operationsKeys.all, 'calendar', range] as const,
  equipment: (status?: EquipmentStatus) =>
    [...operationsKeys.all, 'equipment', status] as const,
  handover: (shiftId?: string) =>
    [...operationsKeys.all, 'handover', shiftId] as const,
  metrics: () => [...operationsKeys.all, 'metrics'] as const,
  reports: () => [...operationsKeys.all, 'reports'] as const,
};

// ============ Shift Hooks ============

/**
 * Get shifts for a date range
 */
export function useShifts(startDate?: string, endDate?: string) {
  const start = startDate || new Date().toISOString().split('T')[0];
  const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return useQuery({
    queryKey: operationsKeys.shifts({ startDate: start, endDate: end }),
    queryFn: async (): Promise<Shift[]> => {
      try {
        return await operationsService.getShifts(start, end);
      } catch {
        return generateMockShifts();
      }
    },
    placeholderData: generateMockShifts,
  });
}

/**
 * Get active shifts
 */
export function useActiveShifts() {
  return useQuery({
    queryKey: operationsKeys.activeShifts(),
    queryFn: async (): Promise<Shift[]> => {
      try {
        return await operationsService.getActiveShifts();
      } catch {
        return generateMockShifts().filter(s => s.status === 'active');
      }
    },
  });
}

/**
 * Create a new shift
 */
export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) =>
      operationsService.createShift(shift),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.shifts() });
    },
  });
}

/**
 * Update shift
 */
export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shiftId, updates }: { shiftId: string; updates: Partial<Shift> }) =>
      operationsService.updateShift(shiftId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.shifts() });
    },
  });
}

// ============ Task Hooks ============

/**
 * Get all tasks
 */
export function useTasks(filters?: { status?: TaskStatus; shiftId?: string }) {
  return useQuery({
    queryKey: operationsKeys.tasks(filters),
    queryFn: async (): Promise<OperationTask[]> => {
      try {
        return await operationsService.getTasks(filters);
      } catch {
        let tasks = generateMockTasks();
        if (filters?.status) {
          tasks = tasks.filter(t => t.status === filters.status);
        }
        return tasks;
      }
    },
    placeholderData: generateMockTasks,
  });
}

/**
 * Get daily checklist
 */
export function useDailyChecklist(shiftId?: string) {
  return useQuery({
    queryKey: operationsKeys.checklist(shiftId),
    queryFn: async (): Promise<OperationTask[]> => {
      try {
        return await operationsService.getDailyChecklist(shiftId);
      } catch {
        return generateMockTasks().filter(t => t.category === 'daily');
      }
    },
  });
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Omit<OperationTask, 'id' | 'createdAt' | 'updatedAt'>) =>
      operationsService.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: operationsKeys.checklist() });
    },
  });
}

/**
 * Update task status
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      operationsService.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: operationsKeys.checklist() });
    },
  });
}

/**
 * Update checklist item
 */
export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, itemId, completed }: { taskId: string; itemId: string; completed: boolean }) =>
      operationsService.updateChecklistItem(taskId, itemId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: operationsKeys.checklist() });
    },
  });
}

/**
 * Assign task
 */
export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId, userName }: { taskId: string; userId: string; userName: string }) =>
      operationsService.assignTask(taskId, userId, userName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.tasks() });
    },
  });
}

// ============ Calendar Hooks ============

/**
 * Get calendar events
 */
export function useCalendarEvents(startDate?: string, endDate?: string) {
  const start = startDate || new Date().toISOString();
  const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return useQuery({
    queryKey: operationsKeys.calendar({ start, end }),
    queryFn: async (): Promise<OperationsCalendarEvent[]> => {
      try {
        return await operationsService.getCalendarEvents(start, end);
      } catch {
        return generateMockCalendarEvents();
      }
    },
    placeholderData: generateMockCalendarEvents,
  });
}

/**
 * Create calendar event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: Omit<OperationsCalendarEvent, 'id'>) =>
      operationsService.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.calendar() });
    },
  });
}

/**
 * Update calendar event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: Partial<OperationsCalendarEvent> }) =>
      operationsService.updateEvent(eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.calendar() });
    },
  });
}

/**
 * Delete calendar event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => operationsService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.calendar() });
    },
  });
}

// ============ Equipment Issues Hooks ============

/**
 * Get equipment issues
 */
export function useEquipmentIssues(status?: EquipmentStatus) {
  return useQuery({
    queryKey: operationsKeys.equipment(status),
    queryFn: async (): Promise<EquipmentIssue[]> => {
      try {
        return await operationsService.getEquipmentIssues(status);
      } catch {
        let issues = generateMockEquipmentIssues();
        if (status) {
          issues = issues.filter(i => i.status === status);
        }
        return issues;
      }
    },
    placeholderData: generateMockEquipmentIssues,
  });
}

/**
 * Report equipment issue
 */
export function useReportEquipmentIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issue: Omit<EquipmentIssue, 'id' | 'reportedAt'>) =>
      operationsService.reportEquipmentIssue(issue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.equipment() });
    },
  });
}

/**
 * Resolve equipment issue
 */
export function useResolveEquipmentIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, resolution }: { issueId: string; resolution: string }) =>
      operationsService.resolveEquipmentIssue(issueId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.equipment() });
    },
  });
}

// ============ Handover Hooks ============

/**
 * Get handover notes
 */
export function useHandoverNotes(shiftId?: string) {
  return useQuery({
    queryKey: operationsKeys.handover(shiftId),
    queryFn: async (): Promise<HandoverNote[]> => {
      try {
        if (shiftId) {
          return await operationsService.getHandoverNotes(shiftId);
        }
        return generateMockHandoverNotes();
      } catch {
        return generateMockHandoverNotes();
      }
    },
  });
}

/**
 * Create handover note
 */
export function useCreateHandoverNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: Omit<HandoverNote, 'id' | 'createdAt'>) =>
      operationsService.createHandoverNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.handover() });
    },
  });
}

// ============ Metrics & Reports Hooks ============

/**
 * Get operations metrics
 */
export function useOperationsMetrics() {
  return useQuery({
    queryKey: operationsKeys.metrics(),
    queryFn: async (): Promise<OperationsMetrics> => {
      try {
        return await operationsService.getMetrics();
      } catch {
        return generateMockMetrics();
      }
    },
    placeholderData: generateMockMetrics,
    refetchInterval: 30000,
  });
}

/**
 * Get operations reports history
 */
export function useOperationsReports(limit: number = 30) {
  return useQuery({
    queryKey: operationsKeys.reports(),
    queryFn: async (): Promise<OperationsReport[]> => {
      try {
        return await operationsService.getReportsHistory(limit);
      } catch {
        return [
          {
            id: 'REP-001',
            date: new Date().toISOString().split('T')[0],
            shiftType: 'morning',
            supervisor: 'Jane Smith',
            summary: { totalOrders: 234, completedOrders: 228, incidents: 2, revenue: 12500 },
            tasksCompleted: 8,
            tasksPending: 2,
            issues: ['Weather delay', 'Driver no-show'],
            notes: 'Overall smooth operations despite weather challenges.',
            createdAt: new Date().toISOString(),
          },
        ];
      }
    },
  });
}

/**
 * Generate operations report
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, shiftId }: { date: string; shiftId: string }) =>
      operationsService.generateReport(date, shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationsKeys.reports() });
    },
  });
}

// ============ Combined Hook ============

/**
 * Get all operations data at once
 */
export function useOperations() {
  const shifts = useShifts();
  const activeShifts = useActiveShifts();
  const tasks = useTasks();
  const calendar = useCalendarEvents();
  const equipment = useEquipmentIssues();
  const handover = useHandoverNotes();
  const metrics = useOperationsMetrics();
  const reports = useOperationsReports();

  return {
    shifts,
    activeShifts,
    tasks,
    calendar,
    equipment,
    handover,
    metrics,
    reports,
    isLoading:
      shifts.isLoading ||
      activeShifts.isLoading ||
      tasks.isLoading ||
      calendar.isLoading ||
      equipment.isLoading ||
      metrics.isLoading,
  };
}

export default useOperations;
