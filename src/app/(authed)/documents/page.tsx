import { cookies } from 'next/headers';
import { DatatableProps } from '@/interfaces/DatatableProps';
import axios from 'axios';
import { getUserFromServerToken } from '@/lib/server/getUserFromToken';
import { Document } from '@/interfaces/Document';
import DocumentTable from '@/components/tables/DocumentTable';

async function fetchData() {
  const cookiesObject = await cookies();
  const token = cookiesObject.get('sempoa')?.value; // Securely get the token from server cookies
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!token) {
    console.error('Missing authentication token');
    return { data: [], totalRows: 0 };
  }

  try {
    const res = await axios.get(`${backendUrl}/api/documents?currentPage=1&pageSize=10`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const json: DatatableProps<Document, unknown> = res.data;
    return { 
      data: json.data, 
      totalRows: json.recordsFiltered 
    };

  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], totalRows: 0 };
  }
}

export default async function Documents() {
  const { data, totalRows } = await fetchData();
  const user = await getUserFromServerToken();
  const role = user?.role ?? "USER";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-kcicGray">
      <h1 className="text-2xl font-bold mb-4 text-kcicBlack">Document Register</h1>
      <DocumentTable initialData={data} userRole={role} />
    </div>
  );
}