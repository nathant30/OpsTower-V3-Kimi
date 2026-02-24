import { Badge } from '@/components/ui/Badge';

import type { Incident } from '@/types/domain.types';
import { format } from 'date-fns';
import { 
  MapPin, Calendar, User, Car, AlertTriangle, 
  FileText, ExternalLink, Copy, CheckCircle2 
} from 'lucide-react';
import { useState } from 'react';

interface IncidentDetailProps {
  incident: Incident;
}

export function IncidentDetail({ incident }: IncidentDetailProps) {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(incident.incidentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-xpress-accent-red';
      case 'High': return 'text-xpress-accent-amber';
      case 'Medium': return 'text-xpress-accent-cyan';
      case 'Low': return 'text-xpress-accent-blue';
      default: return 'text-xpress-text-muted';
    }
  };

  const getStatusVariant = (status: string): 'active' | 'idle' | 'offline' | 'alert' | 'warning' => {
    switch (status) {
      case 'Resolved': return 'active';
      case 'Closed': return 'offline';
      case 'Investigating':
      case 'Reviewing': return 'warning';
      case 'New':
      case 'PendingAction': return 'alert';
      case 'Hearing': return 'idle';
      default: return 'offline';
    }
  };

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
    <div className="space-y-6">
      {/* Header Card */}
      <div className="xpress-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-xpress-text-primary">
                Incident Details
              </h1>
              <Badge variant={getStatusVariant(incident.status)}>
                {incident.status === 'PendingAction' ? 'Pending Action' : incident.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono text-xpress-accent-blue">
                {incident.incidentId.slice(0, 16).toUpperCase()}...
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 hover:bg-xpress-bg-elevated rounded transition-colors"
                title="Copy full ID"
              >
                {copiedId ? (
                  <CheckCircle2 className="w-4 h-4 text-xpress-accent-green" />
                ) : (
                  <Copy className="w-4 h-4 text-xpress-text-muted" />
                )}
              </button>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getSeverityColor(incident.severity)}`}>
              {incident.severity}
            </div>
            <div className="text-sm text-xpress-text-muted">Severity Level</div>
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-xpress-border">
          <div>
            <div className="flex items-center gap-2 text-xpress-text-muted text-sm mb-1">
              <AlertTriangle className="w-4 h-4" />
              Incident Type
            </div>
            <div className="font-medium text-xpress-text-primary">
              {typeLabels[incident.type] || incident.type}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xpress-text-muted text-sm mb-1">
              <Calendar className="w-4 h-4" />
              Reported On
            </div>
            <div className="font-medium text-xpress-text-primary">
              {format(new Date(incident.timeline.reportedAt), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xpress-text-muted text-sm mb-1">
              <User className="w-4 h-4" />
              Reported By
            </div>
            <div className="font-medium text-xpress-text-primary">
              {incident.reportedBy.name}
            </div>
            <div className="text-xs text-xpress-text-muted">
              {incident.reportedBy.type}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xpress-text-muted text-sm mb-1">
              <FileText className="w-4 h-4" />
              Priority
            </div>
            <div className="font-medium text-xpress-text-primary">
              {incident.priority}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Description & Details */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div className="xpress-card p-6">
            <h3 className="text-lg font-semibold text-xpress-text-primary mb-4">
              Description
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-xpress-text-secondary mb-2">
                  Summary
                </h4>
                <p className="text-xpress-text-primary">
                  {incident.description.summary}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-xpress-text-secondary mb-2">
                  Detailed Narrative
                </h4>
                <p className="text-xpress-text-primary whitespace-pre-wrap">
                  {incident.description.detailedNarrative}
                </p>
              </div>
              {incident.description.circumstances.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-xpress-text-secondary mb-2">
                    Contributing Circumstances
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {incident.description.circumstances.map((circumstance, index) => (
                      <li key={index} className="text-xpress-text-primary">
                        {circumstance}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {incident.location && (
            <div className="xpress-card p-6">
              <h3 className="text-lg font-semibold text-xpress-text-primary mb-4">
                Location
              </h3>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-xpress-accent-blue/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-xpress-accent-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-xpress-text-primary">
                    Lat: {incident.location.lat.toFixed(6)}, 
                    Lng: {incident.location.lng.toFixed(6)}
                  </p>
                  {incident.location.heading !== undefined && (
                    <p className="text-sm text-xpress-text-secondary mt-1">
                      Heading: {incident.location.heading}°
                      {incident.location.speed !== undefined && (
                        <>, Speed: {incident.location.speed} km/h</>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-xpress-text-muted mt-2">
                    Recorded: {format(new Date(incident.location.timestamp), 'MMM d, yyyy h:mm:ss a')}
                  </p>
                </div>
                <a
                  href={`https://maps.google.com/?q=${incident.location.lat},${incident.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xpress-accent-blue hover:underline text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Map
                </a>
              </div>
              {/* Map placeholder */}
              <div className="mt-4 h-48 bg-xpress-bg-secondary rounded-lg flex items-center justify-center border border-xpress-border">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-xpress-text-muted mx-auto mb-2" />
                  <p className="text-sm text-xpress-text-muted">Map View</p>
                  <p className="text-xs text-xpress-text-muted mt-1">
                    {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Involved Parties */}
        <div className="space-y-6">
          {/* Involved Drivers */}
          <div className="xpress-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-xpress-accent-blue/10 rounded-lg">
                <User className="w-5 h-5 text-xpress-accent-blue" />
              </div>
              <h3 className="text-lg font-semibold text-xpress-text-primary">
                Involved Drivers
              </h3>
              <span className="ml-auto bg-xpress-bg-elevated px-2 py-0.5 rounded text-sm text-xpress-text-secondary">
                {incident.involved.drivers.length}
              </span>
            </div>
            {incident.involved.drivers.length > 0 ? (
              <div className="space-y-3">
                {incident.involved.drivers.map((driver) => (
                  <div
                    key={driver.driverId}
                    className="p-3 bg-xpress-bg-secondary rounded-lg border border-xpress-border"
                  >
                    <div className="font-medium text-xpress-text-primary">
                      {driver.name}
                    </div>
                    <div className="text-sm text-xpress-text-secondary">
                      {driver.phone}
                    </div>
                    {driver.assignedAt && (
                      <div className="text-xs text-xpress-text-muted mt-1">
                        Assigned: {format(new Date(driver.assignedAt), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-xpress-text-muted">No drivers involved</p>
            )}
          </div>

          {/* Involved Vehicles */}
          <div className="xpress-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-xpress-accent-cyan/10 rounded-lg">
                <Car className="w-5 h-5 text-xpress-accent-cyan" />
              </div>
              <h3 className="text-lg font-semibold text-xpress-text-primary">
                Involved Vehicles
              </h3>
              <span className="ml-auto bg-xpress-bg-elevated px-2 py-0.5 rounded text-sm text-xpress-text-secondary">
                {incident.involved.vehicles.length}
              </span>
            </div>
            {incident.involved.vehicles.length > 0 ? (
              <div className="space-y-3">
                {incident.involved.vehicles.map((vehicle) => (
                  <div
                    key={vehicle.vehicleId}
                    className="p-3 bg-xpress-bg-secondary rounded-lg border border-xpress-border"
                  >
                    <div className="font-medium text-xpress-text-primary">
                      {vehicle.plateNumber}
                    </div>
                    <div className="text-xs text-xpress-text-muted">
                      ID: {vehicle.vehicleId.slice(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-xpress-text-muted">No vehicles involved</p>
            )}
          </div>

          {/* Involved Customers */}
          <div className="xpress-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-xpress-accent-purple/10 rounded-lg">
                <User className="w-5 h-5 text-xpress-accent-purple" />
              </div>
              <h3 className="text-lg font-semibold text-xpress-text-primary">
                Involved Customers
              </h3>
              <span className="ml-auto bg-xpress-bg-elevated px-2 py-0.5 rounded text-sm text-xpress-text-secondary">
                {incident.involved.customers.length}
              </span>
            </div>
            {incident.involved.customers.length > 0 ? (
              <div className="space-y-3">
                {incident.involved.customers.map((customer) => (
                  <div
                    key={customer.customerId}
                    className="p-3 bg-xpress-bg-secondary rounded-lg border border-xpress-border"
                  >
                    <div className="font-medium text-xpress-text-primary">
                      {customer.name}
                    </div>
                    <div className="text-xs text-xpress-text-muted">
                      ID: {customer.customerId.slice(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-xpress-text-muted">No customers involved</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentDetail;
