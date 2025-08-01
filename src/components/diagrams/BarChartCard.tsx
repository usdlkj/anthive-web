'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function BarChartCard({ title, data, dataKey, valueKey }: {
  title: string;
  data: any[];
  dataKey: string;
  valueKey: string;
}) {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={valueKey} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}