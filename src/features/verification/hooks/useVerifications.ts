/**
 * Verification Hook
 * Manages verification requests, reviews, and KYC workflows
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  verificationService,
  type VerificationRequest,
  type VerificationStatus,
  type DocumentType,
  type ReviewAction,
} from '@/services/verification/verification.service';

export interface VerificationFilters {
  status: VerificationStatus | 'all';
  documentType: DocumentType | 'all';
  search: string;
  priority: 'all' | 'low' | 'normal' | 'high' | 'urgent';
}

export interface UseVerificationsReturn {
  // Data
  requests: VerificationRequest[];
  selectedRequest: VerificationRequest | null;
  
  // Filters
  filters: VerificationFilters;
  setFilters: (filters: Partial<VerificationFilters>) => void;
  
  // Selection
  selectRequest: (request: VerificationRequest | null) => void;
  
  // Actions
  refreshRequests: () => Promise<void>;
  submitReview: (requestId: string, action: ReviewAction) => Promise<void>;
  verifyDocument: (documentId: string, notes?: string) => Promise<void>;
  rejectDocument: (documentId: string, reason: string) => Promise<void>;
  addNote: (requestId: string, note: string) => Promise<void>;
  batchApprove: (requestIds: string[]) => Promise<void>;
  batchReject: (requestIds: string[], reason: string) => Promise<void>;
  
  // Stats
  stats: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    byDocumentType: Record<DocumentType, number>;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  
  // Status
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useVerifications(): UseVerificationsReturn {
  // Data state
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  
  // Filter state
  const [filters, setFilterState] = useState<VerificationFilters>({
    status: 'pending',
    documentType: 'all',
    search: '',
    priority: 'all',
  });
  
  // Status state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch requests
  const refreshRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await verificationService.getRequests({
        status: filters.status === 'all' ? undefined : filters.status,
        documentType: filters.documentType === 'all' ? undefined : filters.documentType,
        search: filters.search || undefined,
        priority: filters.priority === 'all' ? undefined : filters.priority,
      });
      setRequests(data.items);
      setLastUpdated(new Date());
      
      // Update selected request if it exists in new data
      if (selectedRequest) {
        const updated = data.items.find((r) => r.id === selectedRequest.id);
        if (updated) {
          setSelectedRequest(updated);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch verification requests');
      console.error('Failed to fetch verification requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.documentType, filters.search, filters.priority, selectedRequest?.id]);

  // Initial load and filter changes
  useEffect(() => {
    refreshRequests();
  }, [refreshRequests]);

  // Filter actions
  const setFilters = useCallback((newFilters: Partial<VerificationFilters>) => {
    setFilterState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Selection
  const selectRequest = useCallback((request: VerificationRequest | null) => {
    setSelectedRequest(request);
  }, []);

  // Review actions
  const submitReview = useCallback(async (requestId: string, action: ReviewAction) => {
    setIsSubmitting(true);
    try {
      await verificationService.submitReview(requestId, action);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to submit review:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshRequests]);

  const verifyDocument = useCallback(async (documentId: string, notes?: string) => {
    try {
      await verificationService.verifyDocument(documentId, notes);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to verify document:', err);
      throw err;
    }
  }, [refreshRequests]);

  const rejectDocument = useCallback(async (documentId: string, reason: string) => {
    try {
      await verificationService.rejectDocument(documentId, reason);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to reject document:', err);
      throw err;
    }
  }, [refreshRequests]);

  const addNote = useCallback(async (requestId: string, note: string) => {
    try {
      await verificationService.addNote(requestId, note);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to add note:', err);
      throw err;
    }
  }, [refreshRequests]);

  const batchApprove = useCallback(async (requestIds: string[]) => {
    setIsSubmitting(true);
    try {
      await verificationService.batchApprove(requestIds);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to batch approve:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshRequests]);

  const batchReject = useCallback(async (requestIds: string[], reason: string) => {
    setIsSubmitting(true);
    try {
      await verificationService.batchReject(requestIds, reason);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to batch reject:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshRequests]);

  // Calculate stats
  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'pending');
    const approved = requests.filter((r) => r.status === 'approved');
    const rejected = requests.filter((r) => r.status === 'rejected');

    const byDocumentType: Record<DocumentType, number> = {
      id: 0,
      license: 0,
      insurance: 0,
      background_check: 0,
      vehicle_registration: 0,
      selfie: 0,
      business_permit: 0,
    };

    requests.forEach((req) => {
      req.documents.forEach((doc) => {
        if (byDocumentType[doc.type] !== undefined) {
          byDocumentType[doc.type]++;
        }
      });
    });

    return {
      totalPending: pending.length,
      totalApproved: approved.length,
      totalRejected: rejected.length,
      byDocumentType,
      riskDistribution: {
        low: pending.filter((r) => r.automatedScore >= 80).length,
        medium: pending.filter((r) => r.automatedScore >= 50 && r.automatedScore < 80).length,
        high: pending.filter((r) => r.automatedScore < 50).length,
      },
    };
  }, [requests]);

  return {
    // Data
    requests,
    selectedRequest,
    
    // Filters
    filters,
    setFilters,
    
    // Selection
    selectRequest,
    
    // Actions
    refreshRequests,
    submitReview,
    verifyDocument,
    rejectDocument,
    addNote,
    batchApprove,
    batchReject,
    
    // Stats
    stats,
    
    // Status
    isLoading,
    isSubmitting,
    error,
    lastUpdated,
  };
}

export default useVerifications;
