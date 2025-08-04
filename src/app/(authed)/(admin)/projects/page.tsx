import { cookies } from 'next/headers';
import { DatatableProps } from '@/interfaces/DatatableProps';
import { getUserFromServerToken } from '@/lib/server/getUserFromToken';
import ProjectTable from '@/components/tables/ProjectTable';
import Project from '@/interfaces/Project';
import axiosInstance from '@/lib/axios';

async function fetchData() {
  const cookiesObject = await cookies();
  const token = cookiesObject.get('sempoa')?.value; // Securely get the token from server cookies

  if (!token) {
    console.error('Missing authentication token');
    return { data: [], totalRows: 0 };
  }

  try {
    const res = await axiosInstance.get(`/projects?currentPage=1&pageSize=10`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const json: DatatableProps<Project, unknown> = res.data;
    return { 
      data: json.data, 
      totalRows: json.recordsFiltered 
    };

  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], totalRows: 0 };
  }
}

export default async function Projects() {
  const { data, totalRows } = await fetchData();
  const user = await getUserFromServerToken();
  const role = user?.role ?? "USER";
  const userId = user?.userId ?? "ID";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-kcicGray">
      <h1 className="text-2xl font-bold mb-4 text-kcicBlack">Projects</h1>
      <ProjectTable initialData={data} userRole={role} userId={userId} />
    </div>
  );
}