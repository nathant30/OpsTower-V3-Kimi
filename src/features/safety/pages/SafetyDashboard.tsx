/**
 * Safety Dashboard Page
 * Complete safety monitoring with incidents, metrics, and emergency response
 */

import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Siren,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  Siren as Sos,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  useSafetyMetrics,
  useSafetyIncidents,
  useDriverRankings,
  useSafetyAlerts,
  useSOSEvents,
  useAcknowledgeIncident,
  useResolveIncident,
  type SafetyIncident,
} from '../hooks/useSafety';
import { SafetyIncidentCard } from '../components/SafetyIncidentCard';
import { EmergencyPanel } from '../components/EmergencyPanel';

// Severity badge configuration
const getSeverityVariant = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'alert';
    case 'high':
      return 'warning';
    case 'medium':
      return 'busy';
    case 'low':
      return 'active';
    default:
      return 'default';
  }
};

// Status badge configuration
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'reported':
      return 'warning';
    case 'responding':
      return 'alert';
    case 'resolved':
    case 'closed':
      return 'active';
    default:
      return 'default';
  }
};

// Safety score color
const getSafetyScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 75) return 'text-blue-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

// Safety score background
const getSafetyScoreBg = (score: number) => {
  if (score >= 90) return 'bg-green-500/20';
  if (score >= 75) return 'bg-blue-500/20';
  if (score >= 60) return 'bg-yellow-500/20';
  return 'bg-red-500/20';
};

// Type labels
const incidentTypeLabels: Record<string, string> = {
  emergency: 'Emergency',
  accident: 'Accident',
  harassment: 'Harassment',
  panic_button: 'Panic Button',
  speeding: 'Speeding',
  route_deviation: 'Route Deviation',
  unsafe_driving: 'Unsafe Driving',
  vehicle_malfunction: 'Vehicle Malfunction',
  medical: 'Medical',
  security: 'Security',
  other: 'Other',
};

