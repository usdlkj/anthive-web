import axios from 'axios';
import { cookies } from 'next/headers';
import { DatatableProps } from '@/interfaces/DatatableProps';
import { ActionLog } from '@/interfaces/ActionLog';
import ActionLogTable from '@/components/tables/ActionLogTable';

async function fetchData() {
  const cookiesObject = await cookies();
  const token = cookiesObject.get('whoosh')?.value; // Securely get the token from server cookies

  if (!token) {
    console.error('Missing authentication token');
    return { data: [], totalRows: 0 };
  }

  try {
    const res = await axios.get(`${process.env.BACKEND_URL}/api/action-logs?page=1&limit=20`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json: DatatableProps<ActionLog, unknown> = res.data;
    return {
      data: json.data,
      totalRows: json.recordsTotal,
      totalPages: res.data.totalPages,
    };

  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], totalRows: 0 };
  }
}

export default async function ApiLogs() {
  const { data, totalRows, totalPages } = await fetchData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-kcicGray">
      <h1 className="text-2xl font-bold mb-4 text-kcicBlack">Action Logs</h1>
      <ActionLogTable initialData={data} initialTotalRows={totalRows} initialTotalPages={totalPages} />
    </div>
  );
}