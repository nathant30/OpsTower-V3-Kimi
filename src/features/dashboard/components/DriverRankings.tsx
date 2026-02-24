import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ChevronRight, TrendingUp, TrendingDown, Award, Phone, Star, MapPin } from 'lucide-react';

interface DriverRank {
  rank: number;
  name: string;
  avatar: string;
  earnings: number;
  trips: number;
  rating: number;
  trend: 'up' | 'down' | 'stable';
  status: 'online' | 'offline' | 'break';
  driverId: string;
  phone?: string;
  location?: string;
  vehicle?: string;
}

const mockRankings: DriverRank[] = [
  { rank: 1, name: 'J. Dela Cruz', avatar: 'JD', earnings: 510, trips: 42, rating: 4.9, trend: 'up', status: 'online', driverId: 'DRV-001', phone: '+63 912 345 6789', location: 'Makati CBD', vehicle: 'Toyota RAV4' },
  { rank: 2, name: 'A. Mendoza', avatar: 'AM', earnings: 470, trips: 38, rating: 4.8, trend: 'up', status: 'online', driverId: 'DRV-002', phone: '+63 913 456 7890', location: 'BGC', vehicle: 'Honda City' },
  { rank: 3, name: 'L. Santos', avatar: 'LS', earnings: 425, trips: 35, rating: 4.7, trend: 'stable', status: 'online', driverId: 'DRV-003', phone: '+63 914 567 8901', location: 'Ortigas', vehicle: 'Moto' },
  { rank: 4, name: 'R. Garcia', avatar: 'RG', earnings: 240, trips: 20, rating: 4.5, trend: 'down', status: 'break', driverId: 'DRV-004', phone: '+63 915 678 9012', location: 'Quezon City', vehicle: 'Toyota Vios' },
  { rank: 5, name: 'K. Reyes', avatar: 'KR', earnings: 230, trips: 18, rating: 4.4, trend: 'down', status: 'offline', driverId: 'DRV-005', phone: '+63 916 789 0123', location: 'Manila', vehicle: 'Honda Civic' },
];

function RankRow({ driver, isTop, onClick }: { driver: DriverRank; isTop?: boolean; onClick: () => void }) {
  const statusColors = {
    online: 'bg-green-500',
    break: 'bg-amber-500',
    offline: 'bg-gray-500',
  };

  const rankColors: Record<number, string> = {
    1: 'text-yellow-400',
    2: 'text-gray-300',
    3: 'text-amber-600',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors cursor-pointer group",
        isTop ? "bg-white/5 hover:bg-white/10" : "hover:bg-white/5"
      )}
    >
      <div className={cn(
        "w-6 text-center text-sm font-bold",
        rankColors[driver.rank] || "text-gray-500"
      )}>
        {driver.rank <= 3 ? (
          <Award className="w-4 h-4 mx-auto" />
        ) : (
          driver.rank
        )}
      </div>

      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white">
          {driver.avatar}
        </div>
        <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#12121a]", statusColors[driver.status])} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate group-hover:text-blue-400 transition-colors">
          {driver.name}
        </p>
        <p className="text-[10px] text-gray-500">{driver.trips} trips</p>
      </div>

      <div className="text-right">
        <p className={cn(
          "text-xs font-semibold",
          driver.trend === 'up' ? "text-green-400" : 
          driver.trend === 'down' ? "text-red-400" : "text-gray-300"
        )}>
          ₱{driver.earnings}/hr
        </p>
        <div className="flex items-center justify-end gap-0.5">
          {driver.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
          {driver.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
          <span className="text-[10px] text-gray-500">{driver.rating}★</span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
    </div>
  );
}

function DriverDetailModal({ driver, onClose }: { driver: DriverRank; onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <Modal isOpen={!!driver} onClose={onClose} title="Driver Profile" size="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
            {driver.avatar}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{driver.name}</h3>
            <p className="text-sm text-gray-400">ID: {driver.driverId}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                driver.status === 'online' ? "bg-green-500/20 text-green-400" :
                driver.status === 'break' ? "bg-amber-500/20 text-amber-400" :
                "bg-gray-500/20 text-gray-400"
              )}>
                {driver.status === 'online' ? 'Online' : driver.status === 'break' ? 'On Break' : 'Offline'}
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                {driver.rating}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <p className="text-lg font-bold text-green-400">₱{driver.earnings}</p>
            <p className="text-[10px] text-gray-500">Earnings/Hr</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <p className="text-lg font-bold text-white">{driver.trips}</p>
            <p className="text-[10px] text-gray-500">Trips Today</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <p className="text-lg font-bold text-blue-400">#{driver.rank}</p>
            <p className="text-[10px] text-gray-500">Ranking</p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Phone className="w-4 h-4" />
            <span>{driver.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{driver.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center text-xs">🚗</div>
            <span>{driver.vehicle}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1"
            onClick={() => { navigate(`/drivers/${driver.driverId}`); onClose(); }}
          >
            View Full Profile
          </Button>
          <Button variant="secondary" className="flex-1">
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function DriverRankings() {
  const navigate = useNavigate();
  const [selectedDriver, setSelectedDriver] = useState<DriverRank | null>(null);
  
  const topDrivers = mockRankings.slice(0, 3);
  const otherDrivers = mockRankings.slice(3);

  return (
    <>
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Driver Performance</h3>
            <p className="text-[10px] text-gray-500">Live Rankings</p>
          </div>
          <button 
            onClick={() => navigate('/drivers')}
            className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1 mb-4">
          {topDrivers.map((driver) => (
            <RankRow 
              key={driver.rank} 
              driver={driver} 
              isTop 
              onClick={() => setSelectedDriver(driver)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">Underperforming</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="space-y-1 flex-1 overflow-auto">
          {otherDrivers.map((driver) => (
            <RankRow 
              key={driver.rank} 
              driver={driver} 
              onClick={() => setSelectedDriver(driver)}
            />
          ))}
        </div>
      </div>

      {selectedDriver && (
        <DriverDetailModal 
          driver={selectedDriver} 
          onClose={() => setSelectedDriver(null)} 
        />
      )}
    </>
  );
}
