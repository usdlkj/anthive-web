'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface ComparisonData {
  name: string;
  success_count: number;
  failed_count: number;
  revenue: number;
}

interface Props {
  title: string;
  data: ComparisonData[];
  valueKey?: keyof ComparisonData; // 'success_count' by default
}

const COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa', '#f87171', '#34d399', '#c084fc'];

export default function ComparisonPieChart({ title, data, valueKey = 'success_count' }: Props) {
  const chartData = data.map((item) => ({
    name: item.name,
    value: Number(item[valueKey] ?? 0),
  })).filter(d => d.value > 0);

  return (
    <div className="w-full h-[300px] mb-6">
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      {chartData.length === 0 ? (
        <div className="text-gray-500 italic">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart key={COLORS.join(',')}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}