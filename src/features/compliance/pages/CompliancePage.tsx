// src/features/compliance/pages/CompliancePage.tsx
// Philippine Compliance Dashboard - BSP, DPA, LTFRB, BIR

import { useState } from 'react';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { format, addDays } from 'date-fns';
import { 
  Shield,
  FileText,
  Truck,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Download,
  Calculator,
  Eye,
  Lock,
  Clock,
  RefreshCw,
  Calendar,
  ChevronRight,
  FileCheck,
} from 'lucide-react';

// Mock data for compliance
const mockAMLReports = [
  { id: 'CTR-001', type: 'CTR', customerId: 'CUST-123', amount: 750000, date: '2026-02-15', status: 'SUBMITTED' },
  { id: 'STR-001', type: 'STR', customerId: 'CUST-456', amount: 250000, date: '2026-02-14', status: 'UNDER_REVIEW', reason: 'Multiple large transactions' },
];

const mockDPARequests = [
  { id: 'DPA-001', userId: 'USER-123', type: 'ACCESS', status: 'COMPLETED', requestedAt: '2026-02-10', completedAt: '2026-02-12' },
  { id: 'DPA-002', userId: 'USER-456', type: 'DELETION', status: 'PENDING', requestedAt: '2026-02-15' },
  { id: 'DPA-003', userId: 'USER-789', type: 'PORTABILITY', status: 'UNDER_REVIEW', requestedAt: '2026-02-14' },
];

const mockLTFRBReports = [
  { id: 'LTFRB-F-001', type: 'FLEET', period: '2026-01', generatedAt: '2026-02-01', status: 'SUBMITTED' },
  { id: 'LTFRB-D-001', type: 'DRIVER', period: '2026-01', generatedAt: '2026-02-01', status: 'SUBMITTED' },
  { id: 'LTFRB-S-001', type: 'SERVICE', period: '2026-01', generatedAt: '2026-02-01', status: 'SUBMITTED' },
];

const mockDeadlines = [
  { id: 1, title: 'BSP Monthly CTR Report', date: '2026-02-20', type: 'BSP', status: 'upcoming' },
  { id: 2, title: 'DPA Access Request - USER-456', date: '2026-03-17', type: 'DPA', status: 'upcoming' },
  { id: 3, title: 'LTFRB Quarterly Filing', date: '2026-03-31', type: 'LTFRB', status: 'upcoming' },
  { id: 4, title: 'BIR VAT Return (2550M)', date: '2026-02-20', type: 'BIR', status: 'urgent' },
  { id: 5, title: 'BSP Quarterly STR Summary', date: '2026-04-15', type: 'BSP', status: 'future' },
];

type TabType = 'bsp' | 'dpa' | 'ltfrb' | 'bir';

const tabs = [
  { id: 'bsp' as TabType, label: 'BSP / AML', icon: Shield },
  { id: 'dpa' as TabType, label: 'DPA / Privacy', icon: Lock },
  { id: 'ltfrb' as TabType, label: 'LTFRB Reports', icon: Truck },
  { id: 'bir' as TabType, label: 'BIR / Taxes', icon: Receipt },
];

// KPI Card Component
interface KpiCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'amber' | 'green' | 'emerald';
}

