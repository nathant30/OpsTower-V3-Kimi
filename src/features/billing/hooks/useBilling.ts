import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService, type InvoicesFilters, type GenerateInvoiceRequest, type BillingSettings } from '@/services/billing/billing.service';
import type { Invoice, InvoiceStatus, BillingCycle, PaymentTerm } from '@/services/billing/billing.service';

// Get invoices list
export function useInvoices(filters: InvoicesFilters = {}) {
  return useQuery({
    queryKey: ['invoices', 'list', filters],
    queryFn: () => billingService.getInvoices(filters),
    staleTime: 30000,
  });
}

// Get single invoice
export function useInvoice(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => billingService.getInvoice(invoiceId!),
    enabled: !!invoiceId,
  });
}

// Generate invoice
export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GenerateInvoiceRequest) => billingService.generateInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
    },
  });
}

// Update invoice
export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: Partial<Invoice> }) => 
      billingService.updateInvoice(invoiceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
    },
  });
}

// Send invoice
export function useSendInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoiceId: string) => billingService.sendInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
    },
  });
}

// Record payment
export function useRecordPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, payment }: { invoiceId: string; payment: { amount: number; method: string; reference?: string; notes?: string } }) => 
      billingService.recordPayment(invoiceId, payment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
    },
  });
}

// Cancel invoice
export function useCancelInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, reason }: { invoiceId: string; reason: string }) => 
      billingService.cancelInvoice(invoiceId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
    },
  });
}

// Get billing settings
export function useBillingSettings() {
  return useQuery({
    queryKey: ['billing', 'settings'],
    queryFn: () => billingService.getBillingSettings(),
    staleTime: 60000,
  });
}

// Update billing settings
export function useUpdateBillingSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Partial<BillingSettings>) => billingService.updateBillingSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'settings'] });
    },
  });
}

// Get automated rules
export function useAutomatedRules() {
  return useQuery({
    queryKey: ['billing', 'rules'],
    queryFn: () => billingService.getAutomatedRules(),
  });
}

// Get billing report
export function useBillingReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['billing', 'report', startDate, endDate],
    queryFn: () => billingService.getBillingReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// Get customer billing history
export function useCustomerBillingHistory(customerId: string | undefined) {
  return useQuery({
    queryKey: ['billing', 'history', customerId],
    queryFn: () => billingService.getCustomerBillingHistory(customerId!),
    enabled: !!customerId,
  });
}

// Download invoice PDF
export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: (invoiceId: string) => billingService.downloadInvoicePdf(invoiceId),
  });
}

// Export invoices
export function useExportInvoices() {
  return useMutation({
    mutationFn: (filters: InvoicesFilters) => billingService.exportInvoices(filters),
  });
}

// Status badge helper
export function getInvoiceStatusVariant(status: InvoiceStatus) {
  switch (status) {
    case 'draft':
      return 'offline';
    case 'sent':
      return 'info';
    case 'paid':
      return 'active';
    case 'overdue':
      return 'alert';
    case 'cancelled':
      return 'offline';
    case 'partial':
      return 'warning';
    default:
      return 'default';
  }
}

// Status label helper
export function getInvoiceStatusLabel(status: InvoiceStatus) {
  const labels: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    partial: 'Partial',
  };
  return labels[status] || status;
}

// Billing cycle label helper
export function getBillingCycleLabel(cycle: BillingCycle) {
  const labels: Record<BillingCycle, string> = {
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
  };
  return labels[cycle] || cycle;
}

// Payment term label helper
export function getPaymentTermLabel(term: PaymentTerm) {
  const labels: Record<PaymentTerm, string> = {
    net7: 'Net 7 days',
    net15: 'Net 15 days',
    net30: 'Net 30 days',
    net45: 'Net 45 days',
    due_on_receipt: 'Due on receipt',
  };
  return labels[term] || term;
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options || defaultOptions);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

// Calculate days until due
export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get days overdue
export function getDaysOverdue(dueDate: string): number {
  const days = getDaysUntilDue(dueDate);
  return days < 0 ? Math.abs(days) : 0;
}
