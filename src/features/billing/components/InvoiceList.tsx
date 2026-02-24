import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { XpressButton } from '@/components/ui/XpressButton';
import { Modal } from '@/components/ui/Modal';
import type { Invoice } from '@/services/billing/billing.service';
import {
  getInvoiceStatusVariant,
  getInvoiceStatusLabel,
  formatCurrency,
  formatDate,
  getDaysOverdue,
  useSendInvoice,
  useRecordPayment,
} from '@/features/billing/hooks/useBilling';
import {
  FileText,
  Mail,
  CheckCircle,
  DollarSign,
  AlertCircle,
  Clock,
  Download,
  Eye,
  Calendar,
} from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  onViewDetails: (invoice: Invoice) => void;
  onDownloadPdf: (invoice: Invoice) => void;
}

export function InvoiceList({ invoices, onViewDetails, onDownloadPdf }: InvoiceListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');

  const sendInvoiceMutation = useSendInvoice();
  const recordPaymentMutation = useRecordPayment();

  const handleSendInvoice = async (invoice: Invoice) => {
    await sendInvoiceMutation.mutateAsync(invoice.invoiceId);
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
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Invoice #</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Issue Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Due Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Total</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Balance</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const daysOverdue = invoice.status === 'overdue' ? getDaysOverdue(invoice.dates.dueDate) : 0;
              
              return (
                <tr
                  key={invoice.invoiceId}
                  className="border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => onViewDetails(invoice)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-white">{invoice.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-white">{invoice.customer.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">{invoice.customer.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      {formatDate(invoice.dates.issueDate)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className={`text-sm ${daysOverdue > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                        {formatDate(invoice.dates.dueDate)}
                        {daysOverdue > 0 && (
                          <span className="ml-1 text-xs text-red-400">({daysOverdue} days overdue)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <XpressBadge variant={getInvoiceStatusVariant(invoice.status)}>
                      {getInvoiceStatusLabel(invoice.status)}
                    </XpressBadge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-white">
                      {formatCurrency(invoice.totals.total)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm ${invoice.totals.balanceDue > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                      {formatCurrency(invoice.totals.balanceDue)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(invoice);
                        }}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadPdf(invoice);
                        }}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {invoice.status === 'draft' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendInvoice(invoice);
                          }}
                          className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-green-400 transition-colors"
                          title="Send Invoice"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      {['sent', 'overdue', 'partial'].includes(invoice.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                            setPaymentAmount(invoice.totals.balanceDue.toString());
                            setShowPaymentModal(true);
                          }}
                          className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-green-400 transition-colors"
                          title="Record Payment"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedInvoice(null);
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
                setSelectedInvoice(null);
                setPaymentAmount('');
                setPaymentReference('');
              }}
            >
              Cancel
            </XpressButton>
            <XpressButton
              onClick={handleRecordPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
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
    </>
  );
}

export default InvoiceList;
