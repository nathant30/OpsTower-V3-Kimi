/**
 * Passengers Hook - React Query hooks for passenger management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  passengersService,
  type Passenger,
  type PassengerFilters,
  type PassengerStatus,
} from '@/services/passengers/passengers.service';

export interface UsePassengersOptions {
  filters?: PassengerFilters;
  enabled?: boolean;
}

// Get passengers list with filters and pagination
export function usePassengers(options: UsePassengersOptions = {}) {
  const { filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: ['passengers', 'list', filters],
    queryFn: () => passengersService.getPassengers(filters),
    enabled,
  });
}

// Get single passenger
export function usePassenger(id: string | undefined) {
  return useQuery({
    queryKey: ['passenger', id],
    queryFn: () => passengersService.getPassenger(id!),
    enabled: !!id,
  });
}

// Get passenger rides
export function usePassengerRides(id: string | undefined) {
  return useQuery({
    queryKey: ['passenger', id, 'rides'],
    queryFn: () => passengersService.getPassengerRides(id!),
    enabled: !!id,
  });
}

// Get passenger support tickets
export function usePassengerTickets(id: string | undefined) {
  return useQuery({
    queryKey: ['passenger', id, 'tickets'],
    queryFn: () => passengersService.getPassengerTickets(id!),
    enabled: !!id,
  });
}

// Get passenger stats
export function usePassengerStats() {
  return useQuery({
    queryKey: ['passengers', 'stats'],
    queryFn: () => passengersService.getPassengerStats(),
  });
}

// Update passenger status (suspend/ban/activate)
export function useUpdatePassengerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: PassengerStatus;
      reason?: string;
    }) => passengersService.updatePassengerStatus(id, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['passenger', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['passengers', 'list'] });
    },
  });
}

// Send message to passenger
export function useSendPassengerMessage() {
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      passengersService.sendMessage(id, message),
  });
}

export default usePassengers;
