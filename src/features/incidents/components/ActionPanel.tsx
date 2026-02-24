import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { usePermissionCheck } from '@/components/auth';
import { 
  useTakeDisciplinaryAction,
  useResolveIncident,
  useCloseIncident,
  useReopenIncident 
} from '@/features/incidents/hooks/useInvestigation';
import type { Incident } from '@/types/domain.types';
import { format } from 'date-fns';
import { 
  Gavel, AlertTriangle, CheckCircle, XCircle, RotateCcw,
  Clock, Calendar, AlertCircle, Shield
} from 'lucide-react';

interface ActionPanelProps {
  incident: Incident;
}

const ACTION_TYPES = [
  { 
    value: 'Warning', 
    label: 'Formal Warning', 
    description: 'Issued for minor violations - remains on record for 6 months',
    icon: AlertTriangle,
    color: 'text-xpress-accent-amber'
  },
  { 
    value: 'Training', 
    label: 'Mandatory Training', 
    description: 'Required retraining or certification course',
    icon: Shield,
    color: 'text-xpress-accent-cyan'
  },
  { 
    value: 'Suspension', 
    label: 'Suspension', 
    description: 'Temporary suspension from duty',
    icon: Clock,
    color: 'text-xpress-accent-orange'
  },
  { 
    value: 'Termination', 
    label: 'Termination', 
    description: 'Immediate termination of employment/contract',
    icon: XCircle,
    color: 'text-xpress-accent-red'
  },
] as const;

