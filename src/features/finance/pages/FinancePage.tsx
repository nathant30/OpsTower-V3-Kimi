import { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useTransactions, useExportTransactions } from '@/features/finance/hooks/useTransactions';
import type { TransactionType } from '@/types/domain.types';
import { usePermissionCheck } from '@/components/auth';
import type { Transaction, Settlement } from '@/types/domain.types';
import type { ExportFormat } from '@/features/finance/components/ExportModal';

// Components
import { FinanceKpiRibbon } from '@/features/finance/components/FinanceKpiRibbon';
import { DateRangeSelector, type DateRange } from '@/features/finance/components/DateRangeSelector';
import { TransactionCard } from '@/features/finance/components/TransactionCard';
import { PayoutCard } from '@/features/finance/components/PayoutCard';
import { TransactionsTable } from '@/features/finance/components/TransactionsTable';
import { TransactionDetail } from '@/features/finance/components/TransactionDetail';
import { RevenueChart } from '@/features/finance/components/RevenueChart';
import { SettlementsPanel } from '@/features/finance/components/SettlementsPanel';
import { WalletViewer } from '@/features/finance/components/WalletViewer';
import { ExportModal } from '@/features/finance/components/ExportModal';
import { FilterModal, type FilterState } from '@/features/finance/components/FilterModal';
import { ApprovePayoutModal, type ApproveData } from '@/features/finance/components/ApprovePayoutModal';

// Mock data imports for development
import { mockSettlements, mockWallets, mockTransactions } from '@/lib/mocks/data';

import { 
  Download, 
  Search, 
  Filter, 
  DollarSign,
  TrendingUp,
  Wallet,
  FileText,
  RotateCcw,
  LayoutGrid,
  List,
  ArrowRight,
  RefreshCcw,
  CheckCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { toast } from '@/components/auth/ToastProvider';

type TabType = 'overview' | 'transactions' | 'payouts' | 'settlements' | 'wallets';
type ViewMode = 'grid' | 'list';

// Filter helper functions
const filterTransactions = (
  transactions: Transaction[],
  searchQuery: string,
  filters: FilterState
): Transaction[] => {
  return transactions.filter(tx => {
    // Search filter
    const matchesSearch = !searchQuery || 
      tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.parties.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.parties.to.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = filters.transactionTypes.length === 0 || 
      filters.transactionTypes.includes(tx.type);
    
    // Status filter
    const matchesStatus = filters.statuses.length === 0 || 
      filters.statuses.includes(tx.status);
    
    // Date filter
    let matchesDate = true;
    if (filters.startDate || filters.endDate) {
      const txDate = new Date(tx.timestamps.initiatedAt);
      if (filters.startDate) {
        matchesDate = matchesDate && txDate >= new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchesDate = matchesDate && txDate <= new Date(filters.endDate + 'T23:59:59');
      }
    }
    
    // Amount filter
    let matchesAmount = true;
    if (filters.minAmount) {
      matchesAmount = matchesAmount && tx.amount >= parseFloat(filters.minAmount);
    }
    if (filters.maxAmount) {
      matchesAmount = matchesAmount && tx.amount <= parseFloat(filters.maxAmount);
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate && matchesAmount;
  });
};

// Get date range from selection
const getDateRangeFromSelection = (range: DateRange): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case '7days':
      start.setDate(start.getDate() - 7);
      break;
    case '30days':
      start.setDate(start.getDate() - 30);
      break;
    case 'thisMonth':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'lastMonth':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start.setDate(start.getDate() - 7);
  }
  
  return { start, end };
};

