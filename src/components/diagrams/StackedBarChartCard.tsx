'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

export default function StackedBarChartCard({
  title,
  data,
  dataKey,
  successKey = 'success_count',
  failedKey = 'failed_count',
}: {
  title: string;
  data: any[];
  dataKey: string;
  successKey?: string;
  failedKey?: string;
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
            <Legend />
            <Bar dataKey={successKey} stackId="a" fill="#34d399" name="Success" />
            <Bar dataKey={failedKey} stackId="a" fill="#f87171" name="Failed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}