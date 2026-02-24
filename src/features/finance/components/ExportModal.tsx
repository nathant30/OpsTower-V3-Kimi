import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
// formatCurrency is not used in this file
import { 
  FileSpreadsheet, 
  FileText, 
  FileDown,
  Download,
  Calendar,
  CheckCircle,
  FileType,
  Filter,
  Loader2
} from 'lucide-react';

export type ExportFormat = 'Excel' | 'CSV' | 'PDF';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: {
    format: ExportFormat;
    startDate: string;
    endDate: string;
    includeBreakdown: boolean;
    transactionTypes?: string[];
  }) => Promise<void>;
  totalTransactions?: number;
  estimatedSize?: string;
}

const transactionTypes = [
  { value: 'OrderPayment', label: 'Order Payment', color: 'bg-xpress-accent-blue/20 text-xpress-accent-blue' },
  { value: 'DriverEarnings', label: 'Driver Earnings', color: 'bg-xpress-accent-green/20 text-xpress-accent-green' },
  { value: 'Commission', label: 'Commission', color: 'bg-xpress-accent-purple/20 text-xpress-accent-purple' },
  { value: 'Payout', label: 'Payout', color: 'bg-xpress-accent-amber/20 text-xpress-accent-amber' },
  { value: 'TopUp', label: 'Top Up', color: 'bg-xpress-accent-cyan/20 text-xpress-accent-cyan' },
  { value: 'Refund', label: 'Refund', color: 'bg-xpress-accent-red/20 text-xpress-accent-red' },
  { value: 'Adjustment', label: 'Adjustment', color: 'bg-xpress-text-muted/20 text-xpress-text-muted' },
  { value: 'Fee', label: 'Fee', color: 'bg-xpress-text-secondary/20 text-xpress-text-secondary' },
];

const formatConfig: Record<ExportFormat, { icon: React.ReactNode; label: string; description: string; extension: string }> = {
  Excel: {
    icon: <FileSpreadsheet className="w-8 h-8" />,
    label: 'Excel (.xlsx)',
    description: 'Best for data analysis with formulas and formatting',
    extension: 'xlsx'
  },
  CSV: {
    icon: <FileText className="w-8 h-8" />,
    label: 'CSV (.csv)',
    description: 'Universal format, compatible with all systems',
    extension: 'csv'
  },
  PDF: {
    icon: <FileDown className="w-8 h-8" />,
    label: 'PDF (.pdf)',
    description: 'Formatted document for sharing and printing',
    extension: 'pdf'
  }
};

export function ExportModal({ 
  isOpen, 
  onClose, 
  onExport,
  totalTransactions = 0,
  estimatedSize = '0 MB'
}: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('Excel');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeBreakdown, setIncludeBreakdown] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const toggleTransactionType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleExport = async () => {
    if (!startDate || !endDate) return;
    
    setIsExporting(true);
    try {
      await onExport({
        format,
        startDate,
        endDate,
        includeBreakdown,
        transactionTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      });
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getDefaultDateRange = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    return {
      end: today.toISOString().split('T')[0],
      start: lastMonth.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDateRange();

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm text-xpress-text-muted">
        {isExporting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Preparing export...
          </span>
        ) : exportSuccess ? (
          <span className="flex items-center gap-2 text-xpress-accent-green">
            <CheckCircle className="w-4 h-4" />
            Export ready!
          </span>
        ) : (
          <span>Estimated: {estimatedSize}</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleExport}
          disabled={!startDate || !endDate || isExporting}
          icon={isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Transactions"
      size="lg"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="text-sm font-medium text-xpress-text-secondary mb-3 flex items-center gap-2">
            <FileType className="w-4 h-4" />
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(formatConfig) as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  format === fmt 
                    ? 'border-xpress-accent-blue bg-xpress-accent-blue/10' 
                    : 'border-xpress-border bg-xpress-bg-secondary hover:bg-xpress-bg-tertiary'
                }`}
              >
                <div className={`mb-2 ${format === fmt ? 'text-xpress-accent-blue' : 'text-xpress-text-muted'}`}>
                  {formatConfig[fmt].icon}
                </div>
                <p className={`font-medium ${format === fmt ? 'text-xpress-accent-blue' : 'text-xpress-text-primary'}`}>
                  {formatConfig[fmt].label}
                </p>
                <p className="text-xs text-xpress-text-muted mt-1">
                  {formatConfig[fmt].description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-sm font-medium text-xpress-text-secondary mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || defaultDates.end}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={defaultDates.end}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                const today = new Date();
                setStartDate(today.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
            >
              Today
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
            >
              Last 7 Days
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                setStartDate(monthAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
            >
              Last 30 Days
            </Button>
          </div>
        </div>

        {/* Transaction Type Filter */}
        <div>
          <label className="text-sm font-medium text-xpress-text-secondary mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Transaction Types 
            <span className="text-xpress-text-muted font-normal">
              ({selectedTypes.length === 0 ? 'All types' : `${selectedTypes.length} selected`})
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {transactionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleTransactionType(type.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTypes.length === 0 || selectedTypes.includes(type.value)
                    ? type.color
                    : 'bg-xpress-bg-tertiary text-xpress-text-muted'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="text-sm font-medium text-xpress-text-secondary mb-3">Options</label>
          <label className="flex items-center gap-3 p-3 bg-xpress-bg-secondary rounded-lg cursor-pointer hover:bg-xpress-bg-tertiary transition-colors">
            <input
              type="checkbox"
              checked={includeBreakdown}
              onChange={(e) => setIncludeBreakdown(e.target.checked)}
              className="w-4 h-4 rounded border-xpress-border bg-xpress-bg-secondary text-xpress-accent-blue focus:ring-xpress-accent-blue"
            />
            <div>
              <p className="text-sm font-medium text-xpress-text-primary">Include detailed breakdown</p>
              <p className="text-xs text-xpress-text-muted">Add fare components, fees, and commission details</p>
            </div>
          </label>
        </div>

        {/* Summary */}
        <div className="p-4 bg-xpress-bg-secondary rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-xpress-text-muted">Transactions to export</span>
            <span className="font-semibold text-xpress-text-primary">
              {totalTransactions.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-xpress-text-muted">File format</span>
            <span className="font-medium text-xpress-text-primary">
              {formatConfig[format].label}
            </span>
          </div>
          {selectedTypes.length > 0 && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-xpress-text-muted">Filtered by type</span>
              <div className="flex gap-1">
                {selectedTypes.map(type => (
                  <Badge key={type} variant="default" className="text-xs">
                    {transactionTypes.find(t => t.value === type)?.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ExportModal;
