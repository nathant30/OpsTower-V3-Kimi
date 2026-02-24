import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  UserCheck,
} from 'lucide-react';
import type { VerificationRequest, RiskLevel } from '@/services/verification/verification.service';

interface VerificationCardProps {
  request: VerificationRequest;
  onSelect?: (request: VerificationRequest) => void;
  onApprove?: (request: VerificationRequest) => void;
  onReject?: (request: VerificationRequest) => void;
  onRequestMoreInfo?: (request: VerificationRequest) => void;
  selected?: boolean;
  showActions?: boolean;
}

export function VerificationCard({
  request,
  onSelect,
  onApprove,
  onReject,
  onRequestMoreInfo,
  selected = false,
  showActions = true,
}: VerificationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusVariant = (status: VerificationRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'alert';
      case 'needs_review':
        return 'busy';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: VerificationRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'normal':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'low':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLevelIcon = (severity: RiskLevel) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'low':
        return <Shield className="w-4 h-4 text-green-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'id':
        return <UserCheck className="w-3 h-3" />;
      case 'license':
        return <Shield className="w-3 h-3" />;
      case 'insurance':
        return <FileText className="w-3 h-3" />;
      case 'background_check':
        return <Shield className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'id':
        return 'ID';
      case 'license':
        return 'License';
      case 'insurance':
        return 'Insurance';
      case 'background_check':
        return 'Background';
      case 'vehicle_registration':
        return 'Vehicle';
      case 'selfie':
        return 'Selfie';
      default:
        return type;
    }
  };

  const pendingDays = Math.floor(
    (Date.now() - new Date(request.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <XpressCard
      className={`transition-all ${selected ? 'ring-2 ring-orange-500' : ''} ${
        onSelect ? 'cursor-pointer hover:border-white/20' : ''
      }`}
      onClick={onSelect ? () => onSelect(request) : undefined}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getStatusVariant(request.status)}>
              {request.status === 'needs_review' ? 'NEEDS REVIEW' : request.status.toUpperCase()}
            </Badge>
            <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(request.priority)}`}>
              {request.priority.toUpperCase()}
            </span>
            {pendingDays > 2 && request.status === 'pending' && (
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                {pendingDays}d overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-semibold ${getScoreColor(request.automatedScore)}`}>
              {request.automatedScore}
            </span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
        </div>

        {/* Applicant Info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-lg">
            {request.applicant.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base truncate">
              {request.applicant.name}
            </h3>
            <p className="text-gray-400 text-xs">{request.applicant.role}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span className="truncate">{request.applicant.email}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {request.documents.map((doc) => (
            <Badge
              key={doc.id}
              variant={doc.status === 'verified' ? 'success' : doc.status === 'rejected' ? 'alert' : 'warning'}
              className="text-xs"
            >
              {getDocumentTypeIcon(doc.type)}
              <span className="ml-1">{getDocumentTypeLabel(doc.type)}</span>
            </Badge>
          ))}
        </div>

        {/* Submission Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Submitted: {formatDate(request.submittedAt)}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {request.documents.length} docs
          </span>
        </div>

        {/* Risk Flags */}
        {request.riskFlags.length > 0 && (
          <div className="space-y-1 mb-3">
            {request.riskFlags.slice(0, expanded ? undefined : 2).map((flag) => (
              <div
                key={flag.id}
                className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                  flag.severity === 'high'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : flag.severity === 'medium'
                    ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                }`}
              >
                {getRiskLevelIcon(flag.severity)}
                <span className="flex-1">{flag.description}</span>
                {flag.autoGenerated && (
                  <span className="text-[10px] opacity-70">(auto)</span>
                )}
              </div>
            ))}
            {request.riskFlags.length > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Show {request.riskFlags.length - 2} more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Review Info (if reviewed) */}
        {request.reviewedBy && (
          <div className="mb-3 p-2 bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <UserCheck className="w-3 h-3 text-gray-500" />
              <span className="text-gray-400">
                Reviewed by <span className="text-white">{request.reviewedBy.name}</span>
              </span>
            </div>
            {request.reviewedAt && (
              <div className="flex items-center gap-2 text-xs mt-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-gray-400">{formatDate(request.reviewedAt)}</span>
              </div>
            )}
            {request.rejectionReason && (
              <div className="mt-2 text-xs text-red-400">
                Reason: {request.rejectionReason}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {request.reviewNotes && (
          <div className="mb-3 p-2 bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <MessageSquare className="w-3 h-3" />
              <span>Notes</span>
            </div>
            <p className="text-xs text-white">{request.reviewNotes}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && request.status === 'pending' && (
          <div className="flex gap-2 pt-3 border-t border-gray-800">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onReject?.(request);
              }}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onRequestMoreInfo?.(request);
              }}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              More Info
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onApprove?.(request);
              }}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </XpressCard>
  );
}

export default VerificationCard;
