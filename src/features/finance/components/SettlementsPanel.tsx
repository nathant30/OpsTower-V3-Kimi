import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils/date';
import type { Settlement } from '@/types/domain.types';
import { 
  Wallet, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign,
  RefreshCw,
  Download
} from 'lucide-react';

interface SettlementsPanelProps {
  settlements: Settlement[];
  isLoading: boolean;
  onProcessSelected?: (settlementIds: string[]) => void;
  onExport?: () => void;
}

const statusConfig: Record<Settlement['status'], { icon: React.ReactNode; variant: 'active' | 'idle' | 'alert' | 'warning' | 'default'; label: string }> = {
  Pending: { 
    icon: <Clock className="w-3.5 h-3.5" />, 
    variant: 'idle', 
    label: 'Pending' 
  },
  Approved: { 
    icon: <CheckCircle className="w-3.5 h-3.5" />, 
    variant: 'warning', 
    label: 'Approved' 
  },
  Processing: { 
    icon: <RefreshCw className="w-3.5 h-3.5" />, 
    variant: 'warning', 
    label: 'Processing' 
  },
  Completed: { 
    icon: <CheckCircle className="w-3.5 h-3.5" />, 
    variant: 'active', 
    label: 'Completed' 
  },
  Failed: { 
    icon: <AlertCircle className="w-3.5 h-3.5" />, 
    variant: 'alert', 
    label: 'Failed' 
  },
};

export function SettlementsPanel({ 
  settlements, 
  isLoading, 
  onProcessSelected,
  onExport 
}: SettlementsPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelection = (ids: string[]) => {
    setSelectedIds(ids);
  };
  
  const pendingSettlements = settlements.filter(s => s.status === 'Pending');
  const totalPending = pendingSettlements.reduce((sum, s) => sum + s.totals.netPayable, 0);

  const columns: Column<Settlement>[] = [
    {
      key: 'settlementId',
      header: 'Settlement ID',
      accessor: (row) => row.settlementId,
      render: (value) => (
        <span className="font-mono text-xpress-accent-blue">{String(value)}</span>
      ),
      sortable: true,
      width: '130px',
    },
    {
      key: 'driverId',
      header: 'Driver',
      accessor: (row) => row.driverId,
      render: (value) => (
        <span className="font-mono text-xpress-text-primary">{String(value)}</span>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'period',
      header: 'Period',
      accessor: (row) => `${row.period.startDate}-${row.period.endDate}`,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-xpress-text-muted" />
          <span className="text-xpress-text-secondary text-sm">
            {formatDate(row.period.startDate)} - {formatDate(row.period.endDate)}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'grossEarnings',
      header: 'Gross',
      accessor: (row) => row.totals.grossEarnings,
      render: (value) => (
        <span className="text-xpress-text-primary">{formatCurrency(Number(value))}</span>
      ),
      align: 'right',
      sortable: true,
      width: '110px',
    },
    {
      key: 'deductions',
      header: 'Deductions',
      accessor: (row) => row.totals.deductions,
      render: (value) => (
        <span className="text-xpress-accent-red">-{formatCurrency(Number(value))}</span>
      ),
      align: 'right',
      sortable: true,
      width: '110px',
    },
    {
      key: 'netPayable',
      header: 'Net Payable',
      accessor: (row) => row.totals.netPayable,
      render: (value) => (
        <span className="font-semibold text-xpress-accent-green">{formatCurrency(Number(value))}</span>
      ),
      align: 'right',
      sortable: true,
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      render: (value) => {
        const config = statusConfig[value as Settlement['status']];
        return (
          <Badge variant={config.variant}>
            <span className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </span>
          </Badge>
        );
      },
      sortable: true,
      width: '110px',
    },
    {
      key: 'payout',
      header: 'Payout',
      accessor: (row) => row.payout.method,
      render: (_, row) => (
        <div className="text-sm">
          <span className="text-xpress-text-primary">{row.payout.method}</span>
          {row.payout.account && (
            <p className="text-xs text-xpress-text-muted">{row.payout.account}</p>
          )}
        </div>
      ),
      sortable: true,
      width: '100px',
    },
  ];

  const handleProcessSelected = () => {
    if (selectedIds.length > 0 && onProcessSelected) {
      onProcessSelected(selectedIds);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="kpi-label">Pending Settlements</p>
              <p className="kpi-value">{pendingSettlements.length}</p>
              <p className="text-xs text-xpress-text-muted mt-1">
                awaiting processing
              </p>
            </div>
            <div className="p-3 rounded-lg bg-xpress-accent-amber/10 text-xpress-accent-amber">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="kpi-label">Total Pending</p>
              <p className="kpi-value">{formatCurrency(totalPending)}</p>
              <p className="text-xs text-xpress-text-muted mt-1">
                to be paid out
              </p>
            </div>
            <div className="p-3 rounded-lg bg-xpress-accent-green/10 text-xpress-accent-green">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-xpress-text-primary">
            Driver Settlements
          </h3>
          {selectedIds.length > 0 && (
            <Badge variant="default" className="ml-2">
              {selectedIds.length} selected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && onProcessSelected && (
            <Button
              variant="primary"
              size="sm"
              icon={<Wallet className="w-4 h-4" />}
              onClick={handleProcessSelected}
            >
              Process Selected
            </Button>
          )}
          {onExport && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={onExport}
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Settlements Table */}
      <div className="xpress-card overflow-hidden">
        <Table
          data={settlements}
          columns={columns}
          selectable={!!onProcessSelected}
          selectedIds={selectedIds}
          onSelectionChange={(ids: string[]) => handleToggleSelection(ids)}
          loading={isLoading}
          getRowId={(row) => row.settlementId}
          emptyMessage="No settlements found"
        />
      </div>
    </div>
  );
}

export default SettlementsPanel;
