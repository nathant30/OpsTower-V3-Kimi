import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { usePermissionCheck } from '@/components/auth';
import { useIncident, useChangePriority } from '@/features/incidents/hooks/useIncidents';
import { EvidenceGallery } from '@/features/incidents/components/EvidenceGallery';
import { InvestigationPanel } from '@/features/incidents/components/InvestigationPanel';
import { ActionPanel } from '@/features/incidents/components/ActionPanel';
import { showSuccess, showError } from '@/lib/stores/ui.store';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { 
  ArrowLeft, RefreshCw, AlertCircle, Loader2,
  Flag, MapPin, Calendar, User, Car, Users,
  CheckCircle2, ExternalLink, Copy, CheckCircle,
  Navigation, Phone
} from 'lucide-react';
import type { IncidentStatus } from '@/types/domain.types';

// Status workflow steps
const WORKFLOW_STEPS: { status: IncidentStatus; label: string; description: string }[] = [
  { status: 'New', label: 'Reported', description: 'Incident reported and awaiting review' },
  { status: 'Reviewing', label: 'Under Review', description: 'Initial assessment in progress' },
  { status: 'Investigating', label: 'Investigation', description: 'Detailed investigation underway' },
  { status: 'PendingAction', label: 'Pending Action', description: 'Awaiting disciplinary decision' },
  { status: 'Hearing', label: 'Hearing', description: 'Disciplinary hearing scheduled' },
  { status: 'Resolved', label: 'Resolved', description: 'Case resolved and closed' },
];

