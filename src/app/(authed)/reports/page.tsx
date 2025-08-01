import { cookies } from 'next/headers';
import ReportTable from '@/components/tables/ReportTable';
import { DatatableProps } from '@/interfaces/DatatableProps';
import axios from 'axios';
import Report from '@/interfaces/Report';

async function fetchData() {
  const cookiesObject = await cookies();
  const token = cookiesObject.get('whoosh')?.value; // Securely get the token from server cookies

  if (!token) {
    console.error('Missing authentication token');
    return { data: [], totalRows: 0 };
  }

  try {
    const res = await axios.get(`${process.env.BACKEND_URL}/api/report?currentPage=1&pageSize=10`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const json: DatatableProps<Report, unknown> = await res.data;
    return { 
      data: json.data, 
      totalRows: json.recordsFiltered 
    };

  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], totalRows: 0 };
  }
}

export default async function Reports() {
  const { data, totalRows } = await fetchData();

  return (
    <div className="container text-gray-500">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <ReportTable initialData={data} initialTotalRows={totalRows} />
    </div>
  );
}