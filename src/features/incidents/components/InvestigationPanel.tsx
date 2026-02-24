import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { usePermissionCheck } from '@/components/auth';
import { 
  useAssignInvestigator, 
  useSaveInvestigation,
  useScheduleHearing 
} from '@/features/incidents/hooks/useInvestigation';
import type { Incident } from '@/types/domain.types';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { 
  UserCheck, Edit2, Calendar, Clock, CheckCircle, 
  FileText, User, Send, History
} from 'lucide-react';

interface InvestigationPanelProps {
  incident: Incident;
}

// Mock investigators - in real app, fetch from API
const INVESTIGATORS = [
  { id: 'inv1', name: 'John Smith', role: 'Senior Investigator', avatar: 'JS' },
  { id: 'inv2', name: 'Sarah Johnson', role: 'Investigator', avatar: 'SJ' },
  { id: 'inv3', name: 'Mike Chen', role: 'Safety Officer', avatar: 'MC' },
  { id: 'inv4', name: 'Lisa Williams', role: 'Compliance Manager', avatar: 'LW' },
];

// Mock investigation notes
const MOCK_NOTES = [
  {
    id: '1',
    author: 'System',
    role: 'System',
    content: 'Incident reported and assigned for initial review.',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: 'system',
  },
  {
    id: '2',
    author: 'John Smith',
    role: 'Senior Investigator',
    content: 'Initial assessment completed. Requested additional evidence from the reporter.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: 'note',
  },
  {
    id: '3',
    author: 'Sarah Johnson',
    role: 'Investigator',
    content: 'Interview conducted with involved driver. Statement recorded and attached to evidence.',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    type: 'note',
  },
];

