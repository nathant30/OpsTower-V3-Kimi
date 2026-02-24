import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateIncident } from '@/features/incidents/hooks/useIncidents';
import { usePermissionCheck } from '@/components/auth';
import type { IncidentType, Severity } from '@/types/domain.types';
import { 
  Car, User, Users, FileText, 
  MapPin, X, CheckCircle2 
} from 'lucide-react';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INCIDENT_TYPES: { value: IncidentType; label: string; description: string }[] = [
  { value: 'Accident', label: 'Accident', description: 'Vehicle collision or accident' },
  { value: 'SafetyViolation', label: 'Safety Violation', description: 'Breach of safety protocols' },
  { value: 'CustomerComplaint', label: 'Customer Complaint', description: 'Issue reported by customer' },
  { value: 'DriverMisconduct', label: 'Driver Misconduct', description: 'Inappropriate driver behavior' },
  { value: 'VehicleIssue', label: 'Vehicle Issue', description: 'Vehicle malfunction or damage' },
  { value: 'PolicyViolation', label: 'Policy Violation', description: 'Violation of company policies' },
  { value: 'Fraud', label: 'Fraud', description: 'Suspicious or fraudulent activity' },
  { value: 'Other', label: 'Other', description: 'Other incident types' },
];

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: 'Critical', label: 'Critical', color: 'bg-xpress-accent-red' },
  { value: 'High', label: 'High', color: 'bg-xpress-accent-amber' },
  { value: 'Medium', label: 'Medium', color: 'bg-xpress-accent-cyan' },
  { value: 'Low', label: 'Low', color: 'bg-xpress-accent-blue' },
];

const PRIORITIES = [
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
];

const REPORTER_TYPES = [
  { value: 'Driver', label: 'Driver' },
  { value: 'Customer', label: 'Customer' },
  { value: 'System', label: 'System' },
  { value: 'Admin', label: 'Admin' },
];

