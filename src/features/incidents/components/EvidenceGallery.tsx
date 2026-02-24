import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { usePermissionCheck } from '@/components/auth';
import { useAddEvidence } from '@/features/incidents/hooks/useInvestigation';
import type { Evidence, MediaFile, Witness } from '@/types/domain.types';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { 
  Image, Video, FileText, ExternalLink, 
  ChevronLeft, ChevronRight, Upload, Eye,
  ZoomIn, Download
} from 'lucide-react';

interface EvidenceGalleryProps {
  evidence: Evidence;
  incidentId?: string;
}

export function EvidenceGallery({ evidence, incidentId }: EvidenceGalleryProps) {
  const { hasPermission } = usePermissionCheck();
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'documents' | 'witnesses'>('photos');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddEvidence = hasPermission('investigate:incidents');
  const addEvidenceMutation = useAddEvidence();

  // Combine all media for navigation
  const allMedia: MediaFile[] = [
    ...evidence.photos,
    ...evidence.videos,
    ...evidence.documents,
  ];

  const handleMediaClick = (media: MediaFile, index: number) => {
    setSelectedMedia(media);
    setMediaIndex(index);
  };

  const handlePrevMedia = () => {
    const newIndex = mediaIndex > 0 ? mediaIndex - 1 : allMedia.length - 1;
    setMediaIndex(newIndex);
    setSelectedMedia(allMedia[newIndex]);
  };

  const handleNextMedia = () => {
    const newIndex = mediaIndex < allMedia.length - 1 ? mediaIndex + 1 : 0;
    setMediaIndex(newIndex);
    setSelectedMedia(allMedia[newIndex]);
  };

  // Handle file drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleUploadFiles(files);
  };

  const handleUploadFiles = async (files: File[]) => {
    if (!incidentId) return;
    
    // In a real implementation, you would upload files to a server
    // For now, we'll just simulate adding evidence
    for (const file of files) {
      const type: 'image' | 'video' | 'document' = file.type.startsWith('image/') 
        ? 'image' 
        : file.type.startsWith('video/') 
          ? 'video' 
          : 'document';
      
      try {
        await addEvidenceMutation.mutateAsync({
          disciplinaryId: incidentId,
          evidence: {
            type,
            url: URL.createObjectURL(file),
            uploadedBy: 'Current User',
            description: file.name,
          },
        });
      } catch {
        // Error handled by mutation
      }
    }
    setShowUploadModal(false);
  };

  const tabs = [
    { key: 'photos' as const, label: 'Photos', count: evidence.photos.length, icon: Image },
    { key: 'videos' as const, label: 'Videos', count: evidence.videos.length, icon: Video },
    { key: 'documents' as const, label: 'Documents', count: evidence.documents.length, icon: FileText },
    { key: 'witnesses' as const, label: 'Witnesses', count: evidence.witnesses.length, icon: Eye },
  ];

  const renderMediaGrid = (items: MediaFile[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            {activeTab === 'photos' && <Image className="w-8 h-8 text-gray-600" />}
            {activeTab === 'videos' && <Video className="w-8 h-8 text-gray-600" />}
            {activeTab === 'documents' && <FileText className="w-8 h-8 text-gray-600" />}
          </div>
          <p className="text-sm">No {activeTab} in this category</p>
          {canAddEvidence && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              icon={<Upload className="w-4 h-4" />}
              onClick={() => setShowUploadModal(true)}
            >
              Upload {activeTab.slice(0, -1)}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMediaClick(item, allMedia.indexOf(item))}
            className={cn(
              "group relative aspect-square rounded-lg overflow-hidden border transition-all",
              "bg-xpress-bg-tertiary border-white/10",
              "hover:border-xpress-accent-blue hover:shadow-lg hover:shadow-xpress-accent-blue/20"
            )}
          >
            {item.type === 'image' ? (
              <img
                src={item.thumbnailUrl || item.url}
                alt="Evidence"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : item.type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center bg-xpress-bg-elevated">
                <Video className="w-10 h-10 text-xpress-accent-blue" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-xpress-bg-elevated">
                <FileText className="w-10 h-10 text-xpress-accent-cyan" />
              </div>
            )}
            
            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                {item.type === 'image' ? (
                  <ZoomIn className="w-6 h-6 text-white" />
                ) : item.type === 'video' ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <ExternalLink className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            
            {/* Type badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] text-white capitalize">
              {item.type}
            </div>
            
            {/* Download button on hover */}
            <a
              href={item.url}
              download
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-xpress-accent-blue"
            >
              <Download className="w-3 h-3 text-white" />
            </a>
          </button>
        ))}
        
        {/* Add more button */}
        {canAddEvidence && (
          <button
            onClick={() => setShowUploadModal(true)}
            className={cn(
              "aspect-square rounded-lg border border-dashed transition-all flex flex-col items-center justify-center gap-2",
              "border-white/20 text-gray-500 hover:border-xpress-accent-blue hover:text-xpress-accent-blue",
              "bg-white/5 hover:bg-xpress-accent-blue/10"
            )}
          >
            <Upload className="w-8 h-8" />
            <span className="text-xs">Add {activeTab.slice(0, -1)}</span>
          </button>
        )}
      </div>
    );
  };

  const renderWitnesses = (witnesses: Witness[]) => {
    if (witnesses.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Eye className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-sm">No witnesses recorded</p>
          {canAddEvidence && (
            <p className="text-xs text-gray-600 mt-2">
              Add witnesses from the investigation panel
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {witnesses.map((witness, index) => (
          <div 
            key={index} 
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-xpress-accent-purple/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-xpress-accent-purple" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{witness.name}</h4>
                  <p className="text-sm text-gray-500">{witness.contact}</p>
                </div>
              </div>
              <Badge variant="default">Witness #{index + 1}</Badge>
            </div>
            {witness.statement && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-sm text-gray-400 italic">
                  &ldquo;{witness.statement}&rdquo;
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const totalEvidence = evidence.photos.length + evidence.videos.length + evidence.documents.length;

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-xpress-accent-cyan/20 rounded-lg">
            <FileText className="w-5 h-5 text-xpress-accent-cyan" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Evidence & Documentation
            </h3>
            <p className="text-sm text-gray-500">
              {totalEvidence} files • {evidence.witnesses.length} witnesses
            </p>
          </div>
        </div>
        {canAddEvidence && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Evidence
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.key
                ? 'bg-xpress-accent-blue text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-xs",
              activeTab === tab.key ? 'bg-white/20' : 'bg-white/5'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {activeTab === 'photos' && renderMediaGrid(evidence.photos)}
        {activeTab === 'videos' && renderMediaGrid(evidence.videos)}
        {activeTab === 'documents' && renderMediaGrid(evidence.documents)}
        {activeTab === 'witnesses' && renderWitnesses(evidence.witnesses)}
      </div>

      {/* Media Lightbox Modal */}
      <Modal
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        title="Evidence Viewer"
        size="xl"
        showCloseButton
      >
        {selectedMedia && (
          <div className="space-y-4">
            {/* Media display */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt="Evidence"
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full max-h-full"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                  <p className="text-white text-lg">Document Preview</p>
                  <a
                    href={selectedMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xpress-accent-blue hover:underline text-sm mt-4 inline-flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Document
                  </a>
                </div>
              )}
              
              {/* Navigation arrows */}
              {allMedia.length > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Media info */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <span className="capitalize px-2 py-0.5 bg-white/10 rounded text-xs mr-2">
                  {selectedMedia.type}
                </span>
                Uploaded by {selectedMedia.uploadedBy}
                {' • '}
                {format(new Date(selectedMedia.uploadedAt), 'MMM d, yyyy h:mm a')}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {mediaIndex + 1} of {allMedia.length}
                </span>
                <a
                  href={selectedMedia.url}
                  download
                  className="p-2 rounded-lg bg-white/10 hover:bg-xpress-accent-blue text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Evidence"
        size="md"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all",
            isDragging 
              ? "border-xpress-accent-blue bg-xpress-accent-blue/10" 
              : "border-white/20 hover:border-white/40"
          )}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">
            Drag & drop files here
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse from your computer
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => e.target.files && handleUploadFiles(Array.from(e.target.files))}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            loading={addEvidenceMutation.isPending}
          >
            Select Files
          </Button>
          <p className="text-xs text-gray-600 mt-4">
            Supported: Images, Videos, PDFs, Documents (max 50MB each)
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default EvidenceGallery;
