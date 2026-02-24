/**
 * Earnings Dashboard
 * Enhanced earnings tracking with KPIs, charts, leaderboard, payouts, and deductions
 */

import { useState, useMemo } from 'react';
import {
  Download,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Wallet,
  Filter,
  ChevronDown,
  Loader2,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  useEarningsKPIs,
  useDailyEarnings,
  useEarningsByTripType,
  useDriverLeaderboard,
  useDeductionsSummary,
  useExportEarningsReport,
  useProcessPayout,
  formatCurrency,
  formatNumber,
  getTrendColor,
  getTrendIndicator,
  type DriverEarningsEntry,
} from '../hooks/useEarnings';
import { EarningsChart } from '../components/EarningsChart';
import { PayoutHistory } from '../components/PayoutHistory';

// Date range presets
const DATE_PRESETS = [
  { label: 'Today', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'This Month', days: 0 }, // Special handling
  { label: 'Last Month', days: -1 }, // Special handling
];

// KPI Card Component
function KPICard({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  color = 'blue',
}: {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: any;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <XpressCard>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-gray-500 text-sm">{title}</div>
            <div className="text-2xl font-bold text-white mt-1">{value}</div>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                 trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </XpressCard>
  );
}

// Driver Leaderboard Component
function DriverLeaderboard({ 
  searchQuery,
  onDriverClick,
}: { 
  searchQuery: string;
  onDriverClick: (driver: DriverEarningsEntry) => void;
}) {
  const { data, isLoading } = useDriverLeaderboard();

  const filteredDrivers = useMemo(() => {
    if (!data?.items) return [];
    if (!searchQuery) return data.items;
    
    const query = searchQuery.toLowerCase();
    return data.items.filter(d => 
      d.driverName.toLowerCase().includes(query) ||
      d.email.toLowerCase().includes(query) ||
      d.phone.includes(query)
    );
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Rank</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Driver</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Tier</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Earnings</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Trips</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Rating</th>
          </tr>
        </thead>
        <tbody>
          {filteredDrivers.map((driver, index) => (
            <tr 
              key={driver.driverId}
              onClick={() => onDriverClick(driver)}
              className="border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <td className="py-3 px-4">
                <span className={`
                  inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold
                  ${index < 3 ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-500'}
                `}>
                  {index + 1}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-white">{driver.driverName}</div>
                <div className="text-xs text-gray-500">{driver.email}</div>
              </td>
              <td className="py-3 px-4">
                <Badge variant="default" className={`
                  ${driver.tier === 'Diamond' ? 'bg-cyan-300/20 text-cyan-300 border-cyan-300/30' :
                    driver.tier === 'Platinum' ? 'bg-slate-300/20 text-slate-200 border-slate-300/30' :
                    driver.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    driver.tier === 'Silver' ? 'bg-gray-400/20 text-gray-300 border-gray-400/30' :
                    'bg-amber-700/20 text-amber-600 border-amber-700/30'}
                `}>
                  {driver.tier}
                </Badge>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="font-semibold text-green-400">
                  {formatCurrency(driver.netEarnings)}
                </div>
                <div className="text-xs text-gray-500">
                  +{formatCurrency(driver.bonuses)} bonus
                </div>
              </td>
              <td className="py-3 px-4 text-right text-white">
                {driver.tripsCompleted}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1 text-yellow-400">
                  <span>★</span>
                  <span>{driver.rating}</span>
                </div>
              </td>
            </tr>
          ))}
          {filteredDrivers.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                No drivers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Deductions Summary Component
function DeductionsSummaryPanel() {
  const { data, isLoading } = useDeductionsSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const deductions = data?.breakdown || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div>
          <div className="text-sm text-gray-400">Total Deductions</div>
          <div className="text-2xl font-bold text-red-400">
            {formatCurrency(data?.totalDeductions || 0)}
          </div>
        </div>
        <TrendingDown className="w-8 h-8 text-red-400" />
      </div>

      <div className="space-y-2">
        {deductions.map((deduction) => (
          <div
            key={deduction.id}
            className="flex items-center justify-between p-3 bg-[#0f0f14] border border-gray-800 rounded-lg"
          >
            <div>
              <div className="text-white font-medium">{deduction.description}</div>
              <div className="text-sm text-gray-500">
                {deduction.count} transactions • {deduction.percentage.toFixed(1)}%
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-red-400">
                -{formatCurrency(deduction.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export Modal Component
function ExportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<'Excel' | 'CSV' | 'PDF'>('Excel');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeBreakdown, setIncludeBreakdown] = useState(true);
  const [includeDeductions, setIncludeDeductions] = useState(true);

  const exportMutation = useExportEarningsReport();

  const handleExport = async () => {
    if (!startDate || !endDate) return;

    try {
      const blob = await exportMutation.mutateAsync({
        format,
        startDate,
        endDate,
        includeBreakdown,
        includeDeductions,
      });

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings-report-${startDate}-to-${endDate}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Earnings Report"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            loading={exportMutation.isPending}
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Excel', 'CSV', 'PDF'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors
                  ${format === f
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                    : 'bg-[#0f0f14] border-gray-800 text-gray-400 hover:border-gray-700'
                  }
                `}
              >
                {f === 'Excel' ? <FileSpreadsheet className="w-6 h-6" /> :
                 f === 'CSV' ? <FileText className="w-6 h-6" /> :
                 <FileText className="w-6 h-6" />}
                <span className="text-sm">{f}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeBreakdown}
              onChange={(e) => setIncludeBreakdown(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-[#0f0f14] text-blue-500"
            />
            Include earnings breakdown by trip type
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDeductions}
              onChange={(e) => setIncludeDeductions(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-[#0f0f14] text-blue-500"
            />
            Include deductions summary
          </label>
        </div>
      </div>
    </Modal>
  );
}

// Main Dashboard Component
export default function EarningsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverEarningsEntry | null>(null);

  // Fetch data
  const { data: kpis, isLoading: kpisLoading } = useEarningsKPIs();
  const { data: dailyEarnings } = useDailyEarnings();
  const { data: tripTypeEarnings } = useEarningsByTripType();

  const handleExport = () => {
    setShowExportModal(true);
  };

  return (
    <div className="p-6 space-y-6 bg-[#0f0f14] min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-green-400" />
            Earnings Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor driver earnings, deductions, and payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={<Calendar className="w-4 h-4" />}
            onClick={() => setShowDatePicker(true)}
          >
            {dateRange.start && dateRange.end
              ? `${dateRange.start} - ${dateRange.end}`
              : 'Select Date Range'
            }
          </Button>
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array(4).fill(null).map((_, i) => (
            <XpressCard key={i}>
              <div className="p-5 flex items-center justify-center h-28">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            </XpressCard>
          ))
        ) : (
          <>
            <KPICard
              title="Today's Earnings"
              value={formatCurrency(kpis?.today || 0)}
              trend={kpis?.todayChange && kpis.todayChange > 0 ? 'up' : 'down'}
              trendValue={`${getTrendIndicator(kpis?.todayChange || 0)} ${Math.abs(kpis?.todayChange || 0).toFixed(1)}% vs yesterday`}
              icon={DollarSign}
              color="green"
            />
            <KPICard
              title="This Week"
              value={formatCurrency(kpis?.thisWeek || 0)}
              trend={kpis?.weekChange && kpis.weekChange > 0 ? 'up' : 'down'}
              trendValue={`${getTrendIndicator(kpis?.weekChange || 0)} ${Math.abs(kpis?.weekChange || 0).toFixed(1)}% vs last week`}
              icon={TrendingUp}
              color="blue"
            />
            <KPICard
              title="This Month"
              value={formatCurrency(kpis?.thisMonth || 0)}
              trend={kpis?.monthChange && kpis.monthChange > 0 ? 'up' : 'down'}
              trendValue={`${getTrendIndicator(kpis?.monthChange || 0)} ${Math.abs(kpis?.monthChange || 0).toFixed(1)}% vs last month`}
              icon={Wallet}
              color="purple"
            />
            <KPICard
              title="Pending Payouts"
              value={formatCurrency(kpis?.pending || 0)}
              trendValue={`${formatNumber(Math.round((kpis?.pending || 0) / 1000))}K pending`}
              icon={Clock}
              color="yellow"
            />
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#12121a] border border-gray-800 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="deductions" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Deductions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <EarningsChart
            dailyData={dailyEarnings}
            tripTypeData={tripTypeEarnings}
            type="both"
          />
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="mt-6">
          <XpressCard
            title="Driver Earnings Leaderboard"
            subtitle="Top performing drivers by net earnings"
            headerAction={
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0f0f14] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            }
          >
            <DriverLeaderboard
              searchQuery={searchQuery}
              onDriverClick={setSelectedDriver}
            />
          </XpressCard>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="mt-6">
          <PayoutHistory />
        </TabsContent>

        {/* Deductions Tab */}
        <TabsContent value="deductions" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <XpressCard title="Deductions Summary" subtitle="Fees, taxes, and adjustments">
              <DeductionsSummaryPanel />
            </XpressCard>
            <XpressCard title="Deduction Breakdown" subtitle="By category">
              {useDeductionsSummary().data?.breakdown && (
                <div className="h-[300px] flex items-center justify-center">
                  {/* Pie chart would go here */}
                  <div className="text-center text-gray-500">
                    <TrendingDown className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Total Deductions</p>
                    <p className="text-2xl font-bold text-red-400 mt-2">
                      {formatCurrency(useDeductionsSummary().data?.totalDeductions || 0)}
                    </p>
                  </div>
                </div>
              )}
            </XpressCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Driver Detail Modal */}
      <Modal
        isOpen={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        title={selectedDriver?.driverName}
        size="md"
      >
        {selectedDriver && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#0f0f14] border border-gray-800 rounded-lg">
                <div className="text-sm text-gray-500">Net Earnings</div>
                <div className="text-xl font-bold text-green-400">
                  {formatCurrency(selectedDriver.netEarnings)}
                </div>
              </div>
              <div className="p-3 bg-[#0f0f14] border border-gray-800 rounded-lg">
                <div className="text-sm text-gray-500">Trips Completed</div>
                <div className="text-xl font-bold text-white">
                  {selectedDriver.tripsCompleted}
                </div>
              </div>
              <div className="p-3 bg-[#0f0f14] border border-gray-800 rounded-lg">
                <div className="text-sm text-gray-500">Trip Earnings</div>
                <div className="text-lg font-semibold text-white">
                  {formatCurrency(selectedDriver.tripEarnings)}
                </div>
              </div>
              <div className="p-3 bg-[#0f0f14] border border-gray-800 rounded-lg">
                <div className="text-sm text-gray-500">Bonuses</div>
                <div className="text-lg font-semibold text-blue-400">
                  {formatCurrency(selectedDriver.bonuses)}
                </div>
              </div>
            </div>
            <div className="p-3 bg-[#0f0f14] border border-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Rating</span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <span>★</span>
                  <span className="font-semibold">{selectedDriver.rating}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-[#0f0f14] border border-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Payout</span>
                <span className="text-white">
                  {selectedDriver.lastPayoutDate 
                    ? new Date(selectedDriver.lastPayoutDate).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
