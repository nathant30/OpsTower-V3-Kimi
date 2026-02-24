import { cn } from '@/lib/utils/cn';
import type { DriverCompliance, Document } from '@/types/domain.types';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  Shield,
  GraduationCap,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

// ==================== TYPES ====================

interface CompliancePanelProps {
  compliance: DriverCompliance;
  onVerifyDocument?: (documentId: string, status: 'Approved' | 'Rejected') => void;
  className?: string;
}

// ==================== HELPERS ====================

function getStatusIcon(status: string) {
  switch (status) {
    case 'Valid':
    case 'Cleared':
    case 'Approved':
      return <CheckCircle className="w-4 h-4 text-xpress-status-active" />;
    case 'Pending':
      return <Clock className="w-4 h-4 text-xpress-status-idle" />;
    case 'Expired':
    case 'Failed':
    case 'Rejected':
      return <XCircle className="w-4 h-4 text-xpress-status-alert" />;
    default:
      return <AlertCircle className="w-4 h-4 text-xpress-text-muted" />;
  }
}

function getStatusVariant(status: string): 'active' | 'idle' | 'alert' | 'warning' | 'default' {
  switch (status) {
    case 'Valid':
    case 'Cleared':
    case 'Approved':
      return 'active';
    case 'Pending':
      return 'idle';
    case 'Expired':
    case 'Failed':
    case 'Rejected':
      return 'alert';
    default:
      return 'default';
  }
}

function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatExpiryDate(expiryDate: string): { text: string; urgent: boolean; expired: boolean } {
  const days = getDaysUntilExpiry(expiryDate);
  
  if (days < 0) {
    return { text: `Expired ${Math.abs(days)} days ago`, urgent: true, expired: true };
  }
  if (days === 0) {
    return { text: 'Expires today', urgent: true, expired: false };
  }
  if (days <= 7) {
    return { text: `Expires in ${days} days`, urgent: true, expired: false };
  }
  if (days <= 30) {
    return { text: `Expires in ${days} days`, urgent: false, expired: false };
  }
  return { text: `Expires ${new Date(expiryDate).toLocaleDateString()}`, urgent: false, expired: false };
}

// ==================== MAIN PANEL ====================

