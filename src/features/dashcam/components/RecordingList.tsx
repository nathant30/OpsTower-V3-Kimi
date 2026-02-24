import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Play,
  Download,
  Lock,
  Unlock,
  MapPin,
  Clock,
  HardDrive,
  Calendar,
  Video,
  AlertCircle,
  Tag,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Recording, RecordingType } from '@/services/dashcam/dashcam.service';

interface RecordingListProps {
  recordings: Recording[];
  onDownload?: (recording: Recording) => void;
  onLock?: (recordingId: string, locked: boolean) => void;
  onPlay?: (recording: Recording) => void;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 6;

export function RecordingList({
  recordings,
  onDownload,
  onLock,
  onPlay,
  isLoading = false,
}: RecordingListProps) {
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [filterType, setFilterType] = useState<RecordingType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const getTypeVariant = (type: RecordingType) => {
    switch (type) {
      case 'continuous':
        return 'default';
      case 'event':
        return 'warning';
      case 'alarm':
        return 'alert';
      case 'manual':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: RecordingType) => {
    switch (type) {
      case 'continuous':
        return 'Continuous';
      case 'event':
        return 'Event';
      case 'alarm':
        return 'Alarm';
      case 'manual':
        return 'Manual';
      default:
        return type;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatFileSize = (mb: number) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRecordings = filterType === 'all' 
    ? recordings 
    : recordings.filter((r) => r.type === filterType);

  const totalPages = Math.ceil(filteredRecordings.length / ITEMS_PER_PAGE);
  const paginatedRecordings = filteredRecordings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <XpressCard key={i}>
            <div className="p-4 animate-pulse">
              <div className="aspect-video bg-gray-800 rounded-lg mb-3" />
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
          </XpressCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as RecordingType | 'all');
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Types</option>
            <option value="continuous">Continuous</option>
            <option value="event">Event</option>
            <option value="alarm">Alarm</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <span className="text-sm text-gray-400">
          {filteredRecordings.length} recordings
        </span>
      </div>

      {/* Recordings Grid */}
      {paginatedRecordings.length === 0 ? (
        <XpressCard>
          <div className="p-8 text-center">
            <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No recordings found</p>
          </div>
        </XpressCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedRecordings.map((recording) => (
              <XpressCard
                key={recording.id}
                className="overflow-hidden cursor-pointer hover:ring-1 hover:ring-orange-500/50 transition-all"
                onClick={() => setSelectedRecording(recording)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-800 relative group">
                  {recording.thumbnailUrl ? (
                    <img
                      src={recording.thumbnailUrl}
                      alt="Recording thumbnail"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-10 h-10 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay?.(recording);
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                    {formatDuration(recording.duration)}
                  </div>

                  {/* Locked Badge */}
                  {recording.locked && (
                    <div className="absolute top-2 left-2">
                      <Lock className="w-4 h-4 text-orange-500" />
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={getTypeVariant(recording.type)}>
                      {getTypeLabel(recording.type)}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white truncate">
                      {recording.deviceName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(recording.size)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(recording.startTime)}</span>
                  </div>

                  {recording.location?.address && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{recording.location.address}</span>
                    </div>
                  )}

                  {recording.triggeredBy && (
                    <div className="flex items-center gap-1 text-xs text-orange-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>{recording.triggeredBy}</span>
                    </div>
                  )}

                  {recording.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Tag className="w-3 h-3 text-gray-500" />
                      {recording.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 bg-gray-800 rounded text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay?.(recording);
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Play
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload?.(recording);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLock?.(recording.id, !recording.locked);
                      }}
                    >
                      {recording.locked ? (
                        <Lock className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Unlock className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </XpressCard>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Recording Detail Modal */}
      <Modal
        isOpen={!!selectedRecording}
        onClose={() => setSelectedRecording(null)}
        title="Recording Details"
        size="lg"
      >
        {selectedRecording && (
          <div className="space-y-4">
            {/* Video Preview Placeholder */}
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Video Preview</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => onPlay?.(selectedRecording)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Recording
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Device</p>
                <p className="text-sm text-white">{selectedRecording.deviceName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <Badge variant={getTypeVariant(selectedRecording.type)}>
                  {getTypeLabel(selectedRecording.type)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Start Time</p>
                <p className="text-sm text-white">{formatDate(selectedRecording.startTime)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Duration</p>
                <p className="text-sm text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(selectedRecording.duration)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">File Size</p>
                <p className="text-sm text-white flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {formatFileSize(selectedRecording.size)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="text-sm text-white flex items-center gap-1">
                  {selectedRecording.locked ? (
                    <>
                      <Lock className="w-3 h-3 text-orange-500" />
                      <span className="text-orange-400">Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-gray-400" />
                      <span>Unlocked</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {selectedRecording.location?.address && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="text-sm text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {selectedRecording.location.address}
                </p>
              </div>
            )}

            {selectedRecording.triggeredBy && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-xs text-orange-400 mb-1">Triggered By</p>
                <p className="text-sm text-white">{selectedRecording.triggeredBy}</p>
              </div>
            )}

            {selectedRecording.tags.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Tags</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedRecording.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-800">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onPlay?.(selectedRecording)}
              >
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onDownload?.(selectedRecording)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => onLock?.(selectedRecording.id, !selectedRecording.locked)}
              >
                {selectedRecording.locked ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RecordingList;
