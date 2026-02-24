/**
 * Global Search Hook
 * Searches across Orders, Drivers, and Vehicles
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { mockOrders, mockDrivers, mockVehicles } from '@/lib/mocks/data';
import type { Order, Driver, Vehicle } from '@/types/domain.types';

export interface SearchResult {
  id: string;
  type: 'order' | 'driver' | 'vehicle';
  title: string;
  subtitle: string;
  status?: string;
  url: string;
}

export interface UseGlobalSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
}

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const { debounceMs = 150, minQueryLength = 2, maxResults = 20 } = options;
  
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce query input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs]);

  // Perform search
  const results = useMemo<SearchResult[]>(() => {
    if (debouncedQuery.length < minQueryLength) return [];
    
    const searchTerm = debouncedQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search Orders
    const matchedOrders = mockOrders.filter((order: Order) => {
      return (
        order.orderId.toLowerCase().includes(searchTerm) ||
        order.customer.name.toLowerCase().includes(searchTerm) ||
        order.customer.phone.includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm)
      );
    }).slice(0, maxResults / 3);

    matchedOrders.forEach((order) => {
      results.push({
        id: order.orderId,
        type: 'order',
        title: `Order ${order.orderId}`,
        subtitle: `${order.customer.name} • ${order.serviceType} • ₱${order.pricing.total.toFixed(2)}`,
        status: order.status,
        url: `/orders/${order.orderId}`,
      });
    });

    // Search Drivers
    const matchedDrivers = mockDrivers.filter((driver: Driver) => {
      const fullName = `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`.toLowerCase();
      return (
        driver.driverId.toLowerCase().includes(searchTerm) ||
        fullName.includes(searchTerm) ||
        driver.personalInfo.phone.includes(searchTerm) ||
        driver.personalInfo.email.toLowerCase().includes(searchTerm)
      );
    }).slice(0, maxResults / 3);

    matchedDrivers.forEach((driver) => {
      results.push({
        id: driver.driverId,
        type: 'driver',
        title: `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`,
        subtitle: `${driver.driverId} • ${driver.onlineStatus} • Trust: ${driver.trustScore.overall}%`,
        status: driver.onlineStatus,
        url: `/drivers/${driver.driverId}`,
      });
    });

    // Search Vehicles
    const matchedVehicles = mockVehicles.filter((vehicle: Vehicle) => {
      return (
        vehicle.vehicleId.toLowerCase().includes(searchTerm) ||
        vehicle.plateNumber.toLowerCase().includes(searchTerm) ||
        vehicle.make.toLowerCase().includes(searchTerm) ||
        vehicle.model.toLowerCase().includes(searchTerm) ||
        (vehicle.assignedDriver?.name.toLowerCase().includes(searchTerm) ?? false)
      );
    }).slice(0, maxResults / 3);

    matchedVehicles.forEach((vehicle) => {
      results.push({
        id: vehicle.vehicleId,
        type: 'vehicle',
        title: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
        subtitle: `${vehicle.plateNumber} • ${vehicle.type} • ${vehicle.status}`,
        status: vehicle.status,
        url: `/fleet/${vehicle.vehicleId}`,
      });
    });

    return results.slice(0, maxResults);
  }, [debouncedQuery, minQueryLength, maxResults]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: { type: string; label: string; items: SearchResult[] }[] = [
      { type: 'order', label: 'Orders', items: results.filter(r => r.type === 'order') },
      { type: 'driver', label: 'Drivers', items: results.filter(r => r.type === 'driver') },
      { type: 'vehicle', label: 'Vehicles', items: results.filter(r => r.type === 'vehicle') },
    ].filter(g => g.items.length > 0);
    
    return groups;
  }, [results]);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    groupedResults,
    isOpen,
    openSearch,
    closeSearch,
    clearQuery,
    hasResults: results.length > 0,
    isSearching: debouncedQuery.length >= minQueryLength,
  };
}

export default useGlobalSearch;
