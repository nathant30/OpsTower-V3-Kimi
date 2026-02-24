/**
 * Support Hook - React Query hooks for support ticketing system
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  supportService,
  type TicketFilters,
  type TicketStatus,
  type TicketPriority,
  type TicketCategory,
} from '@/services/support/support.service';

export interface UseTicketsOptions {
  filters?: TicketFilters;
  enabled?: boolean;
}

// Get tickets list with filters
export function useTickets(options: UseTicketsOptions = {}) {
  const { filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: ['tickets', 'list', filters],
    queryFn: () => supportService.getTickets(filters),
    enabled,
  });
}

// Get single ticket
export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => supportService.getTicket(id!),
    enabled: !!id,
  });
}

// Get ticket messages
export function useTicketMessages(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['ticket', ticketId, 'messages'],
    queryFn: () => supportService.getTicketMessages(ticketId!),
    enabled: !!ticketId,
  });
}

// Get ticket stats
export function useTicketStats() {
  return useQuery({
    queryKey: ['tickets', 'stats'],
    queryFn: () => supportService.getTicketStats(),
  });
}

// Get quick replies
export function useQuickReplies(category?: TicketCategory) {
  return useQuery({
    queryKey: ['quickReplies', category],
    queryFn: () => supportService.getQuickReplies(category),
  });
}

// Get agents
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => supportService.getAgents(),
  });
}

// Assign ticket
export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, agentId }: { ticketId: string; agentId: string }) =>
      supportService.assignTicket(ticketId, agentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'list'] });
    },
  });
}

// Update ticket status
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) =>
      supportService.updateTicketStatus(ticketId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'stats'] });
    },
  });
}

// Escalate ticket
export function useEscalateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, reason }: { ticketId: string; reason: string }) =>
      supportService.escalateTicket(ticketId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'stats'] });
    },
  });
}

// Add message to ticket
export function useAddTicketMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      content,
      isInternal,
    }: {
      ticketId: string;
      content: string;
      isInternal?: boolean;
    }) => supportService.addMessage(ticketId, content, isInternal),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId, 'messages'] });
    },
  });
}

export default useTickets;
