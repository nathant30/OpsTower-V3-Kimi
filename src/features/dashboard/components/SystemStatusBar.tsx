import { Badge } from '@/components/ui/Badge';
import { 
  Wifi,
  Activity,
  Database,
  Camera,
  Download,
  Settings,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-react';

export function SystemStatusBar() {
  return (
    <div className="h-12 border-t border-white/5 bg-[#0f0f16] flex items-center justify-between px-4 shrink-0">
      {/* Left: System Health */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-green-500/10">
            <Wifi className="w-3.5 h-3.5 text-green-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500">GPS Signal</p>
            <p className="text-[10px] text-green-400 font-medium">99.8%</p>
          </div>
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-500/10">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500">API Latency</p>
            <p className="text-[10px] text-blue-400 font-medium">24ms</p>
          </div>
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-500/10">
            <Database className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Data Stream</p>
            <p className="text-[10px] text-purple-400 font-medium">Live</p>
          </div>
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-white/10 text-gray-400 transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
            <Pause className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 text-gray-400 transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-[10px] bg-white/5 border-white/10">
            <Play className="w-3 h-3 mr-1" />
            Live Stream
          </Badge>
          <span className="text-[10px] text-gray-500 font-mono">14:28:05</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10 transition-colors">
          <Camera className="w-3.5 h-3.5" />
          Snapshot
        </button>
        
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 hover:bg-blue-500/20 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export Data
        </button>

        <button className="p-1.5 rounded hover:bg-white/10 text-gray-400 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
