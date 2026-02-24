import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { usePermissionCheck } from '@/components/auth';
import { useIncidents, useBulkUpdateStatus, type IncidentsFilters } from '@/features/incidents/hooks/useIncidents';
import type { Incident, IncidentType, Severity, IncidentStatus } from '@/types/domain.types';
import { format } from 'date-fns';
import { 
  Search, Filter, UserCheck, CheckCircle, XCircle, 
  AlertTriangle, Calendar, RotateCcw 
} from 'lucide-react';

const INCIDENT_TYPES: IncidentType[] = [
  'Accident',
  'SafetyViolation',
  'CustomerComplaint',
  'DriverMisconduct',
  'VehicleIssue',
  'PolicyViolation',
  'Fraud',
  'Other',
];

const SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

const STATUSES: IncidentStatus[] = [
  'New',
  'Reviewing',
  'Investigating',
  'PendingAction',
  'Hearing',
  'Resolved',
  'Closed',
];

interface IncidentsTableProps {
  onReportIncident: () => void;
}

export function IncidentsTable({ onReportIncident }: IncidentsTableProps) {
  const navigate = useNavigate();
  const { hasPermission } = usePermissionCheck();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<IncidentsFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'assign' | 'close' | null>(null);
  const [bulkActionReason, setBulkActionReason] = useState('');

  // Fetch incidents
  const { data: incidentsData, isLoading } = useIncidents({
    ...filters,
    searchQuery: searchQuery || undefined,
  });

  const incidents = incidentsData?.items || [];

  // Mutations
  const bulkUpdateMutation = useBulkUpdateStatus();

  // Permissions
  const canCreate = hasPermission('create:incidents');
  const canInvestigate = hasPermission('investigate:incidents');
  const canResolve = hasPermission('resolve:incidents');

  // Columns
  const columns: Column<Incident>[] = useMemo(() => [
    {
      key: 'incidentId',
      header: 'Incident ID',
      accessor: (row) => row.incidentId,
      render: (value) => (
        <span className="font-mono text-xs text-xpress-accent-blue">
          {String(value).slice(0, 8).toUpperCase()}
        </span>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (row) => row.type,
      render: (value) => {
        const type = String(value);
        const typeLabels: Record<string, string> = {
          'Accident': 'Accident',
          'SafetyViolation': 'Safety Violation',
          'CustomerComplaint': 'Customer Complaint',
          'DriverMisconduct': 'Driver Misconduct',
          'VehicleIssue': 'Vehicle Issue',
          'PolicyViolation': 'Policy Violation',
          'Fraud': 'Fraud',
          'Other': 'Other',
        };
        return (
          <Badge variant="default" className="whitespace-nowrap">
            {typeLabels[type] || type}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: 'severity',
      header: 'Severity',
      accessor: (row) => row.severity,
      render: (value) => {
        const severity = String(value) as Severity;
        const variantMap: Record<Severity, 'alert' | 'warning' | 'idle' | 'active'> = {
          'Critical': 'alert',
          'High': 'warning',
          'Medium': 'idle',
          'Low': 'active',
        };
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              severity === 'Critical' ? 'bg-xpress-accent-red animate-pulse' :
              severity === 'High' ? 'bg-xpress-accent-amber' :
              severity === 'Medium' ? 'bg-xpress-accent-cyan' :
              'bg-xpress-accent-blue'
            }`} />
            <Badge variant={variantMap[severity]}>
              {severity}
            </Badge>
          </div>
        );
      },
      sortable: true,
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      render: (value) => {
        const status = String(value) as IncidentStatus;
        const variantMap: Record<IncidentStatus, 'active' | 'idle' | 'offline' | 'alert' | 'warning'> = {
          'New': 'alert',
          'Reviewing': 'warning',
          'Investigating': 'warning',
          'PendingAction': 'alert',
          'Hearing': 'idle',
          'Resolved': 'active',
          'Closed': 'offline',
        };
        const statusLabels: Record<string, string> = {
          'PendingAction': 'Pending Action',
        };
        return (
          <Badge variant={variantMap[status]}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
      sortable: true,
      width: '130px',
    },
    {
      key: 'priority',
      header: 'Priority',
      accessor: (row) => row.priority,
      render: (value) => {
        const priority = String(value);
        const variant = priority === 'Urgent' ? 'alert' : 
                       priority === 'High' ? 'warning' : 'default';
        return <Badge variant={variant}>{priority}</Badge>;
      },
      sortable: true,
      width: '100px',
    },
    {
      key: 'reportedBy',
      header: 'Reported By',
      accessor: (row) => row.reportedBy.name,
      render: (value, row) => (
        <div>
          <div className="text-xpress-text-primary">{String(value)}</div>
          <div className="text-xs text-xpress-text-muted">
            {(row as Incident).reportedBy.type}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'involved',
      header: 'Involved',
      accessor: (row) => {
        const involved = (row as Incident).involved;
        return involved.drivers.length + involved.vehicles.length + involved.customers.length;
      },
      render: (_value, row) => {
        const involved = (row as Incident).involved;
        return (
          <div className="flex items-center gap-1">
            {involved.drivers.length > 0 && (
              <span className="text-xs bg-xpress-bg-elevated px-2 py-0.5 rounded">
                {involved.drivers.length} Driver{involved.drivers.length > 1 ? 's' : ''}
              </span>
            )}
            {involved.customers.length > 0 && (
              <span className="text-xs bg-xpress-bg-elevated px-2 py-0.5 rounded">
                {involved.customers.length} Customer{involved.customers.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        );
      },
      width: '150px',
    },
    {
      key: 'reportedAt',
      header: 'Reported',
      accessor: (row) => row.timeline.reportedAt,
      render: (value) => {
        const date = new Date(String(value));
        return (
          <div className="text-sm">
            <div>{format(date, 'MMM d, yyyy')}</div>
            <div className="text-xs text-xpress-text-muted">
              {format(date, 'h:mm a')}
            </div>
          </div>
        );
      },
      sortable: true,
      width: '130px',
    },
  ], []);

  // Handlers
  const handleToggleSelection = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleRowClick = (row: Incident) => {
    navigate(`/incidents/${row.incidentId}`);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0 || !bulkActionReason.trim()) return;

    try {
      if (bulkAction === 'close') {
        await bulkUpdateMutation.mutateAsync({
          incidentIds: selectedIds,
          status: 'Closed',
        });
      }
      setShowBulkActionModal(false);
      setBulkActionReason('');
      setBulkAction(null);
      setSelectedIds([]);
    } catch (err) {
      // Error handled by mutation
      console.error('Bulk action failed:', err);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Input
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 bg-xpress-accent-blue text-white text-xs rounded-full px-1.5 py-0.5">
                !
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </div>

        {canCreate && (
          <Button
            variant="primary"
            icon={<AlertTriangle className="w-4 h-4" />}
            onClick={onReportIncident}
          >
            Report Incident
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="xpress-card p-4 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
                Status
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {STATUSES.map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => {
                        const current = filters.status || [];
                        setFilters({
                          ...filters,
                          status: e.target.checked
                            ? [...current, status]
                            : current.filter((s) => s !== status),
                        });
                      }}
                      className="rounded border-xpress-border bg-xpress-bg-secondary text-xpress-accent-blue"
                    />
                    <span className="text-sm text-xpress-text-primary">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
                Severity
              </label>
              <div className="space-y-1">
                {SEVERITIES.map((severity) => (
                  <label key={severity} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.severity?.includes(severity) || false}
                      onChange={(e) => {
                        const current = filters.severity || [];
                        setFilters({
                          ...filters,
                          severity: e.target.checked
                            ? [...current, severity]
                            : current.filter((s) => s !== severity),
                        });
                      }}
                      className="rounded border-xpress-border bg-xpress-bg-secondary text-xpress-accent-blue"
                    />
                    <span className="text-sm text-xpress-text-primary">{severity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
                Type
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {INCIDENT_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.type?.includes(type) || false}
                      onChange={(e) => {
                        const current = filters.type || [];
                        setFilters({
                          ...filters,
                          type: e.target.checked
                            ? [...current, type]
                            : current.filter((t) => t !== type),
                        });
                      }}
                      className="rounded border-xpress-border bg-xpress-bg-secondary text-xpress-accent-blue"
                    />
                    <span className="text-sm text-xpress-text-primary">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
                Date Range
              </label>
              <div className="space-y-2">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="xpress-card p-3 flex items-center justify-between bg-xpress-bg-elevated/50">
          <span className="text-sm text-xpress-text-secondary">
            <span className="font-semibold text-xpress-text-primary">{selectedIds.length}</span>
            {' '}incident{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            {canInvestigate && (
              <Button
                variant="secondary"
                size="sm"
                icon={<UserCheck className="w-4 h-4" />}
                onClick={() => {
                  setBulkAction('assign');
                  setShowBulkActionModal(true);
                }}
              >
                Assign Investigator
              </Button>
            )}
            {canResolve && (
              <Button
                variant="secondary"
                size="sm"
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => {
                  setBulkAction('close');
                  setShowBulkActionModal(true);
                }}
              >
                Close Selected
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="xpress-card overflow-hidden">
        <Table
          data={incidents}
          columns={columns}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={handleToggleSelection}
          onRowClick={handleRowClick}
          loading={isLoading}
          getRowId={(row) => row.incidentId}
          emptyMessage="No incidents found matching your criteria"
        />
      </div>

      {/* Bulk Action Modal */}
      <Modal
        isOpen={showBulkActionModal}
        onClose={() => {
          setShowBulkActionModal(false);
          setBulkActionReason('');
          setBulkAction(null);
        }}
        title={bulkAction === 'assign' ? 'Assign Investigator' : 'Close Incidents'}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowBulkActionModal(false);
                setBulkActionReason('');
                setBulkAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={bulkAction === 'close' ? 'danger' : 'primary'}
              onClick={handleBulkAction}
              loading={bulkUpdateMutation.isPending}
              disabled={!bulkActionReason.trim()}
              icon={bulkAction === 'close' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            >
              {bulkAction === 'assign' ? 'Assign' : 'Close'} {selectedIds.length} Incident{selectedIds.length > 1 ? 's' : ''}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-xpress-text-secondary">
            You are about to {bulkAction === 'assign' ? 'assign an investigator to' : 'close'}{' '}
            <span className="font-semibold text-xpress-text-primary">{selectedIds.length}</span>
            {' '}incident{selectedIds.length > 1 ? 's' : ''}.
          </p>
          <div>
            <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
              Reason <span className="text-xpress-accent-red">*</span>
            </label>
            <textarea
              value={bulkActionReason}
              onChange={(e) => setBulkActionReason(e.target.value)}
              placeholder={bulkAction === 'assign' 
                ? 'Enter assignment notes...' 
                : 'Enter reason for closing...'}
              className="w-full bg-xpress-bg-secondary border border-xpress-border rounded-md px-3 py-2 text-sm text-xpress-text-primary placeholder:text-xpress-text-muted focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[100px] resize-y"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default IncidentsTable;