export default function IncidentDetailPage() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissionCheck();
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [newPriority, setNewPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [priorityReason, setPriorityReason] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Fetch incident data
  const { 
    data: incident, 
    isLoading, 
    error,
    refetch 
  } = useIncident(incidentId);

  // Mutations
  const changePriorityMutation = useChangePriority();

  // Permissions
  const canEdit = hasPermission('create:incidents');

  const handleChangePriority = async () => {
    if (!incidentId || !priorityReason.trim()) return;

    try {
      await changePriorityMutation.mutateAsync({
        incidentId: incidentId,
        priority: newPriority,
      });
      showSuccess(`Priority changed to ${newPriority}`);
      setShowPriorityModal(false);
      setPriorityReason('');
    } catch {
      showError('Failed to change priority');
    }
  };

  const handleCopyId = () => {
    if (!incident) return;
    navigator.clipboard.writeText(incident.incidentId || '');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };



  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return { color: 'red', icon: AlertCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      case 'High':
        return { color: 'amber', icon: AlertCircle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      case 'Medium':
        return { color: 'cyan', icon: AlertCircle, bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' };
      case 'Low':
        return { color: 'blue', icon: AlertCircle, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
      default:
        return { color: 'gray', icon: AlertCircle, bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-xpress-accent-blue animate-spin mx-auto mb-4" />
          <p className="text-xpress-text-muted">Loading incident details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-xpress-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-xpress-text-primary mb-2">
            Error Loading Incident
          </h2>
          <p className="text-xpress-text-muted mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button
            variant="primary"
            onClick={() => refetch()}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!incident) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-xpress-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-xpress-text-primary mb-2">
            Incident Not Found
          </h2>
          <p className="text-xpress-text-muted mb-4">
            The incident you are looking for does not exist or has been removed.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/incidents')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Incidents
          </Button>
        </div>
      </div>
    );
  }

  const severityStyles = getSeverityStyles(incident.severity || 'Unknown');
  const SeverityIcon = severityStyles.icon;

  // Get current workflow step index
  const currentStepIndex = WORKFLOW_STEPS.findIndex(step => step.status === incident.status);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/incidents')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          
          {canEdit && (
            <Button
              variant="secondary"
              icon={<Flag className="w-4 h-4" />}
              onClick={() => {
                setNewPriority(incident.priority as typeof newPriority);
                setShowPriorityModal(true);
              }}
            >
              Change Priority
            </Button>
          )}
        </div>
      </div>

      {/* Incident Header Card */}
      <div className={cn(
        "bg-[#12121a] border rounded-xl p-6",
        severityStyles.border
      )}>
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Left - Icon and Title */}
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-4 rounded-xl shrink-0",
              severityStyles.bg
            )}>
              <SeverityIcon className={cn("w-8 h-8", severityStyles.text)} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">
                  {(incident.type || 'Unknown').replace(/([A-Z])/g, ' $1').trim()}
                </h1>
                <Badge 
                  variant={incident.status === 'Resolved' ? 'active' : incident.status === 'Closed' ? 'offline' : 'alert'}
                >
                  {incident.status === 'PendingAction' ? 'Pending Action' : (incident.status || 'Unknown')}
                </Badge>
              </div>
              <p className="text-gray-400 mt-1">{incident.description?.summary || 'No description'}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="font-mono text-sm text-xpress-accent-blue">
                  {(incident.incidentId || 'UNKNOWN').slice(0, 16).toUpperCase()}...
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Copy full ID"
                >
                  {copiedId ? (
                    <CheckCircle className="w-4 h-4 text-xpress-accent-green" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right - Quick Actions */}
          <div className="lg:ml-auto flex flex-wrap gap-2">
            {incident.location && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Navigation className="w-4 h-4" />}
                onClick={() => {
                  if (incident.location?.lat != null && incident.location?.lng != null) {
                    window.open(`https://maps.google.com/?q=${incident.location.lat},${incident.location.lng}`, '_blank');
                  }
                }}
              >
                View Location
              </Button>
            )}
            {(incident.involved?.drivers?.length ?? 0) > 0 && incident.involved.drivers[0]?.driverId && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Phone className="w-4 h-4" />}
                onClick={() => navigate(`/drivers/${incident.involved.drivers[0].driverId}`)}
              >
                Contact Driver
              </Button>
            )}
          </div>
        </div>

        {/* Status Workflow Visualization */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      isCompleted 
                        ? "bg-xpress-accent-green text-white"
                        : isCurrent
                          ? "bg-xpress-accent-blue text-white ring-2 ring-xpress-accent-blue/50"
                          : "bg-white/5 text-gray-500"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-xs mt-2 font-medium",
                      isCompleted ? "text-xpress-accent-green" :
                      isCurrent ? "text-xpress-accent-blue" : "text-gray-500"
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-2",
                      isCompleted ? "bg-xpress-accent-green" : "bg-white/10"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Incident Details</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <DetailItem
                icon={Calendar}
                label="Reported"
                value={incident.timeline?.reportedAt ? format(new Date(incident.timeline.reportedAt), 'MMM d, yyyy') : 'Unknown'}
                subValue={incident.timeline?.reportedAt ? format(new Date(incident.timeline.reportedAt), 'h:mm a') : ''}
              />
              <DetailItem
                icon={User}
                label="Reporter"
                value={incident.reportedBy?.name || 'Unknown'}
                subValue={incident.reportedBy?.type || 'Unknown'}
              />
              <DetailItem
                icon={AlertCircle}
                label="Severity"
                value={incident.severity || 'Unknown'}
                valueColor={incident.severity === 'Critical' ? 'text-xpress-accent-red' : incident.severity === 'High' ? 'text-xpress-accent-amber' : 'text-xpress-accent-blue'}
              />
              <DetailItem
                icon={Flag}
                label="Priority"
                value={incident.priority || 'Unknown'}
                valueColor={incident.priority === 'Urgent' ? 'text-xpress-accent-red' : incident.priority === 'High' ? 'text-xpress-accent-amber' : 'text-xpress-text-primary'}
              />
            </div>

            {/* Detailed Narrative */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Detailed Description</h4>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {incident.description?.detailedNarrative || 'No detailed description available'}
                  </p>
                </div>
              </div>

              {(incident.description?.circumstances?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Contributing Circumstances</h4>
                  <ul className="space-y-2">
                    {incident.description.circumstances.map((circ, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <span className="text-xpress-accent-blue mt-1">•</span>
                        {circ}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Location Card */}
          {incident.location?.lat != null && incident.location?.lng != null && (
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-xpress-accent-blue" />
                  Location
                </h3>
                <a
                  href={`https://maps.google.com/?q=${incident.location.lat},${incident.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xpress-accent-blue hover:underline text-sm flex items-center gap-1"
                >
                  Open in Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <span className="text-xs text-gray-500 block">Latitude</span>
                  <span className="font-mono text-gray-300">{incident.location.lat.toFixed(6)}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <span className="text-xs text-gray-500 block">Longitude</span>
                  <span className="font-mono text-gray-300">{incident.location.lng.toFixed(6)}</span>
                </div>
              </div>
              {incident.location.speed !== undefined && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg flex items-center gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Speed</span>
                    <span className="text-gray-300">{incident.location.speed} km/h</span>
                  </div>
                  {incident.location.heading !== undefined && (
                    <div>
                      <span className="text-xs text-gray-500 block">Heading</span>
                      <span className="text-gray-300">{incident.location.heading}°</span>
                    </div>
                  )}
                </div>
              )}
              {/* Map placeholder */}
              <div className="mt-4 h-48 bg-xpress-bg-tertiary rounded-lg flex items-center justify-center border border-white/5">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Map View</p>
                  <p className="text-xs text-gray-600">
                    {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Gallery */}
          <EvidenceGallery 
            evidence={incident.evidence || {}} 
            incidentId={incident.incidentId || ''}
          />
        </div>

        {/* Right Column - Timeline & Actions */}
        <div className="space-y-6">
          {/* Involved Parties */}
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-xpress-accent-cyan" />
              Involved Parties
            </h3>
            
            {/* Drivers */}
            {(incident.involved?.drivers?.length ?? 0) > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Drivers ({incident.involved.drivers.length})
                </h4>
                <div className="space-y-2">
                  {incident.involved.drivers.map((driver) => (
                    <div 
                      key={driver.driverId}
                      className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => navigate(`/drivers/${driver.driverId}`)}
                    >
                      <div className="font-medium text-gray-300">{driver.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{driver.phone || 'No phone'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicles */}
            {(incident.involved?.vehicles?.length ?? 0) > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicles ({incident.involved.vehicles.length})
                </h4>
                <div className="space-y-2">
                  {incident.involved.vehicles.map((vehicle) => (
                    <div 
                      key={vehicle.vehicleId}
                      className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => navigate(`/fleet/${vehicle.vehicleId}`)}
                    >
                      <div className="font-medium text-gray-300">{vehicle.plateNumber || 'Unknown'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customers */}
            {(incident.involved?.customers?.length ?? 0) > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Customers ({incident.involved.customers.length})</h4>
                <div className="space-y-2">
                  {incident.involved.customers.map((customer) => (
                    <div 
                      key={customer.customerId}
                      className="p-3 bg-white/5 rounded-lg"
                    >
                      <div className="font-medium text-gray-300">{customer.name || 'Unknown'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Investigation Panel */}
          <InvestigationPanel incident={incident} />

          {/* Action Panel */}
          <ActionPanel incident={incident} />
        </div>
      </div>

      {/* Priority Change Modal */}
      <Modal
        isOpen={showPriorityModal}
        onClose={() => {
          setShowPriorityModal(false);
          setPriorityReason('');
        }}
        title="Change Priority"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowPriorityModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePriority}
              loading={changePriorityMutation.isPending}
              disabled={!priorityReason.trim()}
              icon={<Flag className="w-4 h-4" />}
            >
              Change Priority
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-3 block">
              New Priority
            </label>
            <div className="flex gap-2">
              {(['Normal', 'High', 'Urgent'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`
                    flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
                    ${newPriority === p
                      ? p === 'Urgent' 
                        ? 'bg-xpress-accent-red text-white'
                        : p === 'High'
                          ? 'bg-xpress-accent-amber text-white'
                          : 'bg-xpress-accent-blue text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }
                  `}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Reason for Change <span className="text-xpress-accent-red">*</span>
            </label>
            <textarea
              value={priorityReason}
              onChange={(e) => setPriorityReason(e.target.value)}
              placeholder="Enter reason for priority change..."
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[100px] resize-y"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Detail Item Component
function DetailItem({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  valueColor = 'text-gray-300'
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-white/5 rounded-lg">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`font-medium ${valueColor}`}>{value}</div>
        {subValue && <div className="text-xs text-gray-500">{subValue}</div>}
      </div>
    </div>
  );
}