function KpiCard({ title, value, subtext, icon, color }: KpiCardProps) {
  const colorStyles = {
    blue: 'from-blue-500/20 to-cyan-500/5 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/5 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/20 to-yellow-500/5 border-amber-500/20 text-amber-400',
    green: 'from-green-500/20 to-emerald-500/5 border-green-500/20 text-green-400',
    emerald: 'from-emerald-500/20 to-teal-500/5 border-emerald-500/20 text-emerald-400',
  };

  const iconColors = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    green: 'text-green-400',
    emerald: 'text-emerald-400',
  };

  return (
    <div className={cn(
      "relative h-24 rounded-xl border bg-gradient-to-br p-4 overflow-hidden group transition-all hover:border-opacity-50",
      colorStyles[color]
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        
        <div className={cn(
          "p-2.5 rounded-lg bg-current/10 shrink-0",
          iconColors[color]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<TabType>('bsp');
  const [taxInput, setTaxInput] = useState({ revenue: '', expenses: '', vatRegistered: true });
  const [taxResult, setTaxResult] = useState<{ vatAmount: number; taxableIncome: number; incomeTax: number; totalTax: number; netIncome: number } | null>(null);
  const [lastRefreshTime] = useState<string>(format(new Date(), 'MMM d, h:mm a'));

  // Calculate tax
  const calculateTax = () => {
    const revenue = parseFloat(taxInput.revenue) || 0;
    const expenses = parseFloat(taxInput.expenses) || 0;
    const vatRate = 0.12;
    const vatAmount = taxInput.vatRegistered ? revenue * vatRate : 0;
    const taxableIncome = revenue - expenses - vatAmount;
    
    let incomeTax = 0;
    if (taxableIncome <= 250000) {
      incomeTax = 0;
    } else if (taxableIncome <= 400000) {
      incomeTax = (taxableIncome - 250000) * 0.20;
    } else if (taxableIncome <= 800000) {
      incomeTax = 30000 + (taxableIncome - 400000) * 0.25;
    } else if (taxableIncome <= 2000000) {
      incomeTax = 130000 + (taxableIncome - 800000) * 0.30;
    } else {
      incomeTax = 490000 + (taxableIncome - 2000000) * 0.32;
    }

    const totalTax = vatAmount + incomeTax;
    const netIncome = revenue - totalTax - expenses;

    setTaxResult({
      vatAmount: Math.round(vatAmount * 100) / 100,
      incomeTax: Math.round(incomeTax * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      netIncome: Math.round(netIncome * 100) / 100,
      taxableIncome: Math.round(taxableIncome * 100) / 100,
    });
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'bsp':
        return <BSPTab />;
      case 'dpa':
        return <DPATab />;
      case 'ltfrb':
        return <LTFRBTab />;
      case 'bir':
        return <BIRTab />;
      default:
        return <BSPTab />;
    }
  };

  // BSP Tab Content
  function BSPTab() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-[#12121a] border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-xs text-gray-400">CTR Reports (YTD)</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-[#12121a] border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-xs text-gray-400">STR Reports (YTD)</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-[#12121a] border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-gray-400">Compliance Rate</p>
              </div>
            </div>
          </Card>
        </div>

        {/* AML Reports Table */}
        <Card className="p-6 bg-[#12121a] border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AML Reports</h3>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
              Export goAML
            </Button>
          </div>

          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Report ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockAMLReports.map((report) => (
                <tr key={report.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-white">{report.id}</td>
                  <td className="px-4 py-3">
                    <Badge variant={report.type === 'CTR' ? 'default' : 'warning'} className="text-xs">
                      {report.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{report.customerId}</td>
                  <td className="px-4 py-3 text-right text-sm text-green-400">
                    ₱{report.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{report.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant="active" className="text-xs">{report.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );
  }

  // DPA Tab Content
  function DPATab() {
    return (
      <div className="space-y-4">
        <Card className="p-6 bg-[#12121a] border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Data Subject Requests</h3>
              <p className="text-sm text-gray-400">DPA compliance - 30 day response required</p>
            </div>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
              Export Report
            </Button>
          </div>

          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Request ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Requested</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockDPARequests.map((request) => {
                const deadline = addDays(new Date(request.requestedAt), 30);
                const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <tr key={request.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-sm text-white">{request.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{request.userId}</td>
                    <td className="px-4 py-3">
                      <Badge variant="default" className="text-xs bg-purple-500/20 text-purple-400">
                        {request.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {format(new Date(request.requestedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-sm",
                        daysRemaining <= 5 ? "text-red-400" : daysRemaining <= 10 ? "text-amber-400" : "text-gray-400"
                      )}>
                        {format(deadline, 'MMM d')} ({daysRemaining} days)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant={request.status === 'COMPLETED' ? 'active' : request.status === 'PENDING' ? 'warning' : 'default'}
                        className="text-xs"
                      >
                        {request.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Privacy Controls */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-[#12121a] border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Consent Management</p>
                <p className="text-xs text-gray-400">All users have valid consent</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-[#12121a] border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Data Retention</p>
                <p className="text-xs text-gray-400">7-year retention policy active</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // LTFRB Tab Content
  function LTFRBTab() {
    return (
      <div className="space-y-4">
        <Card className="p-6 bg-[#12121a] border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">LTFRB Reports</h3>
              <p className="text-sm text-gray-400">Monthly regulatory submissions</p>
            </div>
            <Button variant="primary" icon={<FileText className="w-4 h-4" />}>
              Generate New Report
            </Button>
          </div>

          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Report ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Generated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockLTFRBReports.map((report) => (
                <tr key={report.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-white">{report.id}</td>
                  <td className="px-4 py-3">
                    <Badge variant="default" className="text-xs bg-amber-500/20 text-amber-400">
                      {report.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{report.period}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{report.generatedAt}</td>
                  <td className="px-4 py-3">
                    <Badge variant="active" className="text-xs">{report.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-[#12121a] border-white/10">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">1,108</p>
              <p className="text-sm text-gray-400">Total Vehicles</p>
            </div>
          </Card>
          <Card className="p-4 bg-[#12121a] border-white/10">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">788</p>
              <p className="text-sm text-gray-400">Active Drivers</p>
            </div>
          </Card>
          <Card className="p-4 bg-[#12121a] border-white/10">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">98.5%</p>
              <p className="text-sm text-gray-400">Service Compliance</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // BIR Tab Content
  function BIRTab() {
    return (
      <div className="grid grid-cols-2 gap-6">
        {/* Tax Calculator */}
        <Card className="p-6 bg-[#12121a] border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Tax Calculator</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Revenue (₱)</label>
              <input
                type="number"
                value={taxInput.revenue}
                onChange={(e) => setTaxInput({ ...taxInput, revenue: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="Enter revenue"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Expenses (₱)</label>
              <input
                type="number"
                value={taxInput.expenses}
                onChange={(e) => setTaxInput({ ...taxInput, expenses: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="Enter expenses"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={taxInput.vatRegistered}
                onChange={(e) => setTaxInput({ ...taxInput, vatRegistered: e.target.checked })}
                className="rounded border-white/20 bg-white/5"
              />
              VAT Registered (12%)
            </label>

            <Button variant="primary" className="w-full" onClick={calculateTax}>
              Calculate Tax
            </Button>

            {taxResult && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">VAT Amount:</span>
                  <span className="text-white">₱{taxResult.vatAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Income Tax:</span>
                  <span className="text-white">₱{taxResult.incomeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-gray-400">Total Tax:</span>
                  <span className="text-red-400 font-medium">₱{taxResult.totalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Net Income:</span>
                  <span className="text-green-400 font-medium">₱{taxResult.netIncome.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Tax Summary */}
        <Card className="p-6 bg-[#12121a] border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Tax Summary (YTD)</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-400">Total Revenue</span>
              <span className="text-xl font-bold text-white">₱4,256,000</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-400">VAT Collected</span>
              <span className="text-xl font-bold text-white">₱510,720</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-400">Income Tax</span>
              <span className="text-xl font-bold text-red-400">₱850,000</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-green-400">Net After Tax</span>
              <span className="text-xl font-bold text-green-400">₱2,895,280</span>
            </div>
          </div>

          <Button variant="secondary" className="w-full mt-4" icon={<Download className="w-4 h-4" />}>
            Download BIR Reports
          </Button>
        </Card>
      </div>
    );
  }

  // Compliance Calendar (Right Panel)
  function ComplianceCalendar() {
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'BSP': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
        case 'DPA': return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
        case 'LTFRB': return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
        case 'BIR': return 'bg-green-500/20 text-green-400 border-green-500/20';
        default: return 'bg-gray-500/20 text-gray-400';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'urgent': return 'text-red-400';
        case 'upcoming': return 'text-amber-400';
        case 'future': return 'text-gray-400';
        default: return 'text-gray-400';
      }
    };

    return (
      <Card className="h-full bg-[#12121a] border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Compliance Calendar</h3>
              <p className="text-sm text-xpress-text-muted">Upcoming deadlines</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mockDeadlines.map((deadline) => (
            <div 
              key={deadline.id} 
              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default" className={cn("text-[10px] px-1.5 py-0.5", getTypeColor(deadline.type))}>
                      {deadline.type}
                    </Badge>
                    <span className={cn("text-xs font-medium", getStatusColor(deadline.status))}>
                      {deadline.status === 'urgent' ? 'Due Soon' : deadline.status === 'upcoming' ? 'Upcoming' : 'Future'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{deadline.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(deadline.date), 'MMM d, yyyy')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <Button variant="secondary" className="w-full" icon={<FileCheck className="w-4 h-4" />}>
            View All Deadlines
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-xpress-text-primary">Compliance Center</h1>
          <p className="text-sm text-xpress-text-muted">
            Philippine regulatory compliance - BSP, DPA, LTFRB, BIR
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh indicator */}
          <div className="flex items-center gap-2 text-sm text-xpress-text-muted">
            <Clock className="w-4 h-4" />
            <span>Updated {lastRefreshTime}</span>
          </div>
          
          {/* Refresh button */}
          <button
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
              'bg-xpress-bg-tertiary border border-xpress-border',
              'text-xpress-text-secondary hover:text-xpress-text-primary',
              'transition-colors'
            )}
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Generate Report button */}
          <Button variant="primary" icon={<FileText className="w-4 h-4" />}>
            Generate Report
          </Button>

          {/* Compliance Status Badge */}
          <Badge variant="default" className="bg-green-500/20 text-green-400 px-3 py-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            Compliant
          </Badge>
        </div>
      </div>

      {/* KPI Ribbon (5 cards) */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          title="BSP Status"
          value="24 CTR"
          subtext="3 STR pending"
          icon={<Shield className="w-5 h-5" />}
          color="blue"
        />
        <KpiCard
          title="DPA Requests"
          value="1 Pending"
          subtext="2 completed"
          icon={<Lock className="w-5 h-5" />}
          color="purple"
        />
        <KpiCard
          title="LTFRB Reports"
          value="3 Submitted"
          subtext="Monthly filings OK"
          icon={<Truck className="w-5 h-5" />}
          color="amber"
        />
        <KpiCard
          title="BIR Tax Filings"
          value="Current"
          subtext="VAT due Feb 20"
          icon={<Receipt className="w-5 h-5" />}
          color="green"
        />
        <KpiCard
          title="Overall Score"
          value="94%"
          subtext="Above threshold"
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Main Content: Responsive layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Left Panel: Full width on mobile, 60% on desktop */}
        <div className="w-full lg:w-[60%] flex flex-col min-h-0 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-white/10 mb-4">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Panel: Hidden on mobile, 40% on desktop */}
        <div className="hidden lg:flex w-[40%] flex-col min-h-0 overflow-hidden">
          <ComplianceCalendar />
        </div>
      </div>
    </div>
  );
}
