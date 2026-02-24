/**
 * Operations Service
 * Manages operations calendar, tasks, shifts, and team coordination
 */

import { apiClient } from '@/lib/api/client';

// ============ Types ============

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'overnight';
export type ShiftStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'out-of-service';
export type EquipmentType = 'vehicle' | 'device' | 'tool' | 'facility';

export interface Shift {
  id: string;
  type: ShiftType;
  status: ShiftStatus;
  startTime: string;
  endTime: string;
  assignedStaff: ShiftStaff[];
  supervisor?: string;
  notes?: string;
  handoverFrom?: string;
  handoverTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftStaff {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface HandoverNote {
  id: string;
  fromShiftId: string;
  toShiftId: string;
  fromSupervisor: string;
  toSupervisor?: string;
  notes: string;
  pendingIssues: string[];
  completedTasks: string[];
  createdAt: string;
  acknowledgedAt?: string;
}

export interface OperationTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  shiftId?: string;
  dueDate?: string;
  completedAt?: string;
  checklist?: TaskChecklistItem[];
  category: 'daily' | 'weekly' | 'monthly' | 'incident' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface OperationsCalendarEvent {
  id: string;
  title: string;
  type: 'shift' | 'meeting' | 'maintenance' | 'training' | 'audit' | 'other';
  startTime: string;
  endTime: string;
  attendees?: string[];
  location?: string;
  description?: string;
  shiftId?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface EquipmentIssue {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  status: EquipmentStatus;
  issue: string;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  priority: TaskPriority;
  estimatedResolution?: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface OperationsMetrics {
  totalShifts: number;
  activeShifts: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  staffOnDuty: number;
  equipmentIssues: number;
  avgTaskCompletionTime: number; // minutes
  shiftCoverage: number; // percentage
}

export interface OperationsReport {
  id: string;
  date: string;
  shiftType: ShiftType;
  supervisor: string;
  summary: {
    totalOrders: number;
    completedOrders: number;
    incidents: number;
    revenue: number;
  };
  tasksCompleted: number;
  tasksPending: number;
  issues: string[];
  notes: string;
  createdAt: string;
}

// ============ Operations Service ============

export const operationsService = {
  // ============ Shifts ============

  /**
   * Get all shifts for a date range
   */
  async getShifts(startDate: string, endDate: string): Promise<Shift[]> {
    const response = await apiClient.get<{ shifts: Shift[] }>(
      `api/operations/shifts?startDate=${startDate}&endDate=${endDate}`
    );
    return response.shifts;
  },

  /**
   * Get current active shifts
   */
  async getActiveShifts(): Promise<Shift[]> {
    const response = await apiClient.get<{ shifts: Shift[] }>('api/operations/shifts/active');
    return response.shifts;
  },

  /**
   * Get shift by ID
   */
  async getShift(shiftId: string): Promise<Shift> {
    return apiClient.get(`api/operations/shifts/${shiftId}`);
  },

  /**
   * Create a new shift
   */
  async createShift(shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift> {
    return apiClient.post('api/operations/shifts', shift);
  },

  /**
   * Update shift
   */
  async updateShift(shiftId: string, updates: Partial<Shift>): Promise<Shift> {
    return apiClient.patch(`api/operations/shifts/${shiftId}`, updates);
  },

  // ============ Handover Notes ============

  /**
   * Get handover notes for a shift
   */
  async getHandoverNotes(shiftId: string): Promise<HandoverNote[]> {
    const response = await apiClient.get<{ notes: HandoverNote[] }>(
      `api/operations/shifts/${shiftId}/handover`
    );
    return response.notes;
  },

  /**
   * Create handover note
   */
  async createHandoverNote(note: Omit<HandoverNote, 'id' | 'createdAt'>): Promise<HandoverNote> {
    return apiClient.post('api/operations/handover', note);
  },

  /**
   * Acknowledge handover note
   */
  async acknowledgeHandover(noteId: string): Promise<void> {
    await apiClient.post(`api/operations/handover/${noteId}/acknowledge`, {});
  },

  // ============ Tasks ============

  /**
   * Get all tasks
   */
  async getTasks(params?: {
    status?: TaskStatus;
    shiftId?: string;
    assignedTo?: string;
  }): Promise<OperationTask[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.shiftId) queryParams.append('shiftId', params.shiftId);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);

    const response = await apiClient.get<{ tasks: OperationTask[] }>(
      `api/operations/tasks?${queryParams.toString()}`
    );
    return response.tasks;
  },

  /**
   * Get tasks for daily checklist
   */
  async getDailyChecklist(shiftId?: string): Promise<OperationTask[]> {
    const response = await apiClient.get<{ tasks: OperationTask[] }>(
      `api/operations/tasks/checklist${shiftId ? `?shiftId=${shiftId}` : ''}`
    );
    return response.tasks;
  },

  /**
   * Create a new task
   */
  async createTask(task: Omit<OperationTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationTask> {
    return apiClient.post('api/operations/tasks', task);
  },

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<OperationTask> {
    return apiClient.patch(`api/operations/tasks/${taskId}/status`, { status });
  },

  /**
   * Update checklist item
   */
  async updateChecklistItem(
    taskId: string,
    itemId: string,
    completed: boolean
  ): Promise<void> {
    await apiClient.patch(`api/operations/tasks/${taskId}/checklist/${itemId}`, { completed });
  },

  /**
   * Assign task
   */
  async assignTask(taskId: string, userId: string, userName: string): Promise<OperationTask> {
    return apiClient.patch(`api/operations/tasks/${taskId}/assign`, { userId, userName });
  },

  // ============ Calendar Events ============

  /**
   * Get calendar events
   */
  async getCalendarEvents(startDate: string, endDate: string): Promise<OperationsCalendarEvent[]> {
    const response = await apiClient.get<{ events: OperationsCalendarEvent[] }>(
      `api/operations/calendar?startDate=${startDate}&endDate=${endDate}`
    );
    return response.events;
  },

  /**
   * Create calendar event
   */
  async createEvent(event: Omit<OperationsCalendarEvent, 'id'>): Promise<OperationsCalendarEvent> {
    return apiClient.post('api/operations/calendar', event);
  },

  /**
   * Update event
   */
  async updateEvent(eventId: string, updates: Partial<OperationsCalendarEvent>): Promise<OperationsCalendarEvent> {
    return apiClient.patch(`api/operations/calendar/${eventId}`, updates);
  },

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<void> {
    await apiClient.delete(`api/operations/calendar/${eventId}`);
  },

  // ============ Equipment Issues ============

  /**
   * Get all equipment issues
   */
  async getEquipmentIssues(status?: EquipmentStatus): Promise<EquipmentIssue[]> {
    const url = status ? `api/operations/equipment?status=${status}` : 'api/operations/equipment';
    const response = await apiClient.get<{ issues: EquipmentIssue[] }>(url);
    return response.issues;
  },

  /**
   * Report equipment issue
   */
  async reportEquipmentIssue(
    issue: Omit<EquipmentIssue, 'id' | 'reportedAt'>
  ): Promise<EquipmentIssue> {
    return apiClient.post('api/operations/equipment', issue);
  },

  /**
   * Update equipment issue
   */
  async updateEquipmentIssue(
    issueId: string,
    updates: Partial<EquipmentIssue>
  ): Promise<EquipmentIssue> {
    return apiClient.patch(`api/operations/equipment/${issueId}`, updates);
  },

  /**
   * Resolve equipment issue
   */
  async resolveEquipmentIssue(issueId: string, resolution: string): Promise<EquipmentIssue> {
    return apiClient.patch(`api/operations/equipment/${issueId}/resolve`, { resolution });
  },

  // ============ Metrics ============

  /**
   * Get operations metrics
   */
  async getMetrics(): Promise<OperationsMetrics> {
    return apiClient.get('api/operations/metrics');
  },

  /**
   * Get operations report
   */
  async getReport(date: string, shiftType?: ShiftType): Promise<OperationsReport> {
    const url = shiftType 
      ? `api/operations/reports?date=${date}&shiftType=${shiftType}`
      : `api/operations/reports?date=${date}`;
    return apiClient.get(url);
  },

  /**
   * Generate operations report
   */
  async generateReport(date: string, shiftId: string): Promise<OperationsReport> {
    return apiClient.post('api/operations/reports/generate', { date, shiftId });
  },

  /**
   * Get reports history
   */
  async getReportsHistory(limit: number = 30): Promise<OperationsReport[]> {
    const response = await apiClient.get<{ reports: OperationsReport[] }>(
      `api/operations/reports/history?limit=${limit}`
    );
    return response.reports;
  },
};

// ============ Mock Data Generators ============

export function generateMockShifts(): Shift[] {
  const today = new Date();
  const shifts: Shift[] = [];

  const shiftConfigs: Array<{ type: ShiftType; startHour: number; endHour: number }> = [
    { type: 'morning', startHour: 6, endHour: 14 },
    { type: 'afternoon', startHour: 14, endHour: 22 },
    { type: 'night', startHour: 22, endHour: 30 }, // 22:00 to 06:00 next day
  ];

  // Generate shifts for the next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);

    shiftConfigs.forEach((config, index) => {
      const startTime = new Date(date);
      startTime.setHours(config.startHour, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(config.endHour, 0, 0, 0);

      const now = new Date();
      let status: ShiftStatus = 'scheduled';
      if (now >= startTime && now < endTime) status = 'active';
      else if (now >= endTime) status = 'completed';

      shifts.push({
        id: `SHIFT-${day}-${index}`,
        type: config.type,
        status,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        assignedStaff: [
          { id: 'STAFF-001', name: 'John Doe', role: 'Operator', checkInTime: status === 'active' ? startTime.toISOString() : undefined },
          { id: 'STAFF-002', name: 'Jane Smith', role: 'Supervisor' },
          { id: 'STAFF-003', name: 'Mike Johnson', role: 'Dispatcher' },
        ],
        supervisor: 'Jane Smith',
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    });
  }

  return shifts;
}

export function generateMockTasks(): OperationTask[] {
  return [
    {
      id: 'TASK-001',
      title: 'Morning Fleet Check',
      description: 'Verify all vehicles are operational and drivers are logged in',
      status: 'completed',
      priority: 'high',
      assignedTo: 'STAFF-001',
      assignedToName: 'John Doe',
      category: 'daily',
      checklist: [
        { id: 'CHK-001', text: 'Check driver logins', completed: true, completedAt: new Date().toISOString(), completedBy: 'John Doe' },
        { id: 'CHK-002', text: 'Verify vehicle status', completed: true, completedAt: new Date().toISOString(), completedBy: 'John Doe' },
        { id: 'CHK-003', text: 'Review overnight incidents', completed: true, completedAt: new Date().toISOString(), completedBy: 'John Doe' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TASK-002',
      title: 'Update Demand Forecast',
      description: 'Update demand predictions based on historical data and events',
      status: 'in-progress',
      priority: 'medium',
      assignedTo: 'STAFF-002',
      assignedToName: 'Jane Smith',
      category: 'daily',
      checklist: [
        { id: 'CHK-004', text: 'Analyze yesterday data', completed: true },
        { id: 'CHK-005', text: 'Check local events', completed: false },
        { id: 'CHK-006', text: 'Update zone predictions', completed: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TASK-003',
      title: 'Process Driver Payouts',
      description: 'Review and approve pending driver payouts',
      status: 'pending',
      priority: 'high',
      category: 'daily',
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TASK-004',
      title: 'Weekly Performance Review',
      description: 'Compile weekly operations performance report',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'STAFF-002',
      assignedToName: 'Jane Smith',
      category: 'weekly',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TASK-005',
      title: 'Emergency Response Drill',
      description: 'Conduct monthly emergency response protocol drill',
      status: 'pending',
      priority: 'high',
      category: 'monthly',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function generateMockCalendarEvents(): OperationsCalendarEvent[] {
  const today = new Date();
  const events: OperationsCalendarEvent[] = [];

  // Shift events
  const shiftTimes = [
    { type: 'morning' as const, start: 6, end: 14 },
    { type: 'afternoon' as const, start: 14, end: 22 },
    { type: 'night' as const, start: 22, end: 30 },
  ];

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);

    shiftTimes.forEach(shift => {
      const start = new Date(date);
      start.setHours(shift.start, 0, 0, 0);
      const end = new Date(date);
      end.setHours(shift.end, 0, 0, 0);

      events.push({
        id: `EVT-SHIFT-${day}-${shift.type}`,
        title: `${shift.type.charAt(0).toUpperCase() + shift.type.slice(1)} Shift`,
        type: 'shift',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'scheduled',
      });
    });
  }

  // Add some meetings
  events.push({
    id: 'EVT-MEET-001',
    title: 'Operations Standup',
    type: 'meeting',
    startTime: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
    endTime: new Date(today.setHours(9, 30, 0, 0)).toISOString(),
    attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    location: 'Conference Room A',
    status: 'scheduled',
  });

  events.push({
    id: 'EVT-MAINT-001',
    title: 'System Maintenance Window',
    type: 'maintenance',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    description: 'Scheduled database optimization and updates',
    status: 'scheduled',
  });

  return events;
}

export function generateMockEquipmentIssues(): EquipmentIssue[] {
  return [
    {
      id: 'EQ-001',
      equipmentId: 'VEH-1234',
      equipmentName: 'Toyota Vios - ABC-123',
      equipmentType: 'vehicle',
      status: 'repair',
      issue: 'Brake pad replacement needed',
      reportedBy: 'Driver Juan Santos',
      reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      assignedTo: 'Mechanic Team A',
      estimatedResolution: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'EQ-002',
      equipmentId: 'DEV-5678',
      equipmentName: 'Dispatch Terminal 3',
      equipmentType: 'device',
      status: 'maintenance',
      issue: 'Screen flickering and touch response issues',
      reportedBy: 'Operator Jane Smith',
      reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      assignedTo: 'IT Support',
    },
    {
      id: 'EQ-003',
      equipmentId: 'VEH-5679',
      equipmentName: 'Honda Beat - XYZ-789',
      equipmentType: 'vehicle',
      status: 'operational',
      issue: 'Oil change completed',
      reportedBy: 'Fleet Manager',
      reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      resolution: 'Regular maintenance completed',
    },
    {
      id: 'EQ-004',
      equipmentId: 'FAC-001',
      equipmentName: 'Operations Center AC Unit',
      equipmentType: 'facility',
      status: 'repair',
      issue: 'AC not cooling properly in Zone B',
      reportedBy: 'Staff Member',
      reportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      assignedTo: 'Facilities Team',
    },
  ];
}

export function generateMockHandoverNotes(): HandoverNote[] {
  return [
    {
      id: 'HO-001',
      fromShiftId: 'SHIFT-0-0',
      toShiftId: 'SHIFT-0-1',
      fromSupervisor: 'Jane Smith',
      toSupervisor: 'Mike Johnson',
      notes: 'Morning shift was busy due to rain. Several drivers reported slippery road conditions. Peak demand was handled well with 95% assignment rate.',
      pendingIssues: ['Monitor weather conditions', 'Follow up on 3 pending incidents'],
      completedTasks: ['Fleet check completed', 'Morning standup conducted'],
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'HO-002',
      fromShiftId: 'SHIFT--1-2',
      toShiftId: 'SHIFT-0-0',
      fromSupervisor: 'Sarah Wilson',
      toSupervisor: 'Jane Smith',
      notes: 'Quiet night shift. Only 2 minor incidents reported. All vehicles returned safely. One driver reported late due to traffic.',
      pendingIssues: ['Review driver late arrival', 'Check vehicle VEH-1234 brakes'],
      completedTasks: ['Night patrol completed', 'All systems checked'],
      createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function generateMockMetrics(): OperationsMetrics {
  return {
    totalShifts: 21,
    activeShifts: 1,
    completedTasks: 47,
    pendingTasks: 12,
    overdueTasks: 2,
    staffOnDuty: 8,
    equipmentIssues: 4,
    avgTaskCompletionTime: 45,
    shiftCoverage: 94,
  };
}

export default operationsService;
