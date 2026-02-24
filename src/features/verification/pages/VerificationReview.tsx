/**
 * Verification Review Page (KYC)
 * Comprehensive KYC/Verification system for reviewing and approving
 * driver, passenger, and operator verification requests
 */

import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useVerifications } from '@/features/verification/hooks/useVerifications';
import { VerificationCard } from '@/features/verification/components/VerificationCard';
import { DocumentViewer } from '@/features/verification/components/DocumentViewer';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Eye,
  CheckSquare,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Calendar,
} from 'lucide-react';
import type { VerificationRequest, DocumentType } from '@/services/verification/verification.service';

// Stats Chart Component (simplified)
function StatsChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const maxValue = Math.max(...data.map((d) => d.count), 1);
  
  return (
    <div className="h-32 flex items-end gap-2">
      {data.map((item, idx) => {
        const height = (item.count / maxValue) * 100;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-orange-500/30 hover:bg-orange-500/50 rounded-t transition-all relative group"
              style={{ height: `${height}%` }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.count} submissions
              </div>
            </div>
            <span className="text-[10px] text-gray-500">
              {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function VerificationReview() {
  const {
    requests,
    selectedRequest,
    filters,
    stats,
    isLoading,
    isSubmitting,
    lastUpdated,
    setFilters,
    selectRequest,
    refreshRequests,
    submitReview,
    verifyDocument,
    rejectDocument,
    addNote,
    batchApprove,
    batchReject,
  } = useVerifications();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_more_info' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'analytics'>('queue');

  const handleReview = (request: VerificationRequest, action: typeof reviewAction) => {
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const submitReviewAction = async () => {
    if (!selectedRequest || !reviewAction) return;
    
    try {
      await submitReview(selectedRequest.id, {
        action: reviewAction,
        notes: reviewNotes,
        rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
      });
      setShowReviewModal(false);
      setReviewNotes('');
      setRejectionReason('');
      setReviewAction(null);
      selectRequest(null);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.length === 0) return;
    
    try {
      if (action === 'approve') {
        await batchApprove(selectedIds);
      } else {
        await batchReject(selectedIds, rejectionReason);
      }
      setShowBatchModal(false);
      setSelectedIds([]);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to batch process:', err);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <Minus className="w-4 h-4 text-yellow-400" />;
      case 'high':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'id':
        return 'ID Cards';
      case 'license':
        return 'Licenses';
      case 'insurance':
        return 'Insurance';
      case 'background_check':
        return 'Background';
      case 'vehicle_registration':
        return 'Vehicle Reg';
      case 'selfie':
        return 'Selfies';
      default:
        return type;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f14]">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-500" />
              Verification Review
            </h1>
            <p className="text-sm text-gray-500">
              KYC verification system • Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowBatchModal(true)}>
                <CheckSquare className="w-4 h-4 mr-2" />
                Batch ({selectedIds.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={refreshRequests}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <XpressCard>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-500">Pending</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalPending}</p>
            </div>
          </XpressCard>
          <XpressCard>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-500">Approved</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalApproved}</p>
            </div>
          </XpressCard>
          <XpressCard>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-500">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalRejected}</p>
            </div>
          </XpressCard>
          <XpressCard>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-500">High Risk</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{stats.riskDistribution.high}</p>
            </div>
          </XpressCard>
          <XpressCard>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-500">Avg Score</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {requests.length > 0
                  ? Math.round(
                      requests.reduce((sum, r) => sum + r.automatedScore, 0) / requests.length
                    )
                  : 0}
              </p>
            </div>
          </XpressCard>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-800">
          {[
            { id: 'queue', label: 'Review Queue', icon: Eye },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-orange-500 border-orange-500'
                  : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        {activeTab === 'queue' && (
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
                className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="needs_review">Needs Review</option>
              </select>
              <select
                value={filters.documentType}
                onChange={(e) => setFilters({ documentType: e.target.value as typeof filters.documentType })}
                className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Documents</option>
                <option value="id">ID Card</option>
                <option value="license">Driver License</option>
                <option value="insurance">Insurance</option>
                <option value="background_check">Background Check</option>
                <option value="vehicle_registration">Vehicle Registration</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ priority: e.target.value as typeof filters.priority })}
                className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {activeTab === 'queue' && (
          <>
            {/* Requests List */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              ) : requests.length === 0 ? (
                <XpressCard>
                  <div className="p-8 text-center">
                    <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No verification requests found</p>
                  </div>
                </XpressCard>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="relative">
                      {request.status === 'pending' && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(request.id)}
                            onChange={() => toggleSelection(request.id)}
                            className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      )}
                      <VerificationCard
                        request={request}
                        onSelect={selectRequest}
                        onApprove={(req) => handleReview(req, 'approve')}
                        onReject={(req) => handleReview(req, 'reject')}
                        onRequestMoreInfo={(req) => handleReview(req, 'request_more_info')}
                        selected={selectedRequest?.id === request.id}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Request Detail */}
            {selectedRequest && (
              <div className="w-[450px] bg-gray-900 border-l border-gray-800 overflow-y-auto">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Request Details</h2>
                  <button
                    onClick={() => selectRequest(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Applicant Profile */}
                  <div className="flex items-center gap-4 p-4 bg-gray-950 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                      {selectedRequest.applicant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedRequest.applicant.name}</h3>
                      <Badge variant="default" className="mt-1">
                        {selectedRequest.applicant.role}
                      </Badge>
                      <p className="text-sm text-gray-400 mt-1">{selectedRequest.applicant.email}</p>
                      <p className="text-sm text-gray-500">{selectedRequest.applicant.phone}</p>
                    </div>
                  </div>

                  {/* Status & Score */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-950 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <Badge
                        variant={
                          selectedRequest.status === 'approved'
                            ? 'success'
                            : selectedRequest.status === 'rejected'
                            ? 'alert'
                            : selectedRequest.status === 'needs_review'
                            ? 'busy'
                            : 'warning'
                        }
                      >
                        {selectedRequest.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="p-3 bg-gray-950 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                      <p
                        className={`text-lg font-bold ${
                          selectedRequest.automatedScore >= 80
                            ? 'text-green-400'
                            : selectedRequest.automatedScore >= 50
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {selectedRequest.automatedScore}/100
                      </p>
                    </div>
                  </div>

                  {/* Submission Info */}
                  <div className="p-3 bg-gray-950 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Submission Details</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Request ID:</span>
                        <span className="text-white font-mono">{selectedRequest.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Submitted:</span>
                        <span className="text-white">
                          {new Date(selectedRequest.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedRequest.reviewedAt && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reviewed:</span>
                            <span className="text-white">
                              {new Date(selectedRequest.reviewedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reviewer:</span>
                            <span className="text-white">{selectedRequest.reviewedBy?.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documents ({selectedRequest.documents.length})
                    </h4>
                    <DocumentViewer
                      documents={selectedRequest.documents}
                      onVerify={verifyDocument}
                      onReject={rejectDocument}
                      readOnly={selectedRequest.status !== 'pending'}
                    />
                  </div>

                  {/* Risk Flags */}
                  {selectedRequest.riskFlags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Risk Flags ({selectedRequest.riskFlags.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedRequest.riskFlags.map((flag) => (
                          <div
                            key={flag.id}
                            className={`p-3 rounded-lg text-sm ${
                              flag.severity === 'high'
                                ? 'bg-red-500/10 border border-red-500/20'
                                : flag.severity === 'medium'
                                ? 'bg-yellow-500/10 border border-yellow-500/20'
                                : 'bg-blue-500/10 border border-blue-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle
                                className={`w-4 h-4 ${
                                  flag.severity === 'high'
                                    ? 'text-red-400'
                                    : flag.severity === 'medium'
                                    ? 'text-yellow-400'
                                    : 'text-blue-400'
                                }`}
                              />
                              <span
                                className={`font-medium ${
                                  flag.severity === 'high'
                                    ? 'text-red-400'
                                    : flag.severity === 'medium'
                                    ? 'text-yellow-400'
                                    : 'text-blue-400'
                                }`}
                              >
                                {flag.type}
                              </span>
                              {flag.autoGenerated && (
                                <Badge variant="default" className="text-[10px]">
                                  Auto
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400">{flag.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Notes */}
                  {selectedRequest.reviewNotes && (
                    <div className="p-3 bg-gray-950 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Review Notes</p>
                      <p className="text-sm text-white">{selectedRequest.reviewNotes}</p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {selectedRequest.rejectionReason && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-xs text-red-400 mb-1">Rejection Reason</p>
                      <p className="text-sm text-white">{selectedRequest.rejectionReason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedRequest.status === 'pending' && (
                    <div className="flex gap-2 pt-4 border-t border-gray-800">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReview(selectedRequest, 'reject')}
                        disabled={isSubmitting}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReview(selectedRequest, 'request_more_info')}
                        disabled={isSubmitting}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        More Info
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleReview(selectedRequest, 'approve')}
                        disabled={isSubmitting}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-white mb-4">Verification History</h2>
              <div className="space-y-3">
                {requests
                  .filter((r) => r.status !== 'pending')
                  .map((request) => (
                    <XpressCard key={request.id}>
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold">
                            {request.applicant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{request.applicant.name}</p>
                            <p className="text-xs text-gray-500">
                              {request.applicant.email} • {request.applicant.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge
                              variant={
                                request.status === 'approved'
                                  ? 'success'
                                  : request.status === 'rejected'
                                  ? 'alert'
                                  : 'default'
                              }
                            >
                              {request.status.toUpperCase()}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {request.reviewedAt &&
                                new Date(request.reviewedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => selectRequest(request)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </XpressCard>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Risk Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <XpressCard>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Low Risk
                    </h3>
                    <p className="text-3xl font-bold text-green-400">{stats.riskDistribution.low}</p>
                    <p className="text-xs text-gray-500 mt-1">Score ≥ 80</p>
                  </div>
                </XpressCard>
                <XpressCard>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Minus className="w-4 h-4 text-yellow-400" />
                      Medium Risk
                    </h3>
                    <p className="text-3xl font-bold text-yellow-400">
                      {stats.riskDistribution.medium}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Score 50-79</p>
                  </div>
                </XpressCard>
                <XpressCard>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      High Risk
                    </h3>
                    <p className="text-3xl font-bold text-red-400">{stats.riskDistribution.high}</p>
                    <p className="text-xs text-gray-500 mt-1">Score &lt; 50</p>
                  </div>
                </XpressCard>
              </div>

              {/* Documents by Type */}
              <XpressCard>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Documents by Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(stats.byDocumentType).map(([type, count]) => (
                      <div key={type} className="p-3 bg-gray-900 rounded-lg">
                        <p className="text-xs text-gray-500">{getDocumentTypeLabel(type as DocumentType)}</p>
                        <p className="text-xl font-bold text-white">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </XpressCard>

              {/* Submission Trends */}
              <XpressCard>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Daily Submissions (Last 7 Days)</h3>
                  <StatsChart
                    data={[
                      { date: '2025-02-10', count: 3 },
                      { date: '2025-02-11', count: 5 },
                      { date: '2025-02-12', count: 2 },
                      { date: '2025-02-13', count: 4 },
                      { date: '2025-02-14', count: 6 },
                      { date: '2025-02-15', count: 3 },
                      { date: '2025-02-16', count: 2 },
                    ]}
                  />
                </div>
              </XpressCard>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewNotes('');
          setRejectionReason('');
          setReviewAction(null);
        }}
        title={
          reviewAction === 'approve'
            ? 'Approve Verification'
            : reviewAction === 'reject'
            ? 'Reject Verification'
            : 'Request More Information'
        }
        size="md"
      >
        <div className="space-y-4">
          {reviewAction === 'approve' && (
            <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Confirm Approval</p>
                <p className="text-sm text-gray-400">
                  Approve verification for {selectedRequest?.applicant.name}. This will grant full access to the platform.
                </p>
              </div>
            </div>
          )}
          {reviewAction === 'reject' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">Confirm Rejection</p>
                  <p className="text-sm text-gray-400">
                    Reject verification for {selectedRequest?.applicant.name}. Please provide a reason.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Rejection Reason <span className="text-red-400">*</span>
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="invalid_documents">Invalid Documents</option>
                  <option value="expired_documents">Expired Documents</option>
                  <option value="blurry_images">Blurry/Unclear Images</option>
                  <option value="name_mismatch">Name Mismatch</option>
                  <option value="incomplete_info">Incomplete Information</option>
                  <option value="failed_background_check">Failed Background Check</option>
                  <option value="other">Other (specify in notes)</option>
                </select>
              </div>
            </div>
          )}
          {reviewAction === 'request_more_info' && (
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Request More Information</p>
                <p className="text-sm text-gray-400">
                  Ask {selectedRequest?.applicant.name} to provide additional information or documents.
                </p>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Notes (optional)</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 min-h-[100px]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowReviewModal(false);
                setReviewNotes('');
                setRejectionReason('');
                setReviewAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant={reviewAction === 'reject' ? 'danger' : 'primary'}
              onClick={submitReviewAction}
              disabled={isSubmitting || (reviewAction === 'reject' && !rejectionReason)}
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : reviewAction === 'approve' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : reviewAction === 'reject' ? (
                <XCircle className="w-4 h-4 mr-2" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              {reviewAction === 'approve'
                ? 'Approve'
                : reviewAction === 'reject'
                ? 'Reject'
                : 'Request Info'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Batch Action Modal */}
      <Modal
        isOpen={showBatchModal}
        onClose={() => {
          setShowBatchModal(false);
          setRejectionReason('');
        }}
        title={`Batch Process (${selectedIds.length} selected)`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            You have selected {selectedIds.length} verification requests for batch processing.
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => handleBatchAction('approve')}
              disabled={isSubmitting}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve All
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => handleBatchAction('reject')}
              disabled={isSubmitting || !rejectionReason}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject All
            </Button>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Rejection Reason (required for reject)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 min-h-[80px]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