const SafetyDashboard = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Data hooks
  const { data: metrics, isLoading: metricsLoading } = useSafetyMetrics();
  const { data: incidents = [], isLoading: incidentsLoading } = useSafetyIncidents();
  const { data: rankings = [], isLoading: rankingsLoading } = useDriverRankings(5);
  const { data: alerts = [], isLoading: alertsLoading } = useSafetyAlerts();
  const { data: sosEvents = [], isLoading: sosLoading } = useSOSEvents({ limit: 5 });

  // Mutations
  const acknowledgeMutation = useAcknowledgeIncident();
  const resolveMutation = useResolveIncident();

  // Active incidents count
  const activeIncidents = incidents.filter(i => 
    i.status === 'reported' || i.status === 'acknowledged' || i.status === 'responding'
  );

  // Critical/High incidents
  const criticalIncidents = incidents.filter(i => 
    (i.severity === 'critical' || i.severity === 'high') && 
    i.status !== 'resolved' && i.status !== 'closed'
  );

  // Chart data preparation
  const incidentsByTypeData = metrics ? Object.entries(metrics.incidentsByType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      name: incidentTypeLabels[type] || type,
      value: count,
    })) : [];

  const incidentsOverTimeData = metrics?.incidentsOverTime || [];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#3b82f6', '#10b981', '#6b7280'];

  // Handlers
  const handleAcknowledge = async (id: string) => {
    await acknowledgeMutation.mutateAsync(id);
  };

  const handleResolve = async (id: string) => {
    await resolveMutation.mutateAsync({ id });
  };

  // KPI Cards Component
  const KpiCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Safety Score */}
      <XpressCard>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Safety Score</p>
              <p className={`text-3xl font-bold mt-1 ${getSafetyScoreColor(metrics?.overallScore || 0)}`}>
                {metricsLoading ? '-' : metrics?.overallScore}
              </p>
              <p className="text-xs text-gray-500 mt-1">out of 100</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${getSafetyScoreBg(metrics?.overallScore || 0)} flex items-center justify-center`}>
              <Shield className={`w-6 h-6 ${getSafetyScoreColor(metrics?.overallScore || 0)}`} />
            </div>
          </div>
        </div>
      </XpressCard>

      {/* Incidents Today */}
      <XpressCard>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Incidents Today</p>
              <p className="text-3xl font-bold text-white mt-1">
                {metricsLoading ? '-' : metrics?.incidentsToday}
              </p>
              <p className="text-xs text-red-400 mt-1">
                {criticalIncidents.length} critical/high priority
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </XpressCard>

      {/* Emergency Responses */}
      <XpressCard>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Emergencies</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {metricsLoading ? '-' : metrics?.activeEmergencies}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics?.resolvedToday} resolved today
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Siren className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </XpressCard>

      {/* Avg Response Time */}
      <XpressCard>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Response Time</p>
              <p className="text-3xl font-bold text-white mt-1">
                {metricsLoading ? '-' : `${metrics?.avgResponseTime}m`}
              </p>
              <p className="text-xs text-green-400 mt-1">Target: &lt;5 min</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </XpressCard>
    </div>
  );

  // Overview Tab Content
  const OverviewTab = () => (
    <div className="space-y-6">
      <KpiCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Safety Score Gauge */}
        <XpressCard title="Safety Score" icon={<Shield className="w-5 h-5" />}>
          <div className="p-6">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    className="text-gray-800"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 84}`}
                    strokeDashoffset={`${2 * Math.PI * 84 * (1 - (metrics?.overallScore || 0) / 100)}`}
                    className={getSafetyScoreColor(metrics?.overallScore || 0)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${getSafetyScoreColor(metrics?.overallScore || 0)}`}>
                    {metrics?.overallScore}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">Safety Score</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                <div className="text-center p-3 bg-[#0f0f14] rounded-lg">
                  <p className="text-2xl font-bold text-white">{metrics?.safetyViolations}</p>
                  <p className="text-xs text-gray-500">Violations</p>
                </div>
                <div className="text-center p-3 bg-[#0f0f14] rounded-lg">
                  <p className="text-2xl font-bold text-green-400">{metrics?.resolvedToday}</p>
                  <p className="text-xs text-gray-500">Resolved Today</p>
                </div>
              </div>
            </div>
          </div>
        </XpressCard>

        {/* Incidents by Type Chart */}
        <XpressCard title="Incidents by Type" icon={<AlertTriangle className="w-5 h-5" />} className="lg:col-span-2">
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={incidentsByTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incidentsByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </XpressCard>
      </div>

      {/* Active Incidents & Emergency Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Safety Incidents */}
        <XpressCard
          title="Recent Safety Incidents"
          icon={<AlertTriangle className="w-5 h-5" />}
          badge={activeIncidents.length > 0 ? `${activeIncidents.length} Active` : undefined}
          badgeVariant={activeIncidents.length > 0 ? 'alert' : 'default'}
        >
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {incidentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto" />
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
                <p className="text-gray-400">No incidents reported</p>
              </div>
            ) : (
              incidents.slice(0, 5).map((incident) => (
                <SafetyIncidentCard
                  key={incident.id}
                  incident={incident}
                  compact
                  onViewDetails={setSelectedIncident}
                />
              ))
            )}
          </div>
        </XpressCard>

        {/* Emergency Panel */}
        <EmergencyPanel />
      </div>
    </div>
  );

  // Incidents Tab Content
  const IncidentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">All Safety Incidents</h2>
        <div className="flex gap-2">
          <Badge variant="alert">{criticalIncidents.length} Critical/High</Badge>
          <Badge variant="warning">{activeIncidents.length} Active</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {incidentsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto" />
            <p className="text-gray-500 mt-3">Loading incidents...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12 bg-[#12121a] rounded-xl">
            <CheckCircle className="w-16 h-16 text-green-500/50 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No safety incidents found</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <SafetyIncidentCard
              key={incident.id}
              incident={incident}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              onViewDetails={setSelectedIncident}
            />
          ))
        )}
      </div>
    </div>
  );

  // Driver Rankings Tab Content
  const RankingsTab = () => (
    <div className="space-y-6">
      <XpressCard title="Driver Safety Rankings" icon={<User className="w-5 h-5" />}>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Rank</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Driver</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Safety Score</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Total Trips</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Incidents</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rankingsLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full mx-auto" />
                    </td>
                  </tr>
                ) : rankings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No rankings available
                    </td>
                  </tr>
                ) : (
                  rankings.map((driver) => (
                    <tr key={driver.driverId} className="hover:bg-white/5">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${
                          driver.ranking === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                          driver.ranking === 2 ? 'bg-gray-400/20 text-gray-300' :
                          driver.ranking === 3 ? 'bg-orange-600/20 text-orange-400' :
                          'bg-[#0f0f14] text-gray-400'
                        }`}>
                          {driver.ranking}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{driver.name}</p>
                          <p className="text-xs text-gray-500">{driver.driverId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-lg font-bold ${getSafetyScoreColor(driver.safetyScore)}`}>
                          {driver.safetyScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">{driver.totalTrips.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <span className="text-red-400">{driver.incidents} incidents</span>
                          <span className="text-orange-400">{driver.violations} violations</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {driver.trend === 'up' ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : driver.trend === 'down' ? (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        ) : (
                          <Minus className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </XpressCard>
    </div>
  );

  // Alerts Tab Content
  const AlertsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Safety Alerts */}
        <XpressCard title="Safety Alerts" icon={<Bell className="w-5 h-5" />}>
          <div className="p-4 space-y-3">
            {alertsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full mx-auto" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500/50" />
                <p>No active alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant={alert.type === 'critical' ? 'alert' : alert.type === 'warning' ? 'warning' : 'default'}>
                        {alert.type.toUpperCase()}
                      </Badge>
                      <h4 className="text-white font-medium mt-2">{alert.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </XpressCard>

        {/* SOS Event Log */}
        <XpressCard title="SOS/Emergency Button Log" icon={<Sos className="w-5 h-5" />}>
          <div className="p-4 space-y-3">
            {sosLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full mx-auto" />
              </div>
            ) : sosEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500/50" />
                <p>No SOS events recorded</p>
              </div>
            ) : (
              sosEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-[#0f0f14] rounded-xl border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant={event.status === 'active' ? 'alert' : event.status === 'resolved' ? 'active' : 'warning'}>
                        {event.status.toUpperCase().replace('_', ' ')}
                      </Badge>
                      <h4 className="text-white font-medium mt-2">{event.driverName}</h4>
                      <p className="text-sm text-gray-400">{event.location}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{new Date(event.triggeredAt).toLocaleString()}</span>
                        {event.responseTime && (
                          <span className="text-green-400">Response: {event.responseTime}m</span>
                        )}
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      event.status === 'active' ? 'bg-red-500/20' :
                      event.status === 'resolved' ? 'bg-green-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <Siren className={`w-5 h-5 ${
                        event.status === 'active' ? 'text-red-400' :
                        event.status === 'resolved' ? 'text-green-400' :
                        'text-yellow-400'
                      }`} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </XpressCard>
      </div>
    </div>
  );

  // Metrics Tab Content
  const MetricsTab = () => (
    <div className="space-y-6">
      <XpressCard title="Incidents Over Time" icon={<TrendingUp className="w-5 h-5" />}>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incidentsOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
                name="Incidents"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </XpressCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <XpressCard title="Incidents by Severity" icon={<AlertTriangle className="w-5 h-5" />}>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: 'Critical', count: incidents.filter(i => i.severity === 'critical').length, color: '#ef4444' },
                  { name: 'High', count: incidents.filter(i => i.severity === 'high').length, color: '#f97316' },
                  { name: 'Medium', count: incidents.filter(i => i.severity === 'medium').length, color: '#eab308' },
                  { name: 'Low', count: incidents.filter(i => i.severity === 'low').length, color: '#10b981' },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {[
                    { fill: '#ef4444' },
                    { fill: '#f97316' },
                    { fill: '#eab308' },
                    { fill: '#10b981' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </XpressCard>

        <XpressCard title="Response Time Analysis" icon={<Clock className="w-5 h-5" />}>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0f0f14] rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Average Response Time</p>
                  <p className="text-2xl font-bold text-white">{metrics?.avgResponseTime} minutes</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#0f0f14] rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Target Response Time</p>
                  <p className="text-2xl font-bold text-white">5 minutes</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#0f0f14] rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Performance</p>
                  <p className="text-2xl font-bold text-green-400">94%</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </XpressCard>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Safety Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor safety incidents, emergency responses, and safety metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {autoRefresh && (
            <Badge variant="active">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#12121a] border border-white/10 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="rankings" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Driver Rankings
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Siren className="w-4 h-4" />
            Alerts & SOS
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Metrics
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="incidents">
            <IncidentsTab />
          </TabsContent>
          <TabsContent value="rankings">
            <RankingsTab />
          </TabsContent>
          <TabsContent value="alerts">
            <AlertsTab />
          </TabsContent>
          <TabsContent value="metrics">
            <MetricsTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* Incident Detail Modal */}
      <Modal
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={`Incident ${selectedIncident?.id}`}
        size="lg"
      >
        {selectedIncident && (
          <div className="space-y-4">
            <SafetyIncidentCard
              incident={selectedIncident}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SafetyDashboard;
