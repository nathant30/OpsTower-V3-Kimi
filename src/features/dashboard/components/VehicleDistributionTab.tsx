import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { Car, ChevronRight, Truck, Bike, Navigation } from 'lucide-react';

interface VehicleDistributionTabProps {
  serviceType?: string;
}

interface VehicleType {
  type: string;
  count: number;
  color: string;
  percent: number;
  icon: React.ReactNode;
  status: 'active' | 'maintenance' | 'offline';
}

// Vehicle data by service type
const vehicleDataByService: Record<string, VehicleType[]> = {
  'All': [
    { type: 'Toyota RAV4 Hybrid', count: 234, color: 'bg-blue-500', percent: 45, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Honda City', count: 189, color: 'bg-green-500', percent: 35, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Moto Courier', count: 156, color: 'bg-amber-500', percent: 25, icon: <Bike className="w-4 h-4" />, status: 'active' },
    { type: 'Delivery Van', count: 89, color: 'bg-purple-500', percent: 15, icon: <Truck className="w-4 h-4" />, status: 'maintenance' },
    { type: 'Compact SUV', count: 67, color: 'bg-cyan-500', percent: 12, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Electric Scooter', count: 45, color: 'bg-emerald-500', percent: 8, icon: <Navigation className="w-4 h-4" />, status: 'offline' },
  ],
  'TNVS': [
    { type: 'Toyota RAV4 Hybrid', count: 156, color: 'bg-blue-500', percent: 55, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Honda City', count: 98, color: 'bg-green-500', percent: 35, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Compact SUV', count: 45, color: 'bg-cyan-500', percent: 15, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Nissan Altima', count: 28, color: 'bg-purple-500', percent: 10, icon: <Car className="w-4 h-4" />, status: 'maintenance' },
  ],
  'TWG': [
    { type: 'Honda City', count: 124, color: 'bg-green-500', percent: 50, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Toyota Vios', count: 89, color: 'bg-blue-500', percent: 35, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Mitsubishi Mirage', count: 45, color: 'bg-amber-500', percent: 18, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Suzuki Swift', count: 23, color: 'bg-cyan-500', percent: 9, icon: <Car className="w-4 h-4" />, status: 'offline' },
  ],
  '2W Salary': [
    { type: 'Moto Courier', count: 89, color: 'bg-amber-500', percent: 60, icon: <Bike className="w-4 h-4" />, status: 'active' },
    { type: 'Yamaha Mio', count: 34, color: 'bg-blue-500', percent: 23, icon: <Bike className="w-4 h-4" />, status: 'active' },
    { type: 'Honda Beat', count: 23, color: 'bg-green-500', percent: 15, icon: <Bike className="w-4 h-4" />, status: 'maintenance' },
  ],
  '4W Salary': [
    { type: 'Toyota Vios', count: 34, color: 'bg-blue-500', percent: 45, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Honda City', count: 23, color: 'bg-green-500', percent: 30, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Mitsubishi Lancer', count: 12, color: 'bg-purple-500', percent: 15, icon: <Car className="w-4 h-4" />, status: 'maintenance' },
  ],
  '4W Taxi': [
    { type: 'Toyota Innova', count: 12, color: 'bg-blue-500', percent: 55, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Nissan Urvan', count: 6, color: 'bg-green-500', percent: 28, icon: <Car className="w-4 h-4" />, status: 'active' },
    { type: 'Hyundai Starex', count: 4, color: 'bg-amber-500', percent: 17, icon: <Car className="w-4 h-4" />, status: 'offline' },
  ],
};

// Summary stats by service type
const summaryStatsByService: Record<string, { active: number; maintenance: number; offline: number }> = {
  'All': { active: 780, maintenance: 89, offline: 239 },
  'TNVS': { active: 312, maintenance: 28, offline: 68 },
  'TWG': { active: 245, maintenance: 23, offline: 55 },
  '2W Salary': { active: 142, maintenance: 23, offline: 50 },
  '4W Salary': { active: 67, maintenance: 12, offline: 19 },
  '4W Taxi': { active: 22, maintenance: 4, offline: 5 },
};

export function VehicleDistributionTab({ serviceType = 'All' }: VehicleDistributionTabProps) {
  const navigate = useNavigate();
  const vehicleData = vehicleDataByService[serviceType] || vehicleDataByService['All'];
  const summaryStats = summaryStatsByService[serviceType] || summaryStatsByService['All'];
  const totalVehicles = vehicleData.reduce((sum, v) => sum + v.count, 0);

  return (
    <div className="space-y-4">
      {/* Vehicle Distribution Card */}
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
        <div 
          onClick={() => navigate('/fleet')}
          className="flex items-center justify-between mb-4 cursor-pointer group"
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
            <Car className="w-4 h-4 text-purple-400" />
            Vehicle Distribution {serviceType !== 'All' && `• ${serviceType}`}
          </h3>
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
        </div>

        <div className="space-y-4">
          {vehicleData.map((vehicle) => (
            <div key={vehicle.type} className="group">
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg bg-opacity-20", vehicle.color.replace('bg-', 'text-'))}>
                    {vehicle.icon}
                  </div>
                  <span className="text-gray-400 group-hover:text-white transition-colors">
                    {vehicle.type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{vehicle.count}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    vehicle.status === 'active' ? "bg-green-500/20 text-green-400" :
                    vehicle.status === 'maintenance' ? "bg-amber-500/20 text-amber-400" :
                    "bg-gray-500/20 text-gray-400"
                  )}>
                    {vehicle.status}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", vehicle.color)}
                  style={{ width: `${vehicle.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{summaryStats.active}</p>
          <p className="text-xs text-gray-400">Active</p>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{summaryStats.maintenance}</p>
          <p className="text-xs text-gray-400">Maintenance</p>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-400">{summaryStats.offline}</p>
          <p className="text-xs text-gray-400">Offline</p>
        </div>
      </div>

      {/* Total Fleet Summary */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/5 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Fleet Size</p>
              <p className="text-2xl font-bold text-white">{totalVehicles.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-400">+5.2%</p>
            <p className="text-xs text-gray-400">vs last week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
