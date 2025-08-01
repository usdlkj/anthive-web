import { cookies } from 'next/headers';
import UserTable from '@/components/tables/UserTable';
import { DatatableProps } from '@/interfaces/DatatableProps';
import axios from 'axios';
import User from '@/interfaces/User';

async function fetchData() {
  const cookiesObject = await cookies();
  const token = cookiesObject.get('whoosh')?.value; // Securely get the token from server cookies

  if (!token) {
    console.error('Missing authentication token');
    return { data: [], totalRows: 0 };
  }

  try {
    const res = await axios.get(`${process.env.BACKEND_URL}/api/users?currentPage=1&pageSize=10`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const json: DatatableProps<User, unknown> = res.data;
    return { 
      data: json.data, 
      totalRows: json.recordsFiltered 
    };

  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], totalRows: 0 };
  }
}

export default async function Users() {
  const { data, totalRows } = await fetchData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-kcicGray">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-kcicBlack">Users</h1>
      </div>
      <UserTable initialData={data} />
    </div>
  );
}