export function ActionPanel({ incident }: ActionPanelProps) {
  const { hasPermission } = usePermissionCheck();
  const action = incident.disciplinaryAction;
  
  // Modals state
  const [showActionModal, setShowActionModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  
  // Form state
  const [selectedAction, setSelectedAction] = useState<typeof ACTION_TYPES[number]['value'] | ''>('');
  const [duration, setDuration] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [resolution, setResolution] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  // Mutations
  const takeActionMutation = useTakeDisciplinaryAction();
  const resolveMutation = useResolveIncident();
  const closeMutation = useCloseIncident();
  const reopenMutation = useReopenIncident();

  // Permissions
  const canTakeAction = hasPermission('resolve:incidents');
  const canResolve = hasPermission('resolve:incidents');
  const canClose = hasPermission('resolve:incidents');
  const canReopen = hasPermission('investigate:incidents');

  // Check if actions can be taken
  const canTakeDisciplinaryAction = ['PendingAction', 'Hearing'].includes(incident.status) && canTakeAction;
  const canResolveIncident = ['PendingAction', 'Hearing'].includes(incident.status) && canResolve && action;
  const canCloseIncident = ['New', 'Reviewing', 'Investigating', 'PendingAction', 'Hearing', 'Resolved'].includes(incident.status) && canClose;
  const canReopenIncident = incident.status === 'Closed' && canReopen;

  // Selected action type details (used for UI display)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectedActionType = ACTION_TYPES.find(a => a.value === selectedAction);
  void selectedActionType; // Mark as intentionally unused

  const handleTakeAction = async () => {
    if (!selectedAction || !effectiveDate || !actionReason.trim()) return;

    try {
      await takeActionMutation.mutateAsync({
        disciplinaryId: incident.incidentId,
        actionType: selectedAction,
        duration: selectedAction === 'Suspension' ? parseInt(duration) || undefined : undefined,
        effectiveDate,
        reason: actionReason,
        decidedBy: 'Current User', // Would come from auth context
      });
      setShowActionModal(false);
      setSelectedAction('');
      setDuration('');
      setEffectiveDate('');
      setActionReason('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) return;

    try {
      await resolveMutation.mutateAsync({
        disciplinaryId: incident.incidentId,
        resolution,
        resolvedBy: 'Current User',
      });
      setShowResolveModal(false);
      setResolution('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleClose = async () => {
    if (!closureReason.trim()) return;

    try {
      await closeMutation.mutateAsync({
        disciplinaryId: incident.incidentId,
        closureReason,
        closedBy: 'Current User',
      });
      setShowCloseModal(false);
      setClosureReason('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleReopen = async () => {
    if (!reopenReason.trim()) return;

    try {
      await reopenMutation.mutateAsync({
        disciplinaryId: incident.incidentId,
        reopenReason,
        reopenedBy: 'Current User',
      });
      setShowReopenModal(false);
      setReopenReason('');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="xpress-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-xpress-accent-red/20 rounded-lg">
            <Gavel className="w-5 h-5 text-xpress-accent-red" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-xpress-text-primary">
              Disciplinary Action
            </h3>
            <p className="text-sm text-xpress-text-secondary">
              {action ? `Action taken: ${action.actionType}` : 'No action taken yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Current Action Display */}
      {action && (
        <div className="mb-6 p-4 bg-xpress-bg-secondary rounded-lg border border-xpress-border">
          <div className="flex items-start gap-3">
            <div className={`
              p-2 rounded-lg
              ${action.actionType === 'Termination' ? 'bg-xpress-accent-red/20' :
                action.actionType === 'Suspension' ? 'bg-xpress-accent-amber/20' :
                action.actionType === 'Warning' ? 'bg-xpress-accent-cyan/20' :
                'bg-xpress-accent-green/20'
              }
            `}>
              {action.actionType === 'Termination' ? <XCircle className="w-5 h-5 text-xpress-accent-red" /> :
               action.actionType === 'Suspension' ? <Clock className="w-5 h-5 text-xpress-accent-amber" /> :
               action.actionType === 'Warning' ? <AlertTriangle className="w-5 h-5 text-xpress-accent-cyan" /> :
               <Shield className="w-5 h-5 text-xpress-accent-green" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-xpress-text-primary">{action.actionType}</h4>
                <Badge variant={action.actionType === 'Termination' ? 'alert' : 'warning'}>
                  {action.appealStatus || 'No Appeal'}
                </Badge>
              </div>
              <p className="text-sm text-xpress-text-secondary mt-1">
                Effective: {format(new Date(action.effectiveDate), 'MMM d, yyyy')}
              </p>
              {action.duration && (
                <p className="text-sm text-xpress-text-secondary">
                  Duration: {action.duration} days
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-xpress-border">
                <p className="text-sm text-xpress-text-secondary">
                  <span className="text-xpress-text-muted">Reason: </span>
                  {action.reason}
                </p>
                <p className="text-sm text-xpress-text-muted mt-1">
                  Decided by: {action.decidedBy}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {canTakeDisciplinaryAction && (
          <Button
            variant="primary"
            className="w-full"
            icon={<Gavel className="w-4 h-4" />}
            onClick={() => setShowActionModal(true)}
          >
            Take Disciplinary Action
          </Button>
        )}

        {canResolveIncident && (
          <Button
            variant="secondary"
            className="w-full"
            icon={<CheckCircle className="w-4 h-4" />}
            onClick={() => setShowResolveModal(true)}
          >
            Mark as Resolved
          </Button>
        )}

        {canCloseIncident && (
          <Button
            variant="ghost"
            className="w-full"
            icon={<XCircle className="w-4 h-4" />}
            onClick={() => setShowCloseModal(true)}
          >
            Close Incident
          </Button>
        )}

        {canReopenIncident && (
          <Button
            variant="secondary"
            className="w-full"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => setShowReopenModal(true)}
          >
            Reopen Incident
          </Button>
        )}
      </div>

      {/* Take Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setSelectedAction('');
          setDuration('');
          setEffectiveDate('');
          setActionReason('');
        }}
        title="Take Disciplinary Action"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowActionModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleTakeAction}
              loading={takeActionMutation.isPending}
              disabled={!selectedAction || !effectiveDate || !actionReason.trim()}
              icon={<Gavel className="w-4 h-4" />}
            >
              Take Action
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Action Type Selection */}
          <div>
            <label className="text-sm font-medium text-xpress-text-secondary mb-3 block">
              Select Action Type <span className="text-xpress-accent-red">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ACTION_TYPES.map((actionType) => (
                <button
                  key={actionType.value}
                  onClick={() => setSelectedAction(actionType.value)}
                  className={`
                    p-4 rounded-lg border text-left transition-all
                    ${selectedAction === actionType.value
                      ? 'border-xpress-accent-blue bg-xpress-accent-blue/10'
                      : 'border-xpress-border bg-xpress-bg-secondary hover:bg-xpress-bg-elevated'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <actionType.icon className={`w-5 h-5 ${actionType.color}`} />
                    <span className="font-medium text-xpress-text-primary">
                      {actionType.label}
                    </span>
                  </div>
                  <p className="text-xs text-xpress-text-muted">
                    {actionType.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration (only for suspension) */}
          {selectedAction === 'Suspension' && (
            <Input
              label="Suspension Duration (days)"
              type="number"
              min={1}
              max={90}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter number of days"
              icon={<Clock className="w-4 h-4" />}
            />
          )}

          {/* Effective Date */}
          <Input
            label="Effective Date"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
              Reason for Action <span className="text-xpress-accent-red">*</span>
            </label>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Enter detailed reason for this disciplinary action..."
              className="w-full bg-xpress-bg-secondary border border-xpress-border rounded-md px-3 py-2 text-sm text-xpress-text-primary placeholder:text-xpress-text-muted focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[100px] resize-y"
            />
          </div>
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => {
          setShowResolveModal(false);
          setResolution('');
        }}
        title="Resolve Incident"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowResolveModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleResolve}
              loading={resolveMutation.isPending}
              disabled={!resolution.trim()}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Resolve Incident
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-xpress-accent-green/10 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-xpress-accent-green" />
            <p className="text-sm text-xpress-text-primary">
              This will mark the incident as resolved and close the case.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
              Resolution Summary <span className="text-xpress-accent-red">*</span>
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Enter resolution summary..."
              className="w-full bg-xpress-bg-secondary border border-xpress-border rounded-md px-3 py-2 text-sm text-xpress-text-primary placeholder:text-xpress-text-muted focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[120px] resize-y"
            />
          </div>
        </div>
      </Modal>

      {/* Close Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => {
          setShowCloseModal(false);
          setClosureReason('');
        }}
        title="Close Incident"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCloseModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleClose}
              loading={closeMutation.isPending}
              disabled={!closureReason.trim()}
              icon={<XCircle className="w-4 h-4" />}
            >
              Close Incident
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-xpress-accent-amber/10 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-xpress-accent-amber" />
            <p className="text-sm text-xpress-text-primary">
              Closing this incident will prevent any further actions. This cannot be undone.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
              Reason for Closure <span className="text-xpress-accent-red">*</span>
            </label>
            <textarea
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
              placeholder="Enter reason for closing this incident..."
              className="w-full bg-xpress-bg-secondary border border-xpress-border rounded-md px-3 py-2 text-sm text-xpress-text-primary placeholder:text-xpress-text-muted focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[120px] resize-y"
            />
          </div>
        </div>
      </Modal>

      {/* Reopen Modal */}
      <Modal
        isOpen={showReopenModal}
        onClose={() => {
          setShowReopenModal(false);
          setReopenReason('');
        }}
        title="Reopen Incident"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowReopenModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReopen}
              loading={reopenMutation.isPending}
              disabled={!reopenReason.trim()}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reopen Incident
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-xpress-accent-blue/10 rounded-lg flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-xpress-accent-blue" />
            <p className="text-sm text-xpress-text-primary">
              This will reopen the incident for further investigation or action.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
              Reason for Reopening <span className="text-xpress-accent-red">*</span>
            </label>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Enter reason for reopening this incident..."
              className="w-full bg-xpress-bg-secondary border border-xpress-border rounded-md px-3 py-2 text-sm text-xpress-text-primary placeholder:text-xpress-text-muted focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[120px] resize-y"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ActionPanel;
