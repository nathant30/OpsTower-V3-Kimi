/**
 * Dashcam Management Page
 * Comprehensive dashcam system management with device list, recordings, 
 * live view, health monitoring, and alert configuration
 */

import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDashcams } from '@/features/dashcam/hooks/useDashcams';
import { DeviceCard } from '@/features/dashcam/components/DeviceCard';
import { RecordingList } from '@/features/dashcam/components/RecordingList';
import { ConnectionStatus } from '@/features/dashcam/components/ConnectionStatus';
import {
  Video,
  Camera,
  Download,
  Play,
  MapPin,
  RefreshCw,
  AlertTriangle,
  HardDrive,
  Wifi,
  WifiOff,
  VideoOff,
  Activity,
  Settings,
  Search,
  Filter,
  Bell,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Car,
  User,
  Thermometer,
  Signal,
  Battery,
  Clock,
} from 'lucide-react';
import type { DashcamDevice, Recording } from '@/services/dashcam/dashcam.service';

// Simple Map Component (placeholder - would integrate with real map library)
function DeviceMap({ devices, onSelectDevice }: { devices: DashcamDevice[]; onSelectDevice: (device: DashcamDevice) => void }) {
  return (
    <div className="relative w-full h-full bg-[#0a0a0f] rounded-lg overflow-hidden">
      {/* Map Placeholder Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>
      
      {/* Grid Lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Device Markers */}
      {devices.map((device, index) => {
        // Simulate positions on the map
        const top = 20 + ((index * 17) % 60);
        const left = 15 + ((index * 23) % 70);
        
        return (
          <button
            key={device.id}
            onClick={() => onSelectDevice(device)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ top: `${top}%`, left: `${left}%` }}
          >
            <div className={`
              w-4 h-4 rounded-full border-2 transition-all duration-300
              ${device.status === 'online' ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50' : ''}
              ${device.status === 'offline' ? 'bg-gray-600 border-gray-500' : ''}
              ${device.status === 'error' ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50 animate-pulse' : ''}
              ${device.isRecording ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#0a0a0f]' : ''}
              group-hover:scale-150
            `} />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 whitespace-nowrap">
                <p className="text-xs font-medium text-white">{device.name}</p>
                <p className="text-xs text-gray-400">{device.vehicle.plateNumber}</p>
                <p className="text-xs text-gray-500">{device.location.address}</p>
              </div>
            </div>
          </button>
        );
      })}

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button variant="secondary" size="icon">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon">
          <ZoomIn className="w-4 h-4 rotate-180" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-gray-900/90 border border-gray-800 rounded-lg p-3">
        <p className="text-xs font-medium text-white mb-2">Status</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-400">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600" />
            <span className="text-xs text-gray-400">Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-gray-400">Error</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-orange-500" />
            <span className="text-xs text-gray-400">Recording</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashcamManagement() {
  const {
    devices,
    recordings,
    selectedDevice,
    deviceFilters,
    stats,
    isLoading,
    error,
    lastUpdated,
    setDeviceFilters,
    selectDevice,
    refreshDevices,
    downloadRecording,
    requestLiveView,
  } = useDashcams();

  const [activeTab, setActiveTab] = useState<'devices' | 'recordings' | 'map' | 'alerts'>('devices');
  const [liveViewDevice, setLiveViewDevice] = useState<DashcamDevice | null>(null);
  const [settingsDevice, setSettingsDevice] = useState<DashcamDevice | null>(null);
  const [showAlertConfig, setShowAlertConfig] = useState(false);

  const handleLiveView = async (device: DashcamDevice) => {
    setLiveViewDevice(device);
  };

  const handleSettings = (device: DashcamDevice) => {
    setSettingsDevice(device);
  };

  const getStatusIcon = (status: DashcamDevice['status']) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4" />;
      case 'offline':
        return <WifiOff className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0f0f14]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashcam data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-[#0f0f14]">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={refreshDevices}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }



  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-[#0f0f14]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-orange-500" />
            Dashcam Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor {stats.total} devices • Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAlertConfig(true)}>
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </Button>
          <Button variant="outline" size="sm" onClick={refreshDevices}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* API Connection Status */}
      <ConnectionStatus onStatusChange={(connected) => {
        if (connected) {
          refreshDevices();
        }
      }} />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <XpressCard>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total Devices</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </XpressCard>
        <XpressCard>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-green-400" /> Online
            </p>
            <p className="text-2xl font-bold text-green-400">{stats.online}</p>
          </div>
        </XpressCard>
        <XpressCard>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <WifiOff className="w-3 h-3 text-gray-400" /> Offline
            </p>
            <p className="text-2xl font-bold text-gray-400">{stats.offline}</p>
          </div>
        </XpressCard>
        <XpressCard>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Video className="w-3 h-3 text-orange-400" /> Recording
            </p>
            <p className="text-2xl font-bold text-orange-400">{stats.recording}</p>
          </div>
        </XpressCard>
        <XpressCard>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400" /> Errors
            </p>
            <p className="text-2xl font-bold text-red-400">{stats.error}</p>
          </div>
        </XpressCard>
        <XpressCard>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-blue-400" /> Storage
            </p>
            <p className="text-2xl font-bold text-blue-400">
              {Math.round((stats.storageUsed / stats.storageTotal) * 100)}%
            </p>
            <p className="text-xs text-gray-500">
              {stats.storageUsed.toFixed(1)} / {stats.storageTotal} GB
            </p>
          </div>
        </XpressCard>
      </div>

      {/* Main Content Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800">
        {[
          { id: 'devices', label: 'Devices', icon: Camera, count: devices.length },
          { id: 'recordings', label: 'Recordings', icon: Video, count: recordings.length },
          { id: 'map', label: 'Live Map', icon: MapPin },
          { id: 'alerts', label: 'Health & Alerts', icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-orange-500 border-orange-500'
                : 'text-gray-500 border-transparent hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-xs px-2 py-0.5 bg-gray-800 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          {/* Device Filters */}
          <XpressCard>
            <div className="p-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">Status:</span>
                <select
                  value={deviceFilters.status}
                  onChange={(e) => setDeviceFilters({ status: e.target.value as typeof deviceFilters.status })}
                  className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="all">All</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="recording">Recording</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search device, vehicle, or driver..."
                  value={deviceFilters.search}
                  onChange={(e) => setDeviceFilters({ search: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </XpressCard>

          {/* Devices Grid */}
          {devices.length === 0 ? (
            <XpressCard>
              <div className="p-8 text-center">
                <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No devices found</p>
              </div>
            </XpressCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onLiveView={handleLiveView}
                  onSettings={handleSettings}
                  selected={selectedDevice?.id === device.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recordings' && (
        <div className="space-y-4">
          <RecordingList
            recordings={recordings}
            onDownload={(recording) => downloadRecording(recording.id)}
            onPlay={(recording) => {/* Play recording: */ void recording}}
          />
        </div>
      )}

      {activeTab === 'map' && (
        <XpressCard className="h-[600px]">
          <div className="h-full p-4">
            <DeviceMap
              devices={devices}
              onSelectDevice={selectDevice}
            />
          </div>
        </XpressCard>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Health Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <XpressCard>
              <div className="p-4">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  Healthy Devices
                </h3>
                <p className="text-3xl font-bold text-green-400">
                  {devices.filter((d) => d.health.status === 'healthy').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">All systems operational</p>
              </div>
            </XpressCard>
            <XpressCard>
              <div className="p-4">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Warning
                </h3>
                <p className="text-3xl font-bold text-yellow-400">
                  {devices.filter((d) => d.health.status === 'warning').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Requires attention</p>
              </div>
            </XpressCard>
            <XpressCard>
              <div className="p-4">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <VideoOff className="w-4 h-4 text-red-400" />
                  Critical
                </h3>
                <p className="text-3xl font-bold text-red-400">
                  {devices.filter((d) => d.health.status === 'error').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Immediate action needed</p>
              </div>
            </XpressCard>
          </div>

          {/* Device Health Details */}
          <XpressCard>
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Device Health Monitor</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="p-4 bg-gray-900 border border-gray-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant={
                              device.health.status === 'healthy'
                                ? 'success'
                                : device.health.status === 'warning'
                                ? 'warning'
                                : 'alert'
                            }
                          >
                            {device.health.status.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-white">{device.name}</span>
                          <span className="text-sm text-gray-500">{device.vehicle.plateNumber}</span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Battery className="w-4 h-4 text-gray-500" />
                            <span className={device.health.batteryLevel && device.health.batteryLevel < 30 ? 'text-red-400' : 'text-gray-400'}>
                              {device.health.batteryLevel}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Signal className="w-4 h-4 text-gray-500" />
                            <span className={device.health.signalStrength && device.health.signalStrength < 50 ? 'text-yellow-400' : 'text-gray-400'}>
                              {device.health.signalStrength}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-gray-500" />
                            <span className={device.health.temperature && device.health.temperature > 60 ? 'text-red-400' : 'text-gray-400'}>
                              {device.health.temperature}°C
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-400">
                              {new Date(device.lastSeen).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        {device.health.issues.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {device.health.issues.map((issue, idx) => (
                              <p key={idx} className="text-xs text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {issue}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </XpressCard>
        </div>
      )}

      {/* Live View Modal */}
      <Modal
        isOpen={!!liveViewDevice}
        onClose={() => setLiveViewDevice(null)}
        title={liveViewDevice ? `Live View - ${liveViewDevice.name}` : 'Live View'}
        size="xl"
      >
        {liveViewDevice && (
          <div className="space-y-4">
            {/* Video Stream Placeholder */}
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative">
              <div className="text-center">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Live stream would appear here</p>
                <p className="text-sm text-gray-500 mt-1">{liveViewDevice.model} • Channel 1</p>
              </div>
              
              {/* Live Indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-white">LIVE</span>
              </div>
              
              {/* Device Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="bg-black/70 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-white">
                      <Car className="w-3 h-3" />
                      {liveViewDevice.vehicle.plateNumber}
                    </span>
                    <span className="flex items-center gap-1 text-white">
                      <User className="w-3 h-3" />
                      {liveViewDevice.driver.name}
                    </span>
                    <span className="text-gray-400">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Snapshot
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Channel:</span>
                <select className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-sm text-white">
                  <option>Channel 1 (Front)</option>
                  <option>Channel 2 (Interior)</option>
                  <option>Channel 3 (Rear)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Device Settings Modal */}
      <Modal
        isOpen={!!settingsDevice}
        onClose={() => setSettingsDevice(null)}
        title={settingsDevice ? `Settings - ${settingsDevice.name}` : 'Device Settings'}
        size="lg"
      >
        {settingsDevice && (
          <div className="space-y-6">
            {/* Device Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Model</p>
                <p className="text-sm text-white">{settingsDevice.model}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Serial Number</p>
                <p className="text-sm text-white">{settingsDevice.serialNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Firmware</p>
                <p className="text-sm text-white">{settingsDevice.firmware}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Vehicle</p>
                <p className="text-sm text-white">{settingsDevice.vehicle.plateNumber}</p>
              </div>
            </div>

            {/* Recording Settings */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Recording Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Resolution</span>
                  <select
                    defaultValue={settingsDevice.settings.resolution}
                    className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="1440p">1440p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Frame Rate</span>
                  <select
                    defaultValue={settingsDevice.settings.frameRate}
                    className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white"
                  >
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Recording Mode</span>
                  <select
                    defaultValue={settingsDevice.settings.recordingMode}
                    className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white"
                  >
                    <option value="continuous">Continuous</option>
                    <option value="event">Event Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Features</h4>
              <div className="space-y-2">
                {[
                  { key: 'audioEnabled', label: 'Audio Recording' },
                  { key: 'gpsEnabled', label: 'GPS Tracking' },
                  { key: 'nightVision', label: 'Night Vision' },
                  { key: 'motionDetection', label: 'Motion Detection' },
                  { key: 'parkingMode', label: 'Parking Mode' },
                ].map((feature) => (
                  <label key={feature.key} className="flex items-center justify-between p-2 hover:bg-gray-900 rounded cursor-pointer">
                    <span className="text-sm text-gray-400">{feature.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={settingsDevice.settings[feature.key as keyof typeof settingsDevice.settings] as boolean}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-800">
              <Button variant="outline" className="flex-1" onClick={() => setSettingsDevice(null)}>
                Cancel
              </Button>
              <Button className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Alert Configuration Modal */}
      <Modal
        isOpen={showAlertConfig}
        onClose={() => setShowAlertConfig(false)}
        title="Alert Configuration"
        size="lg"
      >
        <div className="space-y-4">
          {[
            {
              type: 'Device Offline',
              description: 'Alert when device goes offline for specified time',
              threshold: '30 minutes',
              enabled: true,
            },
            {
              type: 'Storage Full',
              description: 'Alert when storage capacity is critical',
              threshold: '90% full',
              enabled: true,
            },
            {
              type: 'Health Issue',
              description: 'Alert on device health problems',
              threshold: 'Any issue',
              enabled: true,
            },
            {
              type: 'Geofence Exit',
              description: 'Alert when vehicle leaves designated area',
              threshold: 'Immediate',
              enabled: false,
            },
          ].map((alert, idx) => (
            <div key={idx} className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">{alert.type}</h4>
                  <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Threshold: {alert.threshold}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={alert.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>
            </div>
          ))}
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowAlertConfig(false)}>
              Cancel
            </Button>
            <Button className="flex-1">
              <Bell className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
