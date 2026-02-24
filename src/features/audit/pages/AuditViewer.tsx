/**
 * Audit Viewer Page - Complete Audit System
 * Audit log table with filters, search, export, and detail modals
 */

import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  FileDiff,
  Download,
  Activity,
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  Clock,
  FileText,
  Wifi,
  WifiOff,
  Filter,
  User,
} from 'lucide-react';
import {
  useAuditStats,
  useExportAuditLogs,
  formatAction,
  getActionVariant,
  formatFullTimestamp,
  formatResourceType,
  REASON_CODES,
  type AuditEvent,
  type AuditFilter,
} from '../hooks/useAudit';
import { AuditLogTable } from '../components/AuditLogTable';
import { AuditFilterPanel } from '../components/AuditFilterPanel';

// Real-time stream indicator component
const RealtimeIndicator = ({ isActive }: { isActive: boolean }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
    isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
  }`}>
    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
    {isActive ? 'Real-time' : 'Disconnected'}
    {isActive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
  </div>
);

// Diff view component
const DiffView = ({ event }: { event: AuditEvent }) => {
  if (!event.changes || event.changes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p>No changes recorded for this event</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      {event.changes.map((change, index) => (
        <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
          <div className="bg-[#0f0f14] px-4 py-2 border-b border-white/10">
            <span className="text-sm font-medium text-white">{change.field}</span>
            <Badge variant={change.changeType === 'added' ? 'active' : change.changeType === 'removed' ? 'alert' : 'warning'} className="ml-2">
              {change.changeType}
            </Badge>
          </div>
          <div className="grid grid-cols-2 divide-x divide-white/10">
            <div className="p-4 bg-red-500/5">
              <p className="text-xs text-red-400 mb-2 uppercase tracking-wider">Before</p>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {JSON.stringify(change.oldValue, null, 2)}
              </pre>
            </div>
            <div className="p-4 bg-green-500/5">
              <p className="text-xs text-green-400 mb-2 uppercase tracking-wider">After</p>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {JSON.stringify(change.newValue, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Event detail modal content
const EventDetailModal = ({ event, onClose }: { event: AuditEvent; onClose: () => void }) => {
  const [activeView, setActiveView] = useState<'overview' | 'diff' | 'raw'>('overview');

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="flex items-start justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={getActionVariant(event.action, event.success)} className="text-sm">
              {formatAction(event.action)}
            </Badge>
            <Badge variant={event.success ? 'active' : 'alert'}>
              {event.success ? 'Success' : 'Failed'}
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white">{event.id}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {formatFullTimestamp(event.timestamp)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'overview'
              ? 'bg-xpress-accent-blue text-white'
              : 'bg-[#0f0f14] text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveView('diff')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'diff'
              ? 'bg-xpress-accent-blue text-white'
              : 'bg-[#0f0f14] text-gray-400 hover:text-white'
          }`}
        >
          Changes
        </button>
        <button
          onClick={() => setActiveView('raw')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'raw'
              ? 'bg-xpress-accent-blue text-white'
              : 'bg-[#0f0f14] text-gray-400 hover:text-white'
          }`}
        >
          Raw Data
        </button>
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="space-y-4">
          {/* Actor Info */}
          <XpressCard title="Actor Information" icon={<User className="w-4 h-4" />}>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-white font-medium">{event.actor.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-white font-mono">{event.actor.userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-white">{event.actor.role}</p>
              </div>
              {event.actor.seat && (
                <div>
                  <p className="text-sm text-gray-500">Seat</p>
                  <p className="text-white font-mono">{event.actor.seat}</p>
                </div>
              )}
            </div>
          </XpressCard>

          {/* Resource Info */}
          <XpressCard title="Resource Information" icon={<FileText className="w-4 h-4" />}>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-white capitalize">{formatResourceType(event.resource.type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="text-white font-mono">{event.resource.id}</p>
              </div>
              {event.resource.displayName && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Display Name</p>
                  <p className="text-white">{event.resource.displayName}</p>
                </div>
              )}
            </div>
          </XpressCard>

          {/* Reason */}
          {event.reasonCode && (
            <XpressCard title="Reason" icon={<Activity className="w-4 h-4" />}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">{event.reasonCode}</Badge>
                  <span className="text-gray-400">
                    {REASON_CODES[event.reasonCode]?.label || event.reasonCode}
                  </span>
                </div>
                {event.reasonText && (
                  <p className="text-sm text-gray-400 italic">&ldquo;{event.reasonText}&rdquo;</p>
                )}
              </div>
            </XpressCard>
          )}

          {/* Special Flags */}
          {(event.breakGlass?.used || event.dualControlApprover) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.breakGlass?.used && (
                <XpressCard className="border-red-500/30">
                  <div className="p-4 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h4 className="text-red-400 font-medium">Break Glass Access</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      <span className="text-gray-500">Approved by:</span> {event.breakGlass.approvedBy}
                    </p>
                    {event.breakGlass.justification && (
                      <p className="text-sm text-gray-400 italic">
                        &ldquo;{event.breakGlass.justification}&rdquo;
                      </p>
                    )}
                  </div>
                </XpressCard>
              )}

              {event.dualControlApprover && (
                <XpressCard className="border-yellow-500/30">
                  <div className="p-4 bg-yellow-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      <h4 className="text-yellow-400 font-medium">Dual Control Approval</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      <span className="text-gray-500">Approved by:</span> {event.dualControlApprover.username}
                    </p>
                    <p className="text-sm text-gray-400 mb-1">
                      <span className="text-gray-500">Role:</span> {event.dualControlApprover.role}
                    </p>
                    {event.dualControlApprover.justification && (
                      <p className="text-sm text-gray-400 italic">
                        &ldquo;{event.dualControlApprover.justification}&rdquo;
                      </p>
                    )}
                  </div>
                </XpressCard>
              )}
            </div>
          )}

          {/* Error Message */}
          {!event.success && event.errorMessage && (
            <XpressCard className="border-red-500/30">
              <div className="p-4 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <h4 className="text-red-400 font-medium">Error</h4>
                </div>
                <p className="text-sm text-red-400">{event.errorMessage}</p>
              </div>
            </XpressCard>
          )}

          {/* Metadata */}
          {event.metadata && (
            <XpressCard title="Metadata" icon={<Clock className="w-4 h-4" />}>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                {event.metadata.sessionId && (
                  <div>
                    <p className="text-gray-500">Session ID</p>
                    <p className="text-white font-mono">{event.metadata.sessionId}</p>
                  </div>
                )}
                {event.metadata.requestId && (
                  <div>
                    <p className="text-gray-500">Request ID</p>
                    <p className="text-white font-mono">{event.metadata.requestId}</p>
                  </div>
                )}
                {event.metadata.apiEndpoint && (
                  <div>
                    <p className="text-gray-500">API Endpoint</p>
                    <p className="text-white font-mono">{event.metadata.apiEndpoint}</p>
                  </div>
                )}
                {event.metadata.clientVersion && (
                  <div>
                    <p className="text-gray-500">Client Version</p>
                    <p className="text-white">{event.metadata.clientVersion}</p>
                  </div>
                )}
              </div>
            </XpressCard>
          )}
        </div>
      )}

      {activeView === 'diff' && <DiffView event={event} />}

      {activeView === 'raw' && (
        <div className="bg-[#0f0f14] rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300">
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const AuditViewer = () => {
  const [filters, setFilters] = useState<AuditFilter>({});
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [isRealtime, setIsRealtime] = useState(true);
  const [diffEvent, setDiffEvent] = useState<AuditEvent | null>(null);

  // Data hooks
  const { data: stats } = useAuditStats('7d');

  // Stats cards data
  const statsData = [
    {
      label: 'Total Events',
      value: stats?.totalEvents || 0,
      icon: FileDiff,
      color: 'text-white',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: 'Successful',
      value: stats?.successfulActions || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      label: 'Failed',
      value: stats?.failedActions || 0,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
    {
      label: 'Break Glass / Dual Control',
      value: (stats?.breakGlassUsed || 0) + (stats?.dualControlActions || 0),
      icon: Shield,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and search all system audit events with full change tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RealtimeIndicator isActive={isRealtime} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <XpressCard key={index}>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </XpressCard>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters Panel */}
        {showFilters && (
          <div className="lg:col-span-3">
            <AuditFilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        {/* Audit Table */}
        <div className={showFilters ? 'lg:col-span-9' : 'lg:col-span-12'}>
          <AuditLogTable
            filters={filters}
            onEventClick={setSelectedEvent}
            onViewDiff={setDiffEvent}
          />
        </div>
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        size="xl"
      >
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </Modal>

      {/* Diff Modal */}
      <Modal
        isOpen={!!diffEvent}
        onClose={() => setDiffEvent(null)}
        title={`Changes: ${diffEvent?.id}`}
        size="xl"
      >
        {diffEvent && <DiffView event={diffEvent} />}
      </Modal>
    </div>
  );
};

export default AuditViewer;
