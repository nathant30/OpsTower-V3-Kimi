// Reports Page - Generate, view, and export reports
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';

export interface Report {
  id: string;
  type: string;
  dateRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
  generatedBy?: string;
  status: 'completed' | 'pending' | 'failed';
  data?: {
    summary: Record<string, number | string>;
  };
}

// Mock report history
const mockReportHistory: Report[] = [
  {
    id: '1',
    type: 'Operations',
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    generatedAt: '2024-02-01T10:30:00Z',
    generatedBy: 'Admin User',
    status: 'completed',
    data: { summary: { totalTrips: 12547, revenue: 2847500, avgRating: 4.7 } },
  },
  {
    id: '2',
    type: 'Financial',
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    generatedAt: '2024-02-01T09:15:00Z',
    generatedBy: 'Finance Team',
    status: 'completed',
    data: { summary: { totalRevenue: 2847500, expenses: 1250000, profit: 1597500 } },
  },
  {
    id: '3',
    type: 'Fleet',
    dateRange: { start: '2024-01-15', end: '2024-01-31' },
    generatedAt: '2024-02-01T08:00:00Z',
    generatedBy: 'Fleet Manager',
    status: 'completed',
    data: { summary: { totalVehicles: 156, activeVehicles: 142, maintenance: 14 } },
  },
  {
    id: '4',
    type: 'Drivers',
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    generatedAt: '2024-01-31T18:30:00Z',
    generatedBy: 'HR Team',
    status: 'completed',
    data: { summary: { totalDrivers: 342, activeDrivers: 298, newDrivers: 15 } },
  },
  {
    id: '5',
    type: 'Incidents',
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    generatedAt: '2024-01-31T12:00:00Z',
    generatedBy: 'Safety Officer',
    status: 'completed',
    data: { summary: { totalIncidents: 23, resolved: 21, pending: 2 } },
  },
];

const Reports = () => {
  const [reportType, setReportType] = useState('Operations');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'custom'>('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [generatedReport, setGeneratedReport] = useState<Report | null>(null);

  const { data: reportHistory, isLoading } = useQuery({
    queryKey: ['report-history'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockReportHistory;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (params: { type: string; dateRange: { start: string; end: string } }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: params.type,
        dateRange: params.dateRange,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Current User',
        status: 'completed' as const,
        data: {
          summary: {
            totalRecords: Math.floor(Math.random() * 10000) + 1000,
            totalAmount: Math.floor(Math.random() * 1000000) + 500000,
            avgValue: (Math.random() * 100 + 50).toFixed(2),
          },
        },
      };
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
    },
  });

  const handleGenerateReport = () => {
    let start: string;
    let end: string = new Date().toISOString().split('T')[0];

    if (dateRange === 'custom') {
      start = customStart;
      end = customEnd;
    } else {
      const days = parseInt(dateRange);
      start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    }

    generateReportMutation.mutate({ type: reportType, dateRange: { start, end } });
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!generatedReport) return;
    // Exporting report
    alert(`Export as ${format.toUpperCase()} - Feature will trigger download in production`);
  };

  const reportTypes = ['Operations', 'Financial', 'Fleet', 'Drivers', 'Incidents'];

  const getBadgeVariant = (status: string): 'active' | 'info' | 'alert' => {
    switch (status) {
      case 'completed':
        return 'active';
      case 'pending':
        return 'info';
      case 'failed':
        return 'alert';
      default:
        return 'info';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#0f0f14] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">
          Generate and export custom reports for analysis
        </p>
      </div>

      {/* Report Generator */}
      <XpressCard title="Generate Report" icon={<FileText className="w-5 h-5" />}>
        <div className="space-y-6">
          {/* Report Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Report Type
            </label>
            <div className="flex flex-wrap gap-2">
              {reportTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    reportType === type
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-[#0f0f14] text-white border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Date Range
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {(['7', '30', '90', 'custom'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    dateRange === range
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-[#0f0f14] text-white border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {range === 'custom' ? 'Custom' : `Last ${range} days`}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs */}
            {dateRange === 'custom' && (
              <div className="flex gap-4 max-w-md">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <XpressButton
            onClick={handleGenerateReport}
            loading={generateReportMutation.isPending}
            fullWidth
            icon={<FileText className="w-4 h-4" />}
          >
            Generate Report
          </XpressButton>
        </div>
      </XpressCard>

      {/* Generated Report Preview */}
      {generatedReport && (
        <XpressCard
          title="Report Preview"
          headerAction={
            <div className="flex gap-2">
              <XpressButton
                variant="secondary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={() => handleExport('pdf')}
              >
                PDF
              </XpressButton>
              <XpressButton
                variant="secondary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={() => handleExport('excel')}
              >
                Excel
              </XpressButton>
              <XpressButton
                variant="secondary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={() => handleExport('csv')}
              >
                CSV
              </XpressButton>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Report Type</div>
                <div className="text-lg font-semibold text-white">
                  {generatedReport.type}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Date Range</div>
                <div className="text-lg font-semibold text-white">
                  {new Date(generatedReport.dateRange.start).toLocaleDateString()} -{' '}
                  {new Date(generatedReport.dateRange.end).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            {generatedReport.data && (
              <div className="bg-[#0f0f14] border border-gray-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  Summary
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(generatedReport.data.summary).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-xs text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-xl font-bold text-white">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </XpressCard>
      )}

      {/* Report History */}
      <XpressCard title="Report History" icon={<Calendar className="w-5 h-5" />}>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading report history...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Report Type
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Date Range
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Generated
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Generated By
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {(reportHistory || []).slice(0, 20).map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">{report.type}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(report.dateRange.start).toLocaleDateString()} -{' '}
                      {new Date(report.dateRange.end).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(report.generatedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {report.generatedBy || 'System'}
                    </td>
                    <td className="py-3 px-4">
                      <XpressBadge variant={getBadgeVariant(report.status)}>
                        {report.status.toUpperCase()}
                      </XpressBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </XpressCard>
    </div>
  );
};

export default Reports;
