/**
 * Emergency Panel Component
 * Displays active emergency responses with action buttons
 */

import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Phone,
  MapPin,
  Navigation,
  AlertTriangle,
  Siren,
  Ambulance,
  Shield,
  Flame,
  Wrench,
  Clock,
  CheckCircle,
  X,
} from 'lucide-react';
import { useEmergencyResponses, useDispatchEmergency } from '../hooks/useSafety';
import type { EmergencyType } from '@/services/safety/safety.service';

interface EmergencyPanelProps {
  onViewOnMap?: (lat: number, lng: number) => void;
}

const emergencyTypeConfig: Record<EmergencyType, { icon: React.ElementType; label: string; color: string; bgColor: string }> = {
  police: { icon: Shield, label: 'Police', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  medical: { icon: Ambulance, label: 'Medical', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  fire: { icon: Flame, label: 'Fire Dept', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  tow: { icon: Wrench, label: 'Tow Truck', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  security: { icon: Siren, label: 'Security', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
};

const statusConfig = {
  dispatched: { variant: 'warning' as const, label: 'Dispatched' },
  en_route: { variant: 'alert' as const, label: 'En Route' },
  on_scene: { variant: 'active' as const, label: 'On Scene' },
  resolved: { variant: 'default' as const, label: 'Resolved' },
};

export function EmergencyPanel({ onViewOnMap }: EmergencyPanelProps) {
  const { data: responses = [], isLoading } = useEmergencyResponses();
  const dispatchMutation = useDispatchEmergency();
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const activeResponses = responses.filter(r => r.status !== 'resolved');

  const handleDispatch = async (type: EmergencyType) => {
    if (!selectedIncident) return;
    try {
      await dispatchMutation.mutateAsync({ incidentId: selectedIncident, type });
      setShowDispatchModal(false);
      setSelectedIncident(null);
    } catch (error) {
      console.error('Failed to dispatch emergency:', error);
    }
  };

  if (isLoading) {
    return (
      <XpressCard title="Emergency Response" icon={<Siren className="w-5 h-5" />}>
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto" />
          <p className="text-gray-500 mt-3">Loading emergency responses...</p>
        </div>
      </XpressCard>
    );
  }

  return (
    <>
      <XpressCard
        title="Emergency Response"
        icon={<Siren className="w-5 h-5" />}
        badge={activeResponses.length > 0 ? `${activeResponses.length} Active` : undefined}
        badgeVariant={activeResponses.length > 0 ? 'alert' : 'success'}
      >
        <div className="p-4">
          {/* Quick Dispatch Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {(Object.keys(emergencyTypeConfig) as EmergencyType[]).map((type) => {
              const config = emergencyTypeConfig[type];
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedIncident('new');
                    setShowDispatchModal(true);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl ${config.bgColor} hover:opacity-80 transition-opacity border border-white/10`}
                >
                  <Icon className={`w-5 h-5 ${config.color} mb-1`} />
                  <span className={`text-xs ${config.color} font-medium`}>{config.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Responses */}
          {activeResponses.length === 0 ? (
            <div className="text-center py-8 bg-[#0f0f14] rounded-xl border border-white/5">
              <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
              <p className="text-gray-400">No active emergency responses</p>
              <p className="text-sm text-gray-600 mt-1">All incidents have been resolved</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeResponses.map((response) => {
                const config = emergencyTypeConfig[response.type];
                const status = statusConfig[response.status];
                const Icon = config.icon;

                return (
                  <div
                    key={response.id}
                    className="p-4 bg-[#0f0f14] rounded-xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          <p className="text-white font-medium">{response.responderName || 'Team Dispatched'}</p>
                          {response.estimatedArrival && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <Clock className="w-3.5 h-3.5" />
                              ETA {response.estimatedArrival} min
                            </div>
                          )}
                          {response.notes && (
                            <p className="text-sm text-gray-500 mt-1">{response.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {response.responderContact && (
                          <a
                            href={`tel:${response.responderContact}`}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => onViewOnMap?.(14.5547, 121.0244)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Emergency Hotline */}
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-400 font-medium">Emergency Hotline</p>
                <p className="text-2xl font-bold text-white">911</p>
              </div>
              <a
                href="tel:911"
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </XpressCard>

      {/* Dispatch Modal */}
      <Modal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        title="Dispatch Emergency Services"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            Select the type of emergency service to dispatch to the incident location.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(emergencyTypeConfig) as EmergencyType[]).map((type) => {
              const config = emergencyTypeConfig[type];
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => handleDispatch(type)}
                  disabled={dispatchMutation.isPending}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl ${config.bgColor} hover:opacity-80 transition-all border border-white/10 disabled:opacity-50`}
                >
                  <Icon className={`w-6 h-6 ${config.color} mb-2`} />
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setShowDispatchModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default EmergencyPanel;
