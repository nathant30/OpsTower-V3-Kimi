import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { Modal } from '@/components/ui/Modal';
import {
  useGenerateInvoice,
  useBillingSettings,
  getBillingCycleLabel,
  formatCurrency,
} from '@/features/billing/hooks/useBilling';
import type { BillingCycle } from '@/services/billing/billing.service';
import {
  Plus,
  Trash2,
  Calendar,
  Building,
  FileText,
  DollarSign,
} from 'lucide-react';

interface InvoiceLineItem {
  id: string;
  description: string;
  serviceType: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceGeneratorProps {
  onSuccess?: () => void;
}

export function InvoiceGenerator({ onSuccess }: InvoiceGeneratorProps) {
  const [customerId, setCustomerId] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: '', serviceType: 'Taxi Service', quantity: 1, unitPrice: 0 },
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const generateInvoiceMutation = useGenerateInvoice();
  const { data: billingSettings } = useBillingSettings();

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxRate = billingSettings?.taxRate || 0.12;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        description: '',
        serviceType: 'Taxi Service',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleGenerate = async () => {
    if (!customerId || !startDate || !endDate || !dueDate) return;

    await generateInvoiceMutation.mutateAsync({
      customerId,
      billingCycle,
      startDate,
      endDate,
      dueDate,
      notes,
      items: lineItems.map((item) => ({
        description: item.description,
        serviceType: item.serviceType,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

    setShowPreview(false);
    onSuccess?.();
    
    // Reset form
    setCustomerId('');
    setStartDate('');
    setEndDate('');
    setDueDate('');
    setNotes('');
    setLineItems([{ id: '1', description: '', serviceType: 'Taxi Service', quantity: 1, unitPrice: 0 }]);
  };

  const isValid = customerId && startDate && endDate && dueDate && lineItems.every(item => item.description && item.unitPrice >= 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Generate Invoice</h2>
          <p className="text-sm text-gray-400">Create a new invoice for a customer</p>
        </div>
      </div>

      {/* Customer & Billing Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Customer <span className="text-red-400">*</span>
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select customer...</option>
            <option value="cust-001">Acme Corporation</option>
            <option value="cust-002">Global Logistics Inc</option>
            <option value="cust-003">Metro Retail Group</option>
            <option value="cust-004">Sunrise Trading Co</option>
            <option value="cust-005">Pacific Express Ltd</option>
            <option value="cust-006">Island Deliveries</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Billing Cycle <span className="text-red-400">*</span>
          </label>
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
            className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Due Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Line Items</h3>
          <XpressButton variant="secondary" size="sm" onClick={addLineItem} icon={<Plus className="w-4 h-4" />}>
            Add Item
          </XpressButton>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={item.id} className="p-4 bg-white/5 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5">
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Service description..."
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs text-gray-500 mb-1">Service Type</label>
                  <select
                    value={item.serviceType}
                    onChange={(e) => updateLineItem(item.id, 'serviceType', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Taxi Service</option>
                    <option>Delivery Service</option>
                    <option>Corporate Transport</option>
                    <option>Logistics</option>
                    <option>Express Delivery</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notes <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes or terms..."
          className="w-full h-24 px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>

      {/* Summary */}
      <div className="p-4 bg-white/5 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tax ({(taxRate * 100).toFixed(0)}%)</span>
            <span className="text-white">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="pt-2 border-t border-gray-800 flex justify-between">
            <span className="text-base font-medium text-white">Total</span>
            <span className="text-lg font-semibold text-green-400">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <XpressButton
          variant="secondary"
          onClick={() => setShowPreview(true)}
          disabled={!isValid}
        >
          Preview Invoice
        </XpressButton>
        <XpressButton
          onClick={handleGenerate}
          disabled={!isValid || generateInvoiceMutation.isPending}
          loading={generateInvoiceMutation.isPending}
        >
          Generate Invoice
        </XpressButton>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Invoice Preview"
        size="lg"
        footer={
          <>
            <XpressButton variant="ghost" onClick={() => setShowPreview(false)}>
              Edit
            </XpressButton>
            <XpressButton
              onClick={handleGenerate}
              disabled={generateInvoiceMutation.isPending}
              loading={generateInvoiceMutation.isPending}
            >
              Generate Invoice
            </XpressButton>
          </>
        }
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">INVOICE</h3>
              <p className="text-sm text-gray-400 mt-1">Draft Preview</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Billing Cycle</p>
              <p className="text-white font-medium">{getBillingCycleLabel(billingCycle)}</p>
            </div>
          </div>

          {/* Company & Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">From</p>
              <p className="text-sm font-medium text-white">{billingSettings?.company.name}</p>
              <p className="text-xs text-gray-400">{billingSettings?.company.address.city}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">To</p>
              <p className="text-sm font-medium text-white">
                {customerId === 'cust-001' && 'Acme Corporation'}
                {customerId === 'cust-002' && 'Global Logistics Inc'}
                {customerId === 'cust-003' && 'Metro Retail Group'}
                {customerId === 'cust-004' && 'Sunrise Trading Co'}
                {customerId === 'cust-005' && 'Pacific Express Ltd'}
                {customerId === 'cust-006' && 'Island Deliveries'}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Period</p>
              <p className="text-sm text-white">{startDate} - {endDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="text-sm text-white">{dueDate}</p>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 text-xs text-gray-500">Description</th>
                <th className="text-left py-2 text-xs text-gray-500">Service</th>
                <th className="text-right py-2 text-xs text-gray-500">Qty</th>
                <th className="text-right py-2 text-xs text-gray-500">Price</th>
                <th className="text-right py-2 text-xs text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-800/50">
                  <td className="py-2 text-sm text-white">{item.description || '-'}</td>
                  <td className="py-2 text-sm text-gray-400">{item.serviceType}</td>
                  <td className="py-2 text-sm text-right text-white">{item.quantity}</td>
                  <td className="py-2 text-sm text-right text-white">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-sm text-right text-white">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax</span>
                <span className="text-white">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between">
                <span className="font-medium text-white">Total</span>
                <span className="text-lg font-bold text-green-400">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {notes && (
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-white">{notes}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default InvoiceGenerator;
