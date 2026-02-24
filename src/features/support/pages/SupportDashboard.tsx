import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TicketList } from '../components/TicketList';
import { TicketDetail } from '../components/TicketDetail';
import {
  useTickets,
  useTicket,
  useTicketMessages,
  useTicketStats,
  useQuickReplies,
  useAgents,
  useUpdateTicketStatus,
  useAssignTicket,
  useEscalateTicket,
  useAddTicketMessage,
} from '../hooks/useSupport';
import type { SupportTicket, TicketStatus } from '@/services/support/support.service';
import {
  Ticket,
  Clock,
  CheckCircle,
  ArrowUpCircle,
  Plus,
  AlertCircle,
  Star,
  Filter,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const SupportDashboard = () => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilters, setStatusFilters] = useState<TicketStatus[]>([]);

  // Fetch data
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets({
    filters: { status: statusFilters.length > 0 ? statusFilters : undefined },
  });
  const { data: stats, isLoading: statsLoading } = useTicketStats();
  const { data: quickReplies } = useQuickReplies();
  const { data: agents } = useAgents();

  // Selected ticket data
  const { data: selectedTicket } = useTicket(selectedTicketId || undefined);
  const { data: messages } = useTicketMessages(selectedTicketId || undefined);

  // Mutations
  const updateStatus = useUpdateTicketStatus();
  const assignTicket = useAssignTicket();
  const escalateTicket = useEscalateTicket();
  const addMessage = useAddTicketMessage();

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicketId(ticket.id);
  };

  const handleBackToList = () => {
    setSelectedTicketId(null);
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (selectedTicketId) {
      updateStatus.mutate({ ticketId: selectedTicketId, status });
    }
  };

  const handleAssign = (agentId: string) => {
    if (selectedTicketId) {
      assignTicket.mutate({ ticketId: selectedTicketId, agentId });
    }
  };

  const handleEscalate = (reason: string) => {
    if (selectedTicketId) {
      escalateTicket.mutate({ ticketId: selectedTicketId, reason });
    }
  };

  const handleSendMessage = (content: string, isInternal: boolean) => {
    if (selectedTicketId) {
      addMessage.mutate({ ticketId: selectedTicketId, content, isInternal });
    }
  };

  // Ticket detail view
  if (selectedTicket && messages) {
    return (
      <TicketDetail
        ticket={selectedTicket}
        messages={messages}
        quickReplies={quickReplies || []}
        agents={agents || []}
        onBack={handleBackToList}
        onStatusChange={handleStatusChange}
        onAssign={handleAssign}
        onEscalate={handleEscalate}
        onSendMessage={handleSendMessage}
        isLoading={updateStatus.isPending || addMessage.isPending}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0f0f14]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Support Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage customer support tickets and inquiries</p>
          </div>
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            Create Ticket
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <XpressCard
            title="Open Tickets"
            badge="Needs attention"
            badgeVariant="warning"
            icon={<Ticket className="w-5 h-5" />}
          >
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">
                {statsLoading ? '-' : stats?.open}
              </span>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Ticket className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </XpressCard>

          <XpressCard
            title="In Progress"
            badge="Active"
            badgeVariant="info"
            icon={<Clock className="w-5 h-5" />}
          >
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">
                {statsLoading ? '-' : stats?.inProgress}
              </span>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </XpressCard>

          <XpressCard
            title="Resolved"
            badge="Today"
            badgeVariant="success"
            icon={<CheckCircle className="w-5 h-5" />}
          >
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">
                {statsLoading ? '-' : stats?.resolved}
              </span>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </XpressCard>

          <XpressCard
            title="Escalated"
            badge="Critical"
            badgeVariant="alert"
            icon={<ArrowUpCircle className="w-5 h-5" />}
          >
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">
                {statsLoading ? '-' : stats?.escalated}
              </span>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <ArrowUpCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </XpressCard>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          <XpressCard>
            <div className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '-' : stats?.avgResponseTime}
                </p>
              </div>
            </div>
          </XpressCard>
          <XpressCard>
            <div className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Satisfaction Rating</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '-' : stats?.satisfaction.toFixed(1)}
                </p>
              </div>
            </div>
          </XpressCard>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Quick filters:</span>
          {(['open', 'in-progress', 'resolved', 'escalated'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilters((prev) =>
                  prev.includes(status)
                    ? prev.filter((s) => s !== status)
                    : [...prev, status]
                );
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                statusFilters.includes(status)
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#12121a] border border-gray-800 text-gray-400 hover:border-gray-700'
              )}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
          {statusFilters.length > 0 && (
            <button
              onClick={() => setStatusFilters([])}
              className="text-sm text-orange-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>

        {/* Ticket List */}
        <XpressCard>
          <TicketList
            tickets={ticketsData?.items || []}
            isLoading={ticketsLoading}
            selectedTicketId={selectedTicketId || undefined}
            onSelectTicket={handleSelectTicket}
          />
        </XpressCard>
      </div>
    </div>
  );
};

export default SupportDashboard;