export function CreateIncidentModal({ isOpen, onClose }: CreateIncidentModalProps) {
  const { hasPermission } = usePermissionCheck();
  const createMutation = useCreateIncident();

  // Form state
  const [step, setStep] = useState(1);
  const [type, setType] = useState<IncidentType>('Accident');
  const [severity, setSeverity] = useState<Severity>('Medium');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [summary, setSummary] = useState('');
  const [detailedNarrative, setDetailedNarrative] = useState('');
  const [circumstances, setCircumstances] = useState<string[]>([]);
  const [newCircumstance, setNewCircumstance] = useState('');
  
  // Reporter
  const [reporterType, setReporterType] = useState<'Driver' | 'Customer' | 'System' | 'Admin'>('Driver');
  const [reporterName, setReporterName] = useState('');
  const [reporterId, setReporterId] = useState('');
  
  // Location
  const [hasLocation, setHasLocation] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Involved parties
  const [driverIds, setDriverIds] = useState('');
  const [vehicleIds, setVehicleIds] = useState('');
  const [customerIds, setCustomerIds] = useState('');

  const canCreate = hasPermission('create:incidents');

  const resetForm = () => {
    setStep(1);
    setType('Accident');
    setSeverity('Medium');
    setPriority('Normal');
    setSummary('');
    setDetailedNarrative('');
    setCircumstances([]);
    setNewCircumstance('');
    setReporterType('Driver');
    setReporterName('');
    setReporterId('');
    setHasLocation(false);
    setLatitude('');
    setLongitude('');
    setDriverIds('');
    setVehicleIds('');
    setCustomerIds('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddCircumstance = () => {
    if (newCircumstance.trim()) {
      setCircumstances([...circumstances, newCircumstance.trim()]);
      setNewCircumstance('');
    }
  };

  const handleRemoveCircumstance = (index: number) => {
    setCircumstances(circumstances.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canCreate) return;

    try {
      await createMutation.mutateAsync({
        type,
        severity,
        priority,
        reportedBy: {
          type: reporterType,
          userId: reporterId || 'unknown',
          name: reporterName || 'Anonymous',
          reportedAt: new Date().toISOString(),
        },
        involved: {
          drivers: driverIds.split(',').map(s => s.trim()).filter(Boolean).map(id => ({ driverId: id, name: 'Unknown', phone: '' })),
          vehicles: vehicleIds.split(',').map(s => s.trim()).filter(Boolean).map(id => ({ vehicleId: id, plateNumber: '' })),
          customers: customerIds.split(',').map(s => s.trim()).filter(Boolean).map(id => ({ customerId: id, name: 'Unknown' })),
        },
        location: hasLocation && latitude && longitude ? {
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
          timestamp: new Date().toISOString(),
        } : undefined,
        description: {
          summary,
          detailedNarrative,
          circumstances,
        },
      });
      handleClose();
    } catch {
      // Error handled by mutation
    }
  };

  const isStep1Valid = type && severity && priority;
  const isStep2Valid = summary.trim() && detailedNarrative.trim();
  const isStep3Valid = reporterName.trim();

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Incident Type */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-3 block">
                Incident Type <span className="text-xpress-accent-red">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INCIDENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${type === t.value
                        ? 'border-xpress-accent-blue bg-xpress-accent-blue/10'
                        : 'border-xpress-border bg-xpress-bg-secondary hover:bg-xpress-bg-elevated'
                      }
                    `}
                  >
                    <div className="font-medium text-xpress-text-primary">
                      {t.label}
                    </div>
                    <div className="text-xs text-xpress-text-muted mt-1">
                      {t.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-3 block">
                Severity Level <span className="text-xpress-accent-red">*</span>
              </label>
              <div className="flex gap-3">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSeverity(s.value)}
                    className={`
                      flex-1 p-3 rounded-lg border text-center transition-all
                      ${severity === s.value
                        ? 'border-xpress-accent-blue bg-xpress-accent-blue/10'
                        : 'border-xpress-border bg-xpress-bg-secondary hover:bg-xpress-bg-elevated'
                      }
                    `}
                  >
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${s.color}`} />
                    <div className="font-medium text-xpress-text-primary">
                      {s.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-3 block">
                Priority <span className="text-xpress-accent-red">*</span>
              </label>
              <div className="flex gap-3">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value as typeof priority)}
                    className={`
                      flex-1 p-3 rounded-lg border text-center transition-all
                      ${priority === p.value
                        ? 'border-xpress-accent-blue bg-xpress-accent-blue/10'
                        : 'border-xpress-border bg-xpress-bg-secondary hover:bg-xpress-bg-elevated'
                      }
                    `}
                  >
                    <div className="font-medium text-xpress-text-primary">
                      {p.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
                Incident Summary <span className="text-xpress-accent-red">*</span>
              </label>
              <Input
                placeholder="Brief summary of the incident..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                icon={<FileText className="w-4 h-4" />}
              />
            </div>

            {/* Detailed Narrative */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
                Detailed Narrative <span className="text-xpress-accent-red">*</span>
              </label>
              <textarea
                value={detailedNarrative}
                onChange={(e) => setDetailedNarrative(e.target.value)}
                placeholder="Provide a detailed description of what happened..."
                className="w-full bg-xpress-bg-secondary border border-xpress-border rounded-md px-3 py-2 text-sm text-xpress-text-primary placeholder:text-xpress-text-muted focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[150px] resize-y"
              />
            </div>

            {/* Circumstances */}
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">
                Contributing Circumstances
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a circumstance..."
                  value={newCircumstance}
                  onChange={(e) => setNewCircumstance(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCircumstance()}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={handleAddCircumstance}
                  disabled={!newCircumstance.trim()}
                >
                  Add
                </Button>
              </div>
              {circumstances.length > 0 && (
                <div className="mt-3 space-y-2">
                  {circumstances.map((circ, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-xpress-bg-elevated rounded"
                    >
                      <span className="text-sm text-xpress-text-primary">{circ}</span>
                      <button
                        onClick={() => handleRemoveCircumstance(index)}
                        className="text-xpress-text-muted hover:text-xpress-accent-red"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Reporter Info */}
            <div className="p-4 bg-xpress-bg-secondary rounded-lg border border-xpress-border">
              <h4 className="font-medium text-xpress-text-primary mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Reporter Information
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-xpress-text-muted mb-2 block">
                      Reporter Type
                    </label>
                    <select
                      value={reporterType}
                      onChange={(e) => setReporterType(e.target.value as typeof reporterType)}
                      className="w-full bg-xpress-bg-tertiary border border-xpress-border rounded-md px-3 py-2 text-sm text-xpress-text-primary"
                    >
                      {REPORTER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-xpress-text-muted mb-2 block">
                      Reporter Name <span className="text-xpress-accent-red">*</span>
                    </label>
                    <Input
                      placeholder="Enter name"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                    />
                  </div>
                </div>
                <Input
                  label="Reporter ID (Optional)"
                  placeholder="Enter ID"
                  value={reporterId}
                  onChange={(e) => setReporterId(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="p-4 bg-xpress-bg-secondary rounded-lg border border-xpress-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-xpress-text-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </h4>
                <label className="flex items-center gap-2 text-sm text-xpress-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLocation}
                    onChange={(e) => setHasLocation(e.target.checked)}
                    className="rounded border-xpress-border"
                  />
                  Include Location
                </label>
              </div>
              {hasLocation && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Latitude"
                    placeholder="e.g., 14.5995"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                  <Input
                    label="Longitude"
                    placeholder="e.g., 120.9842"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Involved Parties */}
            <div className="p-4 bg-xpress-bg-secondary rounded-lg border border-xpress-border">
              <h4 className="font-medium text-xpress-text-primary mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Involved Parties
              </h4>
              <div className="space-y-4">
                <Input
                  label="Driver IDs (comma-separated)"
                  placeholder="e.g., DRV001, DRV002"
                  value={driverIds}
                  onChange={(e) => setDriverIds(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Vehicle IDs (comma-separated)"
                  placeholder="e.g., VEH001, VEH002"
                  value={vehicleIds}
                  onChange={(e) => setVehicleIds(e.target.value)}
                  icon={<Car className="w-4 h-4" />}
                />
                <Input
                  label="Customer IDs (comma-separated)"
                  placeholder="e.g., CUST001, CUST002"
                  value={customerIds}
                  onChange={(e) => setCustomerIds(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Incident Details', 'Description', 'Parties & Location'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report New Incident"
      size="xl"
      footer={
        <>
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          {step < 3 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending}
              disabled={!isStep3Valid}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Report Incident
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step > index + 1 ? 'bg-xpress-accent-green text-white' :
                  step === index + 1 ? 'bg-xpress-accent-blue text-white' :
                  'bg-xpress-bg-elevated text-xpress-text-muted'
                }
              `}>
                {step > index + 1 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`
                ml-2 text-sm hidden sm:block
                ${step >= index + 1 ? 'text-xpress-text-primary' : 'text-xpress-text-muted'}
              `}>
                {title}
              </span>
              {index < stepTitles.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > index + 1 ? 'bg-xpress-accent-green' : 'bg-xpress-bg-elevated'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStep()}
      </div>
    </Modal>
  );
}

export default CreateIncidentModal;
