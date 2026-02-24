import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  FileText,
  UserCheck,
  Shield,
  Car,
  Image,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import type { VerificationDocument, DocumentType } from '@/services/verification/verification.service';

interface DocumentViewerProps {
  documents: VerificationDocument[];
  onVerify?: (documentId: string, notes?: string) => void;
  onReject?: (documentId: string, reason: string) => void;
  readOnly?: boolean;
}

export function DocumentViewer({
  documents,
  onVerify,
  onReject,
  readOnly = false,
}: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExtractedData, setShowExtractedData] = useState(true);

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'id':
        return <UserCheck className="w-5 h-5" />;
      case 'license':
        return <Shield className="w-5 h-5" />;
      case 'insurance':
      case 'background_check':
        return <FileText className="w-5 h-5" />;
      case 'vehicle_registration':
        return <Car className="w-5 h-5" />;
      case 'selfie':
        return <Image className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'id':
        return 'Government ID';
      case 'license':
        return 'Driver License';
      case 'insurance':
        return 'Insurance Policy';
      case 'background_check':
        return 'Background Check';
      case 'vehicle_registration':
        return 'Vehicle Registration';
      case 'selfie':
        return 'Selfie Photo';
      default:
        return type;
    }
  };

  const getStatusVariant = (status: VerificationDocument['status']) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'rejected':
        return 'alert';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleVerify = () => {
    if (selectedDoc) {
      onVerify?.(selectedDoc.id, verificationNotes);
      setShowVerificationModal(false);
      setVerificationNotes('');
      setSelectedDoc(null);
    }
  };

  const handleReject = () => {
    if (selectedDoc && rejectionReason.trim()) {
      onReject?.(selectedDoc.id, rejectionReason);
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedDoc(null);
    }
  };

  const navigateDocument = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(documents.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    setSelectedDoc(documents[newIndex]);
    setZoom(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (documents.length === 0) {
    return (
      <XpressCard>
        <div className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No documents uploaded</p>
        </div>
      </XpressCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Document Thumbnails Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {documents.map((doc, index) => (
          <XpressCard
            key={doc.id}
            className={`cursor-pointer hover:ring-1 hover:ring-orange-500/50 transition-all overflow-hidden ${
              doc.status === 'verified' ? 'ring-1 ring-green-500/30' : ''
            } ${doc.status === 'rejected' ? 'ring-1 ring-red-500/30' : ''}`}
            onClick={() => {
              setSelectedDoc(doc);
              setCurrentIndex(index);
              setZoom(1);
            }}
          >
            {/* Thumbnail */}
            <div className="aspect-[4/3] bg-gray-800 relative group">
              {doc.thumbnailUrl ? (
                <img
                  src={doc.thumbnailUrl}
                  alt={getDocumentTypeLabel(doc.type)}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {getDocumentIcon(doc.type)}
                </div>
              )}
              
              {/* Status Overlay */}
              <div className="absolute top-2 right-2">
                <Badge variant={getStatusVariant(doc.status)}>
                  {doc.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {doc.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                  {doc.status.toUpperCase()}
                </Badge>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                {getDocumentIcon(doc.type)}
                <span className="text-sm font-medium text-white truncate">
                  {getDocumentTypeLabel(doc.type)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Uploaded {formatDate(doc.uploadedAt)}
              </p>
            </div>
          </XpressCard>
        ))}
      </div>

      {/* Document Detail Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc ? getDocumentTypeLabel(selectedDoc.type) : 'Document'}
        size="xl"
      >
        {selectedDoc && (
          <div className="flex flex-col lg:flex-row gap-4 h-[70vh]">
            {/* Document Viewer */}
            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-2 border-b border-gray-800">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-gray-400 w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Image Container */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                <img
                  src={selectedDoc.fileUrl}
                  alt={getDocumentTypeLabel(selectedDoc.type)}
                  className="max-w-full max-h-full object-contain transition-transform"
                  style={{ transform: `scale(${zoom})` }}
                />
              </div>

              {/* Navigation */}
              {documents.length > 1 && (
                <div className="flex items-center justify-between p-2 border-t border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDocument('prev')}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-400">
                    {currentIndex + 1} of {documents.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDocument('next')}
                    disabled={currentIndex === documents.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 space-y-4">
              {/* Status Card */}
              <XpressCard>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-white mb-3">Document Status</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={getStatusVariant(selectedDoc.status)} className="text-sm">
                      {selectedDoc.status === 'verified' && <CheckCircle className="w-4 h-4 mr-1" />}
                      {selectedDoc.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                      {selectedDoc.status === 'pending' && <AlertTriangle className="w-4 h-4 mr-1" />}
                      {selectedDoc.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Uploaded on {formatDate(selectedDoc.uploadedAt)}
                  </p>
                  {selectedDoc.verificationNotes && (
                    <div className="mt-3 p-2 bg-gray-900 rounded text-xs">
                      <p className="text-gray-400 mb-1">Verification Notes:</p>
                      <p className="text-white">{selectedDoc.verificationNotes}</p>
                    </div>
                  )}
                </div>
              </XpressCard>

              {/* Extracted Data */}
              {selectedDoc.extractedData && (
                <XpressCard>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white">Extracted Data</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExtractedData(!showExtractedData)}
                      >
                        {showExtractedData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {showExtractedData && (
                      <div className="space-y-2">
                        {Object.entries(selectedDoc.extractedData).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-500">{key}:</span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </XpressCard>
              )}

              {/* Actions */}
              {!readOnly && selectedDoc.status === 'pending' && (
                <XpressCard>
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-medium text-white mb-3">Actions</h4>
                    <Button
                      className="w-full"
                      onClick={() => setShowVerificationModal(true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Document
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowRejectionModal(true)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Document
                    </Button>
                  </div>
                </XpressCard>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Verification Modal */}
      <Modal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        title="Verify Document"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Info className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Confirm Verification</p>
              <p className="text-sm text-gray-400">
                You are about to verify this document. This action cannot be undone.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Verification Notes (optional)
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add any notes about the verification..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 min-h-[100px]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowVerificationModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleVerify}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title="Reject Document"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Confirm Rejection</p>
              <p className="text-sm text-gray-400">
                Please provide a reason for rejecting this document.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Rejection Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this document is being rejected..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 min-h-[100px]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowRejectionModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DocumentViewer;
