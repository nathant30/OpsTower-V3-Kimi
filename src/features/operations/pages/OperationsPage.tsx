import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { Badge } from '@/components/ui/Badge';
import { OperationsCalendar } from '../components/OperationsCalendar';
import { TaskList } from '../components/TaskList';
import {
  useOperations,
  useUpdateTaskStatus,
  useUpdateChecklistItem,
  useResolveEquipmentIssue,
} from '../hooks/useOperations';
import {
  Settings,
  Users,
  ClipboardCheck,
  Wrench,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  User,
  MapPin,
  Car,
  MoreHorizontal,
  Plus,
  RefreshCw,
  MessageSquare,
  FileSpreadsheet,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';

// ============ Metrics Card Component ============

function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  trend?: { value: number; positive: boolean };
}) {
  const colorStyles = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    green: 'from-green-500/20 to-green-600/5 border-green-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
  };

  const iconColors = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  };

  return (
    <div className={cn(
      "relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden",
      colorStyles[color]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs mt-2 font-medium",
              trend.positive ? "text-green-400" : "text-red-400"
            )}>
              <TrendingUp className={cn("w-3 h-3", !trend.positive && "rotate-180")} />
              {trend.value}% vs last week
            </div>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", iconColors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ============ Shift Card Component ============

function ShiftCard({ shift }: { shift: { id: string; type: string; status: string; startTime: string; endTime: string; supervisor?: string; assignedStaff: Array<{ name: string; role: string }> } }) {
  const shiftColors: Record<string, string> = {
    morning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    afternoon: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    night: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    overnight: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  };

  const statusColors: Record<string, 'success' | 'warning' | 'default'> = {
    active: 'success',
    scheduled: 'warning',
    completed: 'default',
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="p-4 bg-[#0f0f14] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border capitalize font-medium",
              shiftColors[shift.type] || shiftColors.morning
            )}>
              {shift.type} Shift
            </span>
            <Badge variant={statusColors[shift.status] || 'default'} className="text-[10px]">
              {shift.status}
            </Badge>
          </div>
          <h4 className="text-sm font-medium text-white mt-2">
            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
          </h4>
        </div>
        <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {shift.assignedStaff.slice(0, 3).map((staff, idx) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-full bg-gray-700 border-2 border-[#0f0f14] flex items-center justify-center text-[10px] text-gray-300"
                title={staff.name}
              >
                {staff.name.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
            {shift.assignedStaff.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-800 border-2 border-[#0f0f14] flex items-center justify-center text-[10px] text-gray-400">
                +{shift.assignedStaff.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">{shift.assignedStaff.length} staff</span>
        </div>
        {shift.supervisor && (
          <div className="text-xs text-gray-500">
            Supervisor: <span className="text-gray-300">{shift.supervisor}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Equipment Issue Card Component ============

function EquipmentIssueCard({ 
  issue,
  onResolve 
}: { 
  issue: { 
    id: string; 
    equipmentName: string; 
    equipmentType: string;
    issue: string; 
    status: string;
    priority: string;
    reportedAt: string;
    assignedTo?: string;
  };
  onResolve?: (id: string) => void;
}) {
  const statusColors: Record<string, 'success' | 'warning' | 'alert' | 'default'> = {
    operational: 'success',
    maintenance: 'warning',
    repair: 'alert',
    'out-of-service': 'alert',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    vehicle: <Car className="w-4 h-4" />,
    device: <Settings className="w-4 h-4" />,
    tool: <Wrench className="w-4 h-4" />,
    facility: <MapPin className="w-4 h-4" />,
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="p-3 bg-[#0f0f14] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gray-800 text-gray-400">
          {typeIcons[issue.equipmentType] || <Wrench className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-medium text-white">{issue.equipmentName}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{issue.issue}</p>
            </div>
            <Badge variant={statusColors[issue.status] || 'default'} className="text-[10px] shrink-0">
              {issue.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{formatRelativeTime(issue.reportedAt)}</span>
              {issue.assignedTo && <span>→ {issue.assignedTo}</span>}
            </div>
            {issue.status !== 'operational' && onResolve && (
              <button
                onClick={() => onResolve(issue.id)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Handover Note Card Component ============

function HandoverNoteCard({ note }: { note: { id: string; fromSupervisor: string; toSupervisor?: string; notes: string; pendingIssues: string[]; completedTasks: string[]; createdAt: string } }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-[#0f0f14] border border-gray-800 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">Shift Handover</h4>
            <p className="text-xs text-gray-500">
              From {note.fromSupervisor} {note.toSupervisor && `to ${note.toSupervisor}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      <p className="text-sm text-gray-400 mt-3 line-clamp-2">{note.notes}</p>

      {expanded && (
        <div className="mt-4 space-y-3">
          {note.pendingIssues.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-amber-400 mb-2">Pending Issues</h5>
              <ul className="space-y-1">
                {note.pendingIssues.map((issue, idx) => (
                  <li key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {note.completedTasks.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-green-400 mb-2">Completed Tasks</h5>
              <ul className="space-y-1">
                {note.completedTasks.map((task, idx) => (
                  <li key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Main Operations Page Component ============

const OperationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'shifts' | 'reports'>('overview');
  
  const { 
    shifts, 
    tasks, 
    calendar, 
    equipment, 
    handover, 
    metrics, 
    isLoading 
  } = useOperations();
  
  const updateTaskStatus = useUpdateTaskStatus();
  const updateChecklistItem = useUpdateChecklistItem();
  const resolveEquipmentIssue = useResolveEquipmentIssue();

  const handleUpdateTaskStatus = (taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'overdue') => {
    updateTaskStatus.mutate({ taskId, status });
  };

  const handleToggleChecklistItem = (taskId: string, itemId: string, completed: boolean) => {
    updateChecklistItem.mutate({ taskId, itemId, completed });
  };

  const handleResolveEquipment = (issueId: string) => {
    resolveEquipmentIssue.mutate({ issueId, resolution: 'Resolved via Operations Dashboard' });
  };

  const activeShifts = shifts.data?.filter(s => s.status === 'active') || [];
  const upcomingShifts = shifts.data?.filter(s => s.status === 'scheduled').slice(0, 3) || [];
  const openIssues = equipment.data?.filter(i => i.status !== 'operational') || [];

  return (
    <div className="min-h-screen bg-[#0f0f14] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0f0f14]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0f0f14]/80 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Settings className="w-7 h-7 text-orange-500" />
                Operations Center
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage shifts, tasks, and daily operations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <XpressButton
                variant="secondary"
                icon={<Video className="w-4 h-4" />}
                onClick={() => navigate('/ground/dashcams')}
              >
                Dashcams
              </XpressButton>
              <XpressButton
                variant="secondary"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </XpressButton>
              <XpressButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                New Task
              </XpressButton>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {(['overview', 'shifts', 'reports'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                  activeTab === tab
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-800"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <MetricCard
                title="Staff on Duty"
                value={metrics.data?.staffOnDuty.toString() || '0'}
                subtext={`${metrics.data?.shiftCoverage || 0}% shift coverage`}
                icon={Users}
                color="blue"
                trend={{ value: 5, positive: true }}
              />
              <MetricCard
                title="Active Tasks"
                value={(metrics.data?.pendingTasks || 0 + (metrics.data?.completedTasks || 0)).toString()}
                subtext={`${metrics.data?.completedTasks || 0} completed`}
                icon={ClipboardCheck}
                color="green"
              />
              <MetricCard
                title="Equipment Issues"
                value={metrics.data?.equipmentIssues.toString() || '0'}
                subtext={`${openIssues.length} require attention`}
                icon={Wrench}
                color={openIssues.length > 0 ? 'amber' : 'green'}
              />
              <MetricCard
                title="Avg Completion"
                value={`${metrics.data?.avgTaskCompletionTime || 0}m`}
                subtext="Per task"
                icon={Clock}
                color="purple"
                trend={{ value: 12, positive: true }}
              />
              <MetricCard
                title="Active Shifts"
                value={activeShifts.length.toString()}
                subtext="Currently running"
                icon={Activity}
                color="blue"
              />
              <MetricCard
                title="Overdue Tasks"
                value={metrics.data?.overdueTasks.toString() || '0'}
                subtext="Need attention"
                icon={AlertTriangle}
                color={(metrics.data?.overdueTasks || 0) > 0 ? 'red' : 'green'}
              />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Calendar & Tasks */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Calendar */}
                <OperationsCalendar
                  events={calendar.data}
                  isLoading={calendar.isLoading}
                />

                {/* Task List */}
                <TaskList
                  tasks={tasks.data}
                  isLoading={tasks.isLoading}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onToggleChecklistItem={handleToggleChecklistItem}
                />
              </div>

              {/* Right Column - Shifts, Issues, Handover */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Active & Upcoming Shifts */}
                <XpressCard
                  title="Shifts"
                  subtitle="Active and upcoming"
                  badge={activeShifts.length > 0 ? `${activeShifts.length} active` : undefined}
                  badgeVariant="success"
                  icon={<Calendar className="w-5 h-5 text-orange-500" />}
                  headerAction={
                    <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      View All
                    </button>
                  }
                >
                  <div className="space-y-3">
                    {/* Active Shifts */}
                    {activeShifts.map((shift) => (
                      <ShiftCard key={shift.id} shift={shift} />
                    ))}
                    
                    {/* Upcoming Shifts */}
                    {upcomingShifts.length > 0 && (
                      <>
                        <div className="h-px bg-gray-800 my-4" />
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                          Upcoming
                        </h4>
                        {upcomingShifts.map((shift) => (
                          <ShiftCard key={shift.id} shift={shift} />
                        ))}
                      </>
                    )}
                    
                    {activeShifts.length === 0 && upcomingShifts.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No active shifts</p>
                      </div>
                    )}
                  </div>
                </XpressCard>

                {/* Equipment Issues */}
                <XpressCard
                  title="Equipment Issues"
                  subtitle="Vehicles, devices, facilities"
                  badge={openIssues.length > 0 ? `${openIssues.length} open` : undefined}
                  badgeVariant={openIssues.length > 0 ? 'alert' : 'success'}
                  icon={<Wrench className="w-5 h-5 text-orange-500" />}
                  headerAction={
                    <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      Report Issue
                    </button>
                  }
                >
                  <div className="space-y-2">
                    {equipment.data?.slice(0, 4).map((issue) => (
                      <EquipmentIssueCard
                        key={issue.id}
                        issue={issue}
                        onResolve={handleResolveEquipment}
                      />
                    ))}
                    {equipment.data?.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400 opacity-50" />
                        <p className="text-sm">All equipment operational</p>
                      </div>
                    )}
                  </div>
                </XpressCard>

                {/* Handover Notes */}
                <XpressCard
                  title="Shift Handover"
                  subtitle="Recent notes and updates"
                  icon={<FileText className="w-5 h-5 text-orange-500" />}
                >
                  <div className="space-y-3">
                    {handover.data?.slice(0, 2).map((note) => (
                      <HandoverNoteCard key={note.id} note={note} />
                    ))}
                    {handover.data?.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No handover notes</p>
                      </div>
                    )}
                  </div>
                </XpressCard>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Shift Management</h2>
              <XpressButton variant="primary" icon={<Plus className="w-4 h-4" />}>
                Create Shift
              </XpressButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.data?.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Operations Reports</h2>
              <XpressButton variant="primary" icon={<FileSpreadsheet className="w-4 h-4" />}>
                Generate Report
              </XpressButton>
            </div>
            <XpressCard>
              <div className="text-center py-12 text-gray-500">
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Reports feature coming soon</p>
                <p className="text-sm mt-1">Generate and download detailed operations reports</p>
              </div>
            </XpressCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationsPage;