export function CompliancePanel({ compliance, onVerifyDocument, className }: CompliancePanelProps) {
  const { license, background, training, documents } = compliance;

  // Calculate compliance score
  const calculateComplianceScore = () => {
    let score = 0;
    let total = 0;

    // License (25 points)
    if (license.status === 'Valid') score += 25;
    else if (license.status === 'Pending') score += 15;
    total += 25;

    // Background check (25 points)
    if (background.status === 'Cleared') score += 25;
    else if (background.status === 'Pending') score += 15;
    total += 25;

    // Training (25 points)
    if (training.certificationDate) score += 25;
    else if (training.completedModules.length > 0) score += 15;
    total += 25;

    // Documents (25 points)
    const approvedDocs = documents.filter(d => d.status === 'Approved').length;
    const totalDocs = documents.length || 1;
    score += (approvedDocs / totalDocs) * 25;
    total += 25;

    return Math.round((score / total) * 100);
  };

  const complianceScore = calculateComplianceScore();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Compliance Score */}
      <div className="bg-xpress-bg-secondary rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-xpress-text-secondary">
            Compliance Score
          </h4>
          <Badge variant={complianceScore >= 80 ? 'active' : complianceScore >= 60 ? 'idle' : 'warning'}>
            {complianceScore}%
          </Badge>
        </div>
        <div className="h-2 bg-xpress-bg-tertiary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              complianceScore >= 80 && 'bg-xpress-status-active',
              complianceScore >= 60 && complianceScore < 80 && 'bg-xpress-status-idle',
              complianceScore < 60 && 'bg-xpress-status-warning'
            )}
            style={{ width: `${complianceScore}%` }}
          />
        </div>
        <p className="text-xs text-xpress-text-muted mt-2">
          Based on license, background check, training, and documents
        </p>
      </div>

      {/* License Section */}
      <div className="bg-xpress-bg-secondary rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-xpress-accent-blue" />
          <h4 className="text-sm font-medium text-xpress-text-secondary">
            Driver's License
          </h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-xpress-text-muted">License Number</span>
            <span className="text-sm font-mono text-xpress-text-primary">
              {license.number}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-xpress-text-muted">Status</span>
            <div className="flex items-center gap-1.5">
              {getStatusIcon(license.status)}
              <Badge variant={getStatusVariant(license.status)}>
                {license.status}
              </Badge>
            </div>
          </div>
          {license.expiryDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-xpress-text-muted">Expiry</span>
              <ExpiryDate date={license.expiryDate} />
            </div>
          )}
        </div>
      </div>

      {/* Background Check Section */}
      <div className="bg-xpress-bg-secondary rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-xpress-accent-purple" />
          <h4 className="text-sm font-medium text-xpress-text-secondary">
            Background Check
          </h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-xpress-text-muted">Status</span>
            <div className="flex items-center gap-1.5">
              {getStatusIcon(background.status)}
              <Badge variant={getStatusVariant(background.status)}>
                {background.status}
              </Badge>
            </div>
          </div>
          {background.clearanceDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-xpress-text-muted">Cleared On</span>
              <span className="text-sm text-xpress-text-primary">
                {new Date(background.clearanceDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Training Section */}
      <div className="bg-xpress-bg-secondary rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4 text-xpress-accent-cyan" />
          <h4 className="text-sm font-medium text-xpress-text-secondary">
            Training & Certification
          </h4>
        </div>
        <div className="space-y-3">
          {training.completedModules.length > 0 && (
            <div>
              <span className="text-sm text-xpress-text-muted block mb-1.5">
                Completed Modules ({training.completedModules.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {training.completedModules.map((module, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-xpress-bg-tertiary rounded text-xs text-xpress-text-secondary"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>
          )}
          {training.certificationDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-xpress-text-muted">Certified On</span>
              <span className="text-sm text-xpress-text-primary">
                {new Date(training.certificationDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-xpress-bg-secondary rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-xpress-status-idle" />
          <h4 className="text-sm font-medium text-xpress-text-secondary">
            Documents ({documents.length})
          </h4>
        </div>
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              onVerify={onVerifyDocument}
            />
          ))}
          {documents.length === 0 && (
            <p className="text-sm text-xpress-text-muted text-center py-4">
              No documents uploaded
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function ExpiryDate({ date }: { date: string }) {
  const { text, urgent, expired } = formatExpiryDate(date);
  
  return (
    <span
      className={cn(
        'text-sm',
        expired && 'text-xpress-status-alert font-medium',
        urgent && !expired && 'text-xpress-status-warning',
        !urgent && 'text-xpress-text-primary'
      )}
    >
      {text}
    </span>
  );
}

interface DocumentItemProps {
  document: Document;
  onVerify?: (documentId: string, status: 'Approved' | 'Rejected') => void;
}

function DocumentItem({ document, onVerify }: DocumentItemProps) {
  const { id, type, name, status, uploadedAt, expiresAt, url } = document;

  return (
    <div className="p-3 bg-xpress-bg-tertiary rounded border border-xpress-border hover:border-xpress-border-focus transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="p-1.5 bg-xpress-bg-elevated rounded mt-0.5">
            <FileText className="w-3.5 h-3.5 text-xpress-text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-xpress-text-primary truncate">
              {name}
            </p>
            <p className="text-xs text-xpress-text-muted">
              {type} • Uploaded {new Date(uploadedAt).toLocaleDateString()}
            </p>
            {expiresAt && (
              <p className="text-xs mt-1">
                <ExpiryDate date={expiresAt} />
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(status)}>
            {status}
          </Badge>
          
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-xpress-text-muted hover:text-xpress-accent-blue hover:bg-xpress-bg-elevated rounded transition-colors"
              title="View Document"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Verify Actions */}
      {status === 'Pending' && onVerify && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-xpress-border">
          <button
            onClick={() => onVerify(id, 'Approved')}
            className="flex-1 px-3 py-1.5 bg-xpress-status-active/20 text-xpress-status-active text-xs font-medium rounded hover:bg-xpress-status-active/30 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => onVerify(id, 'Rejected')}
            className="flex-1 px-3 py-1.5 bg-xpress-status-alert/20 text-xpress-status-alert text-xs font-medium rounded hover:bg-xpress-status-alert/30 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== COMPACT VERSION ====================

interface ComplianceCompactProps {
  compliance: DriverCompliance;
  className?: string;
}

export function ComplianceCompact({ compliance, className }: ComplianceCompactProps) {
  const license = compliance?.license;
  const background = compliance?.background;
  const documents = compliance?.documents || [];
  
  const approvedCount = documents.filter(d => d.status === 'Approved').length;
  const pendingCount = documents.filter(d => d.status === 'Pending').length;

  return (
    <div className={cn('space-y-2', className)}>
      <CompactStatus
        label="License"
        status={license?.status || 'Unknown'}
        icon={<CreditCard className="w-3.5 h-3.5" />}
      />
      <CompactStatus
        label="Background"
        status={background?.status || 'Unknown'}
        icon={<Shield className="w-3.5 h-3.5" />}
      />
      <CompactStatus
        label="Documents"
        status={`${approvedCount}/${documents.length}`}
        icon={<FileText className="w-3.5 h-3.5" />}
        alert={pendingCount > 0}
      />
    </div>
  );
}

interface CompactStatusProps {
  label: string;
  status: string;
  icon: React.ReactNode;
  alert?: boolean;
}

function CompactStatus({ label, status, icon, alert }: CompactStatusProps) {
  const isValid = ['Valid', 'Cleared', 'Approved'].includes(status) || !alert;
  
  return (
    <div className="flex items-center justify-between p-2 bg-xpress-bg-secondary rounded">
      <div className="flex items-center gap-2">
        <span className="text-xpress-text-muted">{icon}</span>
        <span className="text-xs text-xpress-text-secondary">{label}</span>
      </div>
      <span className={cn('text-xs font-medium', isValid ? 'text-xpress-status-active' : 'text-xpress-status-idle')}>
        {status}
      </span>
    </div>
  );
}

export default CompliancePanel;
