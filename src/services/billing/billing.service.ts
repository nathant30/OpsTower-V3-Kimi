/**
 * Billing Service - API layer for billing and invoicing
 */
import { apiClient } from '@/lib/api/client';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partial';
export type BillingCycle = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
export type PaymentTerm = 'net7' | 'net15' | 'net30' | 'net45' | 'due_on_receipt';

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  
  // Customer info
  customer: {
    customerId: string;
    name: string;
    email: string;
    phone: string;
    billingAddress: Address;
  };
  
  // Invoice dates
  dates: {
    issueDate: string;
    dueDate: string;
    paidDate?: string;
    sentDate?: string;
  };
  
  // Line items
  items: InvoiceItem[];
  
  // Totals
  totals: {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discount: number;
    total: number;
    amountPaid: number;
    balanceDue: number;
  };
  
  // Payment info
  payment?: {
    method: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'gcash' | 'maya';
    reference?: string;
    notes?: string;
  };
  
  // Metadata
  notes?: string;
  terms?: string;
  billingCycle: BillingCycle;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface InvoiceItem {
  itemId: string;
  description: string;
  serviceType: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  // Reference to order/booking
  reference?: {
    type: 'order' | 'booking' | 'subscription';
    id: string;
    date: string;
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BillingSettings {
  company: {
    name: string;
    address: Address;
    phone: string;
    email: string;
    taxId: string;
  };
  paymentTerms: PaymentTerm;
  defaultBillingCycle: BillingCycle;
  taxRate: number;
  lateFee: {
    enabled: boolean;
    percentage: number;
    gracePeriodDays: number;
  };
  autoBilling: {
    enabled: boolean;
    generateBeforeDays: number;
    autoSend: boolean;
  };
  reminders: {
    enabled: boolean;
    daysBeforeDue: number[];
    daysAfterOverdue: number[];
  };
}

export interface AutomatedRule {
  ruleId: string;
  name: string;
  enabled: boolean;
  conditions: {
    minAmount?: number;
    maxAmount?: number;
    customerType?: string[];
    serviceType?: string[];
  };
  actions: {
    autoApprove: boolean;
    autoSend: boolean;
    applyDiscount?: number;
    addLateFee?: boolean;
  };
}

export interface BillingReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalInvoices: number;
    totalRevenue: number;
    totalPaid: number;
    totalOutstanding: number;
    totalOverdue: number;
  };
  byStatus: Record<InvoiceStatus, { count: number; amount: number }>;
  byCustomer: Array<{
    customerId: string;
    customerName: string;
    invoiceCount: number;
    totalAmount: number;
    paidAmount: number;
  }>;
}