export default function FinancePage() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [customDateRange, setCustomDateRange] = useState<{ start?: string; end?: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    transactionTypes: [],
    statuses: [],
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  // Hooks
  const { checkPermission, hasPermission } = usePermissionCheck();
  
  // Use mock data for development
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactions({
    type: filters.transactionTypes.length > 0 ? filters.transactionTypes : undefined,
    status: filters.statuses.length > 0 ? filters.statuses : undefined,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const exportMutation = useExportTransactions();

  // Calculate date range for stats (available for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void useMemo(() => {
    if (dateRange === 'custom' && customDateRange.start && customDateRange.end) {
      return {
        start: new Date(customDateRange.start),
        end: new Date(customDateRange.end + 'T23:59:59'),
      };
    }
    return getDateRangeFromSelection(dateRange);
  }, [dateRange, customDateRange]);

  // Filter transactions
  const transactions = useMemo(() => {
    const sourceData = transactionsData?.items?.length ? transactionsData.items : mockTransactions;
    return filterTransactions(sourceData, searchQuery, filters);
  }, [transactionsData, searchQuery, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status === 'Completed');
    const totalRevenue = completedTransactions.reduce((sum, t) => {
      if (t.type === 'OrderPayment' || t.type === 'Commission') return sum + t.amount;
      return sum;
    }, 0);
    
    // Today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEarnings = transactions
      .filter(t => {
        if (t.status !== 'Completed') return false;
        const txDate = new Date(t.timestamps.initiatedAt);
        return txDate >= today;
      })
      .reduce((sum, t) => sum + (t.type === 'OrderPayment' ? t.amount : 0), 0);
    
    // Pending payouts
    const pendingSettlements = mockSettlements.filter(s => s.status === 'Pending');
    const pendingPayouts = pendingSettlements.reduce((sum, s) => sum + s.totals.netPayable, 0);
    
    // Wallet balance
    const walletBalance = mockWallets.reduce((sum, w) => sum + w.balance.available, 0);

    return {
      totalRevenue,
      todayEarnings,
      pendingPayouts,
      walletBalance,
      revenueChange: 12.5,
      earningsChange: 8.3,
    };
  }, [transactions]);

  // Generate chart data
  const chartData = useMemo(() => {
    const days = 7;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Get transactions for this day
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayTransactions = transactions.filter(t => {
        const txDate = new Date(t.timestamps.initiatedAt);
        return txDate >= date && txDate < nextDay && t.status === 'Completed';
      });
      
      const revenue = dayTransactions
        .filter(t => t.type === 'OrderPayment')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const commission = dayTransactions
        .filter(t => t.type === 'Commission')
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        date: date.toISOString(),
        revenue,
        transactions: dayTransactions.length,
        commission,
      });
    }
    
    return data;
  }, [transactions]);

  // Recent transactions for overview
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.timestamps.initiatedAt).getTime() - new Date(a.timestamps.initiatedAt).getTime())
      .slice(0, 6);
  }, [transactions]);

  // Pending settlements for payouts tab
  const pendingSettlements = useMemo(() => {
    return mockSettlements
      .filter(s => s.status === 'Pending' || s.status === 'Approved')
      .slice(0, 6);
  }, []);

  // Handlers
  const handleDateRangeChange = (range: DateRange, startDate?: string, endDate?: string) => {
    setDateRange(range);
    if (range === 'custom' && startDate && endDate) {
      setCustomDateRange({ start: startDate, end: endDate });
      setFilters(prev => ({
        ...prev,
        startDate,
        endDate,
      }));
    } else {
      setCustomDateRange({});
      const { start, end } = getDateRangeFromSelection(range);
      setFilters(prev => ({
        ...prev,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      }));
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  const handleExport = async (data: {
    format: ExportFormat;
    startDate: string;
    endDate: string;
    includeBreakdown: boolean;
    transactionTypes?: string[];
  }) => {
    await exportMutation.mutateAsync({
      startDate: data.startDate,
      endDate: data.endDate,
      type: data.transactionTypes as TransactionType[],
    });
    toast.success('Export started. You will receive an email when ready.');
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      transactionTypes: [],
      statuses: [],
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
    setSearchQuery('');
    setDateRange('7days');
  };

  const handleApprovePayout = (settlement: Settlement) => {
    if (!checkPermission('process:payouts', 'process payouts')) {
      return;
    }
    setSelectedSettlement(settlement);
    setIsApproveModalOpen(true);
  };

  const handleHoldPayout = (settlement: Settlement) => {
    if (!checkPermission('process:payouts', 'process payouts')) {
      return;
    }
    toast.info(`Payout ${settlement.settlementId} placed on hold`);
  };

  const handleConfirmApprove = (settlement: Settlement, data: ApproveData) => {
    // Approving payout
    toast.success(
      <div className="space-y-1">
        <p className="font-medium">Payout approved with dual control</p>
        <p className="text-xs text-gray-400">
          {settlement.settlementId} - {formatCurrency(settlement.totals.netPayable)}
        </p>
        <p className="text-xs text-gray-400">
          Reason: {data.reasonCode} | Verified by: {data.secondaryApproverId}
        </p>
      </div>
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.transactionTypes.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    return count;
  };

  const hasActiveFilters = getActiveFilterCount() > 0 || searchQuery;

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <FinanceKpiRibbon 
              totalRevenue={stats.totalRevenue}
              todayEarnings={stats.todayEarnings}
              pendingPayouts={stats.pendingPayouts}
              walletBalance={stats.walletBalance}
              revenueChange={stats.revenueChange}
              earningsChange={stats.earningsChange}
              isLoading={isTransactionsLoading}
            />
            
            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Revenue Chart */}
              <div className="col-span-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Revenue Trends
                  </h3>
                  <div className="flex items-center gap-2">
                    <DateRangeSelector 
                      value={dateRange} 
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </div>
                <RevenueChart 
                  data={chartData} 
                  type="area" 
                  period="week"
                  isLoading={isTransactionsLoading}
                  className="h-80"
                />
              </div>

              {/* Recent Transactions */}
              <div className="col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Recent Transactions
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('transactions')}
                    className="text-blue-400"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {recentTransactions.map(tx => (
                    <TransactionCard 
                      key={tx.transactionId}
                      transaction={tx}
                      onClick={handleTransactionClick}
                    />
                  ))}
                  {recentTransactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No transactions found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Payouts Preview */}
            {stats.pendingPayouts > 0 && (
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Pending Payouts Require Attention</p>
                      <p className="text-sm text-gray-400">
                        {mockSettlements.filter(s => s.status === 'Pending').length} settlements pending approval
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-400">
                      {formatCurrency(stats.pendingPayouts)}
                    </p>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setActiveTab('payouts')}
                    >
                      Review Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'transactions':
        return (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <Input
                  placeholder="Search transactions by ID, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <DateRangeSelector 
                value={dateRange} 
                onChange={handleDateRangeChange}
              />
              
              <Button 
                variant={hasActiveFilters ? 'primary' : 'secondary'} 
                icon={<Filter className="w-4 h-4" />}
                onClick={() => setIsFilterModalOpen(true)}
              >
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="default" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
              
              {hasPermission('export:transactions') && (
                <Button 
                  variant="secondary" 
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => setIsExportModalOpen(true)}
                >
                  Export
                </Button>
              )}
              
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Active filters:</span>
                {filters.transactionTypes.map(type => (
                  <Badge key={type} variant="default" className="flex items-center gap-1">
                    {type}
                    <button onClick={() => setFilters(prev => ({ ...prev, transactionTypes: prev.transactionTypes.filter(t => t !== type) }))}>
                      <span className="sr-only">Remove</span>
                      ×
                    </button>
                  </Badge>
                ))}
                {filters.statuses.map(status => (
                  <Badge key={status} variant={status === 'Completed' ? 'active' : status === 'Pending' ? 'idle' : status === 'Failed' ? 'alert' : 'warning'} className="flex items-center gap-1">
                    {status}
                    <button onClick={() => setFilters(prev => ({ ...prev, statuses: prev.statuses.filter(s => s !== status) }))}>
                      <span className="sr-only">Remove</span>
                      ×
                    </button>
                  </Badge>
                ))}
                {(filters.startDate || filters.endDate) && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {filters.startDate || '...'} - {filters.endDate || '...'}
                  </Badge>
                )}
              </div>
            )}

            {/* View Toggle & Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === 'list' ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === 'grid' ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
              <div className="bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden">
                <TransactionsTable
                  transactions={transactions}
                  isLoading={isTransactionsLoading}
                  selectable={hasPermission('process:payouts')}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  onRowClick={handleTransactionClick}
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {transactions.map(tx => (
                  <TransactionCard 
                    key={tx.transactionId}
                    transaction={tx}
                    onClick={handleTransactionClick}
                  />
                ))}
                {transactions.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    No transactions match your filters
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'payouts':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Pending Approval</p>
                    <p className="text-2xl font-bold text-white">
                      {mockSettlements.filter(s => s.status === 'Pending').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Approved</p>
                    <p className="text-2xl font-bold text-white">
                      {mockSettlements.filter(s => s.status === 'Approved').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Processing</p>
                    <p className="text-2xl font-bold text-white">
                      {mockSettlements.filter(s => s.status === 'Processing').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <RefreshCcw className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Completed Today</p>
                    <p className="text-2xl font-bold text-white">
                      {mockSettlements.filter(s => s.status === 'Completed').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payouts Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Pending Payouts</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Total: {formatCurrency(pendingSettlements.reduce((sum, s) => sum + s.totals.netPayable, 0))}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {pendingSettlements.map(settlement => (
                  <PayoutCard
                    key={settlement.settlementId}
                    settlement={settlement}
                    onApprove={handleApprovePayout}
                    onHold={handleHoldPayout}
                  />
                ))}
                {pendingSettlements.length === 0 && (
                  <div className="col-span-3 text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-gray-400">All payouts are processed!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'settlements':
        return (
          <SettlementsPanel
            settlements={mockSettlements}
            isLoading={false}
            onProcessSelected={hasPermission('process:payouts') ? (ids) => {
              toast.info(`Processing ${ids.length} settlements`);
            } : undefined}
            onExport={() => setIsExportModalOpen(true)}
          />
        );

      case 'wallets':
        return (
          <WalletViewer
            wallets={mockWallets}
            isLoading={false}
            onAdjust={(wallet, amount, reason, type) => {
              // Adjusting wallet
              toast.success(`Wallet adjustment initiated for ${wallet.userId}`);
            }}
            onToggleFreeze={(wallet, frozen, reason) => {
              // Toggling wallet freeze
              toast.success(`Wallet ${frozen ? 'frozen' : 'unfrozen'} for ${wallet.userId}`);
            }}
            onReleaseHeld={(wallet, amount) => {
              // Releasing held funds
              toast.success(`Released ${formatCurrency(amount || 0)} from held funds`);
            }}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Finance & Transactions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage payments, settlements, and financial records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelector 
            value={dateRange} 
            onChange={handleDateRangeChange}
            className="hidden sm:block"
          />
          <Button 
            variant="primary" 
            icon={<Download className="w-4 h-4" />}
            onClick={() => setIsExportModalOpen(true)}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'transactions', label: 'Transactions', icon: FileText },
            { id: 'payouts', label: 'Payouts', icon: DollarSign },
            { id: 'settlements', label: 'Settlements', icon: Wallet },
            { id: 'wallets', label: 'Wallets', icon: Wallet },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'payouts' && stats.pendingPayouts > 0 && (
                <Badge variant="warning" className="ml-1">
                  {mockSettlements.filter(s => s.status === 'Pending').length}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {renderTabContent()}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetail
        transaction={selectedTransaction}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onReverse={(transaction) => {
          if (!checkPermission('reverse:transactions', 'reverse transactions')) {
            return;
          }
          // Reversing transaction
          toast.success(`Transaction ${transaction.transactionId} marked for reversal`);
        }}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        totalTransactions={transactions.length}
        estimatedSize={`${(transactions.length * 0.5).toFixed(1)} KB`}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Approve Payout Modal */}
      <ApprovePayoutModal
        settlement={selectedSettlement}
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedSettlement(null);
        }}
        onApprove={handleConfirmApprove}
      />
    </div>
  );
}
