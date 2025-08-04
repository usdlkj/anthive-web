import { cookies } from 'next/headers';
import { DatatableProps } from '@/interfaces/DatatableProps';
import { getUserFromServerToken } from '@/lib/server/getUserFromToken';
import CompanyTable from '@/components/tables/CompanyTable';
import Company from '@/interfaces/Company';
import axiosInstance from '@/lib/axios';

async function fetchData() {
  const cookiesObject = await cookies();
  const token = cookiesObject.get('sempoa')?.value; // Securely get the token from server cookies

  if (!token) {
    console.error('Missing authentication token');
    return { data: [], totalRows: 0 };
  }

  try {
    const res = await axiosInstance.get(`/companies?currentPage=1&pageSize=10`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json: DatatableProps<Company, unknown> = res.data;
    return { 
      data: json.data, 
      totalRows: json.recordsFiltered 
    };

  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], totalRows: 0 };
  }
}

export default async function Companies() {
  const { data, totalRows } = await fetchData();
  const user = await getUserFromServerToken();
  const role = user?.role ?? "USER";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-kcicGray">
      <h1 className="text-2xl font-bold mb-4 text-kcicBlack">Companies</h1>
      <CompanyTable initialData={data} userRole={role} />
    </div>
  );
}