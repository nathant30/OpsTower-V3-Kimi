/**
 * Earnings Chart Component
 * Displays earnings breakdown by day and trip type
 */

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { XpressCard } from '@/components/ui/XpressCard';
import { formatCurrency } from '../hooks/useEarnings';
import type { DailyEarnings, EarningsByTripType } from '@/services/earnings/earnings.service';

interface EarningsChartProps {
  dailyData?: DailyEarnings[];
  tripTypeData?: EarningsByTripType[];
  type?: 'daily' | 'tripType' | 'both';
  className?: string;
}

const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899'];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f2937] border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name?.includes('Amount') || entry.name?.includes('Earnings')
              ? formatCurrency(entry.value)
              : entry.value.toLocaleString()
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Daily Earnings Chart
function DailyEarningsChart({ data }: { data?: DailyEarnings[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No daily earnings data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="day" 
          stroke="#6b7280" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis 
          yAxisId="left"
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="amount"
          name="Earnings"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorEarnings)"
          strokeWidth={2}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="trips"
          name="Trips"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorTrips)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Trip Type Breakdown Chart
function TripTypeChart({ data }: { data?: EarningsByTripType[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No trip type data available
      </div>
    );
  }

  const pieData = data.map(item => ({
    name: item.type,
    value: item.amount,
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-[#1f2937] border border-gray-700 rounded-lg p-3 shadow-lg">
                  <p className="text-white font-medium">{data.name}</p>
                  <p className="text-green-400">{formatCurrency(data.value)}</p>
                  <p className="text-gray-400 text-sm">{data.count} trips</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value: string, entry: any) => (
            <span style={{ color: entry.color }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Bar Chart for Trip Type Comparison
function TripTypeBarChart({ data }: { data?: EarningsByTripType[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No trip type data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="type" 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar 
          dataKey="amount" 
          name="Earnings Amount" 
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="count" 
          name="Trip Count" 
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Main Component
export function EarningsChart({ 
  dailyData, 
  tripTypeData, 
  type = 'both',
  className 
}: EarningsChartProps) {
  if (type === 'daily') {
    return (
      <XpressCard 
        title="Daily Earnings Trend" 
        subtitle="Earnings and trip volume over time"
        className={className}
      >
        <DailyEarningsChart data={dailyData} />
      </XpressCard>
    );
  }

  if (type === 'tripType') {
    return (
      <XpressCard 
        title="Earnings by Trip Type" 
        subtitle="Revenue breakdown by service type"
        className={className}
      >
        <TripTypeBarChart data={tripTypeData} />
      </XpressCard>
    );
  }

  // Both charts
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className || ''}`}>
      <XpressCard 
        title="Daily Earnings Trend" 
        subtitle="Earnings and trip volume over time"
      >
        <DailyEarningsChart data={dailyData} />
      </XpressCard>

      <XpressCard 
        title="Earnings by Trip Type" 
        subtitle="Revenue breakdown by service type"
      >
        <TripTypeBarChart data={tripTypeData} />
      </XpressCard>
    </div>
  );
}

// Export individual chart components
export { DailyEarningsChart, TripTypeChart, TripTypeBarChart };

export default EarningsChart;
