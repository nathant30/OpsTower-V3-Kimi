// User Activity Chart - Bar chart for user activity
import { XpressCard } from '@/components/ui/XpressCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users } from 'lucide-react';

interface UserActivityData {
  day: string;
  active: number;
  new: number;
}

interface UserActivityChartProps {
  data: UserActivityData[];
  title?: string;
}

export const UserActivityChart = ({
  data,
  title = 'User Activity (Last 7 Days)',
}: UserActivityChartProps) => {
  return (
    <XpressCard title={title} icon={<Users className="w-5 h-5" />}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="day"
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#12121a',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend
            wrapperStyle={{ color: '#9ca3af' }}
          />
          <Bar
            dataKey="active"
            name="Active Users"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="new"
            name="New Users"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </XpressCard>
  );
};

export default UserActivityChart;
