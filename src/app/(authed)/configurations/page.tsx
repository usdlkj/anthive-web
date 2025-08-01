'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

export default function ConfigurationsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState('No');
  const [refundDelay, setRefundDelay] = useState('');
  const [refundTryCount, setRefundTryCount] = useState('');
  const [refundRetryTimePeriod, setRefundRetryTimePeriod] = useState('');

  useEffect(() => {
    const token = Cookies.get('whoosh')

    axios
      .get('/api/configurations?currentPage=1&pageSize=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const configs = Array.isArray(res.data) ? res.data : [];

        setMaintenanceMode(configs.find((c: any) => c.configName === 'MAINTENANCE_MODE')?.configValue ?? 'No');
        setRefundDelay(configs.find((c: any) => c.configName === 'REFUND_DELAY')?.configValue ?? '0');
        setRefundTryCount(configs.find((c: any) => c.configName === 'REFUND_TRY_COUNT')?.configValue ?? '3');
        setRefundRetryTimePeriod(configs.find((c: any) => c.configName === 'REFUND_RETRY_TIME_PERIOD')?.configValue ?? '10');
      });
  }, []);

  const handleSave = (configName: string, configValue: string) => {
    const token = Cookies.get('whoosh');

    axios.post(
      '/api/configurations',
      { configName, configValue },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .then(() => {
      toast.success(`${configName} updated successfully`);
    })
    .catch((error) => {
      toast.error(`Failed to update ${configName}`);
      console.error(error);
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Configurations</h1>
      <div className="bg-white rounded-md border border-gray-200 shadow p-4">
        {/* Maintenance Mode */}
        <div className="flex items-center mb-4">
          <label className="w-60 font-semibold">Maintenance Mode</label>
          <select
            value={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 w-48"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          <button
            onClick={() => handleSave('MAINTENANCE_MODE', maintenanceMode)}
            className="ml-4 px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>

        {/* Refund Delay */}
        <div className="flex items-center mb-4">
          <label className="w-60 font-semibold">Refund Delay</label>
          <input
            type="number"
            value={refundDelay}
            onChange={(e) => setRefundDelay(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 w-48"
          />
          <button
            onClick={() => handleSave('REFUND_DELAY', refundDelay)}
            className="ml-4 px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>

        {/* Refund Try Count */}
        <div className="flex items-center mb-4">
          <label className="w-60 font-semibold">Refund Try Count</label>
          <input
            type="number"
            value={refundTryCount}
            onChange={(e) => setRefundTryCount(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 w-48"
          />
          <button
            onClick={() => handleSave('REFUND_TRY_COUNT', refundTryCount)}
            className="ml-4 px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>

        {/* Refund Retry Time Period */}
        <div className="flex items-center">
          <label className="w-60 font-semibold">Refund Retry Time Period</label>
          <input
            type="number"
            value={refundRetryTimePeriod}
            onChange={(e) => setRefundRetryTimePeriod(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 w-48"
          />
          <button
            onClick={() => handleSave('REFUND_RETRY_TIME_PERIOD', refundRetryTimePeriod)}
            className="ml-4 px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}