import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { Badge } from '@/components/ui/Badge';
import type { OperationTask, TaskStatus, TaskPriority } from '@/services/operations/operations.service';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  MoreHorizontal,
  Plus,
  Filter,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Flag,
  Tag,
} from 'lucide-react';

interface TaskListProps {
  tasks?: OperationTask[];
  isLoading?: boolean;
  onUpdateStatus?: (taskId: string, status: TaskStatus) => void;
  onToggleChecklistItem?: (taskId: string, itemId: string, completed: boolean) => void;
  maxItems?: number;
}

const statusConfig: Record<TaskStatus, { variant: 'success' | 'warning' | 'alert' | 'default'; label: string; icon: React.ReactNode }> = {
  completed: { 
    variant: 'success', 
    label: 'Completed',
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  'in-progress': { 
    variant: 'warning', 
    label: 'In Progress',
    icon: <Clock className="w-4 h-4" />
  },
  pending: { 
    variant: 'default', 
    label: 'Pending',
    icon: <Circle className="w-4 h-4" />
  },
  overdue: { 
    variant: 'alert', 
    label: 'Overdue',
    icon: <AlertTriangle className="w-4 h-4" />
  },
};

const priorityConfig: Record<TaskPriority, { color: string; label: string }> = {
  urgent: { color: 'text-red-400 bg-red-400', label: 'Urgent' },
  high: { color: 'text-orange-400 bg-orange-400', label: 'High' },
  medium: { color: 'text-blue-400 bg-blue-400', label: 'Medium' },
  low: { color: 'text-gray-400 bg-gray-400', label: 'Low' },
};

const categoryColors: Record<string, string> = {
  daily: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  weekly: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  monthly: 'bg-green-500/20 text-green-400 border-green-500/30',
  incident: 'bg-red-500/20 text-red-400 border-red-500/30',
  maintenance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return 'Overdue';
  if (diffHours < 1) return 'Due soon';
  if (diffHours < 24) return `Due in ${diffHours}h`;
  return `Due in ${diffDays}d`;
}

function TaskItem({
  task,
  onUpdateStatus,
  onToggleChecklistItem,
}: {
  task: OperationTask;
  onUpdateStatus?: (taskId: string, status: TaskStatus) => void;
  onToggleChecklistItem?: (taskId: string, itemId: string, completed: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  const completedChecklistItems = task.checklist?.filter(i => i.completed).length || 0;
  const totalChecklistItems = task.checklist?.length || 0;
  const checklistProgress = totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0;

  return (
    <div className="border-b border-gray-800/50 last:border-0">
      <div className="p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-start gap-3">
          {/* Status Toggle */}
          <button
            onClick={() => onUpdateStatus?.(task.id, task.status === 'completed' ? 'pending' : 'completed')}
            className={cn(
              "mt-0.5 transition-colors",
              task.status === 'completed' ? "text-green-400" : "text-gray-600 hover:text-gray-400"
            )}
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "text-sm font-medium truncate",
                  task.status === 'completed' ? "text-gray-500 line-through" : "text-white"
                )}>
                  {task.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={status.variant} className="text-[10px]">
                  {status.label}
                </Badge>
              </div>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {/* Priority */}
              <div className="flex items-center gap-1">
                <Flag className={cn("w-3 h-3", priority.color.split(' ')[0])} />
                <span className="text-xs text-gray-500">{priority.label}</span>
              </div>

              {/* Category */}
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full border capitalize",
                categoryColors[task.category] || categoryColors.daily
              )}>
                {task.category}
              </span>

              {/* Assignee */}
              {task.assignedToName && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">{task.assignedToName}</span>
                </div>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  task.status === 'overdue' ? "text-red-400" : "text-gray-500"
                )}>
                  <Calendar className="w-3 h-3" />
                  {formatRelativeTime(task.dueDate)}
                </div>
              )}

              {/* Checklist Progress */}
              {totalChecklistItems > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                >
                  <ListTodo className="w-3 h-3" />
                  {completedChecklistItems}/{totalChecklistItems}
                  {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Checklist */}
      {expanded && task.checklist && task.checklist.length > 0 && (
        <div className="px-4 pb-4 pl-12">
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-800 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${checklistProgress}%` }}
            />
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {task.checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 group"
              >
                <button
                  onClick={() => onToggleChecklistItem?.(task.id, item.id, !item.completed)}
                  className={cn(
                    "transition-colors",
                    item.completed ? "text-green-400" : "text-gray-600 group-hover:text-gray-400"
                  )}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <span className={cn(
                  "text-sm",
                  item.completed ? "text-gray-500 line-through" : "text-gray-300"
                )}>
                  {item.text}
                </span>
                {item.completedBy && (
                  <span className="text-xs text-gray-600">
                    by {item.completedBy}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-800 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 bg-gray-800 rounded w-16 animate-pulse" />
              <div className="h-5 bg-gray-800 rounded w-20 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskList({
  tasks = [],
  isLoading,
  onUpdateStatus,
  onToggleChecklistItem,
  maxItems = 50,
}: TaskListProps) {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredTasks = tasks
    .filter(task => filter === 'all' || task.status === filter)
    .slice(0, maxItems);

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  const filters: Array<{ value: TaskStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
  ];

  return (
    <XpressCard
      title="Operations Tasks"
      subtitle="Daily checklist and assignments"
      badge={`${counts.pending + counts['in-progress']} active`}
      badgeVariant={counts.overdue > 0 ? 'alert' : counts['in-progress'] > 0 ? 'warning' : 'default'}
      className="h-full"
      headerAction={
        <div className="flex items-center gap-2">
          <XpressButton
            variant="secondary"
            size="xs"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Task
          </XpressButton>
        </div>
      }
    >
      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 -mt-2 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
              filter === f.value
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            {f.label}
            <span className={cn(
              "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]",
              filter === f.value ? "bg-blue-500/30" : "bg-gray-700"
            )}>
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-0 -mx-5 -mb-5">
        {isLoading ? (
          <TaskListSkeleton />
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400">
              {filter === 'all' ? 'No tasks found' : `No ${filter} tasks`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tasks will appear here when assigned
            </p>
          </div>
        ) : (
          <div>
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdateStatus={onUpdateStatus}
                onToggleChecklistItem={onToggleChecklistItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal - Simplified */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              Add New Task
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Description</label>
                <textarea
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Priority</label>
                  <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Category</label>
                  <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="incident">Incident</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <XpressButton
                variant="secondary"
                fullWidth
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </XpressButton>
              <XpressButton
                variant="primary"
                fullWidth
                onClick={() => setShowAddModal(false)}
              >
                Create Task
              </XpressButton>
            </div>
          </div>
        </div>
      )}
    </XpressCard>
  );
}

export default TaskList;
