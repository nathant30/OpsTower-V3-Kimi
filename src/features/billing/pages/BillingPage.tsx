import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { XpressButton } from '@/components/ui/XpressButton';
import { Modal } from '@/components/ui/Modal';
import { InvoiceList } from '@/features/billing/components/InvoiceList';
import { InvoiceGenerator } from '@/features/billing/components/InvoiceGenerator';
import {
  useInvoices,
  useBillingSettings,
  useBillingReport,
  useDownloadInvoicePdf,
  useExportInvoices,
  useSendInvoice,
  useRecordPayment,
  getInvoiceStatusVariant,
  getInvoiceStatusLabel,
  getBillingCycleLabel,
  getPaymentTermLabel,
  formatCurrency,
  formatDate,
  formatPercentage,
} from '@/features/billing/hooks/useBilling';
import type { Invoice, InvoiceStatus, BillingCycle } from '@/services/billing/billing.service';
import {
  FileText,
  Search,
  Plus,
  Download,
  Filter,
  Settings,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Building,
  CreditCard,
  Bell,
  Mail,
} from 'lucide-react';

type TabView = 'invoices' | 'settings' | 'reports' | 'rules';

const BillingPage = () => {
  const [activeTab, setActiveTab] = useState<TabView>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [billingCycleFilter, setBillingCycleFilter] = useState<BillingCycle | 'all'>('all');
  const [dateRange, setDateRange] = useState(() => ({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  }));
  const [showFilters, setShowFilters] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');

  // Queries
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({
    status: statusFilter !== 'all' ? [statusFilter] : undefined,
    billingCycle: billingCycleFilter !== 'all' ? billingCycleFilter : undefined,
    startDate: dateRange.start,
    endDate: dateRange.end,
    searchQuery: searchQuery || undefined,
    pageNumber: 1,
    pageSize: 50,
  });

  const { data: billingSettings } = useBillingSettings();
  const { data: billingReport } = useBillingReport(dateRange.start, dateRange.end);
  const downloadPdfMutation = useDownloadInvoicePdf();
  const exportInvoicesMutation = useExportInvoices();
  const sendInvoiceMutation = useSendInvoice();
  const recordPaymentMutation = useRecordPayment();

  const invoices = invoicesData?.items || [];

  // Stats
  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalRevenue: invoices.reduce((sum, i) => sum + i.totals.total, 0),
    outstanding: invoices.reduce((sum, i) => sum + i.totals.balanceDue, 0),
    overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.totals.balanceDue, 0),
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    const blob = await downloadPdfMutation.mutateAsync(invoice.invoiceId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const blob = await exportInvoicesMutation.mutateAsync({
      status: statusFilter !== 'all' ? [statusFilter] : undefined,
      searchQuery: searchQuery || undefined,
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return;
    
    await recordPaymentMutation.mutateAsync({
      invoiceId: selectedInvoice.invoiceId,
      payment: {
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        reference: paymentReference,
      },
    });
    
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentReference('');
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f14]">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-500" />
              Billing & Invoicing
            </h1>
            <p className="text-sm text-gray-500">Manage invoices, payments, and billing settings</p>
          </div>

          <div className="flex items-center gap-3">
            <XpressButton
              variant="secondary"
              size="sm"
              onClick={handleExport}
              loading={exportInvoicesMutation.isPending}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </XpressButton>
            <XpressButton
              size="sm"
              onClick={() => setShowGenerator(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Generate Invoice
            </XpressButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-gray-800">
          {[
            { key: 'invoices', label: 'Invoices', icon: FileText },
            { key: 'settings', label: 'Settings', icon: Settings },
            { key: 'reports', label: 'Reports', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabView)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-orange-400 border-orange-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Row - Only show on invoices tab */}
        {activeTab === 'invoices' && (
          <div className="grid grid-cols-6 gap-3 mb-4">
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-500">Total Invoices</p>
              <p className="text-lg font-semibold text-white">{stats.total}</p>
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-500">Draft</p>
              <p className="text-lg font-semibold text-gray-400">{stats.draft}</p>
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-500">Sent</p>
              <p className="text-lg font-semibold text-blue-400">{stats.sent}</p>
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-500">Paid</p>
              <p className="text-lg font-semibold text-green-400">{stats.paid}</p>
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-500">Overdue</p>
              <p className="text-lg font-semibold text-red-400">{stats.overdue}</p>
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-500">Outstanding</p>
              <p className="text-lg font-semibold text-amber-400">{formatCurrency(stats.outstanding)}</p>
            </div>
          </div>
        )}

        {/* Search & Filters - Only show on invoices tab */}
        {activeTab === 'invoices' && (
          <>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by invoice #, customer, or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    : 'bg-gray-950 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Billing Cycle</label>
                  <select
                    value={billingCycleFilter}
                    onChange={(e) => setBillingCycleFilter(e.target.value as BillingCycle | 'all')}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Cycles</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'invoices' && (
          <>
            {invoicesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading invoices...</p>
                </div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No invoices found</h3>
                  <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or generate a new invoice</p>
                  <XpressButton onClick={() => setShowGenerator(true)} icon={<Plus className="w-4 h-4" />}>
                    Generate Invoice
                  </XpressButton>
                </div>
              </div>
            ) : (
              <InvoiceList
                invoices={invoices}
                onViewDetails={handleViewDetails}
                onDownloadPdf={handleDownloadPdf}
              />
            )}
          </>
        )}

        {activeTab === 'settings' && billingSettings && (
          <div className="max-w-4xl space-y-6">
            {/* Company Settings */}
            <XpressCard title="Company Information" icon={<Building className="w-5 h-5" />}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Company Name</label>
                  <p className="text-white">{billingSettings.company.name}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tax ID</label>
                  <p className="text-white">{billingSettings.company.taxId}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone</label>
                  <p className="text-white">{billingSettings.company.phone}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email</label>
                  <p className="text-white">{billingSettings.company.email}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-500 mb-1">Address</label>
                  <p className="text-white">
                    {billingSettings.company.address.street}, {billingSettings.company.address.city},{' '}
                    {billingSettings.company.address.state} {billingSettings.company.address.zipCode}
                  </p>
                </div>
              </div>
            </XpressCard>

            {/* Payment Settings */}
            <XpressCard title="Payment Settings" icon={<CreditCard className="w-5 h-5" />}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Default Payment Terms</label>
                  <p className="text-white">{getPaymentTermLabel(billingSettings.paymentTerms)}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Default Billing Cycle</label>
                  <p className="text-white">{getBillingCycleLabel(billingSettings.defaultBillingCycle)}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tax Rate</label>
                  <p className="text-white">{formatPercentage(billingSettings.taxRate)}</p>
                </div>
              </div>
            </XpressCard>

            {/* Late Fee Settings */}
            <XpressCard title="Late Fee Settings" icon={<AlertCircle className="w-5 h-5" />}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Enabled</label>
                  <p className="text-white">{billingSettings.lateFee.enabled ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Percentage</label>
                  <p className="text-white">{billingSettings.lateFee.percentage}%</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Grace Period</label>
                  <p className="text-white">{billingSettings.lateFee.gracePeriodDays} days</p>
                </div>
              </div>
            </XpressCard>

            {/* Auto Billing Settings */}
            <XpressCard title="Auto Billing" icon={<Calendar className="w-5 h-5" />}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Auto Generate</label>
                  <p className="text-white">{billingSettings.autoBilling.enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Generate Before</label>
                  <p className="text-white">{billingSettings.autoBilling.generateBeforeDays} days</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Auto Send</label>
                  <p className="text-white">{billingSettings.autoBilling.autoSend ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </XpressCard>

            {/* Reminder Settings */}
            <XpressCard title="Reminder Settings" icon={<Bell className="w-5 h-5" />}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Enabled</label>
                  <p className="text-white">{billingSettings.reminders.enabled ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Days Before Due</label>
                  <p className="text-white">{billingSettings.reminders.daysBeforeDue.join(', ')}</p>
                </div>
              </div>
            </XpressCard>
          </div>
        )}

        {activeTab === 'reports' && billingReport && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <XpressCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(billingReport.summary.totalRevenue)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </XpressCard>
              <XpressCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Paid</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(billingReport.summary.totalPaid)}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </XpressCard>
              <XpressCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Outstanding</p>
                    <p className="text-2xl font-bold text-amber-400">{formatCurrency(billingReport.summary.totalOutstanding)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
              </XpressCard>
              <XpressCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Overdue</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(billingReport.summary.totalOverdue)}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </XpressCard>
            </div>

            {/* Status Breakdown */}
            <XpressCard title="Status Breakdown" icon={<FileText className="w-5 h-5" />}>
              <div className="grid grid-cols-6 gap-4">
                {Object.entries(billingReport.byStatus).map(([status, data]) => (
                  <div key={status} className="text-center p-4 bg-white/5 rounded-lg">
                    <XpressBadge variant={getInvoiceStatusVariant(status as InvoiceStatus)}>
                      {getInvoiceStatusLabel(status as InvoiceStatus)}
                    </XpressBadge>
                    <p className="text-2xl font-bold text-white mt-2">{data.count}</p>
                    <p className="text-sm text-gray-400">{formatCurrency(data.amount)}</p>
                  </div>
                ))}
              </div>
            </XpressCard>

            {/* Top Customers */}
            <XpressCard title="Top Customers by Revenue" icon={<Users className="w-5 h-5" />}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 text-sm font-medium text-gray-400">Customer</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-400">Invoices</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-400">Total Amount</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-400">Paid</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-400">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {billingReport.byCustomer.slice(0, 10).map((customer) => (
                    <tr key={customer.customerId} className="border-b border-gray-800/50">
                      <td className="py-3 text-sm text-white">{customer.customerName}</td>
                      <td className="py-3 text-sm text-right text-gray-400">{customer.invoiceCount}</td>
                      <td className="py-3 text-sm text-right text-white">{formatCurrency(customer.totalAmount)}</td>
                      <td className="py-3 text-sm text-right text-green-400">{formatCurrency(customer.paidAmount)}</td>
                      <td className="py-3 text-sm text-right text-amber-400">
                        {formatCurrency(customer.totalAmount - customer.paidAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </XpressCard>
          </div>
        )}
      </div>

      {/* Invoice Generator Modal */}
      <Modal
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        title="Generate Invoice"
        size="lg"
      >
        <InvoiceGenerator onSuccess={() => setShowGenerator(false)} />
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Invoice Details"
        size="lg"
        footer={
          <>
            <XpressButton variant="ghost" onClick={() => setShowDetailModal(false)}>
              Close
            </XpressButton>
            <XpressButton
              variant="secondary"
              onClick={() => selectedInvoice && handleDownloadPdf(selectedInvoice)}
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </XpressButton>
            {selectedInvoice?.status === 'draft' && (
              <XpressButton
                onClick={() => selectedInvoice && sendInvoiceMutation.mutate(selectedInvoice.invoiceId)}
                loading={sendInvoiceMutation.isPending}
                icon={<Mail className="w-4 h-4" />}
              >
                Send Invoice
              </XpressButton>
            )}
            {['sent', 'overdue', 'partial'].includes(selectedInvoice?.status || '') && (
              <XpressButton
                onClick={() => {
                  setShowDetailModal(false);
                  setPaymentAmount(selectedInvoice?.totals.balanceDue.toString() || '');
                  setShowPaymentModal(true);
                }}
              >
                Record Payment
              </XpressButton>
            )}
          </>
        }
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedInvoice.invoiceNumber}</h3>
                <p className="text-sm text-gray-400">{selectedInvoice.invoiceId}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <XpressBadge variant={getInvoiceStatusVariant(selectedInvoice.status)}>
                  {getInvoiceStatusLabel(selectedInvoice.status)}
                </XpressBadge>
                <span className="text-sm text-gray-400">
                  {getBillingCycleLabel(selectedInvoice.billingCycle)}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Issue Date</p>
                <p className="text-sm text-white">{formatDate(selectedInvoice.dates.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className={`text-sm ${selectedInvoice.status === 'overdue' ? 'text-red-400' : 'text-white'}`}>
                  {formatDate(selectedInvoice.dates.dueDate)}
                </p>
              </div>
              {selectedInvoice.dates.paidDate && (
                <div>
                  <p className="text-xs text-gray-500">Paid Date</p>
                  <p className="text-sm text-green-400">{formatDate(selectedInvoice.dates.paidDate)}</p>
                </div>
              )}
              {selectedInvoice.dates.sentDate && (
                <div>
                  <p className="text-xs text-gray-500">Sent Date</p>
                  <p className="text-sm text-white">{formatDate(selectedInvoice.dates.sentDate)}</p>
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Bill To</h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-white">{selectedInvoice.customer.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-400">{selectedInvoice.customer.email}</span>
                    <span className="text-sm text-gray-500">{selectedInvoice.customer.phone}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedInvoice.customer.billingAddress.street}, {selectedInvoice.customer.billingAddress.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Line Items</h4>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 text-xs text-gray-500">Description</th>
                    <th className="text-left py-2 text-xs text-gray-500">Service</th>
                    <th className="text-right py-2 text-xs text-gray-500">Qty</th>
                    <th className="text-right py-2 text-xs text-gray-500">Unit Price</th>
                    <th className="text-right py-2 text-xs text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.itemId} className="border-b border-gray-800/50">
                      <td className="py-3 text-sm text-white">{item.description}</td>
                      <td className="py-3 text-sm text-gray-400">{item.serviceType}</td>
                      <td className="py-3 text-sm text-right text-white">{item.quantity}</td>
                      <td className="py-3 text-sm text-right text-white">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-sm text-right text-white">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(selectedInvoice.totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax ({formatPercentage(selectedInvoice.totals.taxRate, 0)})</span>
                  <span className="text-white">{formatCurrency(selectedInvoice.totals.taxAmount)}</span>
                </div>
                {selectedInvoice.totals.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">-{formatCurrency(selectedInvoice.totals.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-800 flex justify-between">
                  <span className="font-medium text-white">Total</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(selectedInvoice.totals.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount Paid</span>
                  <span className="text-green-400">{formatCurrency(selectedInvoice.totals.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Balance Due</span>
                  <span className="text-amber-400 font-medium">{formatCurrency(selectedInvoice.totals.balanceDue)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {selectedInvoice.payment && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="text-sm font-medium text-green-400 mb-2">Payment Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Method</p>
                    <p className="text-sm text-white capitalize">{selectedInvoice.payment.method.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="text-sm text-white">{selectedInvoice.payment.reference || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Terms */}
            {(selectedInvoice.notes || selectedInvoice.terms) && (
              <div className="p-4 bg-white/5 rounded-lg">
                {selectedInvoice.notes && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-white">{selectedInvoice.notes}</p>
                  </div>
                )}
                {selectedInvoice.terms && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Terms & Conditions</p>
                    <p className="text-sm text-gray-400">{selectedInvoice.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentAmount('');
          setPaymentReference('');
        }}
        title="Record Payment"
        size="md"
        footer={
          <>
            <XpressButton
              variant="ghost"
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentAmount('');
                setPaymentReference('');
              }}
            >
              Cancel
            </XpressButton>
            <XpressButton
              onClick={handleRecordPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || recordPaymentMutation.isPending}
              loading={recordPaymentMutation.isPending}
            >
              Record Payment
            </XpressButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Invoice</span>
              <span className="text-sm font-medium text-white">{selectedInvoice?.invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-400">Balance Due</span>
              <span className="text-sm font-medium text-amber-400">
                {selectedInvoice && formatCurrency(selectedInvoice.totals.balanceDue)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="gcash">GCash</option>
              <option value="maya">Maya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reference Number <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., REF-123456"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BillingPage;
