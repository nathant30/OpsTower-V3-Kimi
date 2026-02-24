import { useState, useEffect } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { Badge } from '@/components/ui/Badge';
import { KpiRibbon } from '../components/KpiRibbon';
import { ActivityFeed } from '../components/ActivityFeed';
import { AlertPanel } from '../components/AlertPanel';
import {
  useCommandCenter,
  useAcknowledgeAlert,
  useResolveAlert,
  useSendBroadcast,
  useTriggerEmergency,
  useEndEmergency,
  useAutoDispatch,
} from '../hooks/useCommand';
import {
  Activity,
  Navigation,
  AlertTriangle,
  Radio,
  ShieldAlert,
  Wrench,
  Zap,
  RefreshCw,
  Settings,
  Globe,
  Clock,
  Server,
  Wifi,
  WifiOff,
  Volume2,
  Car,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============ Mini Map Component ============

function MiniMap({ zones }: { zones?: Array<{ id: string; name: string; demandLevel: string; activeOrders: number; availableDrivers: number }> }) {
  return (
    <div className="relative h-full min-h-[200px] bg-[#0a0a0f] rounded-lg overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Zone Indicators */}
      <div className="absolute inset-0 p-4">
        {zones?.slice(0, 4).map((zone, index) => {
          const positions = [
            { top: '15%', left: '20%' },
            { top: '25%', left: '60%' },
            { top: '55%', left: '30%' },
            { top: '65%', left: '70%' },
          ];
          const pos = positions[index] || { top: '50%', left: '50%' };
          const demandColors: Record<string, string> = {
            critical: 'bg-red-500 shadow-red-500/50',
            high: 'bg-amber-500 shadow-amber-500/50',
            medium: 'bg-blue-500 shadow-blue-500/50',
            low: 'bg-green-500 shadow-green-500/50',
          };
          
          return (
            <div
              key={zone.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className={cn(
                "w-4 h-4 rounded-full animate-pulse shadow-lg",
                demandColors[zone.demandLevel] || demandColors.medium
              )} />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 whitespace-nowrap">
                  <p className="text-xs font-medium text-white">{zone.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {zone.activeOrders} orders • {zone.availableDrivers} drivers
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Critical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Med
            </span>
          </div>
          <span>{zones?.length || 0} zones monitored</span>
        </div>
      </div>
    </div>
  );
}

// ============ Performance Gauge Component ============

function PerformanceGauge({ 
  value, 
  label, 
  color = 'blue',
  icon: Icon,
  subtext,
}: { 
  value: number; 
  label: string; 
  color?: 'green' | 'blue' | 'amber' | 'red';
  icon: React.ElementType;
  subtext?: string;
}) {
  const colors = {
    green: 'text-green-400 stroke-green-400',
    blue: 'text-blue-400 stroke-blue-400',
    amber: 'text-amber-400 stroke-amber-400',
    red: 'text-red-400 stroke-red-400',
  };

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colors[color]}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-lg font-bold", colors[color].split(' ')[0])}>
            {value}%
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", colors[color].split(' ')[0])} />
          <p className="text-sm font-medium text-white">{label}</p>
        </div>
        {subtext && <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

// ============ Quick Actions Panel ============

function QuickActionsPanel({
  onBroadcast,
  onEmergency,
  onMaintenance,
  isEmergency,
}: {
  onBroadcast: () => void;
  onEmergency: () => void;
  onMaintenance: () => void;
  isEmergency: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <XpressButton
        variant="secondary"
        onClick={onBroadcast}
        icon={<Radio className="w-4 h-4" />}
        className="h-auto py-3 flex-col"
      >
        <span className="text-xs mt-1">Broadcast</span>
      </XpressButton>

      <XpressButton
        variant={isEmergency ? 'danger' : 'secondary'}
        onClick={onEmergency}
        icon={<ShieldAlert className="w-4 h-4" />}
        className="h-auto py-3 flex-col"
      >
        <span className="text-xs mt-1">{isEmergency ? 'End Emergency' : 'Emergency'}</span>
      </XpressButton>

      <XpressButton
        variant="secondary"
        onClick={onMaintenance}
        icon={<Wrench className="w-4 h-4" />}
        className="h-auto py-3 flex-col"
      >
        <span className="text-xs mt-1">Maintenance</span>
      </XpressButton>
    </div>
  );
}

// ============ System Health Panel ============

function SystemHealthPanel({ 
  health, 
  services 
}: { 
  health: number; 
  services: Array<{ name: string; status: 'healthy' | 'degraded' | 'down'; latency: number }>;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Wifi className="w-3 h-3 text-green-400" />;
      case 'degraded': return <Wifi className="w-3 h-3 text-amber-400" />;
      case 'down': return <WifiOff className="w-3 h-3 text-red-400" />;
      default: return <Wifi className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <PerformanceGauge
        value={health}
        label="System Health"
        color={health > 90 ? 'green' : health > 70 ? 'blue' : health > 50 ? 'amber' : 'red'}
        icon={Server}
        subtext={`${services.filter(s => s.status === 'healthy').length}/${services.length} services healthy`}
      />

      <div className="space-y-2">
        {services.slice(0, 4).map((service) => (
          <div key={service.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-900/50">
            <div className="flex items-center gap-2">
              {getStatusIcon(service.status)}
              <span className="text-xs text-gray-300">{service.name}</span>
            </div>
            <span className={cn(
              "text-xs font-medium",
              service.latency < 100 ? "text-green-400" : 
              service.latency < 500 ? "text-amber-400" : "text-red-400"
            )}>
              {service.latency}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Main Command Center Component ============

const CommandCenter = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'drivers' | 'operations'>('all');

  const { kpis, alerts, criticalAlerts, activityFeed, zones, systemStatus, isLoading } = useCommandCenter();
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();
  const sendBroadcast = useSendBroadcast();
  const autoDispatch = useAutoDispatch();
  const triggerEmergency = useTriggerEmergency();
  const endEmergency = useEndEmergency();

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlert.mutate({ alertId, userId: 'current-user' });
  };

  const handleResolveAlert = (alertId: string) => {
    resolveAlert.mutate({ alertId, resolution: 'Resolved via Command Center' });
  };

  const handleSendBroadcast = () => {
    if (broadcastMessage.trim()) {
      sendBroadcast.mutate({
        message: broadcastMessage,
        target: broadcastTarget,
        priority: 'high',
      });
      setBroadcastMessage('');
      setShowBroadcastModal(false);
    }
  };

  const handleEmergencyToggle = () => {
    if (systemStatus.data?.mode === 'emergency') {
      endEmergency.mutate();
    } else {
      triggerEmergency.mutate('Manually triggered from Command Center');
    }
  };

  const isEmergency = systemStatus.data?.mode === 'emergency';

  return (
    <div className="min-h-screen bg-[#0f0f14] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0f0f14]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0f0f14]/80 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Activity className="w-7 h-7 text-orange-500" />
                Command Center
                {isEmergency && (
                  <Badge variant="alert" className="animate-pulse">
                    EMERGENCY MODE
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time operations overview and control dashboard
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Last Update */}
              <div className="text-right">
                <div className="text-xs text-gray-500">Last Update</div>
                <div className="text-sm text-white font-medium flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {lastUpdate.toLocaleTimeString()}
                </div>
              </div>

              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "p-2.5 rounded-lg transition-all flex items-center gap-2",
                  autoRefresh 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                )}
              >
                <RefreshCw className={cn("w-4 h-4", autoRefresh && 'animate-spin')} />
                <span className="text-xs font-medium">{autoRefresh ? 'Live' : 'Paused'}</span>
              </button>

              {/* Settings */}
              <button className="p-2.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* KPI Ribbon */}
          <KpiRibbon kpis={kpis.data} isLoading={kpis.isLoading} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* Left Column - Activity & Alerts */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            {/* Activity Feed */}
            <div className="flex-1 min-h-[400px]">
              <ActivityFeed 
                activities={activityFeed.data} 
                isLoading={activityFeed.isLoading}
                maxItems={20}
              />
            </div>
          </div>

          {/* Middle Column - Maps, Gauges, Quick Actions */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            {/* Mini Maps - High Activity Zones */}
            <XpressCard
              title="High Activity Zones"
              subtitle="Real-time demand monitoring"
              badge="Live"
              badgeVariant="success"
              icon={<Globe className="w-5 h-5 text-orange-500" />}
            >
              <MiniMap zones={zones.data} />
            </XpressCard>

            {/* Performance Gauges */}
            <div className="grid grid-cols-2 gap-4">
              <XpressCard title="Fleet Utilization" className="h-full">
                <PerformanceGauge
                  value={kpis.data?.fleetUtilization ?? 78}
                  label="Utilization"
                  color={kpis.data && kpis.data.fleetUtilization > 80 ? 'green' : kpis.data && kpis.data.fleetUtilization > 60 ? 'blue' : 'amber'}
                  icon={Car}
                  subtext={`${kpis.data?.onlineDrivers ?? 0} active drivers`}
                />
              </XpressCard>

              <XpressCard title="System Health" className="h-full">
                <SystemHealthPanel
                  health={systemStatus.data?.health ?? 96}
                  services={systemStatus.data?.services ?? []}
                />
              </XpressCard>
            </div>

            {/* Quick Actions */}
            <XpressCard
              title="Quick Actions"
              subtitle="Immediate operational controls"
              icon={<Zap className="w-5 h-5 text-orange-500" />}
            >
              <QuickActionsPanel
                onBroadcast={() => setShowBroadcastModal(true)}
                onEmergency={handleEmergencyToggle}
                onMaintenance={() => {}}
                isEmergency={isEmergency}
              />
            </XpressCard>
          </div>

          {/* Right Column - Alerts */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Critical Alerts Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/5 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Critical</span>
                </div>
                <p className="text-3xl font-bold text-white">{criticalAlerts.data?.length ?? 0}</p>
                <p className="text-xs text-gray-400 mt-1">Require immediate action</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Active</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {alerts.data?.filter(a => a.status === 'active').length ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">Pending alerts</p>
              </div>
            </div>

            {/* Alert Panel */}
            <div className="flex-1 min-h-[500px]">
              <AlertPanel
                alerts={alerts.data}
                isLoading={alerts.isLoading}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                maxItems={15}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-orange-500" />
              Send Broadcast Message
            </h3>
            
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter your message..."
              className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            
            <div className="mt-4">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Target</label>
              <div className="flex gap-2">
                {(['all', 'drivers', 'operations'] as const).map((target) => (
                  <button
                    key={target}
                    onClick={() => setBroadcastTarget(target)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                      broadcastTarget === target
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    )}
                  >
                    {target}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <XpressButton
                variant="secondary"
                fullWidth
                onClick={() => setShowBroadcastModal(false)}
              >
                Cancel
              </XpressButton>
              <XpressButton
                variant="primary"
                fullWidth
                onClick={handleSendBroadcast}
                disabled={!broadcastMessage.trim()}
                icon={<Volume2 className="w-4 h-4" />}
              >
                Send Broadcast
              </XpressButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandCenter;
