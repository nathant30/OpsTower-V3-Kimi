/**
 * Audit Filter Panel Component
 * Advanced filtering for audit logs
 */

import { useState, useEffect } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Filter,
  Search,
  Calendar,
  User,
  FileText,
  CheckCircle,
  X,
  Download,
  FileSpreadsheet,
  FileType,
} from 'lucide-react';
import { useExportAuditLogs, type AuditFilter, type ResourceType, type AuditAction, type UserRole } from '../hooks/useAudit';

interface AuditFilterPanelProps {
  filters: AuditFilter;
  onFiltersChange: (filters: AuditFilter) => void;
}

const resourceTypes: { value: ResourceType; label: string }[] = [
  { value: 'driver', label: 'Driver' },
  { value: 'order', label: 'Order' },
  { value: 'booking', label: 'Booking' },
  { value: 'payment', label: 'Payment' },
  { value: 'refund', label: 'Refund' },
  { value: 'incident', label: 'Incident' },
  { value: 'shift', label: 'Shift' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'user', label: 'User' },
  { value: 'customer', label: 'Customer' },
  { value: 'fare', label: 'Fare' },
  { value: 'commission', label: 'Commission' },
  { value: 'payout', label: 'Payout' },
  { value: 'adjustment', label: 'Adjustment' },
];

const actions: { value: AuditAction; label: string }[] = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'view', label: 'View' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
  { value: 'suspend', label: 'Suspend' },
  { value: 'reactivate', label: 'Reactivate' },
  { value: 'override', label: 'Override' },
  { value: 'break_glass', label: 'Break Glass' },
  { value: 'dual_control', label: 'Dual Control' },
  { value: 'batch_update', label: 'Batch Update' },
  { value: 'export', label: 'Export' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
];

const userRoles: { value: UserRole; label: string }[] = [
  { value: 'Viewer', label: 'Viewer' },
  { value: 'SupportAgent', label: 'Support Agent' },
  { value: 'FinanceManager', label: 'Finance Manager' },
  { value: 'FleetManager', label: 'Fleet Manager' },
  { value: 'OperationsManager', label: 'Operations Manager' },
  { value: 'OperationsDirector', label: 'Operations Director' },
  { value: 'SuperAdmin', label: 'Super Admin' },
];

export function AuditFilterPanel({ filters, onFiltersChange }: AuditFilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<AuditFilter>(filters);
  const [showExportModal, setShowExportModal] = useState(false);
  const exportMutation = useExportAuditLogs();

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const reset: AuditFilter = {};
    setLocalFilters(reset);
    onFiltersChange(reset);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    await exportMutation.mutateAsync({ filters: localFilters, format });
    setShowExportModal(false);
  };

  const hasActiveFilters = Object.values(localFilters).some(v => v !== undefined && v !== '');

  const activeFilterCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'success') return value !== undefined;
    return value !== undefined && value !== '';
  }).length;

  return (
    <>
      <XpressCard
        title="Filters"
        icon={<Filter className="w-5 h-5" />}
        badge={activeFilterCount > 0 ? `${activeFilterCount} Active` : undefined}
        badgeVariant={activeFilterCount > 0 ? 'warning' : 'default'}
        headerAction={
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        }
      >
        <div className="p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <Input
              type="text"
              placeholder="Search user, action, or resource ID..."
              value={localFilters.searchQuery || ''}
              onChange={(e) => setLocalFilters(f => ({ ...f, searchQuery: e.target.value }))}
              className="bg-[#0f0f14] border-white/10"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={localFilters.startDate?.slice(0, 16) || ''}
                onChange={(e) => setLocalFilters(f => ({ ...f, startDate: e.target.value }))}
                className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-xpress-accent-blue/50"
              />
              <input
                type="datetime-local"
                value={localFilters.endDate?.slice(0, 16) || ''}
                onChange={(e) => setLocalFilters(f => ({ ...f, endDate: e.target.value }))}
                className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-xpress-accent-blue/50"
              />
            </div>
          </div>

          {/* User Filters */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              User
            </label>
            <Input
              type="text"
              placeholder="Username..."
              value={localFilters.username || ''}
              onChange={(e) => setLocalFilters(f => ({ ...f, username: e.target.value }))}
              className="bg-[#0f0f14] border-white/10 mb-2"
            />
            <select
              value={localFilters.role || ''}
              onChange={(e) => setLocalFilters(f => ({ ...f, role: e.target.value as UserRole || undefined }))}
              className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-xpress-accent-blue/50"
            >
              <option value="">All Roles</option>
              {userRoles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Action
            </label>
            <select
              value={localFilters.action || ''}
              onChange={(e) => setLocalFilters(f => ({ ...f, action: e.target.value as AuditAction || undefined }))}
              className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-xpress-accent-blue/50"
            >
              <option value="">All Actions</option>
              {actions.map(action => (
                <option key={action.value} value={action.value}>{action.label}</option>
              ))}
            </select>
          </div>

          {/* Resource Type Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Resource Type
            </label>
            <select
              value={localFilters.resourceType || ''}
              onChange={(e) => setLocalFilters(f => ({ ...f, resourceType: e.target.value as ResourceType || undefined }))}
              className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-xpress-accent-blue/50"
            >
              <option value="">All Types</option>
              {resourceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Resource ID */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Resource ID
            </label>
            <Input
              type="text"
              placeholder="e.g., DRV-001, ORD-1234..."
              value={localFilters.resourceId || ''}
              onChange={(e) => setLocalFilters(f => ({ ...f, resourceId: e.target.value }))}
              className="bg-[#0f0f14] border-white/10"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLocalFilters(f => ({ ...f, success: undefined }))}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  localFilters.success === undefined
                    ? 'bg-xpress-accent-blue text-white'
                    : 'bg-[#0f0f14] text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLocalFilters(f => ({ ...f, success: true }))}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  localFilters.success === true
                    ? 'bg-green-500 text-white'
                    : 'bg-[#0f0f14] text-gray-400 hover:text-white'
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setLocalFilters(f => ({ ...f, success: false }))}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  localFilters.success === false
                    ? 'bg-red-500 text-white'
                    : 'bg-[#0f0f14] text-gray-400 hover:text-white'
                }`}
              >
                Failed
              </button>
            </div>
          </div>

          {/* Apply Button */}
          <Button className="w-full" onClick={handleApplyFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </XpressCard>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Export Audit Logs</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-400 mb-4">
                Export the filtered audit logs in your preferred format.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exportMutation.isPending}
                  className="flex flex-col items-center justify-center p-4 bg-[#0f0f14] border border-white/10 rounded-xl hover:border-green-500/50 transition-colors"
                >
                  <FileSpreadsheet className="w-8 h-8 text-green-400 mb-2" />
                  <span className="text-sm text-white font-medium">CSV</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exportMutation.isPending}
                  className="flex flex-col items-center justify-center p-4 bg-[#0f0f14] border border-white/10 rounded-xl hover:border-red-500/50 transition-colors"
                >
                  <FileType className="w-8 h-8 text-red-400 mb-2" />
                  <span className="text-sm text-white font-medium">PDF</span>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={exportMutation.isPending}
                  className="flex flex-col items-center justify-center p-4 bg-[#0f0f14] border border-white/10 rounded-xl hover:border-blue-500/50 transition-colors"
                >
                  <FileText className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-sm text-white font-medium">JSON</span>
                </button>
              </div>
              {exportMutation.isPending && (
                <div className="mt-4 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Preparing export...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AuditFilterPanel;