export function InvestigationPanel({ incident }: InvestigationPanelProps) {
  const { hasPermission } = usePermissionCheck();
  const investigation = incident.investigation;
  
  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFindingsModal, setShowFindingsModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  
  // Form state
  const [selectedInvestigator, setSelectedInvestigator] = useState('');
  const [findings, setFindings] = useState(investigation?.findings || '');
  const [recommendations, setRecommendations] = useState(investigation?.recommendations || '');
  const [hearingDate, setHearingDate] = useState('');
  const [hearingOfficer, setHearingOfficer] = useState('');
  const [hearingLocation, setHearingLocation] = useState('');
  const [hearingNotes, setHearingNotes] = useState('');
  
  // Notes state
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(MOCK_NOTES);

  // Mutations
  const assignMutation = useAssignInvestigator();
  const saveInvestigationMutation = useSaveInvestigation();
  const scheduleHearingMutation = useScheduleHearing();

  // Permissions
  const canInvestigate = hasPermission('investigate:incidents');
  const canScheduleHearing = hasPermission('resolve:incidents');

  // Check if incident can be assigned for investigation
  const canAssign = ['New', 'Reviewing'].includes(incident.status) && canInvestigate;
  
  // Check if findings can be submitted
  const canSubmitFindings = ['Investigating'].includes(incident.status) && canInvestigate && investigation?.assignedTo;
  
  // Check if hearing can be scheduled
  const canSchedule = ['PendingAction', 'Hearing'].includes(incident.status) && canScheduleHearing;

  const handleAssign = async () => {
    if (!selectedInvestigator) return;
    
    const investigator = INVESTIGATORS.find(i => i.id === selectedInvestigator);
    if (!investigator) return;

    try {
      await assignMutation.mutateAsync({
        disciplinaryId: incident.incidentId,
        investigatorUserId: investigator.id,
        investigatorName: investigator.name,
      });
      setShowAssignModal(false);
      setSelectedInvestigator('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveFindings = async () => {
    if (!findings.trim() || !recommendations.trim()) return;

    try {
      await saveInvestigationMutation.mutateAsync({
        disciplinaryId: incident.incidentId,
        findings,
        recommendations,
      });
      setShowFindingsModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleScheduleHearing = async () => {
    if (!hearingDate || !hearingOfficer.trim()) return;

    try {
      await scheduleHearingMutation.mutateAsync({
        disciplinaryId: incident.incidentId,
        hearingDate,
        hearingOfficer,
        location: hearingLocation,
        notes: hearingNotes,
      });
      setShowHearingModal(false);
      setHearingDate('');
      setHearingOfficer('');
      setHearingLocation('');
      setHearingNotes('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now().toString(),
      author: 'Current User',
      role: 'Investigator',
      content: newNote,
      timestamp: new Date().toISOString(),
      type: 'note',
    };
    
    setNotes([note, ...notes]);
    setNewNote('');
  };

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-xpress-accent-blue/20 rounded-lg">
            <UserCheck className="w-5 h-5 text-xpress-accent-blue" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Investigation
            </h3>
            <p className="text-sm text-gray-500">
              {investigation?.assignedTo 
                ? `Assigned to ${investigation.assignedTo.name}`
                : 'No investigator assigned'}
            </p>
          </div>
        </div>
        
        {canAssign && (
          <Button
            variant="primary"
            size="sm"
            icon={<UserCheck className="w-4 h-4" />}
            onClick={() => setShowAssignModal(true)}
          >
            Assign
          </Button>
        )}
      </div>

      {/* Investigator Card */}
      {investigation?.assignedTo && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-xpress-accent-blue/20 flex items-center justify-center text-xpress-accent-blue font-medium">
              {investigation.assignedTo.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-medium text-white">
                {investigation.assignedTo.name}
              </h4>
              <p className="text-sm text-gray-500">
                Assigned {format(new Date(investigation.assignedTo.assignedAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          {investigation.startedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-400 pt-3 border-t border-white/10">
              <Clock className="w-4 h-4" />
              Investigation started {format(new Date(investigation.startedAt), 'MMM d, yyyy h:mm a')}
            </div>
          )}
        </div>
      )}

      {/* Findings Section */}
      {investigation?.findings ? (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-xpress-accent-cyan" />
              Findings
            </h4>
            {canSubmitFindings && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Edit2 className="w-3 h-3" />}
                onClick={() => setShowFindingsModal(true)}
              >
                Edit
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-400 whitespace-pre-wrap">
            {investigation.findings}
          </p>
        </div>
      ) : canSubmitFindings ? (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-dashed border-white/20 text-center">
          <p className="text-sm text-gray-500 mb-3">
            No findings submitted yet
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit2 className="w-4 h-4" />}
            onClick={() => setShowFindingsModal(true)}
          >
            Submit Findings
          </Button>
        </div>
      ) : null}

      {/* Recommendations Section */}
      {investigation?.recommendations && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-xpress-accent-green" />
              Recommendations
            </h4>
          </div>
          <p className="text-sm text-gray-400 whitespace-pre-wrap">
            {investigation.recommendations}
          </p>
        </div>
      )}

      {/* Hearing Section */}
      {canSchedule && incident.status !== 'Hearing' && (
        <Button
          variant="secondary"
          className="w-full mb-6"
          icon={<Calendar className="w-4 h-4" />}
          onClick={() => setShowHearingModal(true)}
        >
          Schedule Hearing
        </Button>
      )}

      {incident.status === 'Hearing' && (
        <div className="mb-6 p-4 bg-xpress-accent-amber/10 rounded-lg border border-xpress-accent-amber/30">
          <div className="flex items-center gap-2 text-xpress-accent-amber">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Hearing Scheduled</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            A disciplinary hearing has been scheduled for this incident.
          </p>
        </div>
      )}

      {/* Investigation Notes Timeline */}
      <div className="border-t border-white/10 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-gray-500" />
          <h4 className="text-sm font-medium text-white">Investigation Notes</h4>
          <span className="text-xs text-gray-500">({notes.length})</span>
        </div>

        {/* Add Note Input */}
        {canInvestigate && (
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Add a note..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-xpress-accent-blue"
              />
              <Button
                variant="secondary"
                size="sm"
                icon={<Send className="w-4 h-4" />}
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Notes Timeline */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notes.map((note, index) => (
            <div key={note.id} className="relative pl-6 pb-3">
              {/* Timeline line */}
              {index < notes.length - 1 && (
                <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-white/10" />
              )}
              
              {/* Timeline dot */}
              <div className={cn(
                "absolute left-0 top-1 w-4 h-4 rounded-full border-2",
                note.type === 'system' 
                  ? "border-gray-500 bg-gray-500/20" 
                  : "border-xpress-accent-blue bg-xpress-accent-blue/20"
              )} />
              
              {/* Note content */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{note.author}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(note.timestamp), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Investigator Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedInvestigator('');
        }}
        title="Assign Investigator"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              loading={assignMutation.isPending}
              disabled={!selectedInvestigator}
              icon={<UserCheck className="w-4 h-4" />}
            >
              Assign
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Select an investigator to assign to this incident:
          </p>
          <div className="space-y-2">
            {INVESTIGATORS.map((investigator) => (
              <label
                key={investigator.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                  selectedInvestigator === investigator.id
                    ? "border-xpress-accent-blue bg-xpress-accent-blue/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                )}
              >
                <input
                  type="radio"
                  name="investigator"
                  value={investigator.id}
                  checked={selectedInvestigator === investigator.id}
                  onChange={(e) => setSelectedInvestigator(e.target.value)}
                  className="text-xpress-accent-blue"
                />
                <div className="w-10 h-10 rounded-full bg-xpress-accent-blue/20 flex items-center justify-center text-xpress-accent-blue font-medium">
                  {investigator.avatar}
                </div>
                <div>
                  <div className="font-medium text-white">
                    {investigator.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {investigator.role}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      {/* Submit Findings Modal */}
      <Modal
        isOpen={showFindingsModal}
        onClose={() => setShowFindingsModal(false)}
        title="Submit Investigation Findings"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowFindingsModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveFindings}
              loading={saveInvestigationMutation.isPending}
              disabled={!findings.trim() || !recommendations.trim()}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Submit Findings
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Investigation Findings <span className="text-xpress-accent-red">*</span>
            </label>
            <textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Enter detailed findings from the investigation..."
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[150px] resize-y"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Recommendations <span className="text-xpress-accent-red">*</span>
            </label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Enter your recommendations for disciplinary action..."
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[100px] resize-y"
            />
          </div>
        </div>
      </Modal>

      {/* Schedule Hearing Modal */}
      <Modal
        isOpen={showHearingModal}
        onClose={() => {
          setShowHearingModal(false);
          setHearingDate('');
          setHearingOfficer('');
          setHearingLocation('');
          setHearingNotes('');
        }}
        title="Schedule Disciplinary Hearing"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowHearingModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleScheduleHearing}
              loading={scheduleHearingMutation.isPending}
              disabled={!hearingDate || !hearingOfficer.trim()}
              icon={<Calendar className="w-4 h-4" />}
            >
              Schedule Hearing
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hearing Date & Time"
              type="datetime-local"
              value={hearingDate}
              onChange={(e) => setHearingDate(e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
            />
            <Input
              label="Hearing Officer"
              placeholder="Enter officer name"
              value={hearingOfficer}
              onChange={(e) => setHearingOfficer(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
          </div>
          <Input
            label="Location (Optional)"
            placeholder="Enter hearing location"
            value={hearingLocation}
            onChange={(e) => setHearingLocation(e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Additional Notes
            </label>
            <textarea
              value={hearingNotes}
              onChange={(e) => setHearingNotes(e.target.value)}
              placeholder="Add any notes about the hearing..."
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50 transition-all min-h-[100px] resize-y"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default InvestigationPanel;
