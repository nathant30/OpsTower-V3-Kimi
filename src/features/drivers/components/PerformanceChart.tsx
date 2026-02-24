import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import type { DriverPerformance } from '@/types/domain.types';
import {
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
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
} from 'recharts';
import { getPerformanceColor } from '../hooks/useDriverPerformance';

// ==================== TYPES ====================

interface PerformanceChartProps {
  performance: DriverPerformance;
  trends?: {
    date: string;
    completionRate: number;
    acceptanceRate: number;
    onTimePercentage: number;
    trips: number;
    earnings: number;
  }[];
  className?: string;
}

type ChartType = 'radar' | 'bar' | 'trends' | 'area';
type TimeRange = '7d' | '30d' | '90d';

// ==================== CHART COLORS ====================

const COLORS = {
  green: '#10b981',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  red: '#ef4444',
  grid: 'rgba(255, 255, 255, 0.05)',
  text: '#6b7280',
  background: 'transparent',
};

// ==================== MOCK TREND DATA ====================

function generateMockTrends(days: number): PerformanceChartProps['trends'] {
  const trends = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      completionRate: 85 + Math.random() * 15,
      acceptanceRate: 80 + Math.random() * 15,
      onTimePercentage: 88 + Math.random() * 10,
      trips: Math.floor(5 + Math.random() * 15),
      earnings: Math.floor(500 + Math.random() * 1500),
    });
  }
  
  return trends;
}

// ==================== TIME RANGE SELECTOR ====================

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  className?: string;
}

function TimeRangeSelector({ value, onChange, className }: TimeRangeSelectorProps) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  return (
    <div className={cn('flex items-center gap-1 p-1 bg-white/5 rounded-lg', className)}>
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            value === range.value
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

// ==================== CHART TYPE SELECTOR ====================

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (value: ChartType) => void;
  className?: string;
}

