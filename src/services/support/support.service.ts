/**
 * Support Service - API integration for support ticketing system
 */

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'escalated' | 'closed' | 'waiting';
export type TicketPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TicketCategory = 'technical' | 'billing' | 'driver' | 'passenger' | 'other';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  reporter: {
    id: string;
    name: string;
    role: 'Passenger' | 'Driver' | 'Admin';
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  author: {
    id: string;
    name: string;
    role: 'Passenger' | 'Driver' | 'Admin' | 'System';
    avatar?: string;
  };
  content: string;
  createdAt: string;
  isInternal: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus[];
  priority?: TicketPriority[];
  category?: TicketCategory[];
  assignedTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface TicketListResponse {
  items: SupportTicket[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  avgResponseTime: string;
  satisfaction: number;
}

export interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: TicketCategory;
}

const mockTickets: SupportTicket[] = [
  {
    id: 'TKT-001',
    subject: 'Driver did not arrive at pickup location',
    description: 'I booked a ride 30 minutes ago but the driver never showed up. The app still shows the driver as "on the way" but I cannot contact them.',
    status: 'open',
    priority: 'high',
    category: 'driver',
    reporter: { id: 'P001', name: 'Maria Cruz', role: 'Passenger' },
    createdAt: '2025-02-16T08:30:00',
    updatedAt: '2025-02-16T08:30:00',
    tags: ['no-show', 'driver-issue', 'urgent'],
  },
  {
    id: 'TKT-002',
    subject: 'Payment not reflected in account',
    description: 'I paid via GCash but the app still shows pending payment. The money was deducted from my GCash wallet but the ride is marked as unpaid.',
    status: 'in-progress',
    priority: 'urgent',
    category: 'billing',
    reporter: { id: 'P002', name: 'Juan Santos', role: 'Passenger' },
    assignedTo: { id: 'A001', name: 'Sarah Chen' },
    createdAt: '2025-02-16T07:15:00',
    updatedAt: '2025-02-16T09:45:00',
    tags: ['payment', 'gcash', 'billing-issue'],
  },
  {
    id: 'TKT-003',
    subject: 'App keeps crashing on login',
    description: 'After the latest update, I cannot log in to the driver app. It crashes immediately after entering my password. I have tried reinstalling the app.',
    status: 'escalated',
    priority: 'high',
    category: 'technical',
    reporter: { id: 'D001', name: 'Pedro Reyes', role: 'Driver' },
    assignedTo: { id: 'A002', name: 'Tech Team' },
    createdAt: '2025-02-15T14:20:00',
    updatedAt: '2025-02-16T10:00:00',
    tags: ['app-crash', 'login', 'technical'],
  },
  {
    id: 'TKT-004',
    subject: 'Refund request for cancelled ride',
    description: 'I was charged even though the driver cancelled the ride. I need a full refund as this was not my fault.',
    status: 'resolved',
    priority: 'high',
    category: 'billing',
    reporter: { id: 'P003', name: 'Ana Lopez', role: 'Passenger' },
    assignedTo: { id: 'A003', name: 'Finance Team' },
    createdAt: '2025-02-15T10:00:00',
    updatedAt: '2025-02-16T08:00:00',
    resolvedAt: '2025-02-16T08:00:00',
    tags: ['refund', 'cancellation', 'billing'],
  },
  {
    id: 'TKT-005',
    subject: 'How to update vehicle documents',
    description: 'Need help uploading new insurance documents. The current ones are expiring next week.',
    status: 'closed',
    priority: 'low',
    category: 'driver',
    reporter: { id: 'D002', name: 'Carlos Mendez', role: 'Driver' },
    assignedTo: { id: 'A001', name: 'Sarah Chen' },
    createdAt: '2025-02-14T16:45:00',
    updatedAt: '2025-02-15T09:00:00',
    resolvedAt: '2025-02-15T09:00:00',
    tags: ['documents', 'insurance', 'help'],
  },
  {
    id: 'TKT-006',
    subject: 'Account suspended without reason',
    description: 'My account was suspended this morning but I have not received any email explaining why. I need to use the app for work today.',
    status: 'open',
    priority: 'urgent',
    category: 'passenger',
    reporter: { id: 'P005', name: 'Sofia Garcia', role: 'Passenger' },
    createdAt: '2025-02-16T06:00:00',
    updatedAt: '2025-02-16T06:00:00',
    tags: ['suspension', 'account', 'urgent'],
  },
  {
    id: 'TKT-007',
    subject: 'Fare calculation seems incorrect',
    description: 'The fare for my last trip was much higher than usual for the same route. Can you check if surge pricing was applied correctly?',
    status: 'in-progress',
    priority: 'medium',
    category: 'billing',
    reporter: { id: 'P004', name: 'Carlos Mendoza', role: 'Passenger' },
    assignedTo: { id: 'A004', name: 'Mike Johnson' },
    createdAt: '2025-02-15T20:30:00',
    updatedAt: '2025-02-16T08:15:00',
    tags: ['fare', 'pricing', 'surge'],
  },
  {
    id: 'TKT-008',
    subject: 'Cannot accept rides',
    description: 'For the past 2 hours, I have not received any ride requests even though I am online and in a busy area. Is there something wrong with my account?',
    status: 'open',
    priority: 'high',
    category: 'driver',
    reporter: { id: 'D003', name: 'Miguel Torres', role: 'Driver' },
    createdAt: '2025-02-16T09:00:00',
    updatedAt: '2025-02-16T09:00:00',
    tags: ['no-rides', 'connectivity', 'driver-app'],
  },
  {
    id: 'TKT-009',
    subject: 'Lost item in ride',
    description: 'I left my wallet in the car during my last ride. The driver is not responding to calls. Please help me contact them.',
    status: 'escalated',
    priority: 'urgent',
    category: 'passenger',
    reporter: { id: 'P006', name: 'Isabella Reyes', role: 'Passenger' },
    assignedTo: { id: 'A005', name: 'Support Lead' },
    createdAt: '2025-02-15T22:00:00',
    updatedAt: '2025-02-16T07:30:00',
    tags: ['lost-item', 'urgent', 'driver-contact'],
  },
  {
    id: 'TKT-010',
    subject: 'Feature request: Multiple stops',
    description: 'It would be great if we could add multiple stops in a single ride. This would be very helpful for running errands.',
    status: 'closed',
    priority: 'low',
    category: 'other',
    reporter: { id: 'P007', name: 'Rafael Lim', role: 'Passenger' },
    assignedTo: { id: 'A006', name: 'Product Team' },
    createdAt: '2025-02-14T10:00:00',
    updatedAt: '2025-02-14T14:00:00',
    resolvedAt: '2025-02-14T14:00:00',
    tags: ['feature-request', 'feedback'],
  },
  {
    id: 'TKT-011',
    subject: 'Weekly earnings report not received',
    description: 'I usually get my weekly earnings report every Monday but I have not received it this week. Can you resend it?',
    status: 'in-progress',
    priority: 'medium',
    category: 'driver',
    reporter: { id: 'D004', name: 'Antonio Tan', role: 'Driver' },
    assignedTo: { id: 'A001', name: 'Sarah Chen' },
    createdAt: '2025-02-16T08:00:00',
    updatedAt: '2025-02-16T08:30:00',
    tags: ['earnings', 'report', 'email'],
  },
  {
    id: 'TKT-012',
    subject: 'Wrong route taken by driver',
    description: 'The driver took a much longer route than necessary, resulting in a fare that was double what it should have been.',
    status: 'resolved',
    priority: 'medium',
    category: 'passenger',
    reporter: { id: 'P008', name: 'Carmen Wong', role: 'Passenger' },
    assignedTo: { id: 'A004', name: 'Mike Johnson' },
    createdAt: '2025-02-15T18:00:00',
    updatedAt: '2025-02-16T06:00:00',
    resolvedAt: '2025-02-16T06:00:00',
    tags: ['route', 'fare', 'refund'],
  },
];

const mockMessages: Record<string, TicketMessage[]> = {
  'TKT-001': [
    {
      id: 'MSG-001',
      ticketId: 'TKT-001',
      author: { id: 'P001', name: 'Maria Cruz', role: 'Passenger' },
      content: 'I have been waiting for 30 minutes now. The driver is not moving on the map.',
      createdAt: '2025-02-16T08:30:00',
      isInternal: false,
    },
    {
      id: 'MSG-002',
      ticketId: 'TKT-001',
      author: { id: 'P001', name: 'Maria Cruz', role: 'Passenger' },
      content: 'I tried calling the driver but it goes straight to voicemail.',
      createdAt: '2025-02-16T08:35:00',
      isInternal: false,
    },
  ],
  'TKT-002': [
    {
      id: 'MSG-003',
      ticketId: 'TKT-002',
      author: { id: 'P002', name: 'Juan Santos', role: 'Passenger' },
      content: 'I paid ₱250 via GCash (Transaction ID: 123456789) but the app shows unpaid.',
      createdAt: '2025-02-16T07:15:00',
      isInternal: false,
    },
    {
      id: 'MSG-004',
      ticketId: 'TKT-002',
      author: { id: 'A001', name: 'Sarah Chen', role: 'Admin' },
      content: 'Thank you for reporting this. I am checking our payment logs now.',
      createdAt: '2025-02-16T07:30:00',
      isInternal: false,
    },
    {
      id: 'MSG-005',
      ticketId: 'TKT-002',
      author: { id: 'A001', name: 'Sarah Chen', role: 'Admin' },
      content: 'Found the issue - there was a delay in GCash webhook. I will manually mark this as paid.',
      createdAt: '2025-02-16T09:45:00',
      isInternal: false,
    },
  ],
  'TKT-003': [
    {
      id: 'MSG-006',
      ticketId: 'TKT-003',
      author: { id: 'D001', name: 'Pedro Reyes', role: 'Driver' },
      content: 'I am using an iPhone 12 with iOS 17.3. The app version is 3.2.1.',
      createdAt: '2025-02-15T14:25:00',
      isInternal: false,
    },
    {
      id: 'MSG-007',
      ticketId: 'TKT-003',
      author: { id: 'A002', name: 'Tech Team', role: 'Admin' },
      content: 'We are investigating this issue. It appears to affect iOS 17.3 users.',
      createdAt: '2025-02-15T15:00:00',
      isInternal: false,
    },
    {
      id: 'MSG-008',
      ticketId: 'TKT-003',
      author: { id: 'A002', name: 'Tech Team', role: 'Admin' },
      content: 'Escalating to dev team - this needs a hotfix.',
      createdAt: '2025-02-16T10:00:00',
      isInternal: true,
    },
  ],
};

const mockQuickReplies: QuickReply[] = [
  {
    id: 'QR-001',
    title: 'Payment Verification',
    content: 'Thank you for contacting us. We have verified your payment and the issue has been resolved. The ride is now marked as paid.',
    category: 'billing',
  },
  {
    id: 'QR-002',
    title: 'Refund Processed',
    content: 'We apologize for the inconvenience. A full refund of ₱{amount} has been processed and will reflect in your account within 3-5 business days.',
    category: 'billing',
  },
  {
    id: 'QR-003',
    title: 'App Troubleshooting',
    content: 'Please try the following steps: 1) Force close the app 2) Clear cache 3) Restart your device 4) Reinstall if the issue persists.',
    category: 'technical',
  },
  {
    id: 'QR-004',
    title: 'Driver No-Show',
    content: 'We sincerely apologize for this experience. The driver has been flagged and we have waived the cancellation fee. You may book another ride.',
    category: 'driver',
  },
  {
    id: 'QR-005',
    title: 'Document Instructions',
    content: 'To update your documents: 1) Go to Profile 2) Tap Documents 3) Select the document to update 4) Upload a clear photo 5) Submit for review.',
    category: 'driver',
  },
  {
    id: 'QR-006',
    title: 'Escalation Notice',
    content: 'Your case has been escalated to our specialist team. They will contact you within 24 hours with a resolution.',
    category: 'other',
  },
];

const mockAgents = [
  { id: 'A001', name: 'Sarah Chen', avatar: '' },
  { id: 'A002', name: 'Tech Team', avatar: '' },
  { id: 'A003', name: 'Finance Team', avatar: '' },
  { id: 'A004', name: 'Mike Johnson', avatar: '' },
  { id: 'A005', name: 'Support Lead', avatar: '' },
  { id: 'A006', name: 'Product Team', avatar: '' },
];

export const supportService = {
  async getTickets(filters: TicketFilters = {}): Promise<TicketListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockTickets];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.subject.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.id.toLowerCase().includes(search) ||
          t.reporter.name.toLowerCase().includes(search)
      );
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((t) => filters.status!.includes(t.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((t) => filters.priority!.includes(t.priority));
    }

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter((t) => filters.category!.includes(t.category));
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(
        (t) => t.assignedTo?.id === filters.assignedTo || (!t.assignedTo && filters.assignedTo === 'unassigned')
      );
    }

    const pageNumber = filters.pageNumber || 1;
    const pageSize = filters.pageSize || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      total,
      pageNumber,
      pageSize,
      totalPages,
    };
  },

  async getTicket(id: string): Promise<SupportTicket | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockTickets.find((t) => t.id === id) || null;
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockMessages[ticketId] || [];
  },

  async getTicketStats(): Promise<TicketStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      open: mockTickets.filter((t) => t.status === 'open').length,
      inProgress: mockTickets.filter((t) => t.status === 'in-progress').length,
      resolved: mockTickets.filter((t) => t.status === 'resolved').length,
      escalated: mockTickets.filter((t) => t.status === 'escalated').length,
      avgResponseTime: '4.2m',
      satisfaction: 4.6,
    };
  },

  async getQuickReplies(category?: TicketCategory): Promise<QuickReply[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (category) {
      return mockQuickReplies.filter((qr) => qr.category === category);
    }
    return mockQuickReplies;
  },

  async getAgents(): Promise<Array<{ id: string; name: string; avatar?: string }>> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockAgents;
  },

  async assignTicket(ticketId: string, agentId: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const ticket = mockTickets.find((t) => t.id === ticketId);
    const agent = mockAgents.find((a) => a.id === agentId);
    if (ticket && agent) {
      ticket.assignedTo = agent;
      ticket.updatedAt = new Date().toISOString();
    }
    return { success: true };
  },

  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus
  ): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const ticket = mockTickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      if (status === 'resolved') {
        ticket.resolvedAt = new Date().toISOString();
      }
    }
    return { success: true };
  },

  async escalateTicket(ticketId: string, reason: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const ticket = mockTickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = 'escalated';
      ticket.priority = 'urgent';
      ticket.updatedAt = new Date().toISOString();
      ticket.tags.push('escalated', reason);
    }
    return { success: true };
  },

  async addMessage(
    ticketId: string,
    content: string,
    isInternal: boolean = false
  ): Promise<TicketMessage> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const message: TicketMessage = {
      id: `MSG-${Date.now()}`,
      ticketId,
      author: { id: 'CURRENT_USER', name: 'You', role: 'Admin' },
      content,
      createdAt: new Date().toISOString(),
      isInternal,
    };
    if (!mockMessages[ticketId]) {
      mockMessages[ticketId] = [];
    }
    mockMessages[ticketId].push(message);
    
    const ticket = mockTickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.updatedAt = new Date().toISOString();
    }
    
    return message;
  },
};

export default supportService;
