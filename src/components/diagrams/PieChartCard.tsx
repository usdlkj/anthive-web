'use client';

import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#93c5fd', '#fca5a5', '#6ee7b7', '#fde68a', '#d8b4fe'];

export default function PieChartCard({ title, data, nameKey, valueKey }: {
  title: string;
  data: any[];
  nameKey: string;
  valueKey: string;
}) {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}