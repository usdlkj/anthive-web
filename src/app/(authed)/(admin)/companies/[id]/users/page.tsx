// page.tsx
import { cookies } from 'next/headers';
import { DatatableProps } from '@/interfaces/DatatableProps';
import axios from 'axios';
import { getUserFromServerToken } from '@/lib/server/getUserFromToken';
import UserTable from '@/components/tables/UserTable';
import User from '@/interfaces/User';
import { notFound } from 'next/navigation';

async function fetchData(companyId: string) {
  const cookiesObject = await cookies();
  const token = cookiesObject.get('sempoa')?.value;

  if (!token) return notFound();

  try {
    const res = await axios.get(`${process.env.BACKEND_URL}/companies/${companyId}/users`, {
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

export default async function Companies({ params }: { params: { id: string } }) {
  const id = (await params).id;
  const { data, totalRows } = await fetchData(id);
  const user = await getUserFromServerToken();
  const role = user?.role ?? "USER";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-kcicGray">
      <h1 className="text-2xl font-bold mb-4 text-kcicBlack">Users</h1>
      <UserTable initialData={data} companyId={id} userRole={role} />
    </div>
  );
}