import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/date';

export type ChartType = 'area' | 'bar' | 'line';
export type PeriodType = 'day' | 'week' | 'month';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    transactions: number;
    commission: number;
  }>;
  type?: ChartType;
  period?: PeriodType;
  isLoading?: boolean;
  showCommission?: boolean;
  className?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-xpress-bg-tertiary border border-xpress-border rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-xpress-text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xpress-text-secondary">{entry.name}</span>
            </span>
            <span className="font-medium text-xpress-text-primary">
              {entry.name.includes('Revenue') || entry.name.includes('Commission') 
                ? formatCurrency(entry.value) 
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function RevenueChart({ 
  data, 
  type = 'area', 
  period = 'day',
  isLoading,
  showCommission = true,
  className 
}: RevenueChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // Format date based on period
      displayDate: period === 'day' 
        ? new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [data, period]);

  if (isLoading) {
    return (
      <div className={cn("xpress-card p-4 h-80 animate-pulse", className)}>
        <div className="h-full bg-xpress-bg-secondary rounded-lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("xpress-card p-4 h-80 flex items-center justify-center", className)}>
        <p className="text-xpress-text-muted">No data available</p>
      </div>
    );
  }

  const commonProps = {
    data: chartData,
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
  };

  const commonAxisProps = {
    xAxis: {
      dataKey: 'displayDate',
      stroke: '#6b7280',
      fontSize: 12,
      tickLine: false,
      axisLine: false,
    },
    yAxis: {
      stroke: '#6b7280',
      fontSize: 12,
      tickLine: false,
      axisLine: false,
      tickFormatter: (value: number) => `₱${(value / 1000).toFixed(0)}k`,
    },
    cartesianGrid: {
      stroke: '#2a2a45',
      strokeDasharray: '3 3',
      vertical: false,
    },
    tooltip: <CustomTooltip />,
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              {showCommission && (
                <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              )}
            </defs>
            <CartesianGrid {...commonAxisProps.cartesianGrid} />
            <XAxis {...commonAxisProps.xAxis} />
            <YAxis {...commonAxisProps.yAxis} />
            <Tooltip {...commonAxisProps.tooltip} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-xpress-text-secondary">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            {showCommission && (
              <Area
                type="monotone"
                dataKey="commission"
                name="Commission"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCommission)"
              />
            )}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid {...commonAxisProps.cartesianGrid} />
            <XAxis {...commonAxisProps.xAxis} />
            <YAxis {...commonAxisProps.yAxis} />
            <Tooltip {...commonAxisProps.tooltip} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-xpress-text-secondary">{value}</span>}
            />
            <Bar 
              dataKey="revenue" 
              name="Revenue" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
            {showCommission && (
              <Bar 
                dataKey="commission" 
                name="Commission" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid {...commonAxisProps.cartesianGrid} />
            <XAxis {...commonAxisProps.xAxis} />
            <YAxis {...commonAxisProps.yAxis} />
            <Tooltip {...commonAxisProps.tooltip} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-xpress-text-secondary">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#10b981' }}
            />
            {showCommission && (
              <Line
                type="monotone"
                dataKey="commission"
                name="Commission"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className={cn("xpress-card p-4", className)}>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;
