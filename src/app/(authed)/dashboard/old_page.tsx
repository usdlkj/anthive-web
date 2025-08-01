'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import SummaryCard from '@/components/SummaryCard';
import { CheckCircle, XCircle } from 'lucide-react';
import ComparisonPieChart from '@/components/diagrams/ComparisonPieChart';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('whoosh');

    axios.get('/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        const json = res.data;

        const transformedChannels = json.channel_comparison.map((item: any) => ({
          name: item.channel ?? 'unknown',
          success_count: Number(item.success_count),
          failed_count: Number(item.failed_count),
          revenue: Number(item.revenue),
        }));

        const transformedGateways = json.gateway_comparison.map((item: any) => ({
          name: item.gateway ?? 'unknown',
          success_count: Number(item.success_count),
          failed_count: Number(item.failed_count),
          revenue: Number(item.revenue),
        }));

        const transformedProviders = json.provider_comparison.map((item: any) => ({
          name: item.provider ?? 'unknown',
          success_count: Number(item.success_count),
          failed_count: Number(item.failed_count),
          revenue: Number(item.revenue),
        }));

        const newJson = { ...json, transformedChannels, transformedGateways, transformedProviders };
        setData(newJson);
      })
      .catch((err) => {
        console.error('Dashboard fetch failed:', err);
      })
      .finally(() => setLoading(false));
  }, []);
  

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : data?.error ? (
        <div className="text-red-600">Error: {data.error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Success"
            value={data.today?.success_count ?? 0}
            icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          />
          <SummaryCard
            title="Failed"
            value={data.today?.failed_count ?? 0}
            icon={<XCircle className="h-6 w-6 text-red-500" />}
          />
          <SummaryCard
            title="Revenue"
            value={`Rp ${data.today?.revenue?.toLocaleString('id-ID')}`}
          />
          <SummaryCard
            title="Success Rate"
            value={`${data.today?.success_rate ?? 0}%`}
          />
          
          <ComparisonPieChart title="Payment Types" data={data.transformedChannels} />
          <ComparisonPieChart title="Payment Gateways" data={data.transformedGateways} />
          <ComparisonPieChart title="Payment Providers" data={data.transformedProviders} />
        </div>
      )}
    </div>
  );
}