import { useState, useRef, useEffect } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type {
  SupportTicket,
  TicketMessage,
  TicketStatus,
  QuickReply,
} from '@/services/support/support.service';
import {
  ArrowLeft,
  Send,
  User,
  Clock,
  CheckCircle,
  ArrowUpCircle,
  AlertCircle,
  UserPlus,
  MessageSquare,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TicketDetailProps {
  ticket: SupportTicket;
  messages: TicketMessage[];
  quickReplies: QuickReply[];
  agents: Array<{ id: string; name: string; avatar?: string }>;
  onBack: () => void;
  onStatusChange: (status: TicketStatus) => void;
  onAssign: (agentId: string) => void;
  onEscalate: (reason: string) => void;
  onSendMessage: (content: string, isInternal: boolean) => void;
  isLoading?: boolean;
}

export function TicketDetail({
  ticket,
  messages,
  quickReplies,
  agents,
  onBack,
  onStatusChange,
  onAssign,
  onEscalate,
  onSendMessage,
  isLoading = false,
}: TicketDetailProps) {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    onSendMessage(message, isInternal);
    setMessage('');
    setIsInternal(false);
  };

  const handleQuickReply = (reply: QuickReply) => {
    setMessage(reply.content);
    setShowQuickReplies(false);
  };

  const handleEscalate = () => {
    if (!escalateReason.trim()) return;
    onEscalate(escalateReason);
    setEscalateReason('');
    setShowEscalateModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f14]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{ticket.subject}</h2>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {ticket.id} • Opened {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ticket.status !== 'escalated' && ticket.status !== 'closed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEscalateModal(true)}
              icon={<ArrowUpCircle className="w-4 h-4" />}
            >
              Escalate
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAssignModal(true)}
            icon={<UserPlus className="w-4 h-4" />}
          >
            {ticket.assignedTo ? 'Reassign' : 'Assign'}
          </Button>
          {ticket.status === 'open' && (
            <Button
              size="sm"
              onClick={() => onStatusChange('in-progress')}
              icon={<Clock className="w-4 h-4" />}
            >
              Start Work
            </Button>
          )}
          {ticket.status === 'in-progress' && (
            <Button
              size="sm"
              onClick={() => onStatusChange('resolved')}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Resolve
            </Button>
          )}
          {(ticket.status === 'resolved' || ticket.status === 'escalated') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange('closed')}
            >
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Ticket Info */}
          <div className="p-4 border-b border-gray-800 bg-[#12121a]">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Reporter</span>
                <span className="text-white font-medium">{ticket.reporter.name}</span>
                <span className="text-gray-500 text-xs block capitalize">({ticket.reporter.role})</span>
              </div>
              <div>
                <span className="text-gray-500 block">Assigned To</span>
                <span className={cn('font-medium', ticket.assignedTo ? 'text-orange-400' : 'text-gray-500')}>
                  {ticket.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Last Updated</span>
                <span className="text-white">{new Date(ticket.updatedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-500 block text-sm mb-1">Description</span>
              <p className="text-white text-sm">{ticket.description}</p>
            </div>
            {ticket.tags.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-gray-500 text-xs">Tags:</span>
                {ticket.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation by sending a message</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    msg.author.role === 'Admin' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    msg.author.role === 'Admin' ? 'bg-orange-500/20' : 'bg-gray-800'
                  )}>
                    <User className={cn(
                      'w-4 h-4',
                      msg.author.role === 'Admin' ? 'text-orange-400' : 'text-gray-400'
                    )} />
                  </div>
                  <div className={cn(
                    'max-w-[70%]',
                    msg.author.role === 'Admin' ? 'text-right' : ''
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-xs font-medium',
                        msg.author.role === 'Admin' ? 'text-orange-400' : 'text-white'
                      )}>
                        {msg.author.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                      {msg.isInternal && (
                        <span className="px-1.5 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                          Internal
                        </span>
                      )}
                    </div>
                    <div className={cn(
                      'inline-block px-4 py-2 rounded-lg text-sm text-left',
                      msg.author.role === 'Admin'
                        ? 'bg-orange-500 text-white'
                        : msg.isInternal
                        ? 'bg-gray-800 text-gray-300 border border-gray-700'
                        : 'bg-[#1a1a2e] text-white'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-800 bg-[#12121a]">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500"
                      />
                      <span>Internal note</span>
                      <Shield className="w-3 h-3" />
                    </label>
                    {quickReplies.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setShowQuickReplies(!showQuickReplies)}
                          className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300"
                        >
                          Quick replies
                          <ChevronDown className={cn('w-3 h-3 transition-transform', showQuickReplies && 'rotate-180')} />
                        </button>
                        {showQuickReplies && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a2e] border border-gray-800 rounded-lg shadow-xl z-10">
                            {quickReplies.map((reply) => (
                              <button
                                key={reply.id}
                                onClick={() => handleQuickReply(reply)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
                              >
                                <span className="font-medium text-white">{reply.title}</span>
                                <p className="text-xs text-gray-500 truncate">{reply.content}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Cmd+Enter to send
                  </span>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                icon={<Send className="w-4 h-4" />}
                className="mt-1"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Ticket"
        size="sm"
      >
        <div className="space-y-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                onAssign(agent.id);
                setShowAssignModal(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                ticket.assignedTo?.id === agent.id
                  ? 'bg-orange-500/20 border border-orange-500/30'
                  : 'bg-gray-800 hover:bg-gray-700'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">{agent.name}</p>
                <p className="text-xs text-gray-500">Support Agent</p>
              </div>
              {ticket.assignedTo?.id === agent.id && (
                <CheckCircle className="w-4 h-4 text-orange-400" />
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Escalate Modal */}
      <Modal
        isOpen={showEscalateModal}
        onClose={() => setShowEscalateModal(false)}
        title="Escalate Ticket"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEscalateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEscalate}
              disabled={!escalateReason.trim()}
              variant="danger"
              icon={<ArrowUpCircle className="w-4 h-4" />}
            >
              Escalate
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            This will escalate the ticket to the specialist team and mark it as urgent.
            Please provide a reason for escalation.
          </p>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Reason for escalation</label>
            <textarea
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="e.g., Requires technical expertise, billing dispute, safety concern..."
              className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 resize-none"
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const variants: Record<TicketStatus, 'warning' | 'active' | 'success' | 'alert' | 'default'> = {
    open: 'warning',
    'in-progress': 'active',
    resolved: 'success',
    escalated: 'alert',
    closed: 'default',
    waiting: 'warning',
  };

  const icons: Record<TicketStatus, React.ReactNode> = {
    open: <AlertCircle className="w-3 h-3" />,
    'in-progress': <Clock className="w-3 h-3" />,
    resolved: <CheckCircle className="w-3 h-3" />,
    escalated: <ArrowUpCircle className="w-3 h-3" />,
    closed: <CheckCircle className="w-3 h-3" />,
    waiting: <Clock className="w-3 h-3" />,
  };

  return (
    <Badge variant={variants[status]} className="capitalize gap-1">
      {icons[status]}
      {status.replace('-', ' ')}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-gray-700 text-gray-400 border-gray-600',
  };

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border capitalize', colors[priority])}>
      {priority}
    </span>
  );
}

export default TicketDetail;
