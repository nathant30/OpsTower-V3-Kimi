// Order Distribution Chart - Pie chart for order status
import { XpressCard } from '@/components/ui/XpressCard';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface OrderDistributionData {
  status: string;
  count: number;
  color: string;
}

interface OrderDistributionChartProps {
  data: OrderDistributionData[];
  title?: string;
}

export const OrderDistributionChart = ({
  data,
  title = 'Order Status Distribution',
}: OrderDistributionChartProps) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <XpressCard title={title} icon={<PieChartIcon className="w-5 h-5" />}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${((percent || 0) * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="status"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#12121a',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value, name) => [
              `${value} (${((Number(value) / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: '#9ca3af' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-sm text-gray-400">Total Orders</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {Math.round((data.find(d => d.status === 'Completed')?.count || 0) / total * 100)}%
          </div>
          <div className="text-sm text-gray-400">Completion Rate</div>
        </div>
      </div>
    </XpressCard>
  );
};

export default OrderDistributionChart;