export interface InvoicesFilters {
  status?: InvoiceStatus[];
  billingCycle?: BillingCycle;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface InvoicesResponse {
  items: Invoice[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface GenerateInvoiceRequest {
  customerId: string;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  items: Array<{
    description: string;
    serviceType: string;
    quantity: number;
    unitPrice: number;
    referenceId?: string;
  }>;
  notes?: string;
  dueDate: string;
}

// Generate mock invoices
function generateMockInvoices(page: number, pageSize: number, filters?: InvoicesFilters): InvoicesResponse {
  const statuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'partial'];
  const billingCycles: BillingCycle[] = ['weekly', 'biweekly', 'monthly', 'quarterly'];
  const customers = [
    { id: 'cust-001', name: 'Acme Corporation', email: 'billing@acme.com', phone: '+63 2 8123 4567' },
    { id: 'cust-002', name: 'Global Logistics Inc', email: 'ap@globallogistics.com', phone: '+63 2 8987 6543' },
    { id: 'cust-003', name: 'Metro Retail Group', email: 'finance@metrortail.com', phone: '+63 2 8888 9999' },
    { id: 'cust-004', name: 'Sunrise Trading Co', email: 'payments@sunrise.com', phone: '+63 2 8777 1111' },
    { id: 'cust-005', name: 'Pacific Express Ltd', email: 'billing@pacific.com', phone: '+63 2 8666 2222' },
    { id: 'cust-006', name: 'Island Deliveries', email: 'accounts@island.com', phone: '+63 2 8555 3333' },
  ];
  const serviceTypes = ['Taxi Service', 'Delivery Service', 'Corporate Transport', 'Logistics', 'Express Delivery'];

  const allInvoices: Invoice[] = Array.from({ length: 150 }, (_, i) => {
    const index = i + 1;
    const customer = customers[i % customers.length];
    const status = statuses[i % statuses.length];
    const cycle = billingCycles[i % billingCycles.length];
    const issueDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const isPaid = status === 'paid';
    const isOverdue = status === 'overdue';
    const subtotal = Math.floor(Math.random() * 50000) + 5000;
    const taxRate = 0.12;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    const amountPaid = isPaid ? total : isOverdue ? Math.floor(total * 0.3) : 0;

    return {
      invoiceId: `INV-${2025}-${String(index).padStart(5, '0')}`,
      invoiceNumber: `XP-${2025}-${String(index).padStart(4, '0')}`,
      status,
      customer: {
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        billingAddress: {
          street: `${100 + i} Business Ave`,
          city: 'Makati City',
          state: 'Metro Manila',
          zipCode: '1200',
          country: 'Philippines',
        },
      },
      dates: {
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        paidDate: isPaid ? new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        sentDate: issueDate.toISOString(),
      },
      items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => {
        const qty = Math.floor(Math.random() * 20) + 1;
        const unitPrice = Math.floor(Math.random() * 500) + 100;
        return {
          itemId: `ITEM-${index}-${j}`,
          description: `${serviceTypes[(i + j) % serviceTypes.length]} - Week ${j + 1}`,
          serviceType: serviceTypes[(i + j) % serviceTypes.length],
          quantity: qty,
          unitPrice,
          amount: qty * unitPrice,
          reference: {
            type: 'order',
            id: `ORD-${2025}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            date: new Date(issueDate.getTime() - j * 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        };
      }),
      totals: {
        subtotal,
        taxRate,
        taxAmount,
        discount: 0,
        total,
        amountPaid,
        balanceDue: total - amountPaid,
      },
      payment: isPaid ? {
        method: ['bank_transfer', 'credit_card', 'gcash'][i % 3] as 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'gcash' | 'maya',
        reference: `PAY-${String(Math.floor(Math.random() * 1000000)).padStart(8, '0')}`,
      } : undefined,
      notes: i % 10 === 0 ? 'Please include invoice number in payment reference' : undefined,
      terms: 'Payment due within 30 days. Late payments subject to 2% monthly service charge.',
      billingCycle: cycle,
      createdAt: issueDate.toISOString(),
      updatedAt: issueDate.toISOString(),
      createdBy: 'system',
    };
  });

  // Apply filters
  let filtered = allInvoices;
  if (filters?.status?.length) {
    filtered = filtered.filter(inv => filters.status?.includes(inv.status));
  }
  if (filters?.billingCycle) {
    filtered = filtered.filter(inv => inv.billingCycle === filters.billingCycle);
  }
  if (filters?.customerId) {
    filtered = filtered.filter(inv => inv.customer.customerId === filters.customerId);
  }
  if (filters?.minAmount !== undefined) {
    filtered = filtered.filter(inv => inv.totals.total >= filters.minAmount!);
  }
  if (filters?.maxAmount !== undefined) {
    filtered = filtered.filter(inv => inv.totals.total <= filters.maxAmount!);
  }
  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(inv =>
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.customer.name.toLowerCase().includes(query) ||
      inv.customer.email.toLowerCase().includes(query)
    );
  }

  // Pagination
  const pageNum = filters?.pageNumber || 1;
  const size = filters?.pageSize || 20;
  const start = (pageNum - 1) * size;
  const paginated = filtered.slice(start, start + size);

  return {
    items: paginated,
    total: filtered.length,
    pageNumber: pageNum,
    pageSize: size,
    totalPages: Math.ceil(filtered.length / size),
  };
}

export const billingService = {
  // Get invoices list
  async getInvoices(filters: InvoicesFilters = {}): Promise<InvoicesResponse> {
    return generateMockInvoices(filters.pageNumber || 1, filters.pageSize || 20, filters);
    
    // Real API call:
    // return apiClient.post<InvoicesResponse>('api/billing/invoices', filters);
  },

  // Get single invoice
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const all = await this.getInvoices({ pageNumber: 1, pageSize: 1000 });
    return all.items.find(inv => inv.invoiceId === invoiceId) || null;
    
    // Real API call:
    // return apiClient.get<Invoice>(`api/billing/invoices/${invoiceId}`);
  },

  // Generate invoice
  async generateInvoice(data: GenerateInvoiceRequest): Promise<Invoice> {
    const invoiceNumber = `XP-${2025}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = 0.12;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      invoiceId: `INV-${Date.now()}`,
      invoiceNumber,
      status: 'draft',
      customer: {
        customerId: data.customerId,
        name: 'Customer Name',
        email: 'customer@example.com',
        phone: '+63 900 000 0000',
        billingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Philippines',
        },
      },
      dates: {
        issueDate: new Date().toISOString(),
        dueDate: data.dueDate,
      },
      items: data.items.map((item, i) => ({
        itemId: `ITEM-${i}`,
        description: item.description,
        serviceType: item.serviceType,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice,
        reference: item.referenceId ? {
          type: 'order',
          id: item.referenceId,
          date: new Date().toISOString(),
        } : undefined,
      })),
      totals: {
        subtotal,
        taxRate,
        taxAmount,
        discount: 0,
        total,
        amountPaid: 0,
        balanceDue: total,
      },
      notes: data.notes,
      billingCycle: data.billingCycle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };
    
    // Real API call:
    // return apiClient.post<Invoice>('api/billing/invoices/generate', data);
  },

  // Update invoice
  async updateInvoice(invoiceId: string, data: Partial<Invoice>): Promise<Invoice> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    
    return {
      ...invoice,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // Real API call:
    // return apiClient.patch<Invoice>(`api/billing/invoices/${invoiceId}`, data);
  },

  // Send invoice
  async sendInvoice(invoiceId: string): Promise<void> {
    // Sending invoice
    // Mock success
    
    // Real API call:
    // await apiClient.post(`api/billing/invoices/${invoiceId}/send`);
  },

  // Record payment
  async recordPayment(invoiceId: string, payment: { amount: number; method: string; reference?: string; notes?: string }): Promise<void> {
    // Recording payment for invoice
    // Mock success
    
    // Real API call:
    // await apiClient.post(`api/billing/invoices/${invoiceId}/payment`, payment);
  },

  // Cancel invoice
  async cancelInvoice(invoiceId: string, reason: string): Promise<void> {
    // Cancelling invoice with reason
    // Mock success
    
    // Real API call:
    // await apiClient.post(`api/billing/invoices/${invoiceId}/cancel`, { reason });
  },

  // Get billing settings
  async getBillingSettings(): Promise<BillingSettings> {
    return {
      company: {
        name: 'Xpress Transport Solutions Inc.',
        address: {
          street: '123 Business Center, Ayala Avenue',
          city: 'Makati City',
          state: 'Metro Manila',
          zipCode: '1226',
          country: 'Philippines',
        },
        phone: '+63 2 8123 4567',
        email: 'billing@xpress.com',
        taxId: 'TIN-123-456-789-000',
      },
      paymentTerms: 'net30',
      defaultBillingCycle: 'monthly',
      taxRate: 0.12,
      lateFee: {
        enabled: true,
        percentage: 2,
        gracePeriodDays: 7,
      },
      autoBilling: {
        enabled: true,
        generateBeforeDays: 5,
        autoSend: false,
      },
      reminders: {
        enabled: true,
        daysBeforeDue: [7, 3, 1],
        daysAfterOverdue: [1, 7, 14, 30],
      },
    };
    
    // Real API call:
    // return apiClient.get<BillingSettings>('api/billing/settings');
  },

  // Update billing settings
  async updateBillingSettings(settings: Partial<BillingSettings>): Promise<BillingSettings> {
    const current = await this.getBillingSettings();
    return { ...current, ...settings };
    
    // Real API call:
    // return apiClient.put<BillingSettings>('api/billing/settings', settings);
  },

  // Get automated rules
  async getAutomatedRules(): Promise<AutomatedRule[]> {
    return [
      {
        ruleId: 'rule-001',
        name: 'Auto-approve small invoices',
        enabled: true,
        conditions: {
          maxAmount: 5000,
        },
        actions: {
          autoApprove: true,
          autoSend: false,
        },
      },
      {
        ruleId: 'rule-002',
        name: 'VIP Customer Discount',
        enabled: true,
        conditions: {
          customerType: ['vip', 'enterprise'],
        },
        actions: {
          autoApprove: true,
          autoSend: true,
          applyDiscount: 10,
        },
      },
      {
        ruleId: 'rule-003',
        name: 'Late Fee for Overdue',
        enabled: true,
        conditions: {
          minAmount: 10000,
        },
        actions: {
          autoApprove: false,
          autoSend: false,
          addLateFee: true,
        },
      },
    ];
    
    // Real API call:
    // return apiClient.get<AutomatedRule[]>('api/billing/rules');
  },

  // Get billing report
  async getBillingReport(startDate: string, endDate: string): Promise<BillingReport> {
    const invoices = await this.getInvoices({ startDate, endDate, pageNumber: 1, pageSize: 1000 });
    const items = invoices.items;
    
    const byStatus = {
      draft: { count: 0, amount: 0 },
      sent: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      cancelled: { count: 0, amount: 0 },
      partial: { count: 0, amount: 0 },
    };
    
    items.forEach(inv => {
      byStatus[inv.status].count++;
      byStatus[inv.status].amount += inv.totals.total;
    });

    const byCustomerMap = new Map<string, { customerId: string; customerName: string; invoiceCount: number; totalAmount: number; paidAmount: number }>();
    items.forEach(inv => {
      const existing = byCustomerMap.get(inv.customer.customerId);
      if (existing) {
        existing.invoiceCount++;
        existing.totalAmount += inv.totals.total;
        existing.paidAmount += inv.totals.amountPaid;
      } else {
        byCustomerMap.set(inv.customer.customerId, {
          customerId: inv.customer.customerId,
          customerName: inv.customer.name,
          invoiceCount: 1,
          totalAmount: inv.totals.total,
          paidAmount: inv.totals.amountPaid,
        });
      }
    });

    return {
      period: { startDate, endDate },
      summary: {
        totalInvoices: items.length,
        totalRevenue: items.reduce((sum, inv) => sum + inv.totals.total, 0),
        totalPaid: items.reduce((sum, inv) => sum + inv.totals.amountPaid, 0),
        totalOutstanding: items.reduce((sum, inv) => sum + inv.totals.balanceDue, 0),
        totalOverdue: items.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totals.balanceDue, 0),
      },
      byStatus,
      byCustomer: Array.from(byCustomerMap.values()).sort((a, b) => b.totalAmount - a.totalAmount),
    };
    
    // Real API call:
    // return apiClient.post<BillingReport>('api/billing/reports', { startDate, endDate });
  },

  // Get customer billing history
  async getCustomerBillingHistory(customerId: string): Promise<Invoice[]> {
    const invoices = await this.getInvoices({ customerId, pageNumber: 1, pageSize: 100 });
    return invoices.items;
    
    // Real API call:
    // return apiClient.get<Invoice[]>(`api/billing/customers/${customerId}/history`);
  },

  // Download invoice PDF
  async downloadInvoicePdf(invoiceId: string): Promise<Blob> {
    // Mock PDF
    const content = `Invoice ${invoiceId}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    return blob;
    
    // Real API call:
    // return apiClient.get<Blob>(`api/billing/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
  },

  // Export invoices
  async exportInvoices(filters: InvoicesFilters): Promise<Blob> {
    const csvContent = 'Invoice Number,Customer,Status,Issue Date,Due Date,Total,Balance Due\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return blob;
    
    // Real API call:
    // return apiClient.post<Blob>('api/billing/invoices/export', filters, { responseType: 'blob' });
  },
};
