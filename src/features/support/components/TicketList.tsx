import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type {
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '@/services/support/support.service';
import { Search, Filter, X, AlertCircle, Clock, CheckCircle, ArrowUpCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TicketListProps {
  tickets: SupportTicket[];
  isLoading?: boolean;
  selectedTicketId?: string;
  onSelectTicket: (ticket: SupportTicket) => void;
}

interface FiltersState {
  status: TicketStatus[];
  priority: TicketPriority[];
  category: TicketCategory[];
}

export function TicketList({
  tickets,
  isLoading = false,
  selectedTicketId,
  onSelectTicket,
}: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    status: [],
    priority: [],
    category: [],
  });

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !ticket.subject.toLowerCase().includes(query) &&
          !ticket.description.toLowerCase().includes(query) &&
          !ticket.id.toLowerCase().includes(query) &&
          !ticket.reporter.name.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (filters.status.length > 0 && !filters.status.includes(ticket.status)) {
        return false;
      }

      if (filters.priority.length > 0 && !filters.priority.includes(ticket.priority)) {
        return false;
      }

      if (filters.category.length > 0 && !filters.category.includes(ticket.category)) {
        return false;
      }

      return true;
    });
  }, [tickets, searchQuery, filters]);

  const activeFiltersCount =
    filters.status.length + filters.priority.length + filters.category.length;

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'escalated':
        return <ArrowUpCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search tickets by subject, ID, or reporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          size="sm"
          icon={<Filter className="w-4 h-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-xpress-accent-blue/20 rounded-full text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {(searchQuery || activeFiltersCount > 0) && (
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
            onClick={() => {
              setSearchQuery('');
              setFilters({ status: [], priority: [], category: [] });
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-[#12121a] border border-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-400">Filters</h4>
            <button
              onClick={() => setFilters({ status: [], priority: [], category: [] })}
              className="text-xs text-orange-400 hover:underline"
            >
              Reset all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-xs text-gray-500 block mb-2">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {(['open', 'in-progress', 'resolved', 'escalated', 'closed'] as TicketStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        status: prev.status.includes(status)
                          ? prev.status.filter((s) => s !== status)
                          : [...prev.status, status],
                      }));
                    }}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-colors capitalize',
                      filters.status.includes(status)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    )}
                  >
                    {status.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-xs text-gray-500 block mb-2">Priority</label>
              <div className="flex flex-wrap gap-1.5">
                {(['urgent', 'high', 'medium', 'low'] as TicketPriority[]).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        priority: prev.priority.includes(priority)
                          ? prev.priority.filter((p) => p !== priority)
                          : [...prev.priority, priority],
                      }));
                    }}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-colors capitalize',
                      filters.priority.includes(priority)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    )}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs text-gray-500 block mb-2">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {(['technical', 'billing', 'driver', 'passenger', 'other'] as TicketCategory[]).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        category: prev.category.includes(category)
                          ? prev.category.filter((c) => c !== category)
                          : [...prev.category, category],
                      }));
                    }}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-colors capitalize',
                      filters.category.includes(category)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-500">
          Showing <span className="text-white font-medium">{filteredTickets.length}</span> of{' '}
          <span className="text-white font-medium">{tickets.length}</span> tickets
        </p>
      </div>

      {/* Ticket List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-[#12121a] border border-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-[#12121a] border border-gray-800 rounded-lg">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No tickets found</p>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all duration-200',
                selectedTicketId === ticket.id
                  ? 'bg-orange-500/10 border-orange-500/50'
                  : 'bg-[#12121a] border-gray-800 hover:border-gray-700'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-gray-500 text-xs font-mono">{ticket.id}</span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <CategoryBadge category={ticket.category} />
                  </div>
                  <h3 className={cn(
                    'text-sm font-medium truncate',
                    selectedTicketId === ticket.id ? 'text-orange-400' : 'text-white'
                  )}>
                    {ticket.subject}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>By: {ticket.reporter.name}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.assignedTo && (
                      <>
                        <span>•</span>
                        <span className="text-orange-400">Assigned to: {ticket.assignedTo.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={cn(
                  'p-2 rounded-lg',
                  selectedTicketId === ticket.id ? 'bg-orange-500/20' : 'bg-gray-800'
                )}>
                  {getStatusIcon(ticket.status)}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
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

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status.replace('-', ' ')}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const colors: Record<TicketPriority, string> = {
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

function CategoryBadge({ category }: { category: TicketCategory }) {
  const icons: Record<TicketCategory, string> = {
    technical: '🔧',
    billing: '💰',
    driver: '🚗',
    passenger: '👤',
    other: '📋',
  };

  return (
    <span className="text-xs text-gray-500">
      {icons[category]} {category}
    </span>
  );
}

export default TicketList;
