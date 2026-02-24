/**
 * Audit Log Table Component
 * Displays audit events in a paginated table with sorting
 */

import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  FileDiff,
  AlertTriangle,
  Shield,
  User,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  useAuditEvents,
  formatAction,
  formatResourceType,
  getActionVariant,
  formatTimestamp,
  REASON_CODES,
  type AuditEvent,
  type AuditFilter,
} from '../hooks/useAudit';

interface AuditLogTableProps {
  filters: AuditFilter;
  onEventClick: (event: AuditEvent) => void;
  onViewDiff: (event: AuditEvent) => void;
}

export function AuditLogTable({ filters, onEventClick, onViewDiff }: AuditLogTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useAuditEvents(filters, { page, pageSize });

  if (isLoading) {
    return (
      <XpressCard title="Audit Log" icon={<FileDiff className="w-5 h-5" />}>
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto" />
          <p className="text-gray-500 mt-3">Loading audit events...</p>
        </div>
      </XpressCard>
    );
  }

  if (error) {
    return (
      <XpressCard title="Audit Log" icon={<FileDiff className="w-5 h-5" />}>
        <div className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500/50 mx-auto mb-3" />
          <p className="text-red-400">Failed to load audit events</p>
          <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
        </div>
      </XpressCard>
    );
  }

  const events = data?.events || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'driver':
      case 'user':
      case 'customer':
        return <User className="w-4 h-4" />;
      default:
        return <FileDiff className="w-4 h-4" />;
    }
  };

  return (
    <XpressCard
      title="Audit Events"
      icon={<FileDiff className="w-5 h-5" />}
      badge={`${total} Total`}
      badgeVariant="default"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Event ID
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actor
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Resource
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Special
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {events.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <Filter className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No audit events found</p>
                  <p className="text-sm text-gray-600 mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              events.map((event: AuditEvent) => (
                <tr
                  key={event.id}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => onEventClick(event)}
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-gray-400">{event.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-white font-medium">{event.actor.username}</p>
                      <p className="text-xs text-gray-500">{event.actor.role}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getActionVariant(event.action, event.success)}>
                      {formatAction(event.action)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{getResourceIcon(event.resource.type)}</span>
                      <div>
                        <p className="text-sm text-white">
                          {event.resource.displayName || event.resource.id}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{event.resource.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {event.success ? (
                      <Badge variant="active">Success</Badge>
                    ) : (
                      <Badge variant="alert">Failed</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {event.breakGlass?.used && (
                        <Badge variant="alert" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Break Glass
                        </Badge>
                      )}
                      {event.dualControlApprover && (
                        <Badge variant="warning" className="text-xs">
                          Dual Control
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {(event.beforeState || event.afterState) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDiff(event);
                          }}
                        >
                          <FileDiff className="w-4 h-4 mr-1" />
                          Diff
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} events
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-white px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </XpressCard>
  );
}

export default AuditLogTable;
