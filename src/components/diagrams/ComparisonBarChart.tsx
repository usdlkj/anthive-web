'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
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
}

export default function ComparisonBarChart({ title, data }: Props) {
  return (
    <div className="w-full h-[300px] mb-6">
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="success_count" fill="#4ade80" name="Success" />
          <Bar dataKey="failed_count" fill="#f87171" name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}