function ChartTypeSelector({ value, onChange, className }: ChartTypeSelectorProps) {
  const types: { value: ChartType; label: string }[] = [
    { value: 'radar', label: 'Radar' },
    { value: 'bar', label: 'Bar' },
    { value: 'trends', label: 'Trends' },
    { value: 'area', label: 'Area' },
  ];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {types.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className={cn(
            'px-2 py-1 rounded text-xs font-medium transition-all',
            value === type.value
              ? 'bg-white/10 text-white'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}

// ==================== RADAR CHART ====================

export function PerformanceRadarChart({ performance, className }: { performance: DriverPerformance; className?: string }) {
  const data = useMemo(() => [
    { metric: 'Completion', value: performance.completionRate, fullMark: 100 },
    { metric: 'Acceptance', value: performance.acceptanceRate, fullMark: 100 },
    { metric: 'On-Time', value: performance.onTimePercentage, fullMark: 100 },
    { metric: 'Rating', value: performance.averageRating * 20, fullMark: 100 },
    { metric: 'Low Cancel', value: Math.max(0, 100 - performance.cancellationRate * 10), fullMark: 100 },
  ], [performance]);

  return (
    <div className={cn('h-64', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke={COLORS.grid} />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: COLORS.text, fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: COLORS.text, fontSize: 9 }}
            stroke={COLORS.grid}
            tickCount={5}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke={COLORS.blue}
            strokeWidth={2}
            fill={COLORS.blue}
            fillOpacity={0.2}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const value = payload[0].value as number;
                const metric = payload[0].payload.metric as string;
                return (
                  <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
                    <p className="text-gray-400 mb-1">{metric}</p>
                    <p className="text-white font-semibold">
                      {metric === 'Rating' ? (value / 20).toFixed(1) : Math.round(value)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==================== BAR CHART ====================

export function PerformanceBarChart({ performance, className }: { performance: DriverPerformance; className?: string }) {
  const data = useMemo(() => [
    { name: 'Completion', value: performance.completionRate, color: COLORS.green },
    { name: 'Acceptance', value: performance.acceptanceRate, color: COLORS.blue },
    { name: 'On-Time', value: performance.onTimePercentage, color: COLORS.cyan },
    { name: 'Low Cancel', value: Math.max(0, 100 - performance.cancellationRate * 10), color: COLORS.purple },
  ], [performance]);

  return (
    <div className={cn('h-56', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: COLORS.text, fontSize: 11 }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: COLORS.text, fontSize: 10 }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const value = payload[0].value as number;
                const name = payload[0].payload.name as string;
                return (
                  <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
                    <p className="text-gray-400 mb-1">{name}</p>
                    <p className="text-white font-semibold">{Math.round(value)}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==================== TRENDS CHART ====================

export function PerformanceTrendsChart({
  trends,
  className,
  timeRange = '30d',
}: {
  trends: NonNullable<PerformanceChartProps['trends']>;
  className?: string;
  timeRange?: TimeRange;
}) {
  const data = useMemo(() => {
    return trends.map((t) => ({
      ...t,
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [trends]);

  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const filteredData = data.slice(-days);

  return (
    <div className={cn('h-56', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            dataKey="date"
            tick={{ fill: COLORS.text, fontSize: 10 }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: COLORS.text, fontSize: 10 }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
                    <p className="text-gray-400 mb-2">{label}</p>
                    {payload.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-gray-400">{p.name}:</span>
                        <span className="text-white font-medium">{Number(p.value).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="completionRate"
            name="Completion"
            stroke={COLORS.green}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COLORS.green }}
          />
          <Line
            type="monotone"
            dataKey="acceptanceRate"
            name="Acceptance"
            stroke={COLORS.blue}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COLORS.blue }}
          />
          <Line
            type="monotone"
            dataKey="onTimePercentage"
            name="On-Time"
            stroke={COLORS.cyan}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COLORS.cyan }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==================== AREA CHART ====================

export function PerformanceAreaChart({
  trends,
  className,
  timeRange = '30d',
}: {
  trends: NonNullable<PerformanceChartProps['trends']>;
  className?: string;
  timeRange?: TimeRange;
}) {
  const data = useMemo(() => {
    return trends.map((t) => ({
      ...t,
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [trends]);

  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const filteredData = data.slice(-days);

  return (
    <div className={cn('h-56', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAcceptance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            dataKey="date"
            tick={{ fill: COLORS.text, fontSize: 10 }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: COLORS.text, fontSize: 10 }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
                    <p className="text-gray-400 mb-2">{label}</p>
                    {payload.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-gray-400">{p.name}:</span>
                        <span className="text-white font-medium">{Number(p.value).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="completionRate"
            name="Completion"
            stroke={COLORS.green}
            fillOpacity={1}
            fill="url(#colorCompletion)"
          />
          <Area
            type="monotone"
            dataKey="acceptanceRate"
            name="Acceptance"
            stroke={COLORS.blue}
            fillOpacity={1}
            fill="url(#colorAcceptance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==================== TRIPS PIE CHART ====================

export function TripsDistributionChart({
  totalTrips,
  breakdown,
  className,
}: {
  totalTrips: number;
  breakdown?: { serviceType: string; trips: number }[];
  className?: string;
}) {
  const data = useMemo(() => {
    if (breakdown && breakdown.length > 0) {
      return breakdown.map((b) => ({
        name: b.serviceType,
        value: b.trips,
      }));
    }
    return [
      { name: 'Taxi', value: Math.round(totalTrips * 0.5) },
      { name: 'Moto', value: Math.round(totalTrips * 0.25) },
      { name: 'Delivery', value: Math.round(totalTrips * 0.2) },
      { name: 'Car', value: Math.round(totalTrips * 0.05) },
    ].filter((d) => d.value > 0);
  }, [totalTrips, breakdown]);

  const pieColors = [COLORS.blue, COLORS.cyan, COLORS.purple, COLORS.amber];

  return (
    <div className={cn('h-56', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0];
                const percentage = ((p.value as number / totalTrips) * 100).toFixed(0);
                return (
                  <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
                    <p className="text-gray-400 mb-1">{p.name}</p>
                    <p className="text-white font-semibold">
                      {p.value} trips ({percentage}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: pieColors[index % pieColors.length] }}
            />
            <span className="text-xs text-gray-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== EARNINGS CHART ====================

export function EarningsChart({
  trends,
  className,
  timeRange = '30d',
}: {
  trends: NonNullable<PerformanceChartProps['trends']>;
  className?: string;
  timeRange?: TimeRange;
}) {
  const data = useMemo(() => {
    return trends.map((t) => ({
      ...t,
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [trends]);

  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const filteredData = data.slice(-days);

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString()}`;
  };

  return (
    <div className={cn('h-56', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.green} stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: COLORS.text, fontSize: 10 }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: COLORS.text, fontSize: 10 }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
                    <p className="text-gray-400 mb-1">{data.date}</p>
                    <p className="text-green-400 font-semibold">
                      {formatCurrency(data.earnings)}
                    </p>
                    <p className="text-gray-500 mt-1">
                      {data.trips} trips
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="earnings" 
            fill="url(#earningsGradient)" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==================== MAIN PERFORMANCE CHART ====================

export function PerformanceChart({ performance, trends, className }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<ChartType>('radar');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  // Generate mock trends if not provided
  const trendData = trends ?? generateMockTrends(30) ?? [];

  const renderChart = () => {
    switch (chartType) {
      case 'radar':
        return <PerformanceRadarChart performance={performance} />;
      case 'bar':
        return <PerformanceBarChart performance={performance} />;
      case 'trends':
        return <PerformanceTrendsChart trends={trendData} timeRange={timeRange} />;
      case 'area':
        return <PerformanceAreaChart trends={trendData} timeRange={timeRange} />;
      default:
        return <PerformanceRadarChart performance={performance} />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Completion Rate"
          value={performance.completionRate}
          suffix="%"
        />
        <MetricCard
          label="Acceptance Rate"
          value={performance.acceptanceRate}
          suffix="%"
        />
        <MetricCard
          label="On-Time %"
          value={performance.onTimePercentage}
          suffix="%"
        />
        <MetricCard
          label="Avg Rating"
          value={performance.averageRating}
          suffix="/5"
          isRating
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">Performance Overview</h4>
            <ChartTypeSelector value={chartType} onChange={setChartType} />
          </div>
          {renderChart()}
        </div>

        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">Performance Trends</h4>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
          <PerformanceTrendsChart trends={trendData} timeRange={timeRange} />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Trips" value={performance.totalTrips.toLocaleString()} />
        <StatCard label="Total Ratings" value={performance.totalRatings.toLocaleString()} />
        <StatCard
          label="Cancellation Rate"
          value={`${performance.cancellationRate.toFixed(1)}%`}
          alert={performance.cancellationRate > 5}
        />
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function MetricCard({
  label,
  value,
  suffix,
  isRating = false,
}: {
  label: string;
  value: number;
  suffix: string;
  isRating?: boolean;
}) {
  const colorClass = isRating ? getPerformanceColor(value, 'rating') : getPerformanceColor(value);

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={cn('text-xl font-bold', colorClass)}>
        {isRating ? value.toFixed(1) : Math.round(value)}
        <span className="text-sm text-gray-500 ml-0.5">{suffix}</span>
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={cn('text-base font-semibold', alert ? 'text-red-400' : 'text-white')}>
        {value}
      </p>
    </div>
  );
}

// ==================== EXPORTS ====================

export default PerformanceChart;
