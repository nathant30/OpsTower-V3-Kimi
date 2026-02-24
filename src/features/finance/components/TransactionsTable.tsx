
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

import { formatCurrency, formatDateTime } from '@/lib/utils/date';
import type { Transaction, TransactionType, TransactionStatus } from '@/types/domain.types';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  CreditCard, 
  RefreshCcw,
  DollarSign,
  Truck,
  MinusCircle,
  FileText
} from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (transaction: Transaction) => void;
  getRowId?: (row: Transaction) => string;
}

const transactionTypeConfig: Record<TransactionType, { icon: React.ReactNode; label: string; color: string }> = {
  OrderPayment: { 
    icon: <CreditCard className="w-4 h-4" />, 
    label: 'Order Payment', 
    color: 'text-xpress-accent-blue' 
  },
  DriverEarnings: { 
    icon: <Truck className="w-4 h-4" />, 
    label: 'Driver Earnings', 
    color: 'text-xpress-accent-green' 
  },
  Commission: { 
    icon: <FileText className="w-4 h-4" />, 
    label: 'Commission', 
    color: 'text-xpress-accent-purple' 
  },
  Payout: { 
    icon: <ArrowUpRight className="w-4 h-4" />, 
    label: 'Payout', 
    color: 'text-xpress-accent-amber' 
  },
  TopUp: { 
    icon: <ArrowDownLeft className="w-4 h-4" />, 
    label: 'Top Up', 
    color: 'text-xpress-accent-cyan' 
  },
  Refund: { 
    icon: <RefreshCcw className="w-4 h-4" />, 
    label: 'Refund', 
    color: 'text-xpress-accent-red' 
  },
  Adjustment: { 
    icon: <MinusCircle className="w-4 h-4" />, 
    label: 'Adjustment', 
    color: 'text-xpress-text-secondary' 
  },
  Fee: { 
    icon: <DollarSign className="w-4 h-4" />, 
    label: 'Fee', 
    color: 'text-xpress-text-muted' 
  },
};

const statusVariantMap: Record<TransactionStatus, 'active' | 'idle' | 'alert' | 'warning' | 'default'> = {
  Completed: 'active',
  Pending: 'idle',
  Failed: 'alert',
  Reversed: 'warning',
};

export function TransactionsTable({
  transactions,
  isLoading,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  getRowId = (row) => row.transactionId,
}: TransactionsTableProps) {
  const columns: Column<Transaction>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      accessor: (row) => row.transactionId,
      render: (value) => (
        <span className="font-mono text-xpress-accent-blue">{String(value)}</span>
      ),
      sortable: true,
      width: '140px',
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (row) => row.type,
      render: (value) => {
        const config = transactionTypeConfig[value as TransactionType];
        return (
          <div className="flex items-center gap-2">
            <span className={config?.color}>{config?.icon}</span>
            <span className="text-xpress-text-primary">{config?.label || String(value)}</span>
          </div>
        );
      },
      sortable: true,
      width: '160px',
    },
    {
      key: 'from',
      header: 'From',
      accessor: (row) => row.parties.from.name,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-xpress-text-primary">{String(value)}</span>
          <span className="text-xs text-xpress-text-muted">{row.parties.from.type}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'to',
      header: 'To',
      accessor: (row) => row.parties.to.name,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-xpress-text-primary">{String(value)}</span>
          <span className="text-xs text-xpress-text-muted">{row.parties.to.type}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: (row) => row.amount,
      render: (value) => (
        <span className="font-semibold text-xpress-text-primary">
          {formatCurrency(Number(value))}
        </span>
      ),
      align: 'right',
      sortable: true,
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      render: (value) => (
        <Badge variant={statusVariantMap[value as TransactionStatus] || 'default'}>
          {String(value)}
        </Badge>
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'paymentMethod',
      header: 'Payment',
      accessor: (row) => row.payment?.method || '-',
      render: (value) => (
        <div className="flex items-center gap-1.5">
          {value !== '-' && <Wallet className="w-3.5 h-3.5 text-xpress-text-muted" />}
          <span className="text-xpress-text-secondary">{String(value)}</span>
        </div>
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'date',
      header: 'Date',
      accessor: (row) => row.timestamps.initiatedAt,
      render: (value) => (
        <span className="text-xpress-text-secondary text-sm">
          {formatDateTime(String(value))}
        </span>
      ),
      sortable: true,
      width: '160px',
    },
  ];

  return (
    <Table
      data={transactions}
      columns={columns}
      selectable={selectable}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      onRowClick={onRowClick}
      loading={isLoading}
      getRowId={getRowId}
      emptyMessage="No transactions found"
    />
  );
}

export default TransactionsTable;
