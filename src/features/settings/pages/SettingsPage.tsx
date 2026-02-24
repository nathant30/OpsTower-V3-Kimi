// src/features/settings/pages/SettingsPage.tsx
// System Settings - Tier Thresholds, Geofences, Configuration

import { useState } from 'react';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils/cn';
import { 
  Award,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  Save,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';

// Tier threshold configuration
const defaultTierThresholds = {
  BRONZE: { minTrips: 0, minRating: 0, maxCancellationRate: 100, earningsBonus: 0, minRevenuePerHour: 0 },
  SILVER: { minTrips: 50, minRating: 4.5, maxCancellationRate: 5, earningsBonus: 5, minRevenuePerHour: 200 },
  GOLD: { minTrips: 150, minRating: 4.7, maxCancellationRate: 3, earningsBonus: 10, minRevenuePerHour: 300 },
  PLATINUM: { minTrips: 500, minRating: 4.8, maxCancellationRate: 2, earningsBonus: 15, minRevenuePerHour: 400 },
};

// Geofence configuration
const defaultGeofences = [
  { id: '1', name: 'Main Hub - Makati', centerLat: 14.5547, centerLng: 121.0244, radiusMeters: 100, address: 'Makati CBD' },
  { id: '2', name: 'BGC Hub', centerLat: 14.5503, centerLng: 121.0485, radiusMeters: 100, address: 'Bonifacio Global City' },
  { id: '3', name: 'Ortigas Hub', centerLat: 14.5853, centerLng: 121.0614, radiusMeters: 100, address: 'Ortigas Center' },
];

// Shift configuration
const defaultShiftConfig = {
  earlyArrivalMinutes: 20,
  gracePeriodMinutes: 5,
  maxBreakMinutes: 30,
  maxBreaksPerShift: 2,
  geofenceRadiusMeters: 100,
  bondRequiredPercent: 100,
};

export default function SettingsPage() {
  const [tierThresholds, setTierThresholds] = useState(defaultTierThresholds);
  const [geofences] = useState(defaultGeofences);
  const [shiftConfig, setShiftConfig] = useState(defaultShiftConfig);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // In production, this would save to backend
    // Saving settings
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400">Configure tier thresholds, geofences, and system parameters</p>
        </div>
        {hasChanges && (
          <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={handleSave}>
            Save Changes
          </Button>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="tiers" className="space-y-4">
        <TabsList className="bg-[#12121a] border border-white/10">
          <TabsTrigger value="tiers">Driver Tiers</TabsTrigger>
          <TabsTrigger value="geofences">Geofences</TabsTrigger>
          <TabsTrigger value="shifts">Shift Rules</TabsTrigger>
          <TabsTrigger value="bonds">Bond Settings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Tier Settings */}
        <TabsContent value="tiers" className="space-y-4">
          <Card className="p-6 bg-[#12121a] border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Tier Thresholds</h3>
              <p className="text-sm text-gray-400 ml-auto">
                Based on 28-day rolling performance
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {Object.entries(tierThresholds).map(([tier, config]) => (
                <Card key={tier} className={cn(
                  "p-4 border",
                  tier === 'BRONZE' && "border-amber-700/50 bg-amber-900/10",
                  tier === 'SILVER' && "border-gray-500/50 bg-gray-500/10",
                  tier === 'GOLD' && "border-yellow-500/50 bg-yellow-500/10",
                  tier === 'PLATINUM' && "border-cyan-400/50 bg-cyan-400/10",
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={cn(
                      "text-lg font-bold",
                      tier === 'BRONZE' && "text-amber-600",
                      tier === 'SILVER' && "text-gray-300",
                      tier === 'GOLD' && "text-yellow-400",
                      tier === 'PLATINUM' && "text-cyan-400",
                    )}>
                      {tier}
                    </h4>
                    <Badge variant="default" className="bg-white/10">
                      +{config.earningsBonus}% Bonus
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <SettingInput
                      label="Min Trips (28 days)"
                      value={config.minTrips}
                      onChange={(v) => {
                        setTierThresholds({
                          ...tierThresholds,
                          [tier]: { ...config, minTrips: parseInt(v) || 0 }
                        });
                        setHasChanges(true);
                      }}
                    />
                    <SettingInput
                      label="Min Rating"
                      value={config.minRating}
                      step="0.1"
                      onChange={(v) => {
                        setTierThresholds({
                          ...tierThresholds,
                          [tier]: { ...config, minRating: parseFloat(v) || 0 }
                        });
                        setHasChanges(true);
                      }}
                    />
                    <SettingInput
                      label="Max Cancellation Rate (%)"
                      value={config.maxCancellationRate}
                      onChange={(v) => {
                        setTierThresholds({
                          ...tierThresholds,
                          [tier]: { ...config, maxCancellationRate: parseFloat(v) || 0 }
                        });
                        setHasChanges(true);
                      }}
                    />
                    <SettingInput
                      label="Min Revenue/Hour (₱)"
                      value={config.minRevenuePerHour}
                      onChange={(v) => {
                        setTierThresholds({
                          ...tierThresholds,
                          [tier]: { ...config, minRevenuePerHour: parseFloat(v) || 0 }
                        });
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Geofence Settings */}
        <TabsContent value="geofences" className="space-y-4">
          <Card className="p-6 bg-[#12121a] border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Geofence Locations</h3>
              </div>
              <Button variant="secondary" icon={<Plus className="w-4 h-4" />}>
                Add Geofence
              </Button>
            </div>

            <div className="space-y-3">
              {geofences.map((geo) => (
                <div key={geo.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{geo.name}</p>
                      <p className="text-xs text-gray-400">{geo.address}</p>
                      <p className="text-xs text-gray-500">
                        Lat: {geo.centerLat}, Lng: {geo.centerLng}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="default" className="bg-white/10">
                      Radius: {geo.radiusMeters}m
                    </Badge>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Shift Settings */}
        <TabsContent value="shifts" className="space-y-4">
          <Card className="p-6 bg-[#12121a] border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Shift Rules</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <SettingInput
                label="Early Arrival Requirement (minutes)"
                value={shiftConfig.earlyArrivalMinutes}
                onChange={(v) => {
                  setShiftConfig({ ...shiftConfig, earlyArrivalMinutes: parseInt(v) || 0 });
                  setHasChanges(true);
                }}
                helper="Drivers must arrive this many minutes before shift start"
              />
              <SettingInput
                label="Grace Period (minutes)"
                value={shiftConfig.gracePeriodMinutes}
                onChange={(v) => {
                  setShiftConfig({ ...shiftConfig, gracePeriodMinutes: parseInt(v) || 0 });
                  setHasChanges(true);
                }}
                helper="Additional grace period before marking as late"
              />
              <SettingInput
                label="Max Break Minutes per Shift"
                value={shiftConfig.maxBreakMinutes}
                onChange={(v) => {
                  setShiftConfig({ ...shiftConfig, maxBreakMinutes: parseInt(v) || 0 });
                  setHasChanges(true);
                }}
                helper="Maximum total break time allowed"
              />
              <SettingInput
                label="Max Breaks per Shift"
                value={shiftConfig.maxBreaksPerShift}
                onChange={(v) => {
                  setShiftConfig({ ...shiftConfig, maxBreaksPerShift: parseInt(v) || 0 });
                  setHasChanges(true);
                }}
                helper="Maximum number of breaks allowed"
              />
              <SettingInput
                label="Geofence Radius (meters)"
                value={shiftConfig.geofenceRadiusMeters}
                onChange={(v) => {
                  setShiftConfig({ ...shiftConfig, geofenceRadiusMeters: parseInt(v) || 0 });
                  setHasChanges(true);
                }}
                helper="Required distance from hub for clock in/out"
              />
            </div>
          </Card>
        </TabsContent>

        {/* Bond Settings */}
        <TabsContent value="bonds" className="space-y-4">
          <Card className="p-6 bg-[#12121a] border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Bond Settings</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <SettingInput
                label="Required Bond Percentage (%)"
                value={shiftConfig.bondRequiredPercent}
                onChange={(v) => {
                  setShiftConfig({ ...shiftConfig, bondRequiredPercent: parseInt(v) || 0 });
                  setHasChanges(true);
                }}
                helper="Percentage of required bond needed to start shift"
              />
              <Card className="p-4 bg-white/5 border-white/10">
                <h4 className="text-sm font-medium text-white mb-2">Bond Requirements by Vehicle Type</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">2-Wheeler (TWG)</span>
                    <span className="text-white">₱5,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">4-Wheeler (TNVS)</span>
                    <span className="text-white">₱10,000</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-400">
                <strong>Bond Lock:</strong> Drivers cannot start shifts unless their bond balance is at {shiftConfig.bondRequiredPercent}% or higher of the required amount.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="p-6 bg-[#12121a] border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Payment Providers</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-bold">Maya</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Maya (PayMaya)</p>
                    <p className="text-xs text-gray-400">Status: Active</p>
                  </div>
                </div>
                <Badge variant="active">Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-bold">GCash</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">GCash via EBANX</p>
                    <p className="text-xs text-gray-400">Status: Active</p>
                  </div>
                </div>
                <Badge variant="active">Connected</Badge>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Smart Routing Rules</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Amounts &gt; ₱1,000: Route to Maya</li>
                <li>• Amounts ≤ ₱1,000: Route to GCash</li>
                <li>• Fallback to alternative provider on failure</li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Components
function SettingInput({ 
  label, 
  value, 
  onChange, 
  step = "1",
  helper
}: { 
  label: string; 
  value: number; 
  onChange: (value: string) => void;
  step?: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
      />
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  );
